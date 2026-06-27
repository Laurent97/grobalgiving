import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Fetch all crypto wallets (admin only)
export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    let query = supabase
      .from('crypto_wallets')
      .select('*')
      .order('display_order', { ascending: true })

    if (status === 'active') {
      query = query.eq('status', true)
    } else if (status === 'inactive') {
      query = query.eq('status', false)
    }

    const { data: wallets, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ wallets })
  } catch (error) {
    console.error('Error fetching crypto wallets:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST - Create new crypto wallet (admin only)
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const {
      currency_name,
      currency_symbol,
      wallet_address,
      network,
      qr_code_url,
      min_amount = 0,
      exchange_rate_source = 'manual',
      status = true,
      display_order = 0
    } = body

    // Validation
    if (!currency_name || !currency_symbol || !wallet_address || !network) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get max display_order if not provided
    let finalDisplayOrder = display_order
    if (display_order === 0) {
      const { data: maxOrder } = await supabase
        .from('crypto_wallets')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)
        .single()
      
      finalDisplayOrder = (maxOrder?.display_order || 0) + 1
    }

    const { data: wallet, error } = await supabase
      .from('crypto_wallets')
      .insert({
        currency_name,
        currency_symbol,
        wallet_address,
        network,
        qr_code_url,
        min_amount,
        exchange_rate_source,
        status,
        display_order: finalDisplayOrder,
        created_by: user.id
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log audit
    await supabase.from('payment_audit_log').insert({
      action: 'created',
      entity_type: 'crypto_wallet',
      entity_id: wallet.id,
      changes: { new: wallet },
      performed_by: user.id,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown'
    })

    return NextResponse.json({ wallet }, { status: 201 })
  } catch (error) {
    console.error('Error creating crypto wallet:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
