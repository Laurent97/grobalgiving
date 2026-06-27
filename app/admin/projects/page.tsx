import { unstable_noStore } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireNonprofitAdmin } from '@/lib/supabase/admin'
import AdminShell from '@/components/admin/AdminShell'
import AdminProjectsClient from './AdminProjectsClient'

export const dynamic = 'force-dynamic'

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: { status?: string; featured?: string; search?: string; page?: string }
}) {
  unstable_noStore()
  const { profile } = await requireNonprofitAdmin()

  const supabase = await createClient()

  // Fetch nonprofits for the create form
  let nonprofitQuery = supabase.from('nonprofits').select('id, name').order('name')
  if (profile.role === 'nonprofit_admin' && profile.nonprofit_id) {
    nonprofitQuery = nonprofitQuery.eq('id', profile.nonprofit_id)
  }
  const { data: nonprofits } = await nonprofitQuery

  return (
    <AdminShell role={profile.role}>
      <AdminProjectsClient
        initialStatus={searchParams.status}
        initialFeatured={searchParams.featured}
        initialSearch={searchParams.search}
        initialPage={searchParams.page ? Number(searchParams.page) : 1}
        nonprofits={nonprofits || []}
        role={profile.role}
        nonprofitId={profile.nonprofit_id}
      />
    </AdminShell>
  )
}
