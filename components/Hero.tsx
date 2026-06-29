'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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
  { id: 'water', name: 'Clean Water', icon: '💧' },
  { id: 'children', name: 'Children', icon: '👶' },
]

function fmtRaised(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

// ---------------------------------------------------------------------------
// Slideshow media — giving/donation/impact themed.
// Images: Unsplash (free, no key needed).
// Videos: Pexels free CDN (direct MP4 links, no auth needed, muted autoplay).
// Replace any src with a local /public/images/hero/giving/ path at any time.
// ---------------------------------------------------------------------------
type SlideType = 'image' | 'video'
interface Slide { id: number; type: SlideType; src: string; alt: string; poster?: string }

const SLIDES: Slide[] = [
  // ── Images: hands giving, helping, volunteers, donation moments ──
  { id: 1,  type: 'image', src: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1920&q=80', alt: 'Volunteer giving food to community' },
  { id: 2,  type: 'image', src: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1920&q=80', alt: 'Children receiving education support' },
  { id: 3,  type: 'image', src: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1920&q=80', alt: 'Healthcare worker helping patient' },
  { id: 4,  type: 'image', src: 'https://images.unsplash.com/photo-1509099955921-f0b4ed0c175c?w=1920&q=80', alt: 'Community gathering and support' },
  { id: 5,  type: 'image', src: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1920&q=80', alt: 'People coming together to help' },
  { id: 6,  type: 'image', src: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=1920&q=80', alt: 'Hands reaching out in support' },
  { id: 7,  type: 'image', src: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=1920&q=80', alt: 'Volunteers working together' },
  { id: 8,  type: 'image', src: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1920&q=80', alt: 'Community members sharing a meal' },
  { id: 9,  type: 'image', src: 'https://images.unsplash.com/photo-1607748862156-7c548e7e98f4?w=1920&q=80', alt: 'Doctor providing medical aid' },
  { id: 10, type: 'image', src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&q=80', alt: 'Person donating and helping others' },
  { id: 11, type: 'image', src: 'https://images.unsplash.com/photo-1526958097901-5e6d742d3371?w=1920&q=80', alt: 'Hands giving donation' },
  { id: 12, type: 'image', src: 'https://images.unsplash.com/photo-1518398046578-8cca57782e17?w=1920&q=80', alt: 'Education support for children' },

  // ── Videos: volunteers, giving, community help (Pexels free CDN) ──
  {
    id: 101, type: 'video',
    src: 'https://videos.pexels.com/video-files/6646918/6646918-uhd_2560_1440_25fps.mp4',
    poster: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1920&q=60',
    alt: 'Volunteers helping community',
  },
  {
    id: 102, type: 'video',
    src: 'https://videos.pexels.com/video-files/8159958/8159958-uhd_2560_1440_25fps.mp4',
    poster: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1920&q=60',
    alt: 'Healthcare workers giving aid',
  },
  {
    id: 103, type: 'video',
    src: 'https://videos.pexels.com/video-files/6194102/6194102-uhd_2560_1440_25fps.mp4',
    poster: 'https://images.unsplash.com/photo-1509099955921-f0b4ed0c175c?w=1920&q=60',
    alt: 'Community coming together',
  },
  {
    id: 104, type: 'video',
    src: 'https://videos.pexels.com/video-files/3044477/3044477-uhd_2560_1440_25fps.mp4',
    poster: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1920&q=60',
    alt: 'Sharing food and resources',
  },
  {
    id: 105, type: 'video',
    src: 'https://videos.pexels.com/video-files/6785821/6785821-uhd_2560_1440_25fps.mp4',
    poster: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=1920&q=60',
    alt: 'Hands giving and receiving donation',
  },
]

const SLIDE_DURATION = 8000   // ms per image slide
const VIDEO_MAX_MS   = 20000  // max ms to wait for a video before skipping
const TRANSITION_MS  = 1400   // cross-fade duration

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ---------------------------------------------------------------------------
// Slideshow background — pure CSS cross-fade, no framer-motion dependency
// ---------------------------------------------------------------------------
function HeroSlideshow() {
  const [playlist] = useState<Slide[]>(() => shuffle(SLIDES))
  const [current, setCurrent]   = useState(0)
  const [prev, setPrev]         = useState<number | null>(null)
  const [fading, setFading]     = useState(false)
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const videoRef  = useRef<HTMLVideoElement>(null)
  const manualRef = useRef(false)

  const advance = useCallback((idx?: number) => {
    setPrev(current)
    setFading(true)
    const next = idx !== undefined ? idx : (current + 1) % playlist.length
    setCurrent(next)
    setTimeout(() => { setPrev(null); setFading(false) }, TRANSITION_MS)
  }, [current, playlist.length])

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => advance(), SLIDE_DURATION)
  }, [advance])

  useEffect(() => {
    resetTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [resetTimer])

  useEffect(() => {
    if (playlist[current]?.type === 'video') {
      // Pause the interval while the video plays; advance on end/error
      if (timerRef.current) clearInterval(timerRef.current)
      if (videoRef.current) videoRef.current.play().catch(() => { advance(); resetTimer() })
      // Safety timeout: skip if video stalls
      const safety = setTimeout(() => { advance(); resetTimer() }, VIDEO_MAX_MS)
      return () => clearTimeout(safety)
    }
  }, [current, playlist, advance, resetTimer])

  const handleDotClick = (i: number) => {
    if (i === current) return
    manualRef.current = true
    advance(i)
    resetTimer()
  }

  const renderSlide = (idx: number, isActive: boolean, isPrev: boolean) => {
    const slide = playlist[idx]
    const baseStyle: React.CSSProperties = {
      position: 'absolute', inset: 0,
      transition: `opacity ${TRANSITION_MS}ms ease-in-out`,
      opacity: isActive ? 1 : isPrev && fading ? 0 : 0,
    }
    if (slide.type === 'video') {
      return (
        <div key={`slide-${idx}`} style={baseStyle}>
          <video
            ref={isActive ? videoRef : undefined}
            src={slide.src}
            autoPlay muted playsInline
            poster={slide.poster}
            onEnded={() => { advance(); resetTimer() }}
            onError={() => { advance(); resetTimer() }}
            className="w-full h-full object-cover"
          />
        </div>
      )
    }
    return (
      <div
        key={`slide-${idx}`}
        style={{
          ...baseStyle,
          backgroundImage: `url(${slide.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          animation: isActive ? `heroKenBurns ${SLIDE_DURATION + TRANSITION_MS}ms ease-out forwards` : 'none',
        }}
        aria-label={slide.alt}
        role="img"
      />
    )
  }

  return (
    <>
      <style>{`
        @keyframes heroKenBurns {
          from { transform: scale(1.08); }
          to   { transform: scale(1); }
        }
      `}</style>

      {/* Slides layer */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#1a2820]">
        {prev !== null && renderSlide(prev, false, true)}
        {renderSlide(current, true, false)}
      </div>

      {/* Dark gradient overlay — heavier on left for text legibility */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(26,40,32,0.88) 0%, rgba(26,40,32,0.55) 55%, rgba(26,40,32,0.30) 100%)',
        }}
      />
      {/* Bottom fade into page */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 z-[1] pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(26,40,32,0.6))' }}
      />

      {/* Dot indicators */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {playlist.map((_, i) => (
          <button
            key={i}
            onClick={() => handleDotClick(i)}
            aria-label={`Slide ${i + 1}`}
            className="transition-all duration-300 rounded-full border-2 border-white/50 focus:outline-none"
            style={{
              width:  i === current ? '24px' : '10px',
              height: '10px',
              background: i === current ? '#F08B1D' : 'transparent',
              borderColor: i === current ? '#F08B1D' : 'rgba(255,255,255,0.45)',
            }}
          />
        ))}
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Main Hero
// ---------------------------------------------------------------------------
export default function Hero({ stats }: { stats?: HeroStats }) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 120)
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
    { icon: Users,      value: stats.donors.toLocaleString(),  label: 'Donors' },
    { icon: Folder,     value: `${stats.projectsFunded}`,      label: 'Projects' },
  ] : []

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-center overflow-hidden bg-[#1a2820]">

      {/* ── Dynamic slideshow background ── */}
      <HeroSlideshow />

      {/* ── Hero content ── */}
      <div
        className={`relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-36 text-white transition-all duration-700 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Headline */}
        <div className="text-center mb-10">
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight mb-5 drop-shadow-lg"
            style={{ fontFamily: 'Aleo, Georgia, serif', textShadow: '0 2px 20px rgba(0,0,0,0.4)' }}
          >
            Support Communities
            <span className="block text-[#F08B1D]">Worldwide</span>
          </h1>
          <p className="text-xl sm:text-2xl text-white/80 max-w-2xl mx-auto leading-relaxed drop-shadow">
            Discover projects that matter to you and make a real difference today.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
          <div className="flex bg-white rounded-2xl shadow-2xl overflow-hidden ring-4 ring-white/20">
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
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <Link
            href="/#all-projects"
            className="inline-flex items-center justify-center gap-2 bg-[#F08B1D] hover:bg-[#D97B1A] text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 text-base"
          >
            Browse All Projects
          </Link>
          <Link
            href="/?category=disaster"
            className="inline-flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 border border-white/35 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 backdrop-blur-sm text-base hover:-translate-y-0.5"
          >
            View Urgent Causes
          </Link>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <span className="text-white/45 text-sm self-center mr-1">Browse by cause:</span>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => router.push(`/?category=${cat.id}`)}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-[#F08B1D]/70 text-white/85 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 backdrop-blur-sm"
            >
              <span>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Real stats bar */}
        {statItems.length > 0 && (
          <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12 pt-8 border-t border-white/15">
            {statItems.map((s, i) => {
              const Icon = s.icon
              return (
                <div key={i} className="flex items-center gap-3 text-white">
                  <Icon className="w-5 h-5 text-[#F08B1D]" />
                  <div>
                    <p className="text-xl font-bold leading-none drop-shadow">{s.value}</p>
                    <p className="text-xs text-white/50 mt-0.5">{s.label}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/30 animate-bounce z-20">
        <ChevronDown className="w-4 h-4" />
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 60L720 20L1440 60V60H0Z" fill="#f8f9fa" />
        </svg>
      </div>
    </section>
  )
}
