'use client'

import { useState, useEffect } from 'react'
import { canManageAllProjects, type UserRole } from '@/lib/permissions'
import ProjectWizard from './ProjectWizard'
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Star,
  StarOff,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  CheckCircle,
  Clock,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react'

interface Project {
  id: string
  title: string
  slug: string
  description: string
  goal_amount: number
  amount_received?: number
  amount_left?: number
  status: string
  category?: string
  location?: string
  featured: boolean
  is_visible: boolean
  start_date?: string
  end_date?: string
  created_at: string
  nonprofit_id?: string
  main_image_url?: string
  gallery_images?: string[]
  tags?: string[]
  video_url?: string
  nonprofits?: {
    name: string
  }
}

interface Nonprofit {
  id: string
  name: string
}

interface AdminProjectsClientProps {
  initialStatus?: string
  initialFeatured?: string
  initialSearch?: string
  initialPage: number
  nonprofits: Nonprofit[]
  role?: UserRole | null
  nonprofitId?: string | null
}

export default function AdminProjectsClient({
  initialStatus,
  initialFeatured,
  initialSearch,
  initialPage,
  nonprofits,
  role,
  nonprofitId
}: AdminProjectsClientProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showDonationsModal, setShowDonationsModal] = useState(false)
  
  // Filters
  const [status, setStatus] = useState(initialStatus || '')
  const [featured, setFeatured] = useState(initialFeatured || '')
  const [search, setSearch] = useState(initialSearch || '')
  const [page, setPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(1)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    goal_amount: '',
    nonprofit_id: '',
    new_nonprofit_name: '',
    start_date: '',
    end_date: '',
    category: '',
    tags: '',
    location: '',
    featured: false,
    is_visible: true,
    status: 'active',
    amount_received: ''
  })
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [status, featured, search, page])

  useEffect(() => {
    if (!canManageAllProjects(role) && nonprofits.length === 1) {
      setFormData(prev => ({ ...prev, nonprofit_id: nonprofits[0].id }))
    }
  }, [role, nonprofits])

  const isAdmin = canManageAllProjects(role)

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (status) params.append('status', status)
      if (featured) params.append('featured', featured)
      if (search) params.append('search', search)
      if (nonprofitId) params.append('nonprofit_id', nonprofitId)
      params.append('page', page.toString())

      const response = await fetch(`/api/admin/projects?${params.toString()}`)
      const data = await response.json()
      
      if (data.projects) {
        setProjects(data.projects)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const totalImages = existingImages.length + imageFiles.length
    if (totalImages < 3) {
      alert('Please upload at least 3 images')
      return
    }

    setUploadingImages(true)
    try {
      const uploadedUrls = imageFiles.length > 0 ? await uploadImages(imageFiles) : []
      const allImages = [...existingImages, ...uploadedUrls]

      const response = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
          goal_amount: Number(formData.goal_amount),
          amount_received: formData.amount_received ? Number(formData.amount_received) : 0,
          main_image_url: allImages[0],
          gallery_images: allImages.slice(1)
        })
      })

      if (response.ok) {
        setShowCreateModal(false)
        resetForm()
        fetchProjects()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create project')
      }
    } catch (error: any) {
      console.error('Error creating project:', error)
      alert(error.message || 'Failed to create project')
    } finally {
      setUploadingImages(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProject) return

    const totalImages = existingImages.length + imageFiles.length
    if (totalImages < 3) {
      alert('Please upload at least 3 images')
      return
    }

    setUploadingImages(true)
    try {
      const uploadedUrls = imageFiles.length > 0 ? await uploadImages(imageFiles) : []
      const allImages = [...existingImages, ...uploadedUrls]

      const response = await fetch('/api/admin/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedProject.id,
          ...formData,
          tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
          goal_amount: Number(formData.goal_amount),
          amount_received: formData.amount_received ? Number(formData.amount_received) : 0,
          main_image_url: allImages[0],
          gallery_images: allImages.slice(1)
        })
      })

      if (response.ok) {
        setShowEditModal(false)
        setSelectedProject(null)
        resetForm()
        fetchProjects()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update project')
      }
    } catch (error: any) {
      console.error('Error updating project:', error)
      alert(error.message || 'Failed to update project')
    } finally {
      setUploadingImages(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedProject) return

    try {
      const response = await fetch(`/api/admin/projects?id=${selectedProject.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setShowDeleteConfirm(false)
        setSelectedProject(null)
        fetchProjects()
      } else {
        alert('Failed to delete project')
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Failed to delete project')
    }
  }

  const toggleFeatured = async (project: Project) => {
    try {
      const response = await fetch('/api/admin/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: project.id,
          featured: !project.featured
        })
      })

      if (response.ok) {
        fetchProjects()
      }
    } catch (error) {
      console.error('Error toggling featured:', error)
    }
  }

  const toggleVisibility = async (project: Project) => {
    try {
      const response = await fetch('/api/admin/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: project.id,
          is_visible: !project.is_visible
        })
      })

      if (response.ok) {
        fetchProjects()
      }
    } catch (error) {
      console.error('Error toggling visibility:', error)
    }
  }

  const handleExport = async () => {
    try {
      const params = new URLSearchParams()
      if (status) params.append('status', status)
      
      window.open(`/api/admin/projects/export?${params.toString()}`, '_blank')
    } catch (error) {
      console.error('Error exporting:', error)
    }
  }

  const openEditModal = (project: Project) => {
    setSelectedProject(project)
    const images = [
      project.main_image_url,
      ...(project.gallery_images || [])
    ].filter(Boolean) as string[]
    setFormData({
      title: project.title,
      slug: project.slug,
      description: project.description,
      goal_amount: project.goal_amount.toString(),
      nonprofit_id: project.nonprofit_id || '',
      new_nonprofit_name: '',
      start_date: project.start_date ? project.start_date.split('T')[0] : '',
      end_date: project.end_date ? project.end_date.split('T')[0] : '',
      category: project.category || '',
      tags: Array.isArray(project.tags) ? project.tags.join(', ') : '',
      location: project.location || '',
      featured: project.featured,
      is_visible: project.is_visible,
      status: project.status,
      amount_received: project.amount_received?.toString() || '0'
    })
    setExistingImages(images)
    setImageFiles([])
    setShowEditModal(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      goal_amount: '',
      nonprofit_id: '',
      new_nonprofit_name: '',
      start_date: '',
      end_date: '',
      category: '',
      tags: '',
      location: '',
      featured: false,
      is_visible: true,
      status: 'active',
      amount_received: ''
    })
    setImageFiles([])
    setExistingImages([])
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      const validFiles = newFiles.filter(file => file.size <= 5 * 1024 * 1024)
      if (validFiles.length < newFiles.length) {
        alert('Some files exceed 5MB limit and were skipped')
      }
      setImageFiles(prev => [...prev, ...validFiles])
    }
  }

  const removeImageFile = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index))
  }

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const urls: string[] = []
    for (const file of files) {
      const uploadForm = new FormData()
      uploadForm.append('file', file)
      uploadForm.append('bucket', 'project-images')
      uploadForm.append('path', 'projects')
      const response = await fetch('/api/upload', { method: 'POST', body: uploadForm })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `Failed to upload ${file.name}`)
      }
      const data = await response.json()
      urls.push(data.url)
    }
    return urls
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const totalProjects = projects.length
  const activeProjects = projects.filter(p => p.status === 'active').length
  const pendingProjects = projects.filter(p => p.status === 'pending').length
  const completedProjects = projects.filter(p => p.status === 'completed').length
  const totalRaised = projects.reduce((sum, p) => sum + (p.amount_received || 0), 0)
  const totalGoal = projects.reduce((sum, p) => sum + p.goal_amount, 0)

  const StatCard = ({
    title,
    value,
    trend,
    icon: Icon,
    color
  }: {
    title: string
    value: string
    trend?: number
    icon: typeof LayoutGrid
    color: string
  }) => (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {trend !== undefined && (
            <div className="mt-2 flex items-center text-sm">
              {trend >= 0 ? (
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={trend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                {trend >= 0 ? '+' : ''}{trend}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-2.5 rounded-lg ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create, edit, and manage donation projects across the platform.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Projects"
          value={String(totalProjects)}
          trend={8.3}
          icon={LayoutGrid}
          color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        />
        <StatCard
          title="Active"
          value={String(activeProjects)}
          trend={5.2}
          icon={CheckCircle}
          color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
        />
        <StatCard
          title="Pending"
          value={String(pendingProjects)}
          trend={-2.1}
          icon={Clock}
          color="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
        />
        <StatCard
          title="Funding Progress"
          value={`${totalGoal > 0 ? Math.round((totalRaised / totalGoal) * 100) : 0}%`}
          icon={Star}
          color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
        />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter by status"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={featured}
            onChange={(e) => setFeatured(e.target.value)}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter by featured"
          >
            <option value="">All Projects</option>
            <option value="true">Featured Only</option>
          </select>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-900 dark:text-white font-medium">No projects found</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Try adjusting your filters or create a new project.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Project</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Nonprofit</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Goal</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Raised</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Featured</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Visible</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {projects.map((project) => {
                  const progress = project.goal_amount > 0 ? Math.round((project.amount_received || 0) / project.goal_amount * 100) : 0
                  return (
                    <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{project.title}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{project.category || 'No category'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {project.nonprofits?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        ${project.goal_amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white font-medium">
                          ${(project.amount_received || 0).toLocaleString()}
                        </div>
                        <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className={`h-full bg-blue-600 rounded-full ${
                              progress >= 100 ? 'w-full' :
                              progress >= 75 ? 'w-3/4' :
                              progress >= 50 ? 'w-1/2' :
                              progress >= 25 ? 'w-1/4' :
                              progress > 0 ? 'w-1/12' : 'w-0'
                            }`}
                          />
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {progress}% of goal
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                          project.status === 'active'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : project.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : project.status === 'completed'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : project.status === 'rejected'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleFeatured(project)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                          title={project.featured ? 'Unfeature' : 'Feature'}
                          aria-label={project.featured ? 'Unfeature project' : 'Feature project'}
                        >
                          {project.featured ? <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" /> : <StarOff className="w-5 h-5 text-gray-400 dark:text-gray-500" />}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleVisibility(project)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                          title={project.is_visible ? 'Hide' : 'Show'}
                          aria-label={project.is_visible ? 'Hide project' : 'Show project'}
                        >
                          {project.is_visible ? <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" /> : <EyeOff className="w-5 h-5 text-gray-400 dark:text-gray-500" />}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(project)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition"
                            title="Edit"
                            aria-label="Edit project"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProject(project)
                              setShowDonationsModal(true)
                            }}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition"
                            title="View donations"
                            aria-label="View donations"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => {
                                setSelectedProject(project)
                                setShowDeleteConfirm(true)
                              }}
                              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-600 dark:text-gray-400 hover:text-red-600 transition"
                              title="Delete"
                              aria-label="Delete project"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <ProjectWizard
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          resetForm()
        }}
        onSuccess={fetchProjects}
        nonprofits={nonprofits}
        role={role}
        isAdmin={isAdmin}
      />

      {showEditModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Edit Project</h2>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedProject(null)
                  resetForm()
                }}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gg-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gg-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gg-primary"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gg-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Goal Amount ($) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.goal_amount}
                    onChange={(e) => setFormData({ ...formData, goal_amount: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gg-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount Received ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.amount_received}
                    onChange={(e) => setFormData({ ...formData, amount_received: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gg-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gg-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gg-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gg-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gg-primary"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Images * (minimum 3)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                      multiple
                      onChange={handleImageChange}
                      className="w-full text-sm text-gray-600"
                    />
                    <p className="text-xs text-gray-500 mt-1">Upload at least 3 images (max 5MB each)</p>
                  </div>
                  {(existingImages.length > 0 || imageFiles.length > 0) && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-3">
                      {existingImages.map((url, idx) => (
                        <div key={`existing-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                          <img src={url} alt="Existing" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            title="Remove image"
                            onClick={() => removeExistingImage(idx)}
                            className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {imageFiles.map((file, idx) => (
                        <div key={`new-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                          <img src={URL.createObjectURL(file)} alt="New" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            title="Remove image"
                            onClick={() => removeImageFile(idx)}
                            className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {existingImages.length + imageFiles.length < 3 && (
                    <p className="text-sm text-red-600 mt-2">
                      {existingImages.length + imageFiles.length} of 3 minimum images selected
                    </p>
                  )}
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="education, health, community"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gg-primary"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Featured on homepage</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_visible}
                      onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Publicly visible</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedProject(null)
                    resetForm()
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingImages}
                  className="px-4 py-2 bg-gg-primary text-white rounded-lg hover:bg-gg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingImages ? 'Uploading...' : 'Update Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 max-w-md w-full p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Project</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
              Are you sure you want to delete &quot;{selectedProject.title}&quot;? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setSelectedProject(null)
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Donations Modal */}
      {showDonationsModal && selectedProject && (
        <DonationsModal 
          project={selectedProject}
          onClose={() => {
            setShowDonationsModal(false)
            setSelectedProject(null)
          }}
        />
      )}
    </div>
  )
}

function DonationsModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const [donations, setDonations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDonations()
  }, [project.id])

  const fetchDonations = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/projects/${project.id}/donations`)
      const data = await response.json()
      if (data.donations) {
        setDonations(data.donations)
      }
    } catch (error) {
      console.error('Error fetching donations:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-xl">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Donation History</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{project.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="text-center text-gray-500 dark:text-gray-400">Loading donations...</div>
          ) : donations.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400">No donations yet</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Donor</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Amount</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Frequency</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {donations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {donation.profiles?.full_name || 'Anonymous'}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      ${donation.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 capitalize">
                      {donation.frequency}
                    </td>
                    <td className="px-4 py-3 text-sm capitalize">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        donation.status === 'completed' || donation.status === 'verified'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {donation.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(donation.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
