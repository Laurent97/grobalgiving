'use client'

import { useState, useEffect } from 'react'
import { Search, Filter } from 'lucide-react'

interface SearchFilterProps {
  onFilter: (filters: { search?: string; category?: string; sort?: string }) => void
  initial?: { search?: string; category?: string; sort?: string }
}

const categories = ['All', 'Education', 'Physical Health', 'Child Protection', 'Economic Opportunity', 'Water & Sanitation']
const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'funded', label: 'Most Funded' },
  { value: 'trending', label: 'Trending' },
]

export default function SearchFilter({ onFilter, initial }: SearchFilterProps) {
  const [search, setSearch] = useState(initial?.search ?? '')
  const [category, setCategory] = useState(initial?.category ?? 'All')
  const [sort, setSort] = useState(initial?.sort ?? 'newest')
  const [isExpanded, setIsExpanded] = useState(false)

  // Keep local state in sync if `initial` changes (e.g., navigation)
  useEffect(() => {
    if (initial) {
      setSearch(initial.search ?? '')
      setCategory(initial.category ?? 'All')
      setSort(initial.sort ?? 'newest')
    }
  }, [initial])

  const handleApply = () => {
    onFilter({
      search: search || undefined,
      category: category !== 'All' ? category : undefined,
      sort,
    })
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8 p-4 sm:p-6">
      {/* Top row: search + sort + filter toggle */}
      <div className="flex flex-col sm:flex-row gap-3 mb-0">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
          <input
            type="text"
            placeholder="Search projects…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); onFilter({ search: e.target.value || undefined, category: category !== 'All' ? category : undefined, sort }) }}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent transition"
            style={{ '--tw-ring-color': '#F08B1D' } as React.CSSProperties}
          />
        </div>

        {/* Sort — always visible */}
        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); onFilter({ search: search || undefined, category: category !== 'All' ? category : undefined, sort: e.target.value }) }}
          className="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent transition bg-white shrink-0"
          style={{ '--tw-ring-color': '#F08B1D' } as React.CSSProperties}
          aria-label="Sort projects"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>

        {/* Filter toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border transition shrink-0 ${
            isExpanded ? 'border-[#F08B1D] text-[#F08B1D] bg-orange-50' : 'border-gray-200 text-gray-600 hover:border-[#F08B1D] hover:text-[#F08B1D]'
          }`}
          aria-expanded={isExpanded}
        >
          <Filter size={16} />
          <span className="hidden xs:inline">Filters</span>
          {category !== 'All' && (
            <span className="w-2 h-2 rounded-full bg-[#F08B1D] inline-block" />
          )}
        </button>
      </div>

      {/* Expandable category pills */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <label className="block text-xs font-semibold text-gray-500 mb-2.5 uppercase tracking-widest">Category</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); onFilter({ search: search || undefined, category: cat !== 'All' ? cat : undefined, sort }) }}
                className={`px-3.5 py-2 rounded-full text-sm font-medium transition ${
                  category === cat
                    ? 'text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                style={category === cat ? { background: '#F08B1D' } : {}}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
