import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')!

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
    }

    const supabase = await createClient()

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const items = JSON.parse(session.metadata?.items || '[]')

      for (const item of items) {
        await supabase.from('donations').insert({
          donor_id: null, // Guest checkout - implement auth later
          project_id: item.projectId,
          amount: item.amount,
          frequency: item.frequency,
          stripe_session_id: session.id,
          status: 'completed',
        })

        // Update project current_amount
        await supabase.rpc('increment_project_amount', {
          project_id: item.projectId,
          amount_to_add: item.amount,
        })
      }
    }

    if (event.type === 'invoice.paid') {
      const invoice = event.data.object as Stripe.Invoice
      const subscriptionId = (invoice as any).subscription
      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId as string)

        await supabase.from('donations').insert({
          donor_id: null,
          project_id: subscription.metadata.projectId,
          amount: invoice.amount_paid / 100,
          frequency: 'monthly',
          stripe_subscription_id: subscription.id,
          status: 'completed',
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
