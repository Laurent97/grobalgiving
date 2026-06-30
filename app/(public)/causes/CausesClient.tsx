'use client'

import { useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Search, SlidersHorizontal, X, ChevronLeft, ChevronRight,
  AlertTriangle, GraduationCap, HeartPulse, Leaf, Droplets,
  Baby, Users, Home, Sparkles, LayoutGrid, List, TrendingUp,
  MapPin, Heart
} from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'

// ── Constants ────────────────────────────────────────────────
const C = { primary: '#F08B1D', dark: '#3E4B59', bg: '#f8f9fa', sand: '#FEF3C7' }

const CATEGORY_META: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  'Education':             { label: 'Education',         icon: GraduationCap, color: 'text-blue-600',   bg: 'bg-blue-50' },
  'Physical Health':       { label: 'Health',            icon: HeartPulse,    color: 'text-red-500',    bg: 'bg-red-50' },
  'Child Protection':      { label: 'Child Protection',  icon: Baby,          color: 'text-pink-500',   bg: 'bg-pink-50' },
  'Economic Opportunity':  { label: 'Economic',          icon: TrendingUp,    color: 'text-emerald-600',bg: 'bg-emerald-50' },
  'Water & Sanitation':    { label: 'Clean Water',       icon: Droplets,      color: 'text-cyan-500',   bg: 'bg-cyan-50' },
  'disaster':              { label: 'Disaster Relief',   icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50' },
  'environment':           { label: 'Environment',       icon: Leaf,          color: 'text-green-600',  bg: 'bg-green-50' },
  'women':                 { label: 'Women',             icon: Users,         color: 'text-purple-500', bg: 'bg-purple-50' },
  'housing':               { label: 'Housing',           icon: Home,          color: 'text-amber-600',  bg: 'bg-amber-50' },
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'funded', label: 'Most funded' },
  { value: 'goal',   label: 'Largest goal' },
]

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

// ── Types ─────────────────────────────────────────────────────
interface Project {
  id: string
  title: string
  slug: string
  description: string
  category: string
  goal_amount: number
  amount_received?: number
  current_amount?: number
  main_image_url?: string
  location?: string
  location_country?: string
  featured?: boolean
  status: string
}

interface Props {
  initialProjects: Project[]
  totalCount: number
  page: number
  pageSize: number
  categoryCounts: Record<string, number>
  urgentCount: number
  initialFilters: { search?: string; category?: string; sort?: string; urgent?: string }
}

// ── Project Card ──────────────────────────────────────────────
function ProjectCard({ project, view }: { project: Project; view: 'grid' | 'list' }) {
  const raised = project.amount_received ?? project.current_amount ?? 0
  const pct    = project.goal_amount > 0 ? Math.min((raised / project.goal_amount) * 100, 100) : 0
  const meta   = CATEGORY_META[project.category] || { label: project.category, icon: Sparkles, color: 'text-gray-500', bg: 'bg-gray-50' }
  const Icon   = meta.icon
  const location = project.location_country || project.location

  if (view === 'list') {
    return (
      <Link href={`/projects/${project.slug}`}
        className="flex gap-4 bg-white rounded-2xl border border-gray-100 hover:border-[#F08B1D]/40 hover:shadow-lg transition-all duration-200 p-4 group">
        <div className="relative w-28 h-24 rounded-xl overflow-hidden shrink-0 bg-gray-100">
          {project.main_image_url
            ? <Image src={project.main_image_url} alt={project.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="112px" />
            : <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-200">{project.title.charAt(0)}</div>}
          {project.featured && (
            <span className="absolute top-1.5 left-1.5 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <AlertTriangle size={9} /> Urgent
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-[#3E4B59] text-sm leading-snug group-hover:text-[#F08B1D] transition-colors line-clamp-2">{project.title}</h3>
            <span className={`shrink-0 flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>
              <Icon size={11} />{meta.label}
            </span>
          </div>
          {location && <p className="text-xs text-gray-400 flex items-center gap-1 mb-2"><MapPin size={11} />{location}</p>}
          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden mb-1">
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: C.primary }} />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span><strong className="text-[#3E4B59]">{fmt(raised)}</strong> raised of {fmt(project.goal_amount)}</span>
            <span>{Math.round(pct)}%</span>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/projects/${project.slug}`}
      className="group bg-white rounded-2xl border border-gray-100 hover:border-[#F08B1D]/40 hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col">
      <div className="relative h-44 bg-gray-100 overflow-hidden">
        {project.main_image_url
          ? <Image src={project.main_image_url} alt={project.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw" />
          : <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-200">{project.title.charAt(0)}</div>}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {project.featured && (
          <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <AlertTriangle size={11} /> Urgent
          </span>
        )}
        <span className={`absolute top-3 right-3 flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${meta.bg} ${meta.color}`}>
          <Icon size={11} />{meta.label}
        </span>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-[#3E4B59] text-sm leading-snug group-hover:text-[#F08B1D] transition-colors mb-1 line-clamp-2">{project.title}</h3>
        {location && <p className="text-xs text-gray-400 flex items-center gap-1 mb-2"><MapPin size={11} />{location}</p>}
        {project.description && <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{project.description}</p>}
        <div className="mt-auto">
          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden mb-1.5">
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: C.primary }} />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span><strong className="text-[#3E4B59]">{fmt(raised)}</strong> raised</span>
            <span className="font-medium" style={{ color: C.primary }}>{Math.round(pct)}%</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">of {fmt(project.goal_amount)} goal</p>
        </div>
      </div>
    </Link>
  )
}

// ── Main Page ─────────────────────────────────────────────────
export default function CausesClient({
  initialProjects, totalCount, page, pageSize,
  categoryCounts, urgentCount, initialFilters,
}: Props) {
  const router   = useRouter()
  const pathname = usePathname()
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const search   = initialFilters.search   || ''
  const category = initialFilters.category || ''
  const sort     = initialFilters.sort     || 'newest'
  const urgent   = initialFilters.urgent   === '1'

  const totalPages = Math.ceil(totalCount / pageSize)

  const buildUrl = useCallback((overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams()
    const merged = { search, category, sort, urgent: urgent ? '1' : undefined, page: String(page), ...overrides }
    if (merged.search)   params.set('search',   merged.search)
    if (merged.category) params.set('category', merged.category)
    if (merged.sort && merged.sort !== 'newest') params.set('sort', merged.sort)
    if (merged.urgent === '1') params.set('urgent', '1')
    if (merged.page && merged.page !== '1') params.set('page', merged.page)
    const qs = params.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }, [search, category, sort, urgent, page, pathname])

  const navigate = (overrides: Record<string, string | undefined>) => {
    router.push(buildUrl({ ...overrides, page: '1' }))
  }

  const activeFilterCount = [search, category, urgent ? '1' : ''].filter(Boolean).length

  return (
    <div className="min-h-screen" style={{ background: C.bg }}>

      {/* ── Page Header ── */}
      <div style={{ background: C.dark }} className="py-14 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#F08B1D] mb-2">All Causes</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3" style={{ fontFamily: 'Aleo, Georgia, serif' }}>
            Find Your Cause
          </h1>
          <p className="text-lg text-white/70 max-w-xl mx-auto mb-8">
            Browse every active project. Filter by category, urgency, or funding status.
          </p>
          {/* Inline search */}
          <div className="max-w-xl mx-auto flex bg-white rounded-xl overflow-hidden shadow-xl">
            <div className="flex-1 flex items-center gap-3 px-4">
              <Search size={18} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search projects or causes…"
                defaultValue={search}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') navigate({ search: (e.target as HTMLInputElement).value || undefined })
                }}
                onChange={(e) => {
                  if (!e.target.value) navigate({ search: undefined })
                }}
                className="flex-1 py-3.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
              />
              {search && (
                <button onClick={() => navigate({ search: undefined })} className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              )}
            </div>
            <button
              onClick={() => {
                const input = document.querySelector<HTMLInputElement>('input[placeholder="Search projects or causes…"]')
                navigate({ search: input?.value || undefined })
              }}
              className="px-6 py-3.5 text-white text-sm font-semibold transition-colors"
              style={{ background: C.primary }}
            >
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">

          {/* ── Sidebar Filters (desktop) ── */}
          <aside className="hidden lg:block w-60 shrink-0">
            <FilterPanel
              category={category} urgent={urgent} sort={sort}
              categoryCounts={categoryCounts} urgentCount={urgentCount}
              navigate={navigate}
            />
          </aside>

          {/* ── Main Content ── */}
          <div className="flex-1 min-w-0">

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm text-gray-600">
                  <strong className="text-[#3E4B59]">{totalCount}</strong> project{totalCount !== 1 ? 's' : ''} found
                </p>
                {/* Active filter chips */}
                {category && (
                  <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">
                    {CATEGORY_META[category]?.label || category}
                    <button onClick={() => navigate({ category: undefined })}><X size={11} /></button>
                  </span>
                )}
                {urgent && (
                  <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">
                    Urgent only
                    <button onClick={() => navigate({ urgent: undefined })}><X size={11} /></button>
                  </span>
                )}
                {search && (
                  <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                    "{search}"
                    <button onClick={() => navigate({ search: undefined })}><X size={11} /></button>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Mobile filter button */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-xl hover:border-[#F08B1D] transition relative"
                >
                  <SlidersHorizontal size={15} />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[10px] font-bold text-white flex items-center justify-center" style={{ background: C.primary }}>
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* Sort */}
                <select
                  value={sort}
                  onChange={(e) => navigate({ sort: e.target.value })}
                  className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F08B1D]/30"
                >
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>

                {/* View toggle */}
                <div className="flex border border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => setView('grid')} className={`p-2 transition ${view === 'grid' ? 'bg-[#F08B1D] text-white' : 'text-gray-500 hover:bg-gray-50'}`}><LayoutGrid size={16} /></button>
                  <button onClick={() => setView('list')} className={`p-2 transition ${view === 'list' ? 'bg-[#F08B1D] text-white' : 'text-gray-500 hover:bg-gray-50'}`}><List size={16} /></button>
                </div>
              </div>
            </div>

            {/* Projects */}
            {initialProjects.length > 0 ? (
              <>
                <div className={view === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'
                  : 'flex flex-col gap-4'}>
                  {initialProjects.map(p => <ProjectCard key={p.id} project={p} view={view} />)}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-10 flex-wrap">
                    {page > 1 && (
                      <Link href={buildUrl({ page: String(page - 1) })}
                        className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition">
                        <ChevronLeft size={15} /> Prev
                      </Link>
                    )}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <Link key={p} href={buildUrl({ page: String(p) })}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-semibold transition ${
                          p === page ? 'text-white shadow-md' : 'border border-gray-200 hover:bg-gray-50'
                        }`}
                        style={p === page ? { background: C.primary } : {}}>
                        {p}
                      </Link>
                    ))}
                    {page < totalPages && (
                      <Link href={buildUrl({ page: String(page + 1) })}
                        className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition">
                        Next <ChevronRight size={15} />
                      </Link>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <Heart className="w-14 h-14 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No projects found</h3>
                <p className="text-gray-400 text-sm mb-6">Try adjusting your filters or search term.</p>
                <Link href="/causes" className="px-6 py-3 rounded-xl text-white text-sm font-semibold transition-colors" style={{ background: C.primary }}>
                  Clear all filters
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Filter Drawer ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-lg" style={{ color: C.dark }}>Filters</h2>
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>
            <FilterPanel
              category={category} urgent={urgent} sort={sort}
              categoryCounts={categoryCounts} urgentCount={urgentCount}
              navigate={(overrides) => { navigate(overrides); setSidebarOpen(false) }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Filter Panel ──────────────────────────────────────────────
function FilterPanel({ category, urgent, sort, categoryCounts, urgentCount, navigate }: {
  category: string; urgent: boolean; sort: string
  categoryCounts: Record<string, number>; urgentCount: number
  navigate: (o: Record<string, string | undefined>) => void
}) {
  const total = Object.values(categoryCounts).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-6">
      {/* Urgency */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Urgency</p>
        <button
          onClick={() => navigate({ urgent: urgent ? undefined : '1' })}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium border transition ${
            urgent ? 'border-orange-300 bg-orange-50 text-orange-700' : 'border-gray-100 bg-white text-gray-600 hover:border-orange-200'
          }`}
        >
          <span className="flex items-center gap-2"><AlertTriangle size={14} /> Urgent / Featured</span>
          <span className="text-xs bg-orange-100 text-orange-600 font-semibold px-2 py-0.5 rounded-full">{urgentCount}</span>
        </button>
      </div>

      {/* Categories */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Category</p>
        <div className="space-y-1">
          <button
            onClick={() => navigate({ category: undefined })}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium border transition ${
              !category ? 'border-[#F08B1D]/40 bg-orange-50 text-[#F08B1D]' : 'border-transparent text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center gap-2"><Sparkles size={14} /> All Categories</span>
            <span className="text-xs text-gray-400">{total}</span>
          </button>
          {Object.entries(CATEGORY_META).map(([key, meta]) => {
            const count = categoryCounts[key] || 0
            if (count === 0) return null
            const Icon = meta.icon
            const active = category === key
            return (
              <button
                key={key}
                onClick={() => navigate({ category: active ? undefined : key })}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium border transition ${
                  active ? 'border-[#F08B1D]/40 bg-orange-50 text-[#F08B1D]' : 'border-transparent text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className={`flex items-center gap-2 ${active ? '' : meta.color}`}>
                  <Icon size={14} /> {meta.label}
                </span>
                <span className="text-xs text-gray-400">{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Clear */}
      {(category || urgent) && (
        <button
          onClick={() => navigate({ category: undefined, urgent: undefined })}
          className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition flex items-center justify-center gap-2"
        >
          <X size={14} /> Clear filters
        </button>
      )}
    </div>
  )
}
