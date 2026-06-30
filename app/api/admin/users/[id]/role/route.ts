import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/admin'
import { createAdminClient } from '@/lib/supabase/admin-client'
import type { UserRole } from '@/lib/permissions'

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()

    const { id } = await params
    const { role } = await req.json()

    if (!id || !role) {
      return NextResponse.json({ error: 'Missing user id or role' }, { status: 400 })
    }

    const validRoles: UserRole[] = ['admin', 'nonprofit_admin', 'donor']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const admin = createAdminClient()
    if (!admin) {
      return NextResponse.json({ error: 'Admin client not configured. Add SUPABASE_SERVICE_ROLE_KEY.' }, { status: 503 })
    }

    const { data: profile, error } = await admin
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ profile })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
