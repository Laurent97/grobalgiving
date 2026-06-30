import { unstable_noStore } from 'next/cache'
import { requireAdmin } from '@/lib/supabase/admin'
import { createAdminClient } from '@/lib/supabase/admin-client'
import AdminShell from '@/components/admin/AdminShell'
import AdminUsersClient from './AdminUsersClient'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  unstable_noStore()
  const { profile } = await requireAdmin()

  const admin = createAdminClient()

  const [{ data: profiles }, { data: nonprofits }] = await Promise.all([
    admin
      .from('profiles')
      .select('id, full_name, role, nonprofit_id, avatar_url, created_at')
      .order('created_at', { ascending: false }),
    admin
      .from('nonprofits')
      .select('id, name')
      .order('name', { ascending: true }),
  ])

  const profilesWithNonprofit = (profiles || []).map((p) => ({
    ...p,
    nonprofit: (nonprofits || []).find((n) => n.id === p.nonprofit_id) || null,
  }))

  return (
    <AdminShell role={profile.role}>
      <AdminUsersClient
        profiles={profilesWithNonprofit}
        nonprofits={nonprofits || []}
      />
    </AdminShell>
  )
}
