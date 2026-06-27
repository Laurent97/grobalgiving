import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Fetch single crypto wallet (admin only)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const { data: wallet, error } = await supabase
      .from('crypto_wallets')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!wallet) {
      return NextResponse.json({ error: 'Crypto wallet not found' }, { status: 404 })
    }

    return NextResponse.json({ wallet })
  } catch (error) {
    console.error('Error fetching crypto wallet:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PUT - Update crypto wallet (admin only)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Get current wallet for audit
    const { data: currentWallet } = await supabase
      .from('crypto_wallets')
      .select('*')
      .eq('id', id)
      .single()

    if (!currentWallet) {
      return NextResponse.json({ error: 'Crypto wallet not found' }, { status: 404 })
    }

    const body = await req.json()
    const {
      currency_name,
      currency_symbol,
      wallet_address,
      network,
      qr_code_url,
      min_amount,
      exchange_rate_source,
      status,
      display_order
    } = body

    const { data: wallet, error } = await supabase
      .from('crypto_wallets')
      .update({
        currency_name,
        currency_symbol,
        wallet_address,
        network,
        qr_code_url,
        min_amount,
        exchange_rate_source,
        status,
        display_order
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log audit
    await supabase.from('payment_audit_log').insert({
      action: 'updated',
      entity_type: 'crypto_wallet',
      entity_id: id,
      changes: { old: currentWallet, new: wallet },
      performed_by: user.id,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown'
    })

    return NextResponse.json({ wallet })
  } catch (error) {
    console.error('Error updating crypto wallet:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE - Delete crypto wallet (admin only)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Get current wallet for audit
    const { data: currentWallet } = await supabase
      .from('crypto_wallets')
      .select('*')
      .eq('id', id)
      .single()

    if (!currentWallet) {
      return NextResponse.json({ error: 'Crypto wallet not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('crypto_wallets')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log audit
    await supabase.from('payment_audit_log').insert({
      action: 'deleted',
      entity_type: 'crypto_wallet',
      entity_id: id,
      changes: { old: currentWallet },
      performed_by: user.id,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown'
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting crypto wallet:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
