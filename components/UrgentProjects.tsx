'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import ProjectCardEnhanced from './ProjectCardEnhanced'
import { Project } from '@/types'

export default function UrgentProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUrgent() {
      try {
        const response = await fetch('/api/projects/urgent?limit=4')
        const data = await response.json()
        if (data.projects) {
          setProjects(data.projects)
        }
      } catch (err) {
        setError('Failed to load urgent projects')
        console.error('Error fetching urgent projects:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchUrgent()
  }, [])

  if (loading) {
    return (
      <section className="py-16 bg-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return null
  }

  if (projects.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-red-50 border-y border-red-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg animate-pulse">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Urgent Projects</h2>
              <p className="text-gray-600">Time-sensitive initiatives that need immediate support</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {projects.map((project) => (
            <ProjectCardEnhanced key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  )
}
