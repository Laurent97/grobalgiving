'use client'

import { useState } from 'react'
import { Search, MapPin, Heart, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Hero() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery && !selectedCategory) return

    setIsSearching(true)
    const params = new URLSearchParams()
    if (searchQuery) params.append('search', searchQuery)
    if (selectedCategory) params.append('category', selectedCategory)
    
    router.push(`/?${params.toString()}`)
  }

  const categories = [
    { id: 'education', name: 'Education', icon: '📚' },
    { id: 'health', name: 'Health', icon: '🏥' },
    { id: 'environment', name: 'Environment', icon: '🌍' },
    { id: 'disaster', name: 'Disaster Relief', icon: '🚨' },
    { id: 'children', name: 'Children', icon: '👶' },
    { id: 'women', name: 'Women & Girls', icon: '👩' },
  ]

  return (
    <section className="relative bg-gradient-to-br from-gg-primary via-orange-500 to-amber-600 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">
            Make a Difference Today
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
            Discover and support vetted, high-impact projects around the world. Your donation creates real change.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-2xl shadow-2xl p-2 flex flex-col md:flex-row gap-2">
            <div className="flex-1 flex items-center gap-3 px-4">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects, causes, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 py-3 text-gray-900 placeholder-gray-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 px-4 border-l border-gray-200">
              <MapPin className="w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="py-3 text-gray-700 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="">All Causes</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="bg-gg-primary hover:bg-gg-primary-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {/* Quick Category Pills */}
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setSelectedCategory(category.id)
                router.push(`/?category=${category.id}`)
              }}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium transition-colors"
            >
              <span>{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Trust Badge */}
        <div className="mt-12 flex justify-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 flex items-center gap-3">
            <Heart className="w-5 h-5 fill-white" />
            <span className="text-sm font-medium">Trusted by 50,000+ donors worldwide</span>
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F9FAFB"/>
        </svg>
      </div>
    </section>
  )
}
