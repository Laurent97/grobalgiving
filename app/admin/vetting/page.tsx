import { unstable_noStore } from 'next/cache'
import { requireAdmin } from '@/lib/supabase/admin'
import AdminShell from '@/components/admin/AdminShell'
import VettingClient from './VettingClient'

export const dynamic = 'force-dynamic'

export default async function Page() {
  unstable_noStore()
  const { profile } = await requireAdmin()
  return (
    <AdminShell role={profile.role}>
      <VettingClient />
    </AdminShell>
  )
}
