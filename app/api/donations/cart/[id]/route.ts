import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// DELETE - Remove single item from cart
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('session_id')

    let query = supabase.from('donation_cart').delete().eq('id', id)

    if (user) {
      query = query.eq('user_id', user.id)
    } else if (sessionId) {
      query = query.eq('session_id', sessionId)
    } else {
      return NextResponse.json({ error: 'No user or session' }, { status: 400 })
    }

    const { error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing cart item:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PUT - Update cart item (change amount, dedication, etc.)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('session_id')

    const body = await req.json()
    const {
      amount,
      dedication_type,
      dedication_name,
      comment
    } = body

    // Validation
    if (amount && amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    let query = supabase
      .from('donation_cart')
      .update({
        amount,
        dedication_type,
        dedication_name,
        comment
      })
      .eq('id', id)

    if (user) {
      query = query.eq('user_id', user.id)
    } else if (sessionId) {
      query = query.eq('session_id', sessionId)
    } else {
      return NextResponse.json({ error: 'No user or session' }, { status: 400 })
    }

    const { data: item, error } = await query
      .select(`
        *,
        project:projects(*, nonprofit:nonprofits(*))
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ item })
  } catch (error) {
    console.error('Error updating cart item:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
