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

  let query
  let missingServiceKey = false

  const admin = createAdminClient()
  if (admin) {
    query = admin
      .from('donations')
      .select(`
        *,
        project:projects(*, nonprofit:nonprofits(*)),
        donor:profiles(*)
      `)
      .order('created_at', { ascending: false })
  } else {
    missingServiceKey = true
    const supabase = await createClient()
    query = supabase
      .from('donations')
      .select(`
        *,
        project:projects(*, nonprofit:nonprofits(*)),
        donor:profiles(*)
      `)
      .order('created_at', { ascending: false })
  }

  if (profile.role === 'nonprofit_admin' && profile.nonprofit_id) {
    query = query.eq('project.nonprofit_id', profile.nonprofit_id)
  }

  const { data: donations } = await query

  return (
    <AdminShell role={profile.role}>
      <AdminDonationsClient
        initialDonations={donations || []}
        role={profile.role}
        missingServiceKey={missingServiceKey}
      />
    </AdminShell>
  )
}
