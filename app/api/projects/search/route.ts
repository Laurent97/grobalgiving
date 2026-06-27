import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q') || ''
    const location = searchParams.get('location') || ''
    const category = searchParams.get('category') || ''
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 10

    if (!query && !location && !category) {
      return NextResponse.json({ error: 'At least one search parameter required' }, { status: 400 })
    }

    const supabase = await createClient()
    const start = (page - 1) * limit

    let dbQuery = supabase
      .from('projects')
      .select('*, nonprofits(name, logo_url)', { count: 'exact' })
      .eq('status', 'active')
      .eq('is_visible', true)
      .range(start, start + limit - 1)

    // Full-text search on title and description
    if (query) {
      dbQuery = dbQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    }

    // Filter by location
    if (location) {
      dbQuery = dbQuery.ilike('location', `%${location}%`)
    }

    // Filter by category
    if (category) {
      dbQuery = dbQuery.eq('category', category)
    }

    // Order by relevance (simple: created_at desc for now)
    dbQuery = dbQuery.order('created_at', { ascending: false })

    const { data: projects, count, error } = await dbQuery

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({
      projects: projects || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasMore: (count || 0) > page * limit
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
