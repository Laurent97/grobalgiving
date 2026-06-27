'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  TrendingUp, Globe, Users, Heart, ArrowRight, BarChart2,
  Droplets, GraduationCap, HeartPulse, Leaf, Star, CheckCircle
} from 'lucide-react'

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

const categoryImpact = [
  {
    icon: GraduationCap,
    category: 'Education',
    projects: 245,
    beneficiaries: '180,000+',
    raised: '$320K',
    color: 'bg-blue-50',
    iconColor: 'text-blue-600',
    border: 'border-blue-100',
    highlight: 'bg-blue-600',
    story: 'Funded 14 new school buildings, trained 620 teachers, and provided 18,000 students with learning materials across East Africa and South Asia.',
  },
  {
    icon: Droplets,
    category: 'Clean Water',
    projects: 134,
    beneficiaries: '95,000+',
    raised: '$215K',
    color: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
    border: 'border-cyan-100',
    highlight: 'bg-cyan-600',
    story: 'Built 280 clean water wells and installed 45 community filtration systems, reducing waterborne illness rates by up to 70% in served communities.',
  },
  {
    icon: HeartPulse,
    category: 'Healthcare',
    projects: 189,
    beneficiaries: '140,000+',
    raised: '$280K',
    color: 'bg-rose-50',
    iconColor: 'text-rose-600',
    border: 'border-rose-100',
    highlight: 'bg-rose-600',
    story: 'Deployed 12 mobile health clinics, trained 450 community health workers, and delivered vaccines to over 28,000 children in remote regions.',
  },
  {
    icon: Leaf,
    category: 'Environment',
    projects: 156,
    beneficiaries: '210,000+',
    raised: '$190K',
    color: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    border: 'border-emerald-100',
    highlight: 'bg-emerald-600',
    story: 'Planted 1.2 million trees, restored 8,500 hectares of degraded land, and helped 3,200 farmers transition to sustainable agricultural practices.',
  },
]

const stories = [
  {
    name: 'Amina, Kenya',
    quote: 'Before the well arrived in our village, I walked 4 hours every day to fetch water. Now my daughters go to school instead.',
    project: 'Clean Water Initiative — Rift Valley',
    initials: 'AM',
    color: 'bg-cyan-500',
  },
  {
    name: 'Rafael, Brazil',
    quote: 'The vocational training program gave me skills I use every day. I opened my own workshop and employ three people now.',
    project: 'Economic Empowerment — São Paulo',
    initials: 'RF',
    color: 'bg-amber-500',
  },
  {
    name: 'Sita, Nepal',
    quote: 'Our school was just a tent before. Now we have four proper classrooms and 160 children learn here every morning.',
    project: 'Education For All — Kathmandu Valley',
    initials: 'ST',
    color: 'bg-purple-500',
  },
]

const sdgAlignment = [
  { number: '1', label: 'No Poverty', color: 'bg-red-500' },
  { number: '2', label: 'Zero Hunger', color: 'bg-yellow-500' },
  { number: '3', label: 'Good Health', color: 'bg-green-500' },
  { number: '4', label: 'Quality Education', color: 'bg-red-600' },
  { number: '6', label: 'Clean Water', color: 'bg-blue-500' },
  { number: '10', label: 'Reduced Inequality', color: 'bg-pink-500' },
  { number: '13', label: 'Climate Action', color: 'bg-emerald-600' },
  { number: '17', label: 'Partnerships', color: 'bg-blue-700' },
]

export default function ImpactPage() {
  const [inView, setInView] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold: 0.2 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const raised = useCountUp(1200000, 2000, inView)
  const donors = useCountUp(50000, 1800, inView)
  const projects = useCountUp(245, 1400, inView)
  const countries = useCountUp(45, 1200, inView)
  const beneficiaries = useCountUp(625000, 2200, inView)
  const successRate = useCountUp(78, 1200, inView)

  const fmt = (n: number) => {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return n >= 50000 ? `${(n / 1_000).toFixed(0)}K+` : n.toLocaleString()
    return n.toString()
  }

  const topStats = [
    { value: fmt(raised), label: 'Total Raised', icon: TrendingUp, color: 'text-[#F08B1D]', bg: 'bg-orange-50' },
    { value: `${fmt(donors)}+`, label: 'Donors Worldwide', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { value: `${projects}+`, label: 'Active Projects', icon: BarChart2, color: 'text-purple-600', bg: 'bg-purple-50' },
    { value: `${countries}+`, label: 'Countries', icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { value: fmt(beneficiaries), label: 'Beneficiaries Reached', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
    { value: `${successRate}%`, label: 'Project Success Rate', icon: CheckCircle, color: 'text-teal-600', bg: 'bg-teal-50' },
  ]

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-[#3E4B59] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2a3440] via-[#3E4B59] to-[#4a3828]" />
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-[#F08B1D]/10 blur-3xl pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center text-white">
          <div className="inline-flex items-center gap-2 bg-[#F08B1D]/20 border border-[#F08B1D]/30 text-[#F8C07A] text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <BarChart2 className="w-4 h-4" />
            Measurable Results
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6" style={{ fontFamily: 'Aleo, Georgia, serif' }}>
            Real Change.
            <span className="block text-[#F08B1D]">Real Numbers.</span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            We measure what matters. Every project on GlobalGiving is tracked against clear outcomes — so you can see exactly what your generosity achieves.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 60L720 20L1440 60V60H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Count-up stats */}
      <section className="py-20 bg-white" ref={ref}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#3E4B59] mb-3" style={{ fontFamily: 'Aleo, Georgia, serif' }}>
              Our Numbers Tell the Story
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Live metrics updated from our projects around the world.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {topStats.map((s, i) => {
              const Icon = s.icon
              return (
                <div key={i} className="group text-center bg-gray-50 hover:bg-white hover:shadow-lg border border-gray-100 hover:border-gray-200 rounded-2xl p-8 transition-all duration-300">
                  <div className={`inline-flex items-center justify-center w-14 h-14 ${s.bg} rounded-2xl mb-5 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-7 h-7 ${s.color}`} />
                  </div>
                  <p className={`text-4xl font-bold mb-2 ${s.color}`} style={{ fontFamily: 'Aleo, Georgia, serif' }}>{s.value}</p>
                  <p className="text-gray-500 font-medium text-sm">{s.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Impact by category */}
      <section className="py-20 bg-[#f8f9fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-white border border-gray-200 text-[#3E4B59] text-xs font-semibold px-3 py-1.5 rounded-full mb-4 tracking-widest uppercase shadow-sm">
              By the Numbers
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#3E4B59] mb-4" style={{ fontFamily: 'Aleo, Georgia, serif' }}>
              Impact by Cause
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              A breakdown of what your collective donations have achieved across our top cause categories.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categoryImpact.map((cat, i) => {
              const Icon = cat.icon
              return (
                <div key={i} className={`bg-white rounded-2xl border ${cat.border} p-8 hover:shadow-xl transition-all duration-300`}>
                  <div className="flex items-start gap-5 mb-5">
                    <div className={`w-14 h-14 ${cat.color} rounded-2xl flex items-center justify-center shrink-0`}>
                      <Icon className={`w-7 h-7 ${cat.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#3E4B59] mb-1" style={{ fontFamily: 'Aleo, Georgia, serif' }}>{cat.category}</h3>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <span className="text-gray-500"><strong className="text-[#3E4B59]">{cat.projects}</strong> projects</span>
                        <span className="text-gray-500"><strong className="text-[#3E4B59]">{cat.beneficiaries}</strong> beneficiaries</span>
                        <span className="text-gray-500"><strong className="text-[#F08B1D]">{cat.raised}</strong> raised</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-5">
                    {cat.story}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Beneficiary stories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 tracking-widest uppercase">
              <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
              Stories from the Field
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#3E4B59] mb-4" style={{ fontFamily: 'Aleo, Georgia, serif' }}>
              Voices of Impact
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              The people whose lives have been changed by donors like you.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {stories.map((s, i) => (
              <div key={i} className="group bg-gray-50 hover:bg-white rounded-2xl p-8 border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col">
                <div className="flex items-center gap-1 mb-5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-7xl text-[#F08B1D]/15 leading-none font-serif select-none -mt-2 -mb-4">"</span>
                <p className="text-gray-700 leading-relaxed flex-1 mb-6 text-[15px] italic">{s.quote}</p>
                <div className="border-t border-gray-100 pt-5 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${s.color} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                    {s.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-[#3E4B59] text-sm">{s.name}</p>
                    <p className="text-xs text-[#F08B1D] mt-0.5">{s.project}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SDG Alignment */}
      <section className="py-20 bg-[#f8f9fa]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white border border-gray-200 text-[#3E4B59] text-xs font-semibold px-3 py-1.5 rounded-full mb-4 tracking-widest uppercase shadow-sm">
              UN Alignment
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#3E4B59] mb-4" style={{ fontFamily: 'Aleo, Georgia, serif' }}>
              Aligned with the UN SDGs
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Our projects map directly to the United Nations Sustainable Development Goals — the global blueprint for a better world by 2030.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {sdgAlignment.map((sdg, i) => (
              <div key={i} className={`${sdg.color} rounded-xl px-5 py-3 text-white text-center shadow-sm min-w-[100px]`}>
                <div className="text-2xl font-bold" style={{ fontFamily: 'Aleo, Georgia, serif' }}>SDG {sdg.number}</div>
                <div className="text-xs text-white/80 mt-0.5">{sdg.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="py-20 bg-[#3E4B59]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-[#F08B1D]/20 border border-[#F08B1D]/30 text-[#F8C07A] text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <CheckCircle className="w-4 h-4" />
            How We Measure
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-5" style={{ fontFamily: 'Aleo, Georgia, serif' }}>
            Our Impact Methodology
          </h2>
          <p className="text-lg text-white/65 mb-12 max-w-2xl mx-auto leading-relaxed">
            We don't just collect donations — we track outcomes. Every project partner submits quarterly reports with verified data on beneficiaries reached, funds spent, and outcomes achieved. Our team reviews each report and publishes findings publicly.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            {[
              { step: '01', title: 'Quarterly Reporting', desc: 'Partners submit data on spend, reach, and outcomes every 3 months.' },
              { step: '02', title: 'Independent Verification', desc: 'Our team cross-checks reports with field data and third-party audits.' },
              { step: '03', title: 'Public Disclosure', desc: 'All impact data is published openly so donors can see the full picture.' },
            ].map((item, i) => (
              <div key={i} className="bg-white/8 border border-white/10 rounded-2xl p-7 text-left">
                <div className="text-4xl font-bold text-[#F08B1D]/40 mb-3" style={{ fontFamily: 'Aleo, Georgia, serif' }}>{item.step}</div>
                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-white/55 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="inline-flex items-center gap-2 bg-[#F08B1D] hover:bg-[#D97B1A] text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              Support a Project
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/about" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200">
              Learn About Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
