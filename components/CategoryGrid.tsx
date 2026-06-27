'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { 
  HeartPulse, 
  Leaf, 
  AlertTriangle, 
  Baby, 
  Users,
  GraduationCap,
  Droplets,
  Home,
  Sparkles,
  Loader2
} from 'lucide-react'

const categoryIcons: Record<string, any> = {
  'education': GraduationCap,
  'health': HeartPulse,
  'environment': Leaf,
  'disaster': AlertTriangle,
  'children': Baby,
  'women': Users,
  'water': Droplets,
  'housing': Home,
  'animals': Sparkles,
}

const categoryColors: Record<string, string> = {
  'education': 'bg-blue-500',
  'health': 'bg-red-500',
  'environment': 'bg-green-500',
  'disaster': 'bg-orange-500',
  'children': 'bg-pink-500',
  'women': 'bg-purple-500',
  'water': 'bg-cyan-500',
  'housing': 'bg-amber-500',
  'animals': 'bg-teal-500',
}

interface Category {
  id: string
  name: string
  count: number
  slug: string
}

export default function CategoryGrid() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/projects/categories')
        const data = await response.json()
        if (data.categories) {
          setCategories(data.categories)
        }
      } catch (err) {
        setError('Failed to load categories')
        console.error('Error fetching categories:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  const handleCategoryClick = (categorySlug: string) => {
    router.push(`/?category=${categorySlug}`)
  }

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gg-primary" />
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600">{error}</div>
        </div>
      </section>
    )
  }

  if (categories.length === 0) {
    return null
  }

  return (
    <section className="py-20 bg-[#f8f9fa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 text-[#3E4B59] text-xs font-semibold px-3 py-1.5 rounded-full mb-4 tracking-widest uppercase shadow-sm">
            Browse by Cause
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#3E4B59] mb-3" style={{ fontFamily: 'Aleo, Georgia, serif' }}>
            Find Your Cause
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Every cause matters. Pick the issue closest to your heart.
          </p>
        </div>

        {/* Scrollable on mobile, grid on desktop */}
        <div className="flex gap-4 overflow-x-auto pb-4 sm:pb-0 sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          {categories.map((category) => {
            const Icon = categoryIcons[category.slug] || Sparkles
            const color = categoryColors[category.slug] || 'bg-gray-500'
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.slug)}
                className="group flex-shrink-0 sm:flex-shrink bg-white hover:bg-white rounded-2xl p-6 text-center transition-all duration-300 hover:shadow-xl border border-gray-100 hover:border-[#F08B1D]/30 hover:-translate-y-1 w-36 sm:w-auto"
              >
                <div className={`mx-auto w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-[#3E4B59] text-sm mb-1">{category.name}</h3>
                <p className="text-xs text-gray-400">{category.count} projects</p>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
