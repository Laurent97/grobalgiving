import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/admin'
import { createAdminClient } from '@/lib/supabase/admin-client'

// PATCH - Update donor_count for a project
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAdmin()
    const { id } = await params

    const body = await req.json()
    const { donor_count } = body

    if (typeof donor_count !== 'number' || donor_count < 0 || !Number.isInteger(donor_count)) {
      return NextResponse.json({ error: 'donor_count must be a non-negative integer' }, { status: 400 })
    }

    const admin = createAdminClient()
    if (!admin) {
      return NextResponse.json({ error: 'Admin client not configured. Add SUPABASE_SERVICE_ROLE_KEY.' }, { status: 503 })
    }

    const { data: project, error } = await admin
      .from('projects')
      .update({ donor_count })
      .eq('id', id)
      .select('id, title, donor_count')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    await admin.from('admin_audit_log').insert({
      admin_id: user.id,
      action: 'update_donor_count',
      target_id: id,
      new_value: { donor_count }
    }).then(() => {})

    return NextResponse.json({ project })
  } catch (error: any) {
    console.error('Error updating donor_count:', error)
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 })
  }
}
