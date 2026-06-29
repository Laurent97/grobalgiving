'use client'

import { useState, useEffect } from 'react'
import { Search, ChevronDown, TrendingUp, Users, Folder } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface HeroStats {
  totalRaised: number
  donors: number
  projectsFunded: number
}

const categories = [
  { id: 'education', name: 'Education', icon: '📚' },
  { id: 'health', name: 'Health', icon: '🏥' },
  { id: 'environment', name: 'Environment', icon: '🌿' },
  { id: 'disaster', name: 'Disaster Relief', icon: '🚨' },
  { id: 'water', name: 'Clean Water', icon: '�' },
  { id: 'children', name: 'Children', icon: '�' },
]

function fmtRaised(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

export default function Hero({ stats }: { stats?: HeroStats }) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setIsSearching(true)
    router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`)
  }

  const statItems = stats ? [
    { icon: TrendingUp, value: fmtRaised(stats.totalRaised), label: 'Raised' },
    { icon: Users, value: `${stats.donors.toLocaleString()}`, label: 'Donors' },
    { icon: Folder, value: `${stats.projectsFunded}`, label: 'Projects' },
  ] : []

  return (
    <section className="relative min-h-[88vh] flex flex-col justify-center overflow-hidden bg-[#3E4B59]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#2a3440] via-[#3E4B59] to-[#4a3828]" />
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-[#F08B1D]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-[#F08B1D]/8 blur-3xl pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />

      <div className={`relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-white transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        {/* Headline */}
        <div className="text-center mb-10">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight mb-5" style={{ fontFamily: 'Aleo, Georgia, serif' }}>
            Support Communities
            <span className="block text-[#F08B1D]">Worldwide</span>
          </h1>
          <p className="text-xl sm:text-2xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            Discover projects that matter to you and make a real difference today.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
          <div className="flex bg-white rounded-2xl shadow-2xl overflow-hidden ring-4 ring-white/10">
            <div className="flex-1 flex items-center gap-3 px-5">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search projects, causes, or organizations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 py-4 text-gray-900 placeholder-gray-400 focus:outline-none text-base"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="bg-[#F08B1D] hover:bg-[#D97B1A] text-white font-semibold px-7 py-4 transition-colors disabled:opacity-50 flex items-center gap-2 text-base"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
        </form>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/#all-projects"
            className="inline-flex items-center justify-center gap-2 bg-[#F08B1D] hover:bg-[#D97B1A] text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-base"
          >
            Browse All Projects
          </Link>
          <Link
            href="/?category=disaster"
            className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 backdrop-blur-sm text-base"
          >
            View Urgent Causes
          </Link>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <span className="text-white/40 text-sm self-center mr-1">Browse by cause:</span>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => router.push(`/?category=${cat.id}`)}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-[#F08B1D]/60 text-white/85 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
            >
              <span>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Real stats bar — only shown when data is available */}
        {statItems.length > 0 && (
          <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12 pt-8 border-t border-white/10">
            {statItems.map((s, i) => {
              const Icon = s.icon
              return (
                <div key={i} className="flex items-center gap-3 text-white">
                  <Icon className="w-5 h-5 text-[#F08B1D]" />
                  <div>
                    <p className="text-xl font-bold leading-none">{s.value}</p>
                    <p className="text-xs text-white/50 mt-0.5">{s.label}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/25 animate-bounce">
        <ChevronDown className="w-4 h-4" />
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 60L720 20L1440 60V60H0Z" fill="#f8f9fa" />
        </svg>
      </div>
    </section>
  )
}
