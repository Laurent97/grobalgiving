import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  try {
    const supabase = await createClient()

    // Get total raised
    const { data: totalRaised } = await supabase
      .from('donations')
      .select('amount')
      .eq('status', 'completed')

    // Get projects funded (with donations)
    const { count: projectsFunded } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .gt('current_amount', 0)
      .eq('status', 'active')

    // Get unique donors
    const { count: donors } = await supabase
      .from('donations')
      .select('donor_id', { count: 'exact', head: true })
      .not('donor_id', 'is', null)

    // Get unique countries/locations
    const { data: locations } = await supabase
      .from('projects')
      .select('location')
      .eq('status', 'active')
      .not('location', 'is', null)

    const uniqueCountries = new Set(
      (locations || [])
        .map(p => p.location?.split(',').pop()?.trim())
        .filter(Boolean)
    )

    return NextResponse.json({
      totalRaised: totalRaised?.reduce((sum, d) => sum + d.amount, 0) || 0,
      projectsFunded: projectsFunded || 0,
      donors: donors || 0,
      countries: uniqueCountries.size,
      lastUpdated: new Date().toISOString()
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
