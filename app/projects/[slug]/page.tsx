'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  Heart, Share2, Copy, ShoppingCart, MapPin, Calendar, Tag, Users,
  Globe, Mail, Phone, CheckCircle, Clock, AlertCircle,
  Play, X, ExternalLink, FileText, Building2, Target, TrendingUp,
  ArrowLeft
} from 'lucide-react'
import { useSupabase } from '@/hooks/useSupabase'
import { useCartStore } from '@/stores/cartStore'
import type { Project } from '@/types'

// ── Brand colours ──────────────────────────────────────────────
const C = {
  primary:   '#F08B1D',
  primaryDk: '#D97B1A',
  dark:      '#3E4B59',
  bg:        '#f8f9fa',
  sand:      '#FEF3C7',
}

// ── Helpers ─────────────────────────────────────────────────────
function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}
function daysLeft(end?: string) {
  if (!end) return null
  const diff = Math.ceil((new Date(end).getTime() - Date.now()) / 86400000)
  return diff > 0 ? diff : 0
}
function fmtDate(d?: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [donationAmount, setDonationAmount] = useState<number>(50)
  const [frequency, setFrequency] = useState<'once' | 'monthly'>('once')
  const [customAmount, setCustomAmount] = useState('')
  const [isFavorited, setIsFavorited] = useState(false)
  const [activeTab, setActiveTab] = useState<'story' | 'impact' | 'updates' | 'gallery'>('story')
  const [copied, setCopied] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [stickyVisible, setStickyVisible] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const supabase = useSupabase()
  const { addItem } = useCartStore()

  // Sticky donate bar on scroll
  useEffect(() => {
    const onScroll = () => setStickyVisible(window.scrollY > 500)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*, nonprofits(*)')
          .eq('slug', params.slug)
          .maybeSingle()
        if (error) throw error
        setProject(data)
        const { data: { user } } = await supabase.auth.getUser()
        if (user && data) {
          const { data: fav } = await supabase.from('favorites').select('project_id').eq('user_id', user.id).eq('project_id', data.id).limit(1)
          setIsFavorited(Array.isArray(fav) && fav.length > 0)
        }
      } catch (err) {
        console.error('Error fetching project:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProject()
  }, [params.slug])

  // ── Loading ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-4" style={{ borderColor: C.primary, borderTopColor: 'transparent' }} />
          <p className="text-gray-500 text-sm">Loading project…</p>
        </div>
      </div>
    )
  }

  // ── Not found ────────────────────────────────────────────────
  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ background: C.bg }}>
        <AlertCircle className="w-16 h-16 text-gray-300" />
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Project not found</h2>
          <p className="text-gray-500 mb-6">This project may have been removed or the link is incorrect.</p>
          <button onClick={() => router.push('/')} className="px-6 py-3 rounded-xl text-white font-semibold" style={{ background: C.primary }}>
            Browse all projects
          </button>
        </div>
      </div>
    )
  }

  // ── Derived data ─────────────────────────────────────────────
  const pct      = Math.min((project.current_amount / project.goal_amount) * 100, 100)
  const p        = project as any   // typed loosely to access rich fields
  const org      = p.organization   || p.nonprofits || p.nonprofit || {}
  const details  = p.project_details || {}
  const timeline: any[] = details.timeline || p.timeline || []
  const team: any[]     = details.team_members || p.team_members || []
  const leader          = p.project_leader || {}
  const budget: any[]   = p.budget || []
  const impact          = p.impact_metrics || {}
  const gallery: string[] = p.gallery_images || []
  const documents: any[]  = p.documents || []
  const tags: string[]    = p.tags || []
  const dl = daysLeft(p.end_date)

  // ── Handlers ─────────────────────────────────────────────────
  const handleAddToCart = async () => {
    const amt = customAmount ? parseInt(customAmount) : donationAmount
    if (amt < 1) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login?andthen=' + encodeURIComponent(window.location.pathname)); return }
    addItem({ projectId: project.id, title: project.title, amount: amt, frequency })
    router.push('/cart')
  }

  const handleFavorite = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login?andthen=' + encodeURIComponent(window.location.pathname)); return }
    if (isFavorited) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('project_id', project.id)
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, project_id: project.id })
    }
    setIsFavorited(v => !v)
  }

  const handleShare = (platform: string) => {
    const url = window.location.href
    if (platform === 'copy') { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); return }
    const map: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter:  `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(project.title)}`,
    }
    if (map[platform]) window.open(map[platform], '_blank', 'width=600,height=400')
  }

  // ── Reusable sub-components ───────────────────────────────────
  const SectionTitle = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
    <div className="flex items-center gap-2 mb-5">
      <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: C.sand }}>
        {icon}
      </span>
      <h2 className="text-xl font-bold" style={{ color: C.dark }}>{children}</h2>
    </div>
  )

  const DonateWidget = ({ compact = false }: { compact?: boolean }) => {
    const amts = [p.minimum_donation || 10, 25, 50, 100]
    return (
      <div className={compact ? '' : 'space-y-4'}>
        {!compact && (
          <>
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-semibold" style={{ color: C.dark }}>${project.current_amount.toLocaleString()} raised</span>
                <span className="text-gray-500">{Math.round(pct)}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: C.primary }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">of ${project.goal_amount.toLocaleString()} goal</p>
            </div>
          </>
        )}
        <p className="text-sm font-semibold" style={{ color: C.dark }}>Select amount</p>
        <div className="grid grid-cols-4 gap-2">
          {amts.map(a => (
            <button key={a} onClick={() => { setDonationAmount(a); setCustomAmount('') }}
              className="py-2 rounded-lg text-sm font-semibold transition-all"
              style={{ background: donationAmount === a && !customAmount ? C.primary : '#f3f4f6', color: donationAmount === a && !customAmount ? '#fff' : C.dark }}>
              ${a}
            </button>
          ))}
        </div>
        <input type="number" placeholder="Custom amount ($)" value={customAmount}
          onChange={e => { setCustomAmount(e.target.value); if (e.target.value) setDonationAmount(0) }}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2"
          style={{ '--tw-ring-color': C.primary } as React.CSSProperties} />
        <div className="flex gap-2">
          {(['once', 'monthly'] as const).map(f => (
            <button key={f} onClick={() => setFrequency(f)}
              className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{ background: frequency === f ? C.dark : '#f3f4f6', color: frequency === f ? '#fff' : C.dark }}>
              {f === 'once' ? 'One-time' : 'Monthly'}
            </button>
          ))}
        </div>
        <button onClick={handleAddToCart}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
          style={{ background: C.primary }}>
          <ShoppingCart size={18} /> Donate Now
        </button>
      </div>
    )
  }

  // ── Render ───────────────────────────────────────────────────
  return (
    <main className="min-h-screen" style={{ background: C.bg }}>

      {/* ── Sticky top donate bar ───────────────────────────── */}
      <div className={`fixed top-0 left-0 right-0 z-50 bg-white shadow-lg border-b transition-transform duration-300 ${stickyVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <p className="font-semibold text-sm truncate max-w-xs" style={{ color: C.dark }}>{project.title}</p>
          <div className="flex items-center gap-3">
            <div className="w-32 h-2 rounded-full bg-gray-200 overflow-hidden hidden sm:block">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: C.primary }} />
            </div>
            <span className="text-xs text-gray-500 hidden sm:block">{Math.round(pct)}%</span>
            <button onClick={handleAddToCart} className="flex items-center gap-2 px-5 py-2 rounded-xl text-white font-semibold text-sm shadow" style={{ background: C.primary }}>
              <ShoppingCart size={15} /> Donate
            </button>
          </div>
        </div>
      </div>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div ref={heroRef} className="relative w-full overflow-hidden" style={{ height: 'clamp(280px, 45vw, 520px)' }}>
        <Image src={project.main_image_url} alt={project.title} fill className="object-cover" priority sizes="100vw" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.65) 100%)' }} />
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-10 max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <Link href="/" className="flex items-center gap-1.5 text-white/70 text-sm mb-4 hover:text-white transition w-fit">
            <ArrowLeft size={14} /> All Projects
          </Link>
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            {p.featured && <span className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white" style={{ background: C.primary }}>⭐ Featured</span>}
            {p.is_urgent && <span className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white bg-red-500">🔥 Urgent</span>}
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold text-white bg-white/20 backdrop-blur-sm">{project.category}</span>
            {p.sub_category && <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold text-white bg-white/20 backdrop-blur-sm">{p.sub_category}</span>}
          </div>
          <h1 className="text-white font-bold leading-tight mb-2" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)', fontFamily: 'Aleo, Georgia, serif' }}>
            {project.title}
          </h1>
          {p.subtitle && <p className="text-white/80 text-base mb-3 max-w-2xl">{p.subtitle}</p>}
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
            {project.location && <span className="flex items-center gap-1"><MapPin size={13} />{project.location}</span>}
            {p.start_date    && <span className="flex items-center gap-1"><Calendar size={13} />Started {fmtDate(p.start_date)}</span>}
            {dl !== null     && <span className="flex items-center gap-1"><Clock size={13} />{dl > 0 ? `${dl} days left` : 'Ended'}</span>}
          </div>
        </div>
      </div>

      {/* ── Main layout ──────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* ── LEFT: main content ─────────────────────────────── */}
        <div className="lg:col-span-2 space-y-8">

          {/* Progress bar card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>{Math.round(pct)}% funded</span>
              <span>{dl !== null ? (dl > 0 ? `${dl} days left` : 'Campaign ended') : (p.is_ongoing ? 'Ongoing' : '—')}</span>
            </div>
            <div className="h-3 rounded-full bg-gray-100 overflow-hidden mb-5">
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: C.primary }} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
              {[
                { label: 'Raised',  value: fmt(project.current_amount) },
                { label: 'Goal',    value: fmt(project.goal_amount) },
                { label: 'Donors',  value: (project.donor_count ?? p.donors_count ?? '—').toString() },
                { label: 'Days left', value: dl !== null ? (dl > 0 ? `${dl}` : '0') : (p.is_ongoing ? '∞' : '—') },
              ].map(s => (
                <div key={s.label} className="text-center p-3 rounded-xl" style={{ background: C.bg }}>
                  <p className="text-2xl font-bold" style={{ color: C.dark }}>{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            {/* Action row */}
            <div className="flex flex-wrap gap-3">
              <button onClick={handleFavorite} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition">
                <Heart size={15} fill={isFavorited ? C.primary : 'none'} style={{ color: isFavorited ? C.primary : undefined }} />
                {isFavorited ? 'Saved' : 'Save'}
              </button>
              <button onClick={() => handleShare('facebook')} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition">
                <Globe size={15} /> Facebook
              </button>
              <button onClick={() => handleShare('twitter')} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition">
                <Share2 size={15} /> X / Twitter
              </button>
              <button onClick={() => handleShare('copy')} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition">
                <Copy size={15} /> {copied ? 'Copied!' : 'Copy link'}
              </button>
            </div>
          </div>

          {/* ── Tabs ─────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex border-b overflow-x-auto">
              {([
                { key: 'story',   label: 'About' },
                { key: 'impact',  label: 'Impact & Budget' },
                { key: 'updates', label: 'Updates' },
                { key: 'gallery', label: `Gallery${gallery.length ? ` (${gallery.length + 1})` : ''}` },
              ] as const).map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className={`px-5 py-4 text-sm font-semibold whitespace-nowrap transition border-b-2 ${activeTab === t.key ? 'border-b-2' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  style={activeTab === t.key ? { color: C.primary, borderColor: C.primary } : {}}>
                  {t.label}
                </button>
              ))}
            </div>

            <div className="p-6">

              {/* ── About tab ──────────────────────────────── */}
              {activeTab === 'story' && (
                <div className="space-y-8">
                  {/* Summary */}
                  {p.project_summary && (
                    <div className="p-4 rounded-xl border-l-4 text-sm leading-relaxed italic text-gray-600" style={{ borderColor: C.primary, background: C.sand }}>
                      {p.project_summary}
                    </div>
                  )}

                  {/* Challenge / Solution / Activities */}
                  {[
                    { label: 'The Challenge', icon: <AlertCircle size={16} style={{ color: C.primary }} />, content: p.challenge },
                    { label: 'Our Solution',  icon: <CheckCircle size={16} style={{ color: C.primary }} />, content: p.solution },
                    { label: 'Activities',    icon: <Target size={16} style={{ color: C.primary }} />,       content: p.activities },
                  ].map(s => s.content && (
                    <div key={s.label}>
                      <div className="flex items-center gap-2 mb-2 font-semibold text-sm" style={{ color: C.dark }}>
                        {s.icon} {s.label}
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{s.content}</p>
                    </div>
                  ))}

                  {/* Description fallback */}
                  {!p.challenge && !p.project_summary && project.description && (
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{project.description}</p>
                  )}

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {tags.map((t: string) => (
                        <span key={t} className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          <Tag size={10} /> {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Quick info grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    {[
                      { label: 'Category',     value: project.category },
                      { label: 'Sub-category', value: p.sub_category },
                      { label: 'Location',     value: project.location },
                      { label: 'Currency',     value: p.currency },
                      { label: 'Language',     value: p.language },
                      { label: 'Min. donation',value: p.minimum_donation ? `$${p.minimum_donation}` : undefined },
                      { label: 'Start date',   value: fmtDate(p.start_date) },
                      { label: 'End date',     value: p.is_ongoing ? 'Ongoing' : fmtDate(p.end_date) },
                      { label: 'Status',       value: project.status },
                    ].filter(i => i.value).map(i => (
                      <div key={i.label} className="p-3 rounded-xl text-sm" style={{ background: C.bg }}>
                        <p className="text-gray-400 text-xs mb-0.5">{i.label}</p>
                        <p className="font-semibold capitalize" style={{ color: C.dark }}>{i.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Video */}
                  {project.video_url && (
                    <div>
                      <div className="flex items-center gap-2 mb-3 font-semibold text-sm" style={{ color: C.dark }}>
                        <Play size={16} style={{ color: C.primary }} /> Project Video
                      </div>
                      <div className="relative rounded-xl overflow-hidden bg-black" style={{ paddingBottom: '56.25%' }}>
                        <iframe src={project.video_url} className="absolute inset-0 w-full h-full" allowFullScreen title="Project video" />
                      </div>
                    </div>
                  )}

                  {/* Documents */}
                  {documents.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3 font-semibold text-sm" style={{ color: C.dark }}>
                        <FileText size={16} style={{ color: C.primary }} /> Documents
                      </div>
                      <div className="space-y-2">
                        {documents.map((doc: any, i: number) => (
                          <a key={i} href={doc.url} target="_blank" rel="noreferrer"
                            className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-300 transition text-sm">
                            <FileText size={16} className="text-gray-400" />
                            <span className="flex-1 truncate">{doc.name}</span>
                            <ExternalLink size={13} className="text-gray-400" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Impact & Budget tab ─────────────────────── */}
              {activeTab === 'impact' && (
                <div className="space-y-8">

                  {/* Impact metrics */}
                  {(impact.beneficiaries_served || impact.communities_impacted || (impact.key_outcomes?.length > 0)) && (
                    <div>
                      <SectionTitle icon={<TrendingUp size={15} style={{ color: C.primary }} />}>Impact Metrics</SectionTitle>
                      <div className="grid grid-cols-2 gap-4 mb-5">
                        {impact.beneficiaries_served > 0 && (
                          <div className="p-4 rounded-xl text-center" style={{ background: C.sand }}>
                            <p className="text-3xl font-bold" style={{ color: C.primary }}>{impact.beneficiaries_served.toLocaleString()}</p>
                            <p className="text-xs text-gray-500 mt-1">Beneficiaries served</p>
                          </div>
                        )}
                        {impact.communities_impacted > 0 && (
                          <div className="p-4 rounded-xl text-center" style={{ background: C.sand }}>
                            <p className="text-3xl font-bold" style={{ color: C.dark }}>{impact.communities_impacted.toLocaleString()}</p>
                            <p className="text-xs text-gray-500 mt-1">Communities impacted</p>
                          </div>
                        )}
                      </div>
                      {impact.key_outcomes?.filter(Boolean).length > 0 && (
                        <div>
                          <p className="text-sm font-semibold mb-3" style={{ color: C.dark }}>Key outcomes</p>
                          <ul className="space-y-2">
                            {impact.key_outcomes.filter(Boolean).map((o: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                <CheckCircle size={15} className="mt-0.5 shrink-0" style={{ color: C.primary }} />
                                {o}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Donation usage */}
                  {p.donation_usage && (
                    <div>
                      <SectionTitle icon={<Target size={15} style={{ color: C.primary }} />}>How Your Donation Will Be Used</SectionTitle>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{p.donation_usage}</p>
                    </div>
                  )}

                  {/* Budget breakdown */}
                  {budget.length > 0 && (
                    <div>
                      <SectionTitle icon={<TrendingUp size={15} style={{ color: C.primary }} />}>Budget Breakdown</SectionTitle>
                      <div className="space-y-3">
                        {budget.map((b: any, i: number) => {
                          const pct2 = b.percentage || Math.round((b.cost / project.goal_amount) * 100)
                          return (
                            <div key={i}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium" style={{ color: C.dark }}>{b.item}</span>
                                <span className="text-gray-500">${Number(b.cost).toLocaleString()} · {pct2}%</span>
                              </div>
                              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                                <div className="h-full rounded-full transition-all" style={{ width: `${pct2}%`, background: C.primary }} />
                              </div>
                            </div>
                          )
                        })}
                        <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-100">
                          <span style={{ color: C.dark }}>Total</span>
                          <span style={{ color: C.primary }}>${project.goal_amount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Timeline */}
                  {timeline.length > 0 && (
                    <div>
                      <SectionTitle icon={<Calendar size={15} style={{ color: C.primary }} />}>Project Timeline</SectionTitle>
                      <div className="relative pl-6 space-y-6">
                        <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-200" />
                        {timeline.map((ph: any, i: number) => {
                          const isDone = ph.endDate && new Date(ph.endDate) < new Date()
                          const isNow  = !isDone && ph.startDate && new Date(ph.startDate) <= new Date()
                          return (
                            <div key={ph.id || i} className="relative">
                              <div className="absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center"
                                style={{ background: isDone ? C.primary : isNow ? C.dark : '#d1d5db' }}>
                                {isDone && <CheckCircle size={9} className="text-white" />}
                              </div>
                              <div className="pl-2">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-semibold text-sm" style={{ color: C.dark }}>{ph.phase}</p>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isDone ? 'bg-green-100 text-green-700' : isNow ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {isDone ? 'Complete' : isNow ? 'In progress' : 'Pending'}
                                  </span>
                                </div>
                                {(ph.startDate || ph.endDate) && (
                                  <p className="text-xs text-gray-400 mb-1">{fmtDate(ph.startDate)} — {fmtDate(ph.endDate)}</p>
                                )}
                                {ph.activities && <p className="text-sm text-gray-600">{ph.activities}</p>}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Updates tab ─────────────────────────────── */}
              {activeTab === 'updates' && (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No updates posted yet. Check back soon.</p>
                </div>
              )}

              {/* ── Gallery tab ─────────────────────────────── */}
              {activeTab === 'gallery' && (
                <div>
                  {[project.main_image_url, ...gallery].length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[project.main_image_url, ...gallery].map((img, i) => (
                        <button key={i} onClick={() => setLightbox(img)}
                          className="relative rounded-xl overflow-hidden aspect-square group focus:outline-none focus:ring-2"
                          style={{ '--tw-ring-color': C.primary } as React.CSSProperties}>
                          <Image src={img} alt={`Gallery ${i + 1}`} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width:640px) 50vw, 33vw" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-400 text-sm">No gallery images yet.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Organisation card ───────────────────────────── */}
          {(org.name || org.description || org.website) && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <SectionTitle icon={<Building2 size={15} style={{ color: C.primary }} />}>About the Organisation</SectionTitle>
              <div className="flex items-start gap-4">
                {org.logo && (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                    <Image src={org.logo} alt={org.name || 'Org logo'} fill className="object-contain p-1" sizes="64px" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold" style={{ color: C.dark }}>{org.name || p.nonprofits?.name}</h3>
                    {org.registration_number && (
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full text-green-700 bg-green-50">
                        <CheckCircle size={10} /> Registered
                      </span>
                    )}
                  </div>
                  {(org.type || org.size) && (
                    <p className="text-xs text-gray-400 mb-2 capitalize">{[org.type, org.size && `${org.size} staff`].filter(Boolean).join(' · ')}</p>
                  )}
                  {org.description && <p className="text-sm text-gray-600 leading-relaxed mb-3">{org.description}</p>}
                  <div className="flex flex-wrap gap-3 text-sm">
                    {org.website  && <a href={org.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline" style={{ color: C.primary }}><Globe size={13} /> Website</a>}
                    {org.email    && <a href={`mailto:${org.email}`} className="flex items-center gap-1 hover:underline" style={{ color: C.primary }}><Mail size={13} /> {org.email}</a>}
                    {org.phone    && <a href={`tel:${org.phone}`}  className="flex items-center gap-1 hover:underline" style={{ color: C.primary }}><Phone size={13} /> {org.phone}</a>}
                    {org.address  && <span className="flex items-center gap-1 text-gray-500"><MapPin size={13} /> {org.address}</span>}
                  </div>
                  {/* Social links */}
                  {org.social_media && Object.entries(org.social_media as Record<string, string>).filter(([, v]) => v).length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {Object.entries(org.social_media as Record<string, string>).filter(([, v]) => v).map(([k, v]) => (
                        <a key={k} href={v} target="_blank" rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg text-xs font-medium capitalize bg-gray-100 text-gray-600 hover:bg-gray-200 transition">{k}</a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Team ────────────────────────────────────────── */}
          {(leader.name || team.length > 0) && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <SectionTitle icon={<Users size={15} style={{ color: C.primary }} />}>Project Team</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {leader.name && (
                  <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: C.sand }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: C.primary }}>
                      {leader.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm" style={{ color: C.dark }}>{leader.name}</p>
                      <p className="text-xs text-gray-500">{leader.title || 'Project Leader'}</p>
                      {leader.email && <a href={`mailto:${leader.email}`} className="text-xs hover:underline" style={{ color: C.primary }}>{leader.email}</a>}
                    </div>
                  </div>
                )}
                {team.map((m: any, i: number) => (
                  <div key={m.id || i} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: C.dark }}>
                      {(m.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm" style={{ color: C.dark }}>{m.name}</p>
                      <p className="text-xs text-gray-500">{m.role}</p>
                      {m.email && <a href={`mailto:${m.email}`} className="text-xs hover:underline" style={{ color: C.primary }}>{m.email}</a>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: sticky donate sidebar ───────────────────── */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 bg-white rounded-2xl shadow-md border border-gray-100 p-6 space-y-4">
            <h2 className="text-lg font-bold" style={{ color: C.dark }}>Support this project</h2>
            <DonateWidget />
            {/* Mini org info */}
            {(org.name || p.nonprofits?.name) && (
              <div className="pt-4 border-t border-gray-100 text-sm text-gray-500">
                <p className="font-medium text-gray-700 mb-0.5">{org.name || p.nonprofits?.name}</p>
                {org.website && <a href={org.website} target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1 hover:underline" style={{ color: C.primary }}><ExternalLink size={11} /> Visit website</a>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Lightbox ─────────────────────────────────────────── */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white transition" onClick={() => setLightbox(null)}>
            <X size={28} />
          </button>
          <div className="relative max-w-5xl w-full" style={{ maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
            <Image src={lightbox} alt="Gallery" width={1200} height={800} className="object-contain w-full h-full rounded-xl" style={{ maxHeight: '85vh' }} />
          </div>
        </div>
      )}
    </main>
  )
}
