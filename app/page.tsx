import { createClient } from '@/lib/supabase/server'
import ProjectCard from '@/components/ProjectCard'
import Hero from '@/components/Hero'
import CategoryGrid from '@/components/CategoryGrid'
import FeaturedProjects from '@/components/FeaturedProjects'
import UrgentProjects from '@/components/UrgentProjects'
import ImpactStats from '@/components/ImpactStats'
import HowItWorks from '@/components/HowItWorks'
import Testimonials from '@/components/Testimonials'
import SearchFilterClient from '@/components/SearchFilterClient'
import Newsletter from '@/components/Newsletter'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getStats() {
  try {
    const supabase = await createClient()

    // Sum amount_received across all active projects — the authoritative raised total
    const { data: projectAmounts } = await supabase
      .from('projects')
      .select('amount_received')
      .eq('status', 'active')

    const totalRaised = (projectAmounts ?? []).reduce((sum, p) => sum + (p.amount_received || 0), 0)

    const { count: projectsFunded } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .gt('amount_received', 0)

    // Count unique donors from all donations (any status)
    const { count: donors } = await supabase
      .from('donations')
      .select('donor_id', { count: 'exact', head: true })
      .not('donor_id', 'is', null)

    const { data: locations } = await supabase
      .from('projects')
      .select('location_country')
      .eq('status', 'active')
      .not('location_country', 'is', null)

    const countries = new Set((locations || []).map(p => p.location_country).filter(Boolean)).size

    return { totalRaised, projectsFunded: projectsFunded || 0, donors: donors || 0, countries }
  } catch (error) {
    console.error('Error fetching stats:', error)
    return { totalRaised: 0, projectsFunded: 0, donors: 0, countries: 0 }
  }
}

async function getProjects(filters?: { search?: string; category?: string; sort?: string; page?: number }) {
  try {
    const supabase = await createClient()
    const page = filters?.page || 1
    const pageSize = 12
    const start = (page - 1) * pageSize

    let query = supabase
      .from('projects')
      .select('*', { count: 'exact' })
      .eq('status', 'active')
      .eq('is_visible', true)
      .range(start, start + pageSize - 1)

    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`)
    }
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    if (filters?.sort === 'funded') {
      query = query.order('current_amount', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data: projects, count } = await query
    return { projects: projects || [], count: count || 0, page, pageSize }
  } catch (error) {
    console.error('Error fetching projects:', error)
    return { projects: [], count: 0, page: filters?.page || 1, pageSize: 12 }
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: { search?: string; category?: string; sort?: string; page?: string }
}) {
  const { projects, count, page, pageSize } = await getProjects({
    search: searchParams.search,
    category: searchParams.category,
    sort: searchParams.sort,
    page: searchParams.page ? Number(searchParams.page) : 1,
  })

  const stats = await getStats()
  const totalPages = count ? Math.ceil(count / pageSize) : 1

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section with Search */}
      <Hero stats={stats} />

      {/* Category Grid */}
      <CategoryGrid />

      {/* Featured Projects */}
      <FeaturedProjects />

      {/* Urgent Projects */}
      <UrgentProjects />

      {/* Impact Stats & Trust Signals */}
      <ImpactStats
        totalRaised={stats.totalRaised}
        donors={stats.donors}
        projectsFunded={stats.projectsFunded}
        countries={stats.countries}
      />

      {/* All Projects Section */}
      <section id="all-projects" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explore All Projects
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover more causes and make a difference today.
            </p>
          </div>

          {/* Search and Filters */}
          <SearchFilterClient
            initial={{
              search: searchParams.search,
              category: searchParams.category,
              sort: searchParams.sort,
            }}
          />

          {/* Projects Grid */}
          {projects && projects.length > 0 ? (
            <>
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <p className="text-sm sm:text-base text-gray-600">
                  Showing <strong>{(page - 1) * pageSize + 1}</strong>–<strong>{Math.min(page * pageSize, count || 0)}</strong> of <strong>{count || 0}</strong> projects
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-12 flex-wrap">
                  {page > 1 && (
                    <Link
                      href={`?page=${page - 1}${searchParams.search ? `&search=${searchParams.search}` : ''}${searchParams.category ? `&category=${searchParams.category}` : ''}${searchParams.sort ? `&sort=${searchParams.sort}` : ''}`}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                    >
                      ← Previous
                    </Link>
                  )}

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1
                    return (
                      <Link
                        key={pageNum}
                        href={`?page=${pageNum}${searchParams.search ? `&search=${searchParams.search}` : ''}${searchParams.category ? `&category=${searchParams.category}` : ''}${searchParams.sort ? `&sort=${searchParams.sort}` : ''}`}
                        className={`px-4 py-2 rounded-lg transition ${
                          page === pageNum
                            ? 'bg-gg-primary text-white'
                            : 'border border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </Link>
                    )
                  })}

                  {page < totalPages && (
                    <Link
                      href={`?page=${page + 1}${searchParams.search ? `&search=${searchParams.search}` : ''}${searchParams.category ? `&category=${searchParams.category}` : ''}${searchParams.sort ? `&sort=${searchParams.sort}` : ''}`}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                    >
                      Next →
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">No projects found matching your criteria</p>
              <Link href="/" className="text-gg-primary hover:text-gg-primary-700 font-medium">
                Clear filters
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <HowItWorks />

      {/* Testimonials */}
      <Testimonials />

      {/* Newsletter */}
      <Newsletter />
    </main>
  )
}
