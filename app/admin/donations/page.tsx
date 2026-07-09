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
  const admin = createAdminClient()

  // Build the select – for nonprofit admins, use an inner join so PostgREST
  // filters on the related table; for full admins just fetch everything.
  const isNonprofitAdmin = profile.role === 'nonprofit_admin' && !!profile.nonprofit_id

  let donations: any[] | null = null

  if (admin) {
    if (isNonprofitAdmin) {
      // Filter via the projects table using a subquery on project_id
      const { data: projectIds } = await admin
        .from('projects')
        .select('id')
        .eq('nonprofit_id', profile.nonprofit_id!)

      const ids = (projectIds || []).map((p: any) => p.id)

      const { data } = await admin
        .from('donations')
        .select(`*, project:projects(*, nonprofit:nonprofits(*)), donor:profiles(*)`)
        .in('project_id', ids.length > 0 ? ids : ['00000000-0000-0000-0000-000000000000'])
        .order('created_at', { ascending: false })

      donations = data
    } else {
      const { data } = await admin
        .from('donations')
        .select(`*, project:projects(*, nonprofit:nonprofits(*)), donor:profiles(*)`)
        .order('created_at', { ascending: false })

      donations = data
    }
  } else {
    missingServiceKey = true
    const supabase = await createClient()

    const { data } = await supabase
      .from('donations')
      .select(`*, project:projects(*, nonprofit:nonprofits(*)), donor:profiles(*)`)
      .order('created_at', { ascending: false })

    donations = data
  }

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
