'use client'

import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import ProjectCardEnhanced from './ProjectCardEnhanced'
import { Project } from '@/types'

export default function FeaturedProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const response = await fetch('/api/projects/featured?limit=6')
        const data = await response.json()
        if (data.projects) {
          setProjects(data.projects)
        }
      } catch (error) {
        console.error('Error fetching featured projects:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchFeatured()
  }, [])

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading featured projects...</div>
        </div>
      </section>
    )
  }

  if (projects.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600 fill-yellow-600" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Projects</h2>
              <p className="text-gray-600">Staff picks and high-impact initiatives</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCardEnhanced key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  )
}
