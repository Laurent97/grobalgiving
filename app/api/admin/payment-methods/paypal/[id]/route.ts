import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/admin'

// PUT - Update PayPal account
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const supabase = await createClient()
    const body = await req.json()
    const { email, account_name, currency, me_link, client_id, instructions, status, display_order } = body

    const update: any = {}
    if (email !== undefined) update.email = email
    if (account_name !== undefined) update.account_name = account_name
    if (currency !== undefined) update.currency = currency
    if (me_link !== undefined) update.me_link = me_link || null
    if (client_id !== undefined) update.client_id = client_id || null
    if (instructions !== undefined) update.instructions = instructions || null
    if (status !== undefined) update.status = status
    if (display_order !== undefined) update.display_order = display_order
    update.updated_at = new Date().toISOString()

    const { data: account, error } = await supabase
      .from('paypal_accounts')
      .update(update)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 })

    return NextResponse.json({ account })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}

// DELETE - Delete PayPal account
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const supabase = await createClient()

    const { error } = await supabase.from('paypal_accounts').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
