import { unstable_noStore } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireNonprofitAdmin } from '@/lib/supabase/admin'
import AdminShell from '@/components/admin/AdminShell'
import AdminDonationsClient from './AdminDonationsClient'

export const dynamic = 'force-dynamic'

export default async function AdminDonationsPage() {
  unstable_noStore()
  const { profile } = await requireNonprofitAdmin()
  const supabase = await createClient()

  let query = supabase
    .from('donations')
    .select(`
      *,
      project:projects(*, nonprofit:nonprofits(*)),
      donor:profiles(*)
    `)
    .order('created_at', { ascending: false })

  if (profile.role === 'nonprofit_admin' && profile.nonprofit_id) {
    query = query.eq('project.nonprofit_id', profile.nonprofit_id)
  }

  const { data: donations } = await query

  return (
    <AdminShell role={profile.role}>
      <AdminDonationsClient initialDonations={donations || []} role={profile.role} />
    </AdminShell>
  )
}
