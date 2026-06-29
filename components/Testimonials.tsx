'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, TrendingUp } from 'lucide-react'

interface Project {
  id: string
  title: string
  description: string
  goal_amount: number
  amount_received: number
  main_image_url: string | null
  category: string | null
  location_country: string | null
  slug: string
}

function ProgressBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.round(value))
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
      <div
        className="h-full bg-[#F08B1D] rounded-full transition-all duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export default function Testimonials() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/projects/featured?limit=3')
      .then(r => r.json())
      .then(d => setProjects(d.projects || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (!loading && projects.length === 0) return null

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#3E4B59] mb-2" style={{ fontFamily: 'Aleo, Georgia, serif' }}>
              Projects Making Progress
            </h2>
            <p className="text-gray-500 text-lg">Real campaigns with real updates — funded by donors like you.</p>
          </div>
          <Link href="/#all-projects" className="inline-flex items-center gap-1.5 text-[#F08B1D] font-semibold hover:gap-2.5 transition-all shrink-0">
            View all projects <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-100 rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map(p => {
              const pct = p.goal_amount > 0 ? (p.amount_received / p.goal_amount) * 100 : 0
              const raised = p.amount_received >= 1000
                ? `$${(p.amount_received / 1000).toFixed(1)}K`
                : `$${p.amount_received}`
              const goal = p.goal_amount >= 1000
                ? `$${(p.goal_amount / 1000).toFixed(0)}K`
                : `$${p.goal_amount}`

              return (
                <Link
                  key={p.id}
                  href={`/donate/${p.slug}`}
                  className="group bg-gray-50 hover:bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
                >
                  {/* Image */}
                  <div className="h-44 bg-gray-200 overflow-hidden relative">
                    {p.main_image_url ? (
                      <img
                        src={p.main_image_url}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                        <TrendingUp className="w-10 h-10 text-gray-400" />
                      </div>
                    )}
                    {p.category && (
                      <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#3E4B59] text-xs font-semibold px-2.5 py-1 rounded-full capitalize">
                        {p.category}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-[#3E4B59] mb-1.5 line-clamp-2 group-hover:text-[#F08B1D] transition-colors" style={{ fontFamily: 'Aleo, Georgia, serif' }}>
                      {p.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4 flex-1">
                      {p.description}
                    </p>

                    <ProgressBar value={pct} />
                    <div className="flex justify-between items-center mt-2 text-sm">
                      <span className="font-semibold text-[#F08B1D]">{raised} raised</span>
                      <span className="text-gray-400">of {goal} goal</span>
                    </div>
                    {p.location_country && (
                      <p className="text-xs text-gray-400 mt-2">{p.location_country}</p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
