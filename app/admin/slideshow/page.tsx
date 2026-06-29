import { unstable_noStore } from 'next/cache'
import { requireAdmin } from '@/lib/supabase/admin'
import AdminShell from '@/components/admin/AdminShell'
import SlideshowClient from './SlideshowClient'

export const dynamic = 'force-dynamic'

export default async function AdminSlideshowPage() {
  unstable_noStore()
  const { profile } = await requireAdmin()

  return (
    <AdminShell role={profile.role}>
      <SlideshowClient />
    </AdminShell>
  )
}
