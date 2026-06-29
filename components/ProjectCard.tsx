'use client'

import { Project } from '@/types'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingCart } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCartStore } from '@/stores/cartStore'
import { useSupabase } from '@/hooks/useSupabase'
import { useRouter } from 'next/navigation'

interface ProjectCardProps {
  project: Project
  onFavorite?: (projectId: string, isFavorited: boolean) => void
}

export default function ProjectCard({ project, onFavorite }: ProjectCardProps) {
  const [donationAmount, setDonationAmount] = useState<number>(25)
  const [frequency, setFrequency] = useState<'once' | 'monthly'>('once')
  const [isFavorited, setIsFavorited] = useState(false)
  const [showDonationForm, setShowDonationForm] = useState(false)
  const [customAmount, setCustomAmount] = useState('')
  const { addItem } = useCartStore()
  const supabase = useSupabase()
  const router = useRouter()

  const percentage = Math.min((project.current_amount / project.goal_amount) * 100, 100)

  const checkFavorite = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('favorites')
        .select('project_id')
        .eq('user_id', user.id)
        .eq('project_id', project.id)
        .limit(1)

      setIsFavorited(Array.isArray(data) && data.length > 0)
    } catch (error) {
      setIsFavorited(false)
    }
  }

  useEffect(() => {
    checkFavorite()
  }, [])

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()

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
      onFavorite?.(project.id, !isFavorited)
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()

    const finalAmount = customAmount ? parseInt(customAmount) : donationAmount
    if (finalAmount < 1) {
      alert('Please enter a valid amount')
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user && frequency === 'monthly') {
      router.push('/login?andthen=' + encodeURIComponent(window.location.pathname))
      return
    }

    addItem({
      projectId: project.id,
      title: project.title,
      amount: finalAmount,
      frequency,
    })

    setShowDonationForm(false)
    setCustomAmount('')
    setDonationAmount(25)
  }

  const donationAmounts = [10, 25, 50, 100]

  return (
    <Link href={`/projects/${project.slug}`}>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer h-full flex flex-col">
        {/* Image */}
        <div className="relative h-48 w-full bg-gray-200 overflow-hidden">
          <Image
            src={project.main_image_url}
            alt={project.title}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Category Badge */}
          <div className="mb-2">
            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
              {project.category}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold mb-2 line-clamp-2 text-gray-900">{project.title}</h3>

          {/* Location */}
          <p className="text-sm text-gray-600 mb-3">{project.location}</p>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 transition-all" style={{ width: `${percentage}%` }} />
            </div>
          </div>

          {/* Funding Info */}
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-900">
              ${project.current_amount.toLocaleString()} raised
            </p>
            <p className="text-xs text-gray-600">of ${project.goal_amount.toLocaleString()} goal</p>
            <p className="text-xs text-gray-600 mt-1">{Math.round(percentage)}% funded</p>
          </div>

          {/* Donation Form / Button */}
          <div className="mt-auto pt-4 border-t">
            {!showDonationForm ? (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setShowDonationForm(true)
                }}
                className="w-full bg-gg-primary hover:bg-gg-primary-700 text-white font-semibold py-2 px-4 rounded transition flex items-center justify-center gap-2"
              >
                <ShoppingCart size={16} />
                GIVE
              </button>
            ) : (
              <div className="space-y-3 click-stop" onClick={(e) => e.preventDefault()}>
                {/* Amount Selection */}
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Select Amount</p>
                  <div className="grid grid-cols-2 gap-2">
                    {donationAmounts.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => {
                          setDonationAmount(amount)
                          setCustomAmount('')
                        }}
                        className={`py-2 px-2 rounded text-sm font-semibold transition ${
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
                    placeholder="Custom"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value)
                      if (e.target.value) setDonationAmount(0)
                    }}
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>

                {/* Frequency Toggle */}
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Frequency</p>
                  <div className="flex gap-2">
                    {(['once', 'monthly'] as const).map((freq) => (
                      <button
                        key={freq}
                        onClick={() => setFrequency(freq)}
                        className={`flex-1 py-2 px-2 rounded text-sm font-semibold transition ${
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

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition text-sm"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => setShowDonationForm(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 px-4 rounded transition text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* Favorite Heart */}
            <button
              onClick={handleFavorite}
              className="mt-3 w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-red-600 transition"
            >
              <Heart size={16} fill={isFavorited ? 'currentColor' : 'none'} />
              {isFavorited ? 'Favorited' : 'Add to Favorites'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
