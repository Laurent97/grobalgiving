'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Heart, Share2, Globe2, Copy, ShoppingCart } from 'lucide-react'
import { useSupabase } from '@/hooks/useSupabase'
import { useCartStore } from '@/stores/cartStore'
import type { Project } from '@/types'

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [donationAmount, setDonationAmount] = useState<number>(100)
  const [frequency, setFrequency] = useState<'once' | 'monthly'>('once')
  const [customAmount, setCustomAmount] = useState('')
  const [isFavorited, setIsFavorited] = useState(false)
  const [activeTab, setActiveTab] = useState<'story' | 'reports' | 'photos'>('story')
  const [copied, setCopied] = useState(false)
  const supabase = useSupabase()
  const { addItem } = useCartStore()

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('slug', params.slug)
          .maybeSingle()

        if (error) throw error
        setProject(data)

        // Check if favorited
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          const { data: favorite } = await supabase
            .from('favorites')
            .select('*')
            .eq('user_id', user.id)
            .eq('project_id', data.id)
            .maybeSingle()
          setIsFavorited(!!favorite)
        }
      } catch (error) {
        console.error('Error fetching project:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [params.slug])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-600 text-lg">Project not found</p>
        <button onClick={() => router.push('/')} className="text-gg-primary hover:underline">
          Back to projects
        </button>
      </div>
    )
  }

  const percentage = Math.min((project.current_amount / project.goal_amount) * 100, 100)
  const remaining = project.goal_amount - project.current_amount

  const handleAddToCart = () => {
    const finalAmount = customAmount ? parseInt(customAmount) : donationAmount
    if (finalAmount < 1) {
      alert('Please enter a valid amount')
      return
    }

    addItem({
      projectId: project.id,
      title: project.title,
      amount: finalAmount,
      frequency,
    })

    router.push('/cart')
  }

  const handleFavorite = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login?andthen=' + encodeURIComponent(window.location.pathname))
        return
      }

      if (isFavorited) {
        await supabase.from('favorites').delete().eq('user_id', user.id).eq('project_id', project.id)
      } else {
        await supabase.from('favorites').insert({ user_id: user.id, project_id: project.id })
      }

      setIsFavorited(!isFavorited)
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const handleShare = (platform: string) => {
    const url = window.location.href
    const title = project.title

    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    }

    if (platform === 'copy') {
      navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      return
    }

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400')
    }
  }

  const donationAmounts = [20, 100, 300, 600]

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="text-gg-primary hover:text-gg-primary-700 mb-4"
          >
            ← Back to Projects
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image */}
            <div className="relative h-96 w-full mb-8 rounded-lg overflow-hidden">
              <Image
                src={project.main_image_url}
                alt={project.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Title and Meta */}
            <div className="mb-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{project.title}</h1>
                  <p className="text-gray-600 text-lg">{project.location}</p>
                </div>
                <button
                  onClick={handleFavorite}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  <Heart size={20} fill={isFavorited ? 'currentColor' : 'none'} />
                  {isFavorited ? 'Favorited' : 'Favorite'}
                </button>
              </div>

              <p className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
                {project.category}
              </p>
            </div>

            {/* Funding Progress */}
            <div className="bg-gray-50 p-8 rounded-lg mb-8">
              <div className="mb-6">
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-green-500 transition-all" style={{ width: `${percentage}%` }} />
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-3xl font-bold text-gray-900">${project.current_amount.toLocaleString()}</p>
                    <p className="text-gray-600">raised</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">${remaining.toLocaleString()}</p>
                    <p className="text-gray-600">remaining</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{Math.round(percentage)}%</p>
                    <p className="text-gray-600">funded</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-8 text-sm">
                <div>
                  <p className="text-gray-600">Donors</p>
                  <p className="font-semibold">72</p>
                </div>
                <div>
                  <p className="text-gray-600">Monthly Donors</p>
                  <p className="font-semibold">2</p>
                </div>
                <div>
                  <p className="text-gray-600">Time remaining</p>
                  <p className="font-semibold">3 years</p>
                </div>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="flex items-center gap-2 mb-8 pb-8 border-b">
              <p className="text-gray-600 font-medium">Share:</p>
              <button
                onClick={() => handleShare('facebook')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title="Share on Facebook"
              >
                <Globe2 size={20} />
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title="Share on Twitter"
              >
                <Share2 size={20} />
              </button>
              <button
                onClick={() => handleShare('copy')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title="Copy link"
              >
                <Copy size={20} />
              </button>
              {copied && <span className="text-green-600 text-sm">Copied!</span>}
            </div>

            {/* Tabs */}
            <div className="mb-8">
              <div className="flex gap-4 border-b mb-6">
                {(['story', 'reports', 'photos'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2 px-4 font-medium transition ${
                      activeTab === tab
                        ? 'text-gg-primary border-b-2 border-gg-primary'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab === 'story' ? 'Story' : tab === 'reports' ? 'Updates' : 'Gallery'}
                  </button>
                ))}
              </div>

              {activeTab === 'story' && (
                <div className="prose max-w-none">
                  <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {project.description}
                  </div>
                </div>
              )}

              {activeTab === 'reports' && (
                <div className="text-center py-12 text-gray-600">
                  <p>No updates yet. Check back soon!</p>
                </div>
              )}

              {activeTab === 'photos' && (
                <div className="text-center py-12 text-gray-600">
                  <p>Photo gallery coming soon</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Donation Form */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold mb-6">Donate Now</h2>

              {/* Amount Selection */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">Select Amount</p>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {donationAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => {
                        setDonationAmount(amount)
                        setCustomAmount('')
                      }}
                      className={`py-3 rounded font-semibold transition ${
                        donationAmount === amount && !customAmount
                          ? 'bg-gg-primary text-white'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  placeholder="Custom amount"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value)
                    if (e.target.value) setDonationAmount(0)
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              {/* Frequency Toggle */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">Frequency</p>
                <div className="flex gap-2">
                  {(['once', 'monthly'] as const).map((freq) => (
                    <button
                      key={freq}
                      onClick={() => setFrequency(freq)}
                      className={`flex-1 py-3 rounded font-semibold transition ${
                        frequency === freq
                          ? 'bg-gg-primary text-white'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      {freq === 'once' ? 'Once' : 'Monthly'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 mb-3"
              >
                <ShoppingCart size={20} />
                Add to Cart
              </button>

              {/* Organization Info */}
              <div className="border-t pt-6 mt-6">
                <h3 className="font-semibold text-gray-900 mb-2">Organization</h3>
                <p className="text-gray-600 text-sm">
                  James Dean Byrd Foundation Inc
                </p>
                <p className="text-gray-600 text-sm">Green Cove Springs, FL</p>
                <a href="#" className="text-gg-primary hover:underline text-sm mt-2 block">
                  Visit website
                </a>
              </div>

              {/* Project Leader */}
              <div className="border-t pt-6 mt-6">
                <h3 className="font-semibold text-gray-900 mb-2">Project Leader</h3>
                <p className="text-gray-600 text-sm">Rachel Isser</p>
                <p className="text-gray-600 text-sm">Green Cove Springs, FL</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
