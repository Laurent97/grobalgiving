import { redirect } from 'next/navigation'
import { createClient } from './server'
import type { UserRole } from '@/lib/permissions'

export async function requireAdmin() {
  return requireRole(['admin'])
}

export async function requireNonprofitAdmin() {
  return requireRole(['admin', 'nonprofit_admin'])
}

export async function requireRole(allowedRoles: UserRole[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, nonprofit_id')
    .eq('id', user.id)
    .single()

  if (!profile || !allowedRoles.includes(profile.role as UserRole)) redirect('/')

  return { user, profile: profile as { role: UserRole; nonprofit_id?: string | null } }
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, nonprofit_id')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  return { user, profile: profile as { role: UserRole; nonprofit_id?: string | null } }
}
