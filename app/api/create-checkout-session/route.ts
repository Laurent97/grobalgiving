import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const { items } = await req.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 })
    }

    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: { name: item.title },
        unit_amount: item.amount * 100,
        ...(item.frequency === 'monthly' && { recurring: { interval: 'month' } }),
      },
      quantity: 1,
    }))

    const hasMonthly = items.some((i: any) => i.frequency === 'monthly')
    const mode = hasMonthly ? 'subscription' : 'payment'

    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: lineItems,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/donation-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cart`,
      metadata: {
        items: JSON.stringify(items.map((i: any) => ({ projectId: i.projectId, amount: i.amount, frequency: i.frequency }))),
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Stripe session creation error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
