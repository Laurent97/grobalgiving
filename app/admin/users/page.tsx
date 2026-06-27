import { unstable_noStore } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/admin'
import AdminShell from '@/components/admin/AdminShell'
import AdminUsersClient from './AdminUsersClient'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  unstable_noStore()
  const { profile } = await requireAdmin()
  const supabase = await createClient()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*, nonprofit:nonprofits(name)')
    .order('created_at', { ascending: false })

  return (
    <AdminShell role={profile.role}>
      <AdminUsersClient profiles={profiles || []} />
    </AdminShell>
  )
}
