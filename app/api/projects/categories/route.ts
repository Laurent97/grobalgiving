import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  try {
    const supabase = await createClient()

    // Get all unique categories with project counts
    const { data: categories, error } = await supabase
      .from('projects')
      .select('category')
      .eq('status', 'active')
      .eq('is_visible', true)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Count projects per category
    const categoryCounts = (categories || []).reduce((acc: Record<string, number>, project) => {
      const cat = project.category || 'Other'
      acc[cat] = (acc[cat] || 0) + 1
      return acc
    }, {})

    // Format response
    const formattedCategories = Object.entries(categoryCounts).map(([name, count]) => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      count,
      slug: name.toLowerCase().replace(/\s+/g, '-')
    }))

    return NextResponse.json({ categories: formattedCategories })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
