'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Image as ImageIcon, Video, Plus, RefreshCw, Search, Filter,
  Edit, Trash2, Eye, EyeOff, CheckCircle, Clock, X, Loader2,
  GripVertical, ChevronLeft, ChevronRight, UploadCloud, AlertTriangle,
  LayoutGrid, Check
} from 'lucide-react'

interface Slide {
  id: string
  title: string
  media_url: string
  media_type: 'image' | 'video'
  alt_text: string | null
  source: string
  status: 'active' | 'inactive' | 'pending'
  display_order: number
  created_at: string
  updated_at: string
}

const STATUS_COLORS = {
  active:   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  inactive: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  pending:  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
}

const SOURCE_OPTIONS = ['custom', 'project', 'project_gallery', 'organization', 'blog', 'testimonial']

// ─── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onDone }: { msg: string; type: 'success' | 'error'; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-sm font-medium transition-all ${
      type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
    }`}>
      {type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
      {msg}
    </div>
  )
}

// ─── Thumbnail ─────────────────────────────────────────────────────────────────
function SlideThumbnail({ slide }: { slide: Slide }) {
  const [failed, setFailed] = useState(false)
  if (slide.media_type === 'video' || failed) {
    return (
      <div className="w-16 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
        {slide.media_type === 'video'
          ? <Video className="w-5 h-5 text-gray-400" />
          : <ImageIcon className="w-5 h-5 text-gray-400" />}
      </div>
    )
  }
  return (
    <img
      src={slide.media_url}
      alt={slide.alt_text || slide.title}
      className="w-16 h-10 rounded-lg object-cover shrink-0 bg-gray-100"
      onError={() => setFailed(true)}
    />
  )
}

// ─── Edit / Add Modal ──────────────────────────────────────────────────────────
function SlideModal({
  slide,
  onClose,
  onSave,
}: {
  slide: Slide | null
  onClose: () => void
  onSave: (data: Partial<Slide> & { id?: string }) => Promise<void>
}) {
  const isEdit = Boolean(slide)
  const [form, setForm] = useState({
    title:         slide?.title || '',
    media_url:     slide?.media_url || '',
    media_type:    slide?.media_type || 'image' as 'image' | 'video',
    alt_text:      slide?.alt_text || '',
    source:        slide?.source || 'custom',
    status:        slide?.status || 'active' as Slide['status'],
    display_order: slide?.display_order?.toString() || '0',
  })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving]       = useState(false)
  const [preview, setPreview]     = useState(slide?.media_url || '')
  const [previewFailed, setPreviewFailed] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { alert('File must be under 10MB'); return }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('bucket', 'project-images')
      fd.append('path', 'slideshow')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('Upload failed')
      const { url } = await res.json()
      const type = file.type.startsWith('video/') ? 'video' : 'image'
      setForm(f => ({ ...f, media_url: url, media_type: type }))
      setPreview(url)
      setPreviewFailed(false)
    } catch (err: any) {
      alert(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.media_url.trim()) return
    setSaving(true)
    try {
      await onSave({
        ...(isEdit ? { id: slide!.id } : {}),
        title:         form.title.trim(),
        media_url:     form.media_url.trim(),
        media_type:    form.media_type,
        alt_text:      form.alt_text.trim() || null,
        source:        form.source,
        status:        form.status,
        display_order: Number(form.display_order) || 0,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-2xl shadow-2xl my-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Slide' : 'Add New Slide'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Close">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Preview + upload */}
          <div className="flex gap-4 items-start">
            <div className="shrink-0 w-36 h-24 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center border border-gray-200 dark:border-gray-700">
              {preview && !previewFailed
                ? form.media_type === 'video'
                  ? <Video className="w-10 h-10 text-gray-400" />
                  : <img src={preview} alt="preview" className="w-full h-full object-cover" onError={() => setPreviewFailed(true)} />
                : <ImageIcon className="w-10 h-10 text-gray-300" />
              }
            </div>
            <div className="flex-1 space-y-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">Media</label>
              <input
                type="text"
                placeholder="Paste image/video URL…"
                value={form.media_url}
                onChange={e => { setForm(f => ({ ...f, media_url: e.target.value })); setPreview(e.target.value); setPreviewFailed(false) }}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F08B1D] focus:border-transparent"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                  {uploading ? 'Uploading…' : 'Upload file'}
                </button>
                <span className="text-xs text-gray-400 self-center">JPG, PNG, WebP, MP4 · max 10MB</span>
              </div>
              <input ref={fileRef} type="file" accept="image/*,video/mp4" className="hidden" onChange={handleUpload} />
            </div>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Title *</label>
              <input
                required
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F08B1D] focus:border-transparent"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Alt Text</label>
              <input
                type="text"
                value={form.alt_text}
                onChange={e => setForm(f => ({ ...f, alt_text: e.target.value }))}
                placeholder="Describe the image for accessibility"
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F08B1D] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Type</label>
              <select
                value={form.media_type}
                onChange={e => setForm(f => ({ ...f, media_type: e.target.value as 'image' | 'video' }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F08B1D]"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Source</label>
              <select
                value={form.source}
                onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F08B1D]"
              >
                {SOURCE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Status</label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as Slide['status'] }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F08B1D]"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Display Order</label>
              <input
                type="number"
                min="0"
                value={form.display_order}
                onChange={e => setForm(f => ({ ...f, display_order: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F08B1D]"
              />
            </div>
          </div>

          {isEdit && (
            <div className="text-xs text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-800 pt-3 flex flex-wrap gap-4">
              <span>Created: {new Date(slide!.created_at).toLocaleDateString()}</span>
              <span>Updated: {new Date(slide!.updated_at).toLocaleDateString()}</span>
              <span>Source: {slide!.source}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="px-5 py-2 text-sm rounded-lg text-white font-semibold transition disabled:opacity-50"
              style={{ background: '#F08B1D' }}
            >
              {saving ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />{isEdit ? 'Saving…' : 'Adding…'}</span> : isEdit ? 'Save Changes' : 'Add Slide'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Refresh Modal ─────────────────────────────────────────────────────────────
function RefreshModal({ total, onClose, onConfirm, loading }: {
  total: number; onClose: () => void; onConfirm: () => void; loading: boolean
}) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md shadow-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-[#F08B1D]" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Refresh Hero Slideshow</h2>
        </div>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-5">
          <p>This will re-pull all project images from the database and update the live hero slideshow immediately.</p>
          <ul className="mt-3 space-y-1.5">
            {['Fetch latest media from all active projects', 'Rebuild the slideshow playlist', 'Update the website hero immediately'].map(t => (
              <li key={t} className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0" />{t}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-gray-400">Current custom slides in DB: <strong>{total}</strong></p>
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            This updates the live site immediately.
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2 text-sm rounded-lg text-white font-semibold transition flex items-center gap-2 disabled:opacity-50"
            style={{ background: '#F08B1D' }}
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Refreshing…</> : <><RefreshCw className="w-4 h-4" />Refresh Now</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function SlideshowClient() {
  const [slides, setSlides]         = useState<Slide[]>([])
  const [loading, setLoading]       = useState(true)
  const [page, setPage]             = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal]           = useState(0)

  // Filters
  const [search, setSearch]         = useState('')
  const [filterSource, setSource]   = useState('')
  const [filterType, setType]       = useState('')
  const [filterStatus, setStatus]   = useState('')

  // Selection
  const [selected, setSelected]     = useState<Set<string>>(new Set())

  // Modals
  const [showAdd, setShowAdd]       = useState(false)
  const [editSlide, setEditSlide]   = useState<Slide | null>(null)
  const [deleteSlide, setDeleteSlide] = useState<Slide | null>(null)
  const [showRefresh, setShowRefresh] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Toast
  const [toast, setToast]           = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => setToast({ msg, type })

  const fetchSlides = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '20' })
      if (search)       params.set('search', search)
      if (filterSource) params.set('source', filterSource)
      if (filterType)   params.set('type', filterType)
      if (filterStatus) params.set('status', filterStatus)

      const res  = await fetch(`/api/admin/slideshow?${params}`)
      const data = await res.json()
      if (data.slides) {
        setSlides(data.slides)
        setTotal(data.pagination.total)
        setTotalPages(data.pagination.totalPages)
      }
    } catch {
      showToast('Failed to load slides', 'error')
    } finally {
      setLoading(false)
    }
  }, [page, search, filterSource, filterType, filterStatus])

  useEffect(() => { fetchSlides() }, [fetchSlides])

  // Reset page on filter change
  useEffect(() => { setPage(1) }, [search, filterSource, filterType, filterStatus])

  // Stats
  const activeCount   = slides.filter(s => s.status === 'active').length
  const pendingCount  = slides.filter(s => s.status === 'pending').length
  const inactiveCount = slides.filter(s => s.status === 'inactive').length

  // Selection helpers
  const allSelected    = slides.length > 0 && selected.size === slides.length
  const toggleAll      = () => setSelected(allSelected ? new Set() : new Set(slides.map(s => s.id)))
  const toggleOne      = (id: string) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  // Save (create or update)
  const handleSave = async (data: Partial<Slide> & { id?: string }) => {
    const isEdit = Boolean(data.id)
    const res = await fetch('/api/admin/slideshow', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) { showToast(json.error || 'Save failed', 'error'); return }
    showToast(isEdit ? 'Slide updated' : 'Slide added')
    setShowAdd(false); setEditSlide(null)
    fetchSlides()
  }

  // Toggle status
  const toggleStatus = async (slide: Slide) => {
    const next = slide.status === 'active' ? 'inactive' : 'active'
    const res  = await fetch('/api/admin/slideshow', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: slide.id, status: next }),
    })
    if (!res.ok) { showToast('Failed to update status', 'error'); return }
    showToast(next === 'active' ? 'Slide activated' : 'Slide deactivated')
    fetchSlides()
  }

  // Delete
  const handleDelete = async () => {
    if (!deleteSlide) return
    const res = await fetch(`/api/admin/slideshow?id=${deleteSlide.id}`, { method: 'DELETE' })
    if (!res.ok) { showToast('Delete failed', 'error'); return }
    showToast('Slide deleted')
    setDeleteSlide(null)
    fetchSlides()
  }

  // Bulk actions
  const handleBulk = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selected.size === 0) return
    if (action === 'delete' && !confirm(`Delete ${selected.size} slide(s)? This cannot be undone.`)) return
    const res = await fetch('/api/admin/slideshow', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ids: Array.from(selected) }),
    })
    if (!res.ok) { showToast('Bulk action failed', 'error'); return }
    showToast(`${selected.size} slide(s) ${action}d`)
    setSelected(new Set())
    fetchSlides()
  }

  // Refresh (re-pulls from DB projects)
  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const res = await fetch('/api/hero-media')
      if (!res.ok) throw new Error()
      const { slides: mediaSlides } = await res.json()
      showToast(`Hero refreshed — ${mediaSlides?.length ?? 0} project images in pool`)
      setShowRefresh(false)
    } catch {
      showToast('Refresh failed', 'error')
    } finally {
      setRefreshing(false)
    }
  }

  // Reorder (move up/down)
  const moveSlide = async (idx: number, dir: -1 | 1) => {
    const swapIdx = idx + dir
    if (swapIdx < 0 || swapIdx >= slides.length) return
    const updated = [...slides]
    const orderA = updated[idx].display_order
    const orderB = updated[swapIdx].display_order
    ;[updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]]
    updated[idx].display_order = orderA
    updated[swapIdx].display_order = orderB
    setSlides(updated)
    await fetch('/api/admin/slideshow', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'reorder',
        slides: [
          { id: updated[idx].id,    display_order: updated[idx].display_order },
          { id: updated[swapIdx].id, display_order: updated[swapIdx].display_order },
        ],
      }),
    })
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Slideshow Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage custom slides for the hero section. Project images are pulled automatically.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowRefresh(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Hero
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition"
            style={{ background: '#F08B1D' }}
          >
            <Plus className="w-4 h-4" />
            Add Slide
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Slides', value: total, icon: LayoutGrid, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400' },
          { label: 'Active',       value: activeCount,   icon: CheckCircle, color: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400' },
          { label: 'Pending',      value: pendingCount,  icon: Clock,       color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400' },
          { label: 'Inactive',     value: inactiveCount, icon: EyeOff,      color: 'text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${color}`}><Icon className="w-4 h-4" /></div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search slides…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F08B1D] focus:border-transparent"
            />
          </div>
          {[
            { value: filterSource, set: setSource, placeholder: 'All Sources', options: SOURCE_OPTIONS },
            { value: filterType,   set: setType,   placeholder: 'All Types',   options: ['image', 'video'] },
            { value: filterStatus, set: setStatus, placeholder: 'All Statuses',options: ['active', 'inactive', 'pending'] },
          ].map(({ value, set, placeholder, options }, i) => (
            <select
              key={i}
              value={value}
              onChange={e => set(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F08B1D]"
            >
              <option value="">{placeholder}</option>
              {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ))}
        </div>

        {/* Bulk actions (visible when items selected) */}
        {selected.size > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3 flex-wrap">
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{selected.size} selected</span>
            <button onClick={() => handleBulk('activate')}   className="text-xs px-3 py-1.5 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 transition font-medium">Activate</button>
            <button onClick={() => handleBulk('deactivate')} className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 transition font-medium">Deactivate</button>
            <button onClick={() => handleBulk('delete')}     className="text-xs px-3 py-1.5 rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 transition font-medium">Delete</button>
            <button onClick={() => setSelected(new Set())}   className="text-xs px-3 py-1.5 rounded-lg text-gray-500 hover:text-gray-700 transition">Clear</button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading slides…</p>
          </div>
        ) : slides.length === 0 ? (
          <div className="p-12 text-center">
            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-medium text-gray-900 dark:text-white">No slides found</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add a custom slide or adjust your filters.</p>
            <button onClick={() => setShowAdd(true)} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: '#F08B1D' }}>
              <Plus className="w-4 h-4" /> Add Slide
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left w-10">
                    <button
                      onClick={toggleAll}
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center transition ${allSelected ? 'border-[#F08B1D] bg-[#F08B1D]' : 'border-gray-300 dark:border-gray-600'}`}
                      aria-label="Select all"
                    >
                      {allSelected && <Check className="w-2.5 h-2.5 text-white" />}
                    </button>
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest w-8">#</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Preview</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Title</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest hidden md:table-cell">Source</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest hidden sm:table-cell">Type</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {slides.map((slide, idx) => (
                  <tr key={slide.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleOne(slide.id)}
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition ${selected.has(slide.id) ? 'border-[#F08B1D] bg-[#F08B1D]' : 'border-gray-300 dark:border-gray-600'}`}
                        aria-label={`Select ${slide.title}`}
                      >
                        {selected.has(slide.id) && <Check className="w-2.5 h-2.5 text-white" />}
                      </button>
                    </td>
                    <td className="px-3 py-3 text-gray-500 dark:text-gray-400 text-xs">{slide.display_order}</td>
                    <td className="px-3 py-3"><SlideThumbnail slide={slide} /></td>
                    <td className="px-3 py-3">
                      <div className="font-medium text-gray-900 dark:text-white line-clamp-1 max-w-[200px]">{slide.title}</div>
                      {slide.alt_text && <div className="text-xs text-gray-400 line-clamp-1">{slide.alt_text}</div>}
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell">
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{slide.source}</span>
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell">
                      <span className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                        {slide.media_type === 'video' ? <Video className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
                        {slide.media_type}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[slide.status]}`}>
                        {slide.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {/* Move up/down */}
                        <button onClick={() => moveSlide(idx, -1)} disabled={idx === 0} title="Move up" className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-25 transition" aria-label="Move up">
                          <GripVertical className="w-3.5 h-3.5 rotate-0" />
                        </button>
                        {/* Toggle active */}
                        <button onClick={() => toggleStatus(slide)} title={slide.status === 'active' ? 'Deactivate' : 'Activate'} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition" aria-label="Toggle status">
                          {slide.status === 'active' ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        {/* Edit */}
                        <button onClick={() => setEditSlide(slide)} title="Edit" className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition" aria-label="Edit slide">
                          <Edit className="w-4 h-4" />
                        </button>
                        {/* Delete */}
                        <button onClick={() => setDeleteSlide(slide)} title="Delete" className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition" aria-label="Delete slide">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Page {page} of {totalPages} · {total} total
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Note about auto-pulled media */}
      <div className="mt-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2.5">
        <ImageIcon className="w-4 h-4 shrink-0 mt-0.5" />
        <span>
          <strong>Auto-pulled media:</strong> Project cover &amp; gallery images from active projects are automatically included in the hero slideshow and do not appear in this table. Use <strong>Refresh Hero</strong> to re-pull the latest project media.
        </span>
      </div>

      {/* Modals */}
      {(showAdd || editSlide) && (
        <SlideModal
          slide={editSlide}
          onClose={() => { setShowAdd(false); setEditSlide(null) }}
          onSave={handleSave}
        />
      )}

      {deleteSlide && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-sm shadow-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Slide</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
              Delete <strong>&quot;{deleteSlide.title}&quot;</strong>? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteSlide(null)} className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                Cancel
              </button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showRefresh && (
        <RefreshModal
          total={total}
          onClose={() => setShowRefresh(false)}
          onConfirm={handleRefresh}
          loading={refreshing}
        />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  )
}
