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
    <div className="bg-white rounded-lg shadow mb-8 p-6">
      <div className="flex flex-col gap-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Expandable Filters */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gg-primary transition"
        >
          <Filter size={16} />
          Filters
          <span className={`transform transition ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
        </button>

        {isExpanded && (
          <div className="border-t pt-4 space-y-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                      category === cat
                        ? 'bg-gg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Apply Button */}
            <button
              onClick={handleApply}
              className="w-full bg-gg-primary hover:bg-gg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Apply Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
