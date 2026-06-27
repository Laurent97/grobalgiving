import { createClient } from '@/lib/supabase/client'
import { useCallback, useState } from 'react'

export const useSupabase = () => {
  return createClient()
}

export const useProjects = () => {
  const supabase = useSupabase()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = useCallback(async (filters?: { category?: string; search?: string }) => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase.from('projects').select('*').eq('status', 'active')

      if (filters?.category) {
        query = query.eq('category', filters.category)
      }
      if (filters?.search) {
        query = query.ilike('title', `%${filters.search}%`)
      }

      const { data, error: err } = await query
      if (err) throw err
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching projects')
      return []
    } finally {
      setLoading(false)
    }
  }, [supabase])

  return { fetchProjects, loading, error }
}

export const useDonations = () => {
  const supabase = useSupabase()
  const [loading, setLoading] = useState(false)

  const createDonation = useCallback(async (donation: any) => {
    setLoading(true)
    try {
      const { data, error: err } = await supabase
        .from('donations')
        .insert([donation])
        .select()
      if (err) throw err
      return data[0]
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const getDonationsByProject = useCallback(async (projectId: string) => {
    setLoading(true)
    try {
      const { data, error: err } = await supabase
        .from('donations')
        .select('*')
        .eq('project_id', projectId)
        .eq('status', 'completed')
      if (err) throw err
      return data
    } finally {
      setLoading(false)
    }
  }, [supabase])

  return { createDonation, getDonationsByProject, loading }
}
