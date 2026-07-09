import { unstable_noStore } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin-client'
import { requireNonprofitAdmin } from '@/lib/supabase/admin'
import AdminShell from '@/components/admin/AdminShell'
import AdminDonationsClient from './AdminDonationsClient'

export const dynamic = 'force-dynamic'

export default async function AdminDonationsPage() {
  unstable_noStore()
  const { profile } = await requireNonprofitAdmin()

  let missingServiceKey = false
  let rawCount: number | null = null
  const admin = createAdminClient()

  // Build the select – for nonprofit admins, use an inner join so PostgREST
  // filters on the related table; for full admins just fetch everything.
  const isNonprofitAdmin = profile.role === 'nonprofit_admin' && !!profile.nonprofit_id

  let donations: any[] | null = null

  if (!admin) missingServiceKey = true

  // Use service-role client when available (bypasses RLS).
  // Fall back to session client — this works for admins but nested
  // joins may return null for related rows filtered by their own RLS.
  const client = admin ?? await createClient()

  // Step 1: try full join (works when migration is fully applied + service key set)
  // Step 2: project join only (no nonprofit nesting)
  // Step 3: bare SELECT * no joins at all — must work if dbCount works
  const trySelect = async (sel: string, extraFilter?: string[]) => {
    let q = client.from('donations').select(sel).order('created_at', { ascending: false })
    if (extraFilter) q = (q as any).in('project_id', extraFilter)
    const { data, error } = await q
    if (error) console.error(`[donations] select failed (${sel.slice(0, 50)}):`, error.message)
    return { data, error }
  }

  const projectFilter = isNonprofitAdmin ? await (async () => {
    const { data } = await client.from('projects').select('id').eq('nonprofit_id', profile.nonprofit_id!)
    const ids = (data || []).map((p: any) => p.id)
    return ids.length > 0 ? ids : ['00000000-0000-0000-0000-000000000000']
  })() : undefined

  // Try 1: full join with nonprofit
  let result = await trySelect(
    `*, project:projects(id, title, slug, nonprofit:nonprofits(id, name)), donor:profiles(id, full_name, avatar_url, email)`,
    projectFilter
  )

  // Try 2: nonprofit nested but no donor profile join
  if (result.error || !result.data) {
    result = await trySelect(
      `*, project:projects(id, title, slug, nonprofit:nonprofits(id, name))`,
      projectFilter
    )
  }

  // Try 3: project join only, no donor profile join (profiles RLS blocks unauthenticated reads)
  if (result.error || !result.data) {
    result = await trySelect(`*, project:projects(id, title, slug)`, projectFilter)
  }

  // Try 4: no joins at all
  if (result.error || !result.data) {
    result = await trySelect(`*`, projectFilter)
  }

  donations = result.data ?? []

  // If donations came back without donor info, enrich separately using admin client
  const hasDonorInfo = donations.some((d: any) => d.donor)
  if (!hasDonorInfo && donations.length > 0 && admin) {
    const donorIds = [...new Set(donations.map((d: any) => d.donor_id).filter(Boolean))]
    if (donorIds.length > 0) {
      const { data: profiles } = await admin
        .from('profiles')
        .select('id, full_name, avatar_url, email')
        .in('id', donorIds)
      if (profiles) {
        const profileMap = Object.fromEntries(profiles.map((p: any) => [p.id, p]))
        donations = donations.map((d: any) => ({
          ...d,
          donor: profileMap[d.donor_id] || null
        }))
      }
    }
  }

  // If donations came back without project info, enrich separately
  const hasProjectInfo = donations.some((d: any) => d.project)
  if (!hasProjectInfo && donations.length > 0) {
    const projectIds = [...new Set(donations.map((d: any) => d.project_id).filter(Boolean))]
    if (projectIds.length > 0) {
      const { data: projects } = await client
        .from('projects')
        .select('id, title, slug')
        .in('id', projectIds)
      if (projects) {
        const projectMap = Object.fromEntries(projects.map((p: any) => [p.id, p]))
        donations = donations.map((d: any) => ({
          ...d,
          project: projectMap[d.project_id] || null
        }))
      }
    }
  }

  rawCount = donations.length
  console.log('[donations page] result count:', rawCount)

  // Separate simple count to detect rows even if joins fail
  const { count: dbCount } = await client
    .from('donations')
    .select('*', { count: 'exact', head: true })
  console.log('[donations page] db count (no join):', dbCount)

  return (
    <AdminShell role={profile.role}>
      <AdminDonationsClient
        initialDonations={donations || []}
        role={profile.role}
        missingServiceKey={missingServiceKey}
        rawCount={rawCount ?? 0}
        dbCount={dbCount ?? 0}
      />
    </AdminShell>
  )
}
