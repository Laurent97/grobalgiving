import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Fetch single bank account (admin only)
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

    const { data: account, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!account) {
      return NextResponse.json({ error: 'Bank account not found' }, { status: 404 })
    }

    return NextResponse.json({ account })
  } catch (error) {
    console.error('Error fetching bank account:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PUT - Update bank account (admin only)
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

    // Get current account for audit
    const { data: currentAccount } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('id', id)
      .single()

    if (!currentAccount) {
      return NextResponse.json({ error: 'Bank account not found' }, { status: 404 })
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
      status,
      display_order
    } = body

    const { data: account, error } = await supabase
      .from('bank_accounts')
      .update({
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
      entity_type: 'bank_account',
      entity_id: id,
      changes: { old: currentAccount, new: account },
      performed_by: user.id,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown'
    })

    return NextResponse.json({ account })
  } catch (error) {
    console.error('Error updating bank account:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE - Delete bank account (admin only)
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

    // Get current account for audit
    const { data: currentAccount } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('id', id)
      .single()

    if (!currentAccount) {
      return NextResponse.json({ error: 'Bank account not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('bank_accounts')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log audit
    await supabase.from('payment_audit_log').insert({
      action: 'deleted',
      entity_type: 'bank_account',
      entity_id: id,
      changes: { old: currentAccount },
      performed_by: user.id,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown'
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting bank account:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
