import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(req.url)
    const limit = Number(searchParams.get('limit')) || 6

    const { data: projects, error } = await supabase
      .from('projects')
      .select('*, nonprofits(name, logo_url)')
      .eq('status', 'active')
      .eq('is_visible', true)
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ projects: projects || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
