'use client'

import { useState, useEffect, useRef } from 'react'
import { Globe, Heart, Users, TrendingUp } from 'lucide-react'

function useCountUp(target: number, duration = 1800, shouldStart = false) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!shouldStart || target === 0) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setValue(target); clearInterval(timer) }
      else setValue(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration, shouldStart])
  return value
}

export default function ImpactStats() {
  const [rawStats, setRawStats] = useState({ totalRaised: 0, projectsFunded: 0, donors: 0, countries: 0 })
  const [inView, setInView] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(d => setRawStats(d)).catch(() => {})
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold: 0.3 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const raised = useCountUp(rawStats.totalRaised, 1800, inView)
  const donors = useCountUp(rawStats.donors, 1600, inView)
  const projects = useCountUp(rawStats.projectsFunded, 1400, inView)
  const countries = useCountUp(rawStats.countries || 45, 1200, inView)

  const fmt = (n: number) => {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
    return `$${n}`
  }

  const statItems = [
    { value: fmt(raised), label: 'Total Raised', icon: TrendingUp, color: 'text-[#F08B1D]', bg: 'bg-orange-50' },
    { value: `${donors.toLocaleString()}+`, label: 'Generous Donors', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { value: `${projects}+`, label: 'Projects Funded', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
    { value: `${countries}+`, label: 'Countries Reached', icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ]

  return (
    <section className="py-20 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-[#3E4B59] mb-3" style={{ fontFamily: 'Aleo, Georgia, serif' }}>
            Our Impact So Far
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Updated in real time from active projects around the world.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {statItems.map((stat, i) => {
            const Icon = stat.icon
            return (
              <div key={i} className="group text-center bg-gray-50 hover:bg-white hover:shadow-lg border border-gray-100 hover:border-gray-200 rounded-2xl p-8 transition-all duration-300">
                <div className={`inline-flex items-center justify-center w-14 h-14 ${stat.bg} rounded-2xl mb-5 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-7 h-7 ${stat.color}`} />
                </div>
                <p className={`text-4xl font-bold mb-2 ${stat.color}`} style={{ fontFamily: 'Aleo, Georgia, serif' }}>{stat.value}</p>
                <p className="text-gray-500 font-medium text-sm">{stat.label}</p>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
