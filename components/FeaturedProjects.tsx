'use client'

import { useEffect, useState } from 'react'
import { Star, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import ProjectCardEnhanced from './ProjectCardEnhanced'
import { Project } from '@/types'

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-100" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-100 rounded w-1/3" />
        <div className="h-5 bg-gray-100 rounded w-3/4" />
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-2 bg-gray-100 rounded-full w-full" />
        <div className="h-10 bg-gray-100 rounded-xl w-full mt-2" />
      </div>
    </div>
  )
}

export default function FeaturedProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/projects/featured?limit=6')
      .then(r => r.json())
      .then(d => { if (d.projects) setProjects(d.projects) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (!loading && projects.length === 0) return null

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-3 tracking-widest uppercase">
              <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
              Hand-picked
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#3E4B59]" style={{ fontFamily: 'Aleo, Georgia, serif' }}>
              Featured Projects
            </h2>
            <p className="text-gray-500 mt-1">Staff picks and high-impact initiatives making a real difference.</p>
          </div>
          <Link
            href="/?sort=featured"
            className="hidden sm:inline-flex items-center gap-1.5 text-[#F08B1D] font-semibold hover:gap-3 transition-all duration-200 text-sm"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : projects.map((project) => <ProjectCardEnhanced key={project.id} project={project} />)
          }
        </div>

        {/* Mobile view all */}
        <div className="mt-8 text-center sm:hidden">
          <Link href="/" className="inline-flex items-center gap-2 text-[#F08B1D] font-semibold">
            View all projects <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
