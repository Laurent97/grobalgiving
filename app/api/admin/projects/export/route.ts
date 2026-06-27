import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    let query = supabase
      .from('projects')
      .select('*, nonprofits(name)')
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)

    const { data: projects, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Generate CSV
    const headers = [
      'ID',
      'Title',
      'Nonprofit',
      'Description',
      'Goal Amount',
      'Amount Received',
      'Amount Left',
      'Status',
      'Category',
      'Location',
      'Featured',
      'Visible',
      'Start Date',
      'End Date',
      'Created At'
    ]

    const rows = projects?.map(p => [
      p.id,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.nonprofits?.name || 'N/A'}"`,
      `"${p.description.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      p.goal_amount,
      p.amount_received || 0,
      (p.goal_amount - (p.amount_received || 0)),
      p.status,
      p.category || 'N/A',
      p.location || 'N/A',
      p.featured ? 'Yes' : 'No',
      p.is_visible ? 'Yes' : 'No',
      p.start_date || 'N/A',
      p.end_date || 'N/A',
      p.created_at
    ]) || []

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="projects-export-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
