'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function ScrollToProjects() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const hasFilter = searchParams.get('search') || searchParams.get('category') || searchParams.get('sort')
    if (!hasFilter) return

    const el = document.getElementById('all-projects')
    if (!el) return

    // Small delay to let the page paint first
    const t = setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
    return () => clearTimeout(t)
  }, [searchParams])

  return null
}
