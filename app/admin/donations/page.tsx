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

  if (isNonprofitAdmin) {
    const { data: projectIds, error: pidErr } = await client
      .from('projects')
      .select('id')
      .eq('nonprofit_id', profile.nonprofit_id!)

    if (pidErr) console.error('[donations page] project ids error:', pidErr.message)
    const ids = (projectIds || []).map((p: any) => p.id)

    const { data, error } = await client
      .from('donations')
      .select(`*, project:projects(id, title, slug, nonprofit:nonprofits(id, name)), donor:profiles(id, full_name, avatar_url)`)
      .in('project_id', ids.length > 0 ? ids : ['00000000-0000-0000-0000-000000000000'])
      .order('created_at', { ascending: false })

    if (error) console.error('[donations page] nonprofit admin query error:', error.message)
    rawCount = data?.length ?? 0
    console.log('[donations page] nonprofit admin result count:', rawCount)
    donations = data
  } else {
    const { data, error } = await client
      .from('donations')
      .select(`*, project:projects(id, title, slug, nonprofit:nonprofits(id, name)), donor:profiles(id, full_name, avatar_url)`)
      .order('created_at', { ascending: false })

    if (error) console.error('[donations page] admin query error:', error.message)
    rawCount = data?.length ?? 0
    console.log('[donations page] admin result count:', rawCount)
    donations = data
  }

  return (
    <AdminShell role={profile.role}>
      <AdminDonationsClient
        initialDonations={donations || []}
        role={profile.role}
        missingServiceKey={missingServiceKey}
        rawCount={rawCount ?? 0}
      />
    </AdminShell>
  )
}
