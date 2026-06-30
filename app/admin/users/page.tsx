import { unstable_noStore } from 'next/cache'
import { requireAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin-client'
import AdminShell from '@/components/admin/AdminShell'
import AdminUsersClient from './AdminUsersClient'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  unstable_noStore()
  const { profile } = await requireAdmin()

  let profiles: any[] = []
  let nonprofits: any[] = []
  let missingServiceKey = false

  const admin = createAdminClient()

  if (admin) {
    const [{ data: p }, { data: n }] = await Promise.all([
      admin
        .from('profiles')
        .select('id, full_name, role, nonprofit_id, avatar_url, created_at')
        .order('created_at', { ascending: false }),
      admin
        .from('nonprofits')
        .select('id, name')
        .order('name', { ascending: true }),
    ])
    profiles = p || []
    nonprofits = n || []
  } else {
    missingServiceKey = true
    // Fallback: read with the normal server client (RLS public policies apply)
    const supabase = await createClient()
    const [{ data: p }, { data: n }] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, full_name, role, nonprofit_id, avatar_url, created_at')
        .order('created_at', { ascending: false }),
      supabase
        .from('nonprofits')
        .select('id, name')
        .order('name', { ascending: true }),
    ])
    profiles = p || []
    nonprofits = n || []
  }

  const profilesWithNonprofit = profiles.map((p) => ({
    ...p,
    nonprofit: nonprofits.find((n) => n.id === p.nonprofit_id) || null,
  }))

  return (
    <AdminShell role={profile.role}>
      <AdminUsersClient
        profiles={profilesWithNonprofit}
        nonprofits={nonprofits}
        missingServiceKey={missingServiceKey}
      />
    </AdminShell>
  )
}
