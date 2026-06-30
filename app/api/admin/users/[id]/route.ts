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
    const body = await req.json()

    const { full_name, role, nonprofit_id } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing user id' }, { status: 400 })
    }

    const validRoles: UserRole[] = ['admin', 'nonprofit_admin', 'donor']
    if (role && !validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const admin = createAdminClient()
    if (!admin) {
      return NextResponse.json({ error: 'Admin client not configured. Add SUPABASE_SERVICE_ROLE_KEY.' }, { status: 503 })
    }

    const updateData: Record<string, any> = {}
    if (full_name !== undefined) updateData.full_name = full_name
    if (role !== undefined) updateData.role = role
    if (nonprofit_id !== undefined) updateData.nonprofit_id = nonprofit_id || null

    const { data: profile, error } = await admin
      .from('profiles')
      .update(updateData)
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

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Missing user id' }, { status: 400 })
    }

    const admin = createAdminClient()
    if (!admin) {
      return NextResponse.json({ error: 'Admin client not configured. Add SUPABASE_SERVICE_ROLE_KEY.' }, { status: 503 })
    }

    // 1. Remove or nullify FK references so the profile can be deleted
    await admin.from('donations').update({ donor_id: null }).eq('donor_id', id)
    await admin.from('updates').update({ author_id: null }).eq('author_id', id)
    await admin.from('admin_audit_log').update({ admin_id: null }).eq('admin_id', id)
    await admin.from('favorites').delete().eq('user_id', id)

    // 2. Delete the profile row
    const { error: profileError } = await admin.from('profiles').delete().eq('id', id)
    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    // 3. Delete the auth user
    const { error: authError } = await admin.auth.admin.deleteUser(id)
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
