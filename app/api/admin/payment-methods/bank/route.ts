import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { BankAccount } from '@/types'

// GET - Fetch all bank accounts (admin only)
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
      .from('bank_accounts')
      .select('*')
      .order('display_order', { ascending: true })

    if (status === 'active') {
      query = query.eq('status', true)
    } else if (status === 'inactive') {
      query = query.eq('status', false)
    }

    const { data: accounts, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ accounts })
  } catch (error) {
    console.error('Error fetching bank accounts:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST - Create new bank account (admin only)
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
      account_name,
      bank_name,
      account_number,
      routing_number,
      swift_bic,
      account_type,
      currency,
      country,
      branch_address,
      instructions,
      bank_logo_url,
      status = true,
      display_order = 0
    } = body

    // Validation
    if (!account_name || !bank_name || !account_number || !account_type || !currency || !country) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get max display_order if not provided
    let finalDisplayOrder = display_order
    if (display_order === 0) {
      const { data: maxOrder } = await supabase
        .from('bank_accounts')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)
        .single()
      
      finalDisplayOrder = (maxOrder?.display_order || 0) + 1
    }

    const { data: account, error } = await supabase
      .from('bank_accounts')
      .insert({
        account_name,
        bank_name,
        account_number,
        routing_number,
        swift_bic,
        account_type,
        currency,
        country,
        branch_address,
        instructions,
        bank_logo_url,
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
      entity_type: 'bank_account',
      entity_id: account.id,
      changes: { new: account },
      performed_by: user.id,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown'
    })

    return NextResponse.json({ account }, { status: 201 })
  } catch (error) {
    console.error('Error creating bank account:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
