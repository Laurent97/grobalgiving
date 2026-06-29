'use client'

import { useState, useEffect } from 'react'
import { Search, ChevronDown, ShieldCheck, Star, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const categories = [
  { id: 'education', name: 'Education', icon: '📚' },
  { id: 'health', name: 'Health', icon: '🏥' },
  { id: 'environment', name: 'Environment', icon: '🌿' },
  { id: 'disaster', name: 'Disaster Relief', icon: '🚨' },
  { id: 'children', name: 'Children', icon: '👶' },
  { id: 'women', name: 'Women & Girls', icon: '👩' },
  { id: 'water', name: 'Clean Water', icon: '💧' },
]

export default function Hero() {
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

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-center overflow-hidden bg-[#3E4B59]">
      {/* Background layered gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2a3440] via-[#3E4B59] to-[#4a3828]" />

      {/* Decorative orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-[#F08B1D]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-[#F08B1D]/8 blur-3xl pointer-events-none" />

      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-white transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        {/* Headline */}
        <div className="text-center mb-10">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight mb-6" style={{ fontFamily: 'Aleo, Georgia, serif' }}>
            Empower Communities
            <span className="block text-[#F08B1D]">Worldwide</span>
          </h1>
          <p className="text-xl sm:text-2xl text-white/75 max-w-2xl mx-auto leading-relaxed">
            Every donation creates lasting change — discover vetted projects and give with confidence.
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

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
          <Link
            href="/projects"
            className="inline-flex items-center justify-center gap-2 bg-[#F08B1D] hover:bg-[#D97B1A] text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-base"
          >
            Explore All Projects
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 backdrop-blur-sm text-base"
          >
            Start Giving Today
          </Link>
        </div>

        {/* Quick Category Pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-14">
          <span className="text-white/50 text-sm self-center mr-1">Browse by cause:</span>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => router.push(`/?category=${cat.id}`)}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-[#F08B1D]/60 text-white/90 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
            >
              <span>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center gap-6 sm:gap-10 text-white/60 text-sm">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#F08B1D]" />
            <span>50,000+ donors worldwide</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-[#F08B1D] fill-[#F08B1D]" />
            <span>4.9 / 5 donor satisfaction</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#F08B1D]" />
            <span>Every nonprofit vetted</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/30 animate-bounce">
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <ChevronDown className="w-4 h-4" />
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 80L48 69.3C96 59 192 37 288 32C384 27 480 37 576 42.7C672 48 768 48 864 42.7C960 37 1056 27 1152 26.7C1248 27 1344 37 1392 42.7L1440 48V80H1392C1344 80 1248 80 1152 80C1056 80 960 80 864 80C768 80 672 80 576 80C480 80 384 80 288 80C192 80 96 80 48 80H0Z" fill="#f8f9fa"/>
        </svg>
      </div>
    </section>
  )
}
