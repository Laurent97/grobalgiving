import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { DonationCartItem } from '@/types'

// GET - Fetch cart items for current user or session
export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('session_id')

    let query = supabase
      .from('donation_cart')
      .select(`
        *,
        project:projects(*, nonprofit:nonprofits(*))
      `)

    if (user) {
      query = query.eq('user_id', user.id)
    } else if (sessionId) {
      query = query.eq('session_id', sessionId)
    } else {
      return NextResponse.json({ items: [] })
    }

    const { data: items, error } = await query.order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ items: items || [] })
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST - Add item to cart
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const body = await req.json()
    const {
      project_id,
      amount,
      currency = 'USD',
      dedication_type,
      dedication_name,
      comment,
      session_id
    } = body

    // Validation
    if (!project_id || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid project or amount' }, { status: 400 })
    }

    // Check if project exists and is active
    const { data: project } = await supabase
      .from('projects')
      .select('id, status, is_visible')
      .eq('id', project_id)
      .single()

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (project.status !== 'active' || !project.is_visible) {
      return NextResponse.json({ error: 'Project is not available for donation' }, { status: 400 })
    }

    // Generate session ID if not provided and user is not logged in
    let finalSessionId = session_id
    if (!user && !session_id) {
      finalSessionId = crypto.randomUUID()
    }

    // Ensure profile exists for authenticated user (prevents FK violation on donation_cart)
    if (user) {
      await supabase.from('profiles').upsert(
        { id: user.id, full_name: user.user_metadata?.full_name || null },
        { onConflict: 'id', ignoreDuplicates: true }
      )
    }

    // Add to cart
    const { data: item, error } = await supabase
      .from('donation_cart')
      .insert({
        user_id: user?.id || null,
        session_id: finalSessionId,
        project_id,
        amount,
        currency,
        dedication_type,
        dedication_name,
        comment
      })
      .select(`
        *,
        project:projects(*, nonprofit:nonprofits(*))
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ item, session_id: finalSessionId }, { status: 201 })
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE - Clear entire cart
export async function DELETE(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('session_id')

    let query
    if (user) {
      query = supabase.from('donation_cart').delete().eq('user_id', user.id)
    } else if (sessionId) {
      query = supabase.from('donation_cart').delete().eq('session_id', sessionId)
    } else {
      return NextResponse.json({ error: 'No user or session' }, { status: 400 })
    }

    const { error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error clearing cart:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
