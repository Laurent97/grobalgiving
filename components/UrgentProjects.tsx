'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import ProjectCardEnhanced from './ProjectCardEnhanced'
import { Project } from '@/types'

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-red-100 overflow-hidden animate-pulse">
      <div className="h-44 bg-red-50" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-red-50 rounded w-1/3" />
        <div className="h-5 bg-red-50 rounded w-3/4" />
        <div className="h-2 bg-red-50 rounded-full w-full" />
        <div className="h-10 bg-red-50 rounded-xl w-full mt-2" />
      </div>
    </div>
  )
}

export default function UrgentProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/projects/urgent?limit=4')
      .then(r => r.json())
      .then(d => { if (d.projects) setProjects(d.projects) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (!loading && projects.length === 0) return null

  return (
    <section className="py-20 bg-red-50 border-y border-red-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-red-100 border border-red-200 text-red-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-3 tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              Urgent
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#3E4B59]" style={{ fontFamily: 'Aleo, Georgia, serif' }}>
              Help Now
            </h2>
            <p className="text-gray-500 mt-1 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Time-sensitive initiatives that need your immediate support.
            </p>
          </div>
          <Link
            href="/?sort=urgent"
            className="hidden sm:inline-flex items-center gap-1.5 text-red-600 font-semibold hover:gap-3 transition-all duration-200 text-sm"
          >
            View all urgent <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : projects.map((project) => <ProjectCardEnhanced key={project.id} project={project} />)
          }
        </div>

        {/* Mobile view all */}
        <div className="mt-8 text-center sm:hidden">
          <Link href="/" className="inline-flex items-center gap-2 text-red-600 font-semibold">
            View all urgent projects <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
