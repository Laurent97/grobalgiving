'use client'

import { Project } from '@/types'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingCart, MapPin, Users, Star } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCartStore } from '@/stores/cartStore'
import { useSupabase } from '@/hooks/useSupabase'
import { useRouter } from 'next/navigation'

interface ProjectCardProps {
  project: Project
  onFavorite?: (projectId: string, isFavorited: boolean) => void
  showDonateButton?: boolean
}

export default function ProjectCardEnhanced({ project, onFavorite, showDonateButton = true }: ProjectCardProps) {
  const [donationAmount, setDonationAmount] = useState<number>(25)
  const [frequency, setFrequency] = useState<'once' | 'monthly'>('once')
  const [isFavorited, setIsFavorited] = useState(false)
  const [showDonationForm, setShowDonationForm] = useState(false)
  const [customAmount, setCustomAmount] = useState('')
  const { addItem } = useCartStore()
  const supabase = useSupabase()
  const router = useRouter()

  // Use amount_received if available, otherwise fall back to current_amount
  const currentAmount = project.amount_received || project.current_amount || 0
  const percentage = Math.min((currentAmount / project.goal_amount) * 100, 100)
  const amountLeft = project.goal_amount - currentAmount

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
    if (!user) {
      router.push('/login?andthen=' + encodeURIComponent(window.location.pathname))
      return
    }

    // Add to server-side cart via API
    try {
      const response = await fetch('/api/donations/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: project.id,
          amount: finalAmount,
          currency: 'USD'
        })
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || 'Failed to add to cart')
        return
      }

      await response.json()
      
      // Also update local cart store for UI state
      addItem({
        projectId: project.id,
        title: project.title,
        amount: finalAmount,
        frequency,
      })

      setShowDonationForm(false)
      setCustomAmount('')
      setDonationAmount(25)
      
      // Redirect to checkout or show success
      if (confirm('Item added to cart. Proceed to checkout?')) {
        router.push('/donate/checkout')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Failed to add to cart')
    }
  }

  const donationAmounts = [10, 25, 50, 100]

  return (
    <Link href={`/projects/${project.slug}`}>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer h-full flex flex-col group">
        {/* Image */}
        <div className="relative h-52 w-full bg-gray-200 overflow-hidden">
          <Image
            src={project.main_image_url}
            alt={project.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          {/* Featured Badge */}
          {project.featured && (
            <div className="absolute top-3 left-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              Featured
            </div>
          )}
          {/* Urgent Badge */}
          {project.category === 'disaster' && (
            <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
              Urgent
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          {/* Organization Name */}
          <p className="text-sm font-medium text-gg-primary mb-2">
            {project.nonprofits?.name || 'Verified Nonprofit'}
          </p>

          {/* Title */}
          <h3 className="text-lg font-bold mb-2 line-clamp-2 text-gray-900 group-hover:text-gg-primary transition-colors">
            {project.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
            <MapPin className="w-4 h-4" />
            {project.location}
          </div>

          {/* Short Description */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
            {project.description}
          </p>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-semibold text-gray-900">${currentAmount.toLocaleString()} raised</span>
              <span className="text-gray-600">{Math.round(percentage)}%</span>
            </div>
            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-gg-primary to-orange-500 transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Funding Info */}
          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
            <span>${amountLeft.toLocaleString()} to go</span>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{project.donor_count || 0} donors</span>
            </div>
          </div>

          {/* Donation Form / Button */}
          {showDonateButton && (
            <div className="mt-auto pt-4 border-t border-gray-100">
              {!showDonationForm ? (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    setShowDonationForm(true)
                  }}
                  className="w-full bg-gg-primary hover:bg-gg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                >
                  <ShoppingCart size={18} />
                  Give Now
                </button>
              ) : (
                <div className="space-y-3 click-stop" onClick={(e) => e.preventDefault()}>
                  {/* Amount Selection */}
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2">Select Amount</p>
                    <div className="grid grid-cols-4 gap-2">
                      {donationAmounts.map((amount) => (
                        <button
                          key={amount}
                          onClick={() => {
                            setDonationAmount(amount)
                            setCustomAmount('')
                          }}
                          className={`py-2 px-2 rounded-lg text-sm font-semibold transition ${
                            donationAmount === amount && !customAmount
                              ? 'bg-gg-primary text-white shadow-md'
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
                      className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gg-primary focus:border-transparent"
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
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition ${
                            frequency === freq
                              ? 'bg-gg-primary text-white shadow-md'
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
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 text-sm shadow-sm hover:shadow-md"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => setShowDonationForm(false)}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Favorite Heart */}
              <button
                onClick={handleFavorite}
                className="mt-3 w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors py-2"
              >
                <Heart size={16} fill={isFavorited ? 'currentColor' : 'none'} />
                {isFavorited ? 'Saved' : 'Save for later'}
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
