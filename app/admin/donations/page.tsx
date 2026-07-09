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

  // Progressive fallback selects — use the first one that succeeds.
  // This handles any state of the production schema (partially migrated, etc.)
  const SELECTS = [
    `*, project:projects(id, title, slug, nonprofit:nonprofits(id, name)), donor:profiles(id, full_name, avatar_url, email)`,
    `*, project:projects(id, title, slug), donor:profiles(id, full_name, avatar_url, email)`,
    `*, project:projects(id, title, slug), donor:profiles(id, full_name)`,
    `id, donor_id, project_id, amount, currency, status, payment_method_type, payment_method_id, transaction_reference, receipt_url, admin_notes, verified_at, dedication_type, dedication_name, donor_comment, created_at`,
    `id, donor_id, project_id, amount, currency, status, created_at`,
  ]

  async function queryDonations(filter?: Record<string, any>) {
    for (const sel of SELECTS) {
      let q = client.from('donations').select(sel).order('created_at', { ascending: false })
      if (filter?.in) q = (q as any).in('project_id', filter.in)
      const { data, error } = await q
      if (!error && data) {
        console.log('[donations page] select succeeded:', sel.slice(0, 60))
        return data
      }
      console.error('[donations page] select failed, trying simpler:', error?.message)
    }
    return []
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
