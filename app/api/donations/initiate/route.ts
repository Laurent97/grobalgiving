import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST - Initiate donation from cart items
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const body = await req.json()
    const {
      cart_item_ids,
      payment_method_type,
      payment_method_id,
      session_id,
      donor_preferences
    } = body

    // Validation
    if (!cart_item_ids || !Array.isArray(cart_item_ids) || cart_item_ids.length === 0) {
      return NextResponse.json({ error: 'No cart items provided' }, { status: 400 })
    }

    if (!payment_method_type || !payment_method_id) {
      return NextResponse.json({ error: 'Payment method required' }, { status: 400 })
    }

    // Fetch cart items
    let cartQuery = supabase
      .from('donation_cart')
      .select(`
        *,
        project:projects(*, nonprofit:nonprofits(*))
      `)
      .in('id', cart_item_ids)

    if (user) {
      cartQuery = cartQuery.eq('user_id', user.id)
    } else if (session_id) {
      cartQuery = cartQuery.eq('session_id', session_id)
    } else {
      return NextResponse.json({ error: 'No user or session' }, { status: 400 })
    }

    const { data: cartItems, error: cartError } = await cartQuery

    if (cartError) {
      return NextResponse.json({ error: cartError.message }, { status: 500 })
    }

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart items not found' }, { status: 404 })
    }

    // Calculate total amount
    const totalAmount = cartItems.reduce((sum, item) => sum + Number(item.amount), 0)
    const currency = cartItems[0].currency

    // Generate unique donation reference
    const donationReference = `DON-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // Create donation records for each cart item
    const donationPromises = cartItems.map(async (cartItem) => {
      const { error } = await supabase.from('donations').insert({
        donor_id: user?.id || null,
        project_id: cartItem.project_id,
        amount: cartItem.amount,
        currency: cartItem.currency,
        frequency: 'once',
        payment_method_type,
        payment_method_id,
        transaction_reference: donationReference,
        status: 'pending',
        dedication_type: cartItem.dedication_type,
        dedication_name: cartItem.dedication_name,
        donor_comment: cartItem.comment,
        donor_preferences: donor_preferences || {}
      })

      return { error, projectId: cartItem.project_id }
    })

    const results = await Promise.all(donationPromises)

    // Check for errors
    const errors = results.filter(r => r.error)
    if (errors.length > 0) {
      console.error('Some donations failed:', errors)
      return NextResponse.json({ error: 'Failed to create some donations' }, { status: 500 })
    }

    // Clear cart items
    await supabase
      .from('donation_cart')
      .delete()
      .in('id', cart_item_ids)

    return NextResponse.json({
      success: true,
      donation_reference: donationReference,
      total_amount: totalAmount,
      currency,
      project_count: cartItems.length
    })
  } catch (error) {
    console.error('Error initiating donation:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
