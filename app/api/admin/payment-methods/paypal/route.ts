import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/admin'

// GET - List all PayPal accounts
export async function GET() {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('paypal_accounts')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ accounts: data })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}

// POST - Create PayPal account
export async function POST(req: Request) {
  try {
    const { user } = await requireAdmin()
    const supabase = await createClient()
    const body = await req.json()
    const { email, account_name, currency, me_link, client_id, instructions, status, display_order } = body

    if (!email || !account_name) {
      return NextResponse.json({ error: 'Email and account name are required' }, { status: 400 })
    }

    const { data: account, error } = await supabase
      .from('paypal_accounts')
      .insert({
        email,
        account_name,
        currency: currency || 'USD',
        me_link: me_link || null,
        client_id: client_id || null,
        instructions: instructions || null,
        status: status ?? true,
        display_order: display_order || 0,
        created_by: user.id
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ account })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
