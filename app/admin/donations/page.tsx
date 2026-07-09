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

  // Try join with project+nonprofit; fall back to simpler join if that fails
  const FULL_SELECT = `*, project:projects(id, title, slug, nonprofit:nonprofits(id, name)), donor:profiles(id, full_name, avatar_url, email)`
  const SIMPLE_SELECT = `*, project:projects(id, title, slug), donor:profiles(id, full_name, avatar_url, email)`

  async function queryDonations(filter?: Record<string, any>) {
    let q = client.from('donations').select(FULL_SELECT).order('created_at', { ascending: false })
    if (filter?.in) q = (q as any).in('project_id', filter.in)
    const { data, error } = await q
    if (error) {
      console.error('[donations page] full join error:', error.message, '— retrying with simple join')
      let q2 = client.from('donations').select(SIMPLE_SELECT).order('created_at', { ascending: false })
      if (filter?.in) q2 = (q2 as any).in('project_id', filter.in)
      const { data: data2, error: err2 } = await q2
      if (err2) console.error('[donations page] simple join error:', err2.message)
      return data2 ?? []
    }
    return data ?? []
  }

  if (isNonprofitAdmin) {
    const { data: projectIds, error: pidErr } = await client
      .from('projects')
      .select('id')
      .eq('nonprofit_id', profile.nonprofit_id!)

    if (pidErr) console.error('[donations page] project ids error:', pidErr.message)
    const ids = (projectIds || []).map((p: any) => p.id)
    const filterIds = ids.length > 0 ? ids : ['00000000-0000-0000-0000-000000000000']

    donations = await queryDonations({ in: filterIds })
  } else {
    donations = await queryDonations()
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
