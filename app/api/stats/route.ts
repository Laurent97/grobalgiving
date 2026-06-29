import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  try {
    const supabase = await createClient()

    // Sum amount_received across all active projects — authoritative raised total
    const { data: projectAmounts } = await supabase
      .from('projects')
      .select('amount_received')
      .eq('status', 'active')

    const totalRaised = (projectAmounts ?? []).reduce((sum, p) => sum + (p.amount_received || 0), 0)

    // Projects with any funds received
    const { count: projectsFunded } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .gt('amount_received', 0)

    // Unique donors across all donations
    const { count: donors } = await supabase
      .from('donations')
      .select('donor_id', { count: 'exact', head: true })
      .not('donor_id', 'is', null)

    // Unique countries from active projects
    const { data: locations } = await supabase
      .from('projects')
      .select('location_country')
      .eq('status', 'active')
      .not('location_country', 'is', null)

    const countries = new Set((locations || []).map(p => p.location_country).filter(Boolean)).size

    return NextResponse.json({
      totalRaised,
      projectsFunded: projectsFunded || 0,
      donors: donors || 0,
      countries,
      lastUpdated: new Date().toISOString()
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
