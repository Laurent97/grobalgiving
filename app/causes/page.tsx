import { createClient } from '@/lib/supabase/server'
import CausesClient from './CausesClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'All Causes & Projects | GlobalGiving',
  description: 'Browse all active projects and causes. Filter by category, urgency, funding progress and more.',
}

export default async function CausesPage({
  searchParams,
}: {
  searchParams: { search?: string; category?: string; sort?: string; urgent?: string; page?: string }
}) {
  const supabase = await createClient()
  const page = searchParams.page ? Number(searchParams.page) : 1
  const pageSize = 12
  const start = (page - 1) * pageSize

  let query = supabase
    .from('projects')
    .select('*', { count: 'exact' })
    .eq('status', 'active')
    .eq('is_visible', true)
    .range(start, start + pageSize - 1)

  if (searchParams.search) {
    query = query.ilike('title', `%${searchParams.search}%`)
  }
  if (searchParams.category) {
    query = query.eq('category', searchParams.category)
  }
  if (searchParams.urgent === '1') {
    query = query.eq('featured', true)
  }
  if (searchParams.sort === 'funded') {
    query = query.order('amount_received', { ascending: false })
  } else if (searchParams.sort === 'goal') {
    query = query.order('goal_amount', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data: projects, count } = await query

  // Fetch distinct categories with counts for filter sidebar
  const { data: allProjects } = await supabase
    .from('projects')
    .select('category, featured, amount_received, goal_amount')
    .eq('status', 'active')
    .eq('is_visible', true)

  const categoryCounts: Record<string, number> = {}
  let urgentCount = 0
  for (const p of allProjects ?? []) {
    if (p.category) categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1
    if (p.featured) urgentCount++
  }

  return (
    <CausesClient
      initialProjects={projects || []}
      totalCount={count || 0}
      page={page}
      pageSize={pageSize}
      categoryCounts={categoryCounts}
      urgentCount={urgentCount}
      initialFilters={{
        search: searchParams.search,
        category: searchParams.category,
        sort: searchParams.sort,
        urgent: searchParams.urgent,
      }}
    />
  )
}
