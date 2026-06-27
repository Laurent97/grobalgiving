'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Loader2, RefreshCw, Inbox, Building2, Calendar, AlertCircle } from 'lucide-react'

interface Project {
  id: string
  title: string
  description?: string
  status?: string
  created_at?: string
  nonprofit?: { name: string }
}

export default function VettingClient() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<Record<string, 'approve' | 'reject' | false>>({})

  useEffect(() => {
    fetchProjects()
  }, [])

  async function fetchProjects() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/pending')
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || `Request failed: ${res.status}`)
      }
      const json = await res.json()
      setProjects(json.projects || [])
    } catch (err: any) {
      setError(err?.message || 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  async function approveProject(id: string) {
    setActionLoading(prev => ({ ...prev, [id]: 'approve' }))
    try {
      const res = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || `Approve failed: ${res.status}`)
      }
      await fetchProjects()
    } catch (err: any) {
      setError(err?.message || 'Approve failed')
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }))
    }
  }

  async function rejectProject(id: string) {
    setActionLoading(prev => ({ ...prev, [id]: 'reject' }))
    try {
      const res = await fetch('/api/admin/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || `Reject failed: ${res.status}`)
      }
      await fetchProjects()
    } catch (err: any) {
      setError(err?.message || 'Reject failed')
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }))
    }
  }

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color
  }: {
    title: string
    value: string
    icon: typeof Inbox
    color: string
  }) => (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={`p-2.5 rounded-lg ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Project Vetting</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review and approve pending nonprofit projects.</p>
          </div>
        </div>
        <div className="p-12 text-center bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading pending projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Project Vetting</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Review and approve pending nonprofit projects before they go live.
          </p>
        </div>
        <button
          onClick={fetchProjects}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Pending Review"
          value={String(projects.length)}
          icon={Inbox}
          color="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
        />
        <StatCard
          title="Approved Today"
          value="0"
          icon={CheckCircle}
          color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
        />
        <StatCard
          title="Rejected Today"
          value="0"
          icon={XCircle}
          color="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
        />
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-300">Error</p>
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {projects.map((project) => {
          const isLoading = actionLoading[project.id]
          return (
            <div
              key={project.id}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 transition-shadow hover:shadow-sm"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                      Pending Review
                    </span>
                    {project.created_at && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(project.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{project.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                    <Building2 className="w-4 h-4" />
                    Nonprofit: {project.nonprofit?.name || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 leading-relaxed">
                    {project.description?.slice(0, 300)}{project.description && project.description.length > 300 ? '...' : ''}
                  </p>
                </div>
                <div className="flex lg:flex-col gap-2 lg:min-w-[140px]">
                  <button
                    onClick={() => approveProject(project.id)}
                    disabled={!!isLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
                  >
                    {isLoading === 'approve' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => rejectProject(project.id)}
                    disabled={!!isLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium transition disabled:opacity-50"
                  >
                    {isLoading === 'reject' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Reject
                  </button>
                </div>
              </div>
            </div>
          )
        })}
        {projects.length === 0 && (
          <div className="p-12 text-center bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-gray-900 dark:text-white font-medium">No projects pending review</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">All submitted projects have been reviewed.</p>
          </div>
        )}
      </div>
    </div>
  )
}
