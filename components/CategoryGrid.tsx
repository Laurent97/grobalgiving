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
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Explore by Cause
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find projects that match your passion. Every cause matters.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((category) => {
            const Icon = categoryIcons[category.slug] || Sparkles
            const color = categoryColors[category.slug] || 'bg-gray-500'
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.slug)}
                className="group relative bg-gray-50 hover:bg-white rounded-2xl p-6 text-center transition-all duration-200 hover:shadow-lg border border-gray-200 hover:border-gg-primary"
              >
                <div className={`mx-auto w-16 h-16 ${color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.count} projects</p>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
