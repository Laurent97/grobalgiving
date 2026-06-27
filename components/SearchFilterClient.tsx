"use client"

import { useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SearchFilter from './SearchFilter'

interface Filters {
  search?: string
  category?: string
  sort?: string
}

interface Props {
  initial?: Filters
}

export default function SearchFilterClient({ initial }: Props) {
  const router = useRouter()
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const onFilter = useCallback(
    (filters: Filters) => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = window.setTimeout(() => {
        const params = new URLSearchParams()
        if (filters.search) params.set('search', filters.search)
        if (filters.category) params.set('category', filters.category)
        if (filters.sort) params.set('sort', filters.sort)
        const query = params.toString()
        // Use replace so repeated filter changes don't bloat history
        router.replace(query ? `?${query}` : '/')
      }, 300)
    },
    [router]
  )

  return <SearchFilter onFilter={onFilter} initial={initial} />
}
