import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/lib/permissions'

// GET - Fetch all donations with filters (admin and nonprofit admin)
export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, nonprofit_id')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'admin' && profile.role !== 'nonprofit_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const typedProfile = profile as { role: UserRole; nonprofit_id?: string | null }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const paymentMethod = searchParams.get('payment_method')
    const search = searchParams.get('search')

    let query = supabase
      .from('donations')
      .select(`
        *,
        project:projects(*, nonprofit:nonprofits(*)),
        donor:profiles(*)
      `)
      .order('created_at', { ascending: false })

    if (typedProfile.role === 'nonprofit_admin' && typedProfile.nonprofit_id) {
      query = query.eq('project.nonprofit_id', typedProfile.nonprofit_id)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (paymentMethod) {
      query = query.eq('payment_method_type', paymentMethod)
    }

    if (search) {
      query = query.or(`transaction_reference.ilike.%${search}%,project.title.ilike.%${search}%`)
    }

    const { data: donations, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ donations })
  } catch (error) {
    console.error('Error fetching donations:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
