import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const clean = email.trim().toLowerCase()

    const { error } = await supabase
      .from('newsletter_subscribers')
      .upsert({ email: clean, subscribed_at: new Date().toISOString() }, { onConflict: 'email' })

    if (error) {
      // Unique-violation means already subscribed — treat as success
      if (error.code === '23505') {
        return NextResponse.json({ success: true })
      }
      console.error('Newsletter subscribe error:', error.code, error.message)
      return NextResponse.json({ error: 'Failed to subscribe. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Newsletter route exception:', err?.message)
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
