// @ts-nocheck
'use client'

import { useState } from 'react'
import { X, ChevronLeft, ChevronRight, Plus, Trash2, Upload } from 'lucide-react'
import type { UserRole } from '@/lib/permissions'

interface Nonprofit {
  id: string
  name: string
}

interface BudgetItem {
  id: string
  item: string
  cost: number
  percentage: number
}

interface TimelinePhase {
  id: string
  phase: string
  startDate: string
  endDate: string
  activities: string
}

interface TeamMember {
  id: string
  name: string
  role: string
  email: string
}

interface ProjectWizardProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  nonprofits: Nonprofit[]
  role?: UserRole | null
  isAdmin: boolean
}

const steps = [
  'Basic Information',
  'Organization',
  'Project Details',
  'Impact & Budget',
  'Media',
  'Settings',
  'Review'
]

const categories = [
  'Education', 'Health', 'Environment', 'Poverty', 'Disaster Relief',
  'Animal Welfare', 'Arts & Culture', 'Community Development', 'Human Rights',
  'Technology', 'Women & Girls', 'Children & Youth', 'Food Security', 'Water & Sanitation'
]

const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'NGN', 'KES', 'ZAR', 'INR']
const languages = ['English', 'Spanish', 'French', 'Portuguese', 'Arabic', 'Swahili', 'Hindi']
const countries = ['United States', 'United Kingdom', 'Nigeria', 'Kenya', 'India', 'Ghana', 'South Africa', 'Uganda', 'Tanzania', 'Rwanda', 'Other']

export default function ProjectWizard({ isOpen, onClose, onSuccess, nonprofits, role, isAdmin }: ProjectWizardProps) {
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [docFiles, setDocFiles] = useState<File[]>([])
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<any>({
    // Basic
    title: '',
    subtitle: '',
    slug: '',
    category: '',
    sub_category: '',
    goal_amount: '',
    minimum_donation: '10',
    currency: 'USD',
    language: 'English',
    location_country: '',
    location_city: '',
    location_region: '',
    start_date: '',
    end_date: '',
    is_ongoing: false,
    // Organization
    nonprofit_id: '',
    new_nonprofit_name: '',
    organization: {
      type: 'non-profit',
      size: '1-10',
      website: '',
      email: '',
      phone: '',
      address: '',
      registration_number: '',
      description: '',
      logo: '',
      cover_image: '',
      social_media: { facebook: '', twitter: '', linkedin: '', instagram: '', youtube: '' }
    },
    // Details
    project_summary: '',
    challenge: '',
    solution: '',
    activities: '',
    // Impact
    donation_usage: '',
    budget: [] as BudgetItem[],
    impact_metrics: { beneficiaries_served: '', communities_impacted: '', key_outcomes: ['', '', ''] },
    // Media
    video_url: '',
    // Settings
    visibility: 'draft',
    featured: false,
    is_urgent: false,
    allow_comments: true,
    allow_sharing: true,
    project_leader: { name: '', title: '', email: '', phone: '' },
    team_members: [] as TeamMember[],
    tags: '',
    seo: { meta_title: '', meta_description: '', meta_keywords: '', auto_generate: true },
    notifications: { on_donation: true, weekly_updates: false, auto_thank_you: false },
    terms_accepted: false,
    project_details: { timeline: [] }
  })

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const updateNested = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...(prev as any)[parent], [field]: value }
    }))
  }

  const updateDeepNested = (parent: string, child: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev as any)[parent],
        [child]: { ...(prev as any)[parent][child], [field]: value }
      }
    }))
  }

  const addBudgetItem = () => {
    setFormData(prev => ({
      ...prev,
      budget: [...prev.budget, { id: crypto.randomUUID(), item: '', cost: 0, percentage: 0 }]
    }))
  }

  const updateBudgetItem = (id: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      budget: prev.budget.map(item => item.id === id ? { ...item, [field]: value } : item)
    }))
  }

  const removeBudgetItem = (id: string) => {
    setFormData(prev => ({ ...prev, budget: prev.budget.filter(item => item.id !== id) }))
  }

  const addTimelinePhase = () => {
    setFormData(prev => ({
      ...prev,
      project_details: {
        ...prev.project_details,
        timeline: [...(prev.project_details?.timeline || []), { id: crypto.randomUUID(), phase: '', startDate: '', endDate: '', activities: '' }]
      }
    }))
  }

  const updateTimelinePhase = (id: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      project_details: {
        ...prev.project_details,
        timeline: (prev.project_details?.timeline || []).map((phase: any) => phase.id === id ? { ...phase, [field]: value } : phase)
      }
    }))
  }

  const removeTimelinePhase = (id: string) => {
    setFormData(prev => ({
      ...prev,
      project_details: {
        ...prev.project_details,
        timeline: (prev.project_details?.timeline || []).filter((phase: any) => phase.id !== id)
      }
    }))
  }

  const addTeamMember = () => {
    setFormData(prev => ({
      ...prev,
      team_members: [...prev.team_members, { id: crypto.randomUUID(), name: '', role: '', email: '' }]
    }))
  }

  const updateTeamMember = (id: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      team_members: prev.team_members.map(member => member.id === id ? { ...member, [field]: value } : member)
    }))
  }

  const removeTeamMember = (id: string) => {
    setFormData(prev => ({ ...prev, team_members: prev.team_members.filter(member => member.id !== id) }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(f => f.size <= 5 * 1024 * 1024)
      setImageFiles(prev => [...prev, ...files])
      setPreviewUrls(prev => [...prev, ...files.map(f => URL.createObjectURL(f))])
    }
  }

  const removeImage = (idx: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== idx))
    setPreviewUrls(prev => prev.filter((_, i) => i !== idx))
  }

  const uploadFile = async (file: File, bucket: string, path: string): Promise<string> => {
    const form = new FormData()
    form.append('file', file)
    form.append('bucket', bucket)
    form.append('path', path)
    const res = await fetch('/api/upload', { method: 'POST', body: form })
    if (!res.ok) throw new Error('Upload failed')
    const data = await res.json()
    return data.url
  }

  const validateStep = () => {
    setError('')
    if (step === 0) {
      if (!formData.title.trim() || formData.title.length < 10) return setError('Title must be at least 10 characters')
      if (!formData.slug.trim()) return setError('Slug is required')
      if (!formData.category) return setError('Category is required')
      if (!formData.goal_amount || Number(formData.goal_amount) < 1) return setError('Funding goal is required')
      if (!formData.start_date) return setError('Start date is required')
      if (!formData.is_ongoing && !formData.end_date) return setError('End date is required or mark as ongoing')
    }
    if (step === 1) {
      if (!formData.nonprofit_id) return setError('Please select an organization')
      if (formData.nonprofit_id === 'other' && !formData.new_nonprofit_name.trim()) return setError('Please enter a new nonprofit name')
    }
    if (step === 2) {
      if (!formData.project_summary.trim() || formData.project_summary.length < 20) return setError('Project summary is required (min 20 characters)')
      if (!formData.challenge.trim() || formData.challenge.length < 50) return setError('Challenge description is required (min 50 characters)')
      if (!formData.solution.trim() || formData.solution.length < 50) return setError('Solution description is required (min 50 characters)')
      if (!formData.activities.trim()) return setError('Project activities are required')
    }
    if (step === 3) {
      if (!formData.donation_usage.trim() || formData.donation_usage.length < 50) return setError('Donation usage breakdown is required (min 50 characters)')
      if (formData.budget.length === 0) return setError('At least one budget item is required')
      const totalBudget = formData.budget.reduce((sum, item) => sum + Number(item.cost || 0), 0)
      if (totalBudget !== Number(formData.goal_amount)) return setError('Total budget must equal funding goal')
    }
    if (step === 4) {
      if (imageFiles.length + previewUrls.length < 3) return setError('At least 3 project images are required')
    }
    if (step === 5) {
      if (!formData.project_leader.name.trim()) return setError('Project leader name is required')
      if (!formData.project_leader.email.trim()) return setError('Project leader email is required')
    }
    if (step === 6) {
      if (formData.visibility === 'published' && !formData.terms_accepted) return setError('You must accept the terms and conditions to publish')
    }
    return true
  }

  const nextStep = () => {
    if (validateStep() === true) setStep(s => Math.min(s + 1, steps.length - 1))
  }

  const prevStep = () => setStep(s => Math.max(s - 1, 0))

  const generateSlug = () => {
    const base = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    updateField('slug', base ? `${base}-${Date.now()}` : '')
  }

  const handleSubmit = async (publish = false) => {
    if (validateStep() !== true) return
    setSaving(true)
    setError('')
    try {
      const visibility = publish ? 'published' : formData.visibility

      // Upload images
      const uploadedGallery = await Promise.all(imageFiles.map(file => uploadFile(file, 'project-images', 'projects')))
      const allImages = [...uploadedGallery]
      if (allImages.length < 3) {
        setError('At least 3 project images are required')
        setSaving(false)
        return
      }

      // Upload logo and cover
      let orgLogo = formData.organization.logo
      let orgCover = formData.organization.cover_image
      if (logoFile) orgLogo = await uploadFile(logoFile, 'project-images', 'nonprofits')
      if (coverFile) orgCover = await uploadFile(coverFile, 'project-images', 'nonprofits')

      // Upload documents
      const uploadedDocs = await Promise.all(docFiles.map(async file => {
        const url = await uploadFile(file, 'project-documents', 'projects')
        return { name: file.name, url, type: file.name.split('.').pop() || 'pdf' }
      }))

      const body = {
        ...formData,
        goal_amount: Number(formData.goal_amount),
        minimum_donation: Number(formData.minimum_donation) || 1,
        main_image_url: allImages[0],
        gallery_images: allImages.slice(1),
        video_url: formData.video_url || undefined,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        budget: formData.budget.map(b => ({ item: b.item, cost: Number(b.cost), percentage: Number(b.percentage) })),
        timeline: formData.project_details?.timeline || [],
        impact_metrics: {
          beneficiaries_served: Number(formData.impact_metrics.beneficiaries_served) || 0,
          communities_impacted: Number(formData.impact_metrics.communities_impacted) || 0,
          key_outcomes: formData.impact_metrics.key_outcomes.filter(Boolean)
        },
        documents: uploadedDocs,
        organization: {
          ...formData.organization,
          logo: orgLogo,
          cover_image: orgCover
        },
        project_details: {
          timeline: formData.project_details?.timeline || [],
          team_members: formData.team_members,
          seo: formData.seo,
          notifications: formData.notifications,
          organization: { ...formData.organization, logo: orgLogo, cover_image: orgCover }
        },
        visibility
      }

      const response = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create project')
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to create project')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Project</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Step {step + 1} of {steps.length}: {steps[step]}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Basic Information */}
          {step === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Clear, compelling title"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => updateField('subtitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief tagline"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Slug *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => updateField('slug', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="auto-generated-slug"
                  />
                  <button
                    type="button"
                    onClick={generateSlug}
                    className="px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    Generate
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sub-Category</label>
                <input
                  type="text"
                  value={formData.sub_category}
                  onChange={(e) => updateField('sub_category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Primary Education"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Funding Goal *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.goal_amount}
                  onChange={(e) => updateField('goal_amount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Minimum Donation</label>
                <input
                  type="number"
                  min="1"
                  value={formData.minimum_donation}
                  onChange={(e) => updateField('minimum_donation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => updateField('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
                <select
                  value={formData.language}
                  onChange={(e) => updateField('language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {languages.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                <select
                  value={formData.location_country}
                  onChange={(e) => updateField('location_country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select country</option>
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                <input
                  type="text"
                  value={formData.location_city}
                  onChange={(e) => updateField('location_city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Region/State</label>
                <input
                  type="text"
                  value={formData.location_region}
                  onChange={(e) => updateField('location_region', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date *</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => updateField('start_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => updateField('end_date', e.target.value)}
                  disabled={formData.is_ongoing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={formData.is_ongoing}
                    onChange={(e) => updateField('is_ongoing', e.target.checked)}
                    className="rounded"
                  />
                  Ongoing Project (No end date)
                </label>
              </div>
            </div>
          )}

          {/* Step 2: Organization */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Organization *</label>
                <select
                  value={formData.nonprofit_id}
                  onChange={(e) => updateField('nonprofit_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select organization</option>
                  {nonprofits.map(np => <option key={np.id} value={np.id}>{np.name}</option>)}
                  {isAdmin && <option value="other">Other (create new)</option>}
                </select>
              </div>
              {formData.nonprofit_id === 'other' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Organization Name *</label>
                  <input
                    type="text"
                    value={formData.new_nonprofit_name}
                    onChange={(e) => updateField('new_nonprofit_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Organization Type</label>
                  <select
                    value={formData.organization.type}
                    onChange={(e) => updateNested('organization', 'type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="non-profit">Non-Profit</option>
                    <option value="ngo">NGO</option>
                    <option value="community">Community Group</option>
                    <option value="for-profit">For-Profit Social Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Organization Size</label>
                  <select
                    value={formData.organization.size}
                    onChange={(e) => updateNested('organization', 'size', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1-10">1-10 Employees</option>
                    <option value="11-50">11-50 Employees</option>
                    <option value="51-200">51-200 Employees</option>
                    <option value="201+">201+ Employees</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website</label>
                  <input
                    type="url"
                    value={formData.organization.website}
                    onChange={(e) => updateNested('organization', 'website', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.organization.email}
                    onChange={(e) => updateNested('organization', 'email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.organization.phone}
                    onChange={(e) => updateNested('organization', 'phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Registration Number</label>
                  <input
                    type="text"
                    value={formData.organization.registration_number}
                    onChange={(e) => updateNested('organization', 'registration_number', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                <input
                  type="text"
                  value={formData.organization.address}
                  onChange={(e) => updateNested('organization', 'address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Organization Description</label>
                <textarea
                  rows={4}
                  value={formData.organization.description}
                  onChange={(e) => updateNested('organization', 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Organization Logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    className="w-full text-sm text-gray-600 dark:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Organization Cover Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                    className="w-full text-sm text-gray-600 dark:text-gray-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Social Media Links</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {['facebook', 'twitter', 'linkedin', 'instagram', 'youtube'].map(platform => (
                    <input
                      key={platform}
                      type="url"
                      value={(formData.organization.social_media as any)[platform]}
                      onChange={(e) => updateNested('organization', 'social_media', { ...formData.organization.social_media, [platform]: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Project Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Summary *</label>
                <textarea
                  rows={3}
                  value={formData.project_summary}
                  onChange={(e) => updateField('project_summary', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="2-3 sentences summarizing the project"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">The Problem / Challenge *</label>
                <textarea
                  rows={5}
                  value={formData.challenge}
                  onChange={(e) => updateField('challenge', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the specific problem or challenge you are addressing"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">The Solution *</label>
                <textarea
                  rows={5}
                  value={formData.solution}
                  onChange={(e) => updateField('solution', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Explain your approach to solving the problem"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Activities *</label>
                <textarea
                  rows={5}
                  value={formData.activities}
                  onChange={(e) => updateField('activities', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="List the specific activities you will undertake"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Project Timeline</label>
                  <button
                    type="button"
                    onClick={addTimelinePhase}
                    className="text-sm flex items-center gap-1 text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="w-4 h-4" /> Add Phase
                  </button>
                </div>
                <div className="space-y-3">
                  {(formData.project_details?.timeline || []).map((phase: any, idx: number) => (
                    <div key={phase.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Phase {idx + 1}</span>
                        <button type="button" onClick={() => removeTimelinePhase(phase.id)} className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={phase.phase}
                        onChange={(e) => updateTimelinePhase(phase.id, 'phase', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="Phase name"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          value={phase.startDate}
                          onChange={(e) => updateTimelinePhase(phase.id, 'startDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        />
                        <input
                          type="date"
                          value={phase.endDate}
                          onChange={(e) => updateTimelinePhase(phase.id, 'endDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      <textarea
                        rows={2}
                        value={phase.activities}
                        onChange={(e) => updateTimelinePhase(phase.id, 'activities', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="Activities for this phase"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Impact & Budget */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">How Your Donation Will Be Used *</label>
                <textarea
                  rows={5}
                  value={formData.donation_usage}
                  onChange={(e) => updateField('donation_usage', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Break down exactly how donated funds will be allocated"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Budget Breakdown *</label>
                  <button
                    type="button"
                    onClick={addBudgetItem}
                    className="text-sm flex items-center gap-1 text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="w-4 h-4" /> Add Item
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.budget.map((item, idx) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <input
                          type="text"
                          value={item.item}
                          onChange={(e) => updateBudgetItem(item.id, 'item', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          placeholder="Item name"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          value={item.cost}
                          onChange={(e) => updateBudgetItem(item.id, 'cost', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          placeholder="Cost"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          value={item.percentage}
                          onChange={(e) => updateBudgetItem(item.id, 'percentage', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          placeholder="%"
                        />
                      </div>
                      <div className="col-span-1">
                        <button type="button" onClick={() => removeBudgetItem(item.id)} className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Total Budget: ${formData.budget.reduce((sum, item) => sum + Number(item.cost || 0), 0).toLocaleString()} / Goal: ${Number(formData.goal_amount || 0).toLocaleString()}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Beneficiaries Served</label>
                  <input
                    type="number"
                    value={formData.impact_metrics.beneficiaries_served}
                    onChange={(e) => updateNested('impact_metrics', 'beneficiaries_served', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Communities Impacted</label>
                  <input
                    type="number"
                    value={formData.impact_metrics.communities_impacted}
                    onChange={(e) => updateNested('impact_metrics', 'communities_impacted', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Key Outcomes</label>
                <div className="space-y-2">
                  {formData.impact_metrics.key_outcomes.map((outcome, idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={outcome}
                      onChange={(e) => {
                        const outcomes = [...formData.impact_metrics.key_outcomes]
                        outcomes[idx] = e.target.value
                        updateNested('impact_metrics', 'key_outcomes', outcomes)
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Outcome ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Media */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Images * (minimum 3)</label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="w-full text-sm text-gray-600 dark:text-gray-400"
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload at least 3 images (max 5MB each)</p>
                </div>
                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-3">
                    {previewUrls.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <img src={url} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          title="Remove image"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Video URL (YouTube/Vimeo)</label>
                <input
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => updateField('video_url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Document Uploads</label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    multiple
                    onChange={(e) => setDocFiles(Array.from(e.target.files || []))}
                    className="w-full text-sm text-gray-600 dark:text-gray-400"
                  />
                  <p className="text-xs text-gray-500 mt-1">Accepted: PDF, DOC, DOCX, XLS, XLSX</p>
                </div>
                {docFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {docFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                        <span>{file.name}</span>
                        <button type="button" onClick={() => setDocFiles(prev => prev.filter((_, i) => i !== idx))} className="text-red-600 hover:text-red-700">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 6: Settings */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Visibility</label>
                <div className="flex gap-4">
                  {['draft', 'pending', 'published'].map(v => (
                    <label key={v} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <input
                        type="radio"
                        name="visibility"
                        value={v}
                        checked={formData.visibility === v}
                        onChange={(e) => updateField('visibility', e.target.value)}
                      />
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input type="checkbox" checked={formData.featured} onChange={(e) => updateField('featured', e.target.checked)} />
                  Featured Project
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input type="checkbox" checked={formData.is_urgent} onChange={(e) => updateField('is_urgent', e.target.checked)} />
                  Urgent Project
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input type="checkbox" checked={formData.allow_comments} onChange={(e) => updateField('allow_comments', e.target.checked)} />
                  Allow Comments
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input type="checkbox" checked={formData.allow_sharing} onChange={(e) => updateField('allow_sharing', e.target.checked)} />
                  Allow Sharing
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Leader</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={formData.project_leader.name}
                    onChange={(e) => updateNested('project_leader', 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Name"
                  />
                  <input
                    type="text"
                    value={formData.project_leader.title}
                    onChange={(e) => updateNested('project_leader', 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Title"
                  />
                  <input
                    type="email"
                    value={formData.project_leader.email}
                    onChange={(e) => updateNested('project_leader', 'email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Email"
                  />
                  <input
                    type="tel"
                    value={formData.project_leader.phone}
                    onChange={(e) => updateNested('project_leader', 'phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Phone"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Team Members</label>
                  <button type="button" onClick={addTeamMember} className="text-sm flex items-center gap-1 text-blue-600 hover:text-blue-700">
                    <Plus className="w-4 h-4" /> Add Member
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.team_members.map(member => (
                    <div key={member.id} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-4">
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => updateTeamMember(member.id, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          placeholder="Name"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="text"
                          value={member.role}
                          onChange={(e) => updateTeamMember(member.id, 'role', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          placeholder="Role"
                        />
                      </div>
                      <div className="col-span-4">
                        <input
                          type="email"
                          value={member.email}
                          onChange={(e) => updateTeamMember(member.id, 'email', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          placeholder="Email"
                        />
                      </div>
                      <div className="col-span-1">
                        <button type="button" onClick={() => removeTeamMember(member.id)} className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => updateField('tags', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="education, school, children, africa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SEO Settings</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={formData.seo.meta_title}
                    onChange={(e) => updateNested('seo', 'meta_title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Meta Title"
                  />
                  <textarea
                    rows={2}
                    value={formData.seo.meta_description}
                    onChange={(e) => updateNested('seo', 'meta_description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Meta Description"
                  />
                  <input
                    type="text"
                    value={formData.seo.meta_keywords}
                    onChange={(e) => updateNested('seo', 'meta_keywords', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Meta Keywords"
                  />
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input type="checkbox" checked={formData.seo.auto_generate} onChange={(e) => updateNested('seo', 'auto_generate', e.target.checked)} />
                    Auto-generate meta tags from content
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input type="checkbox" checked={formData.notifications.on_donation} onChange={(e) => updateNested('notifications', 'on_donation', e.target.checked)} />
                  Notify me when donation received
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input type="checkbox" checked={formData.notifications.weekly_updates} onChange={(e) => updateNested('notifications', 'weekly_updates', e.target.checked)} />
                  Send weekly project updates to donors
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input type="checkbox" checked={formData.notifications.auto_thank_you} onChange={(e) => updateNested('notifications', 'auto_thank_you', e.target.checked)} />
                  Send thank you messages automatically
                </label>
              </div>
            </div>
          )}

          {/* Step 7: Review */}
          {step === 6 && (
            <div className="space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{formData.title || 'Untitled Project'}</h3>
                <p className="text-gray-600 dark:text-gray-400">{formData.subtitle}</p>
                <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                  <div><span className="text-gray-500 dark:text-gray-400">Goal:</span> ${Number(formData.goal_amount || 0).toLocaleString()} {formData.currency}</div>
                  <div><span className="text-gray-500 dark:text-gray-400">Category:</span> {formData.category}</div>
                  <div><span className="text-gray-500 dark:text-gray-400">Location:</span> {formData.location_city}, {formData.location_country}</div>
                  <div><span className="text-gray-500 dark:text-gray-400">Status:</span> {formData.visibility}</div>
                </div>
                {previewUrls.length > 0 && (
                  <div className="mt-3">
                    <img src={previewUrls[0]} alt="Cover" className="w-full h-48 object-cover rounded-lg" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 dark:text-white">Completion Checklist</h4>
                <ul className="text-sm space-y-1">
                  <li className={formData.title.length >= 10 ? 'text-green-600' : 'text-gray-500'}>✓ Basic Information</li>
                  <li className={formData.nonprofit_id ? 'text-green-600' : 'text-gray-500'}>✓ Organization Selected</li>
                  <li className={formData.challenge.length >= 50 ? 'text-green-600' : 'text-gray-500'}>✓ Project Details</li>
                  <li className={formData.budget.length > 0 ? 'text-green-600' : 'text-gray-500'}>✓ Impact & Budget</li>
                  <li className={imageFiles.length >= 3 ? 'text-green-600' : 'text-gray-500'}>✓ Media Uploaded</li>
                  <li className={formData.project_leader.name ? 'text-green-600' : 'text-gray-500'}>✓ Settings Configured</li>
                </ul>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <label className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={formData.terms_accepted}
                    onChange={(e) => updateField('terms_accepted', e.target.checked)}
                    className="mt-0.5"
                  />
                  <span>I confirm that all information provided is accurate and complete. I agree to the terms and conditions of the platform.</span>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 0}
            className="px-4 py-2 flex items-center gap-1 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            {step < steps.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-4 py-2 flex items-center gap-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleSubmit(false)}
                  disabled={saving}
                  className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save as Draft'}
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit(true)}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Publishing...' : 'Publish Project'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
