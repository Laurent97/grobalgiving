import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized', status: 401 as const }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') return { error: 'Forbidden', status: 403 as const }
  return { user, supabase }
}

// GET  /api/admin/slideshow  — list all slides (paginated + filtered)
export async function GET(req: Request) {
  try {
    const auth = await requireAdmin()
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { supabase } = auth

    const { searchParams } = new URL(req.url)
    const page     = Math.max(1, Number(searchParams.get('page')) || 1)
    const pageSize = Math.min(50, Number(searchParams.get('pageSize')) || 20)
    const search   = searchParams.get('search') || ''
    const source   = searchParams.get('source') || ''
    const type     = searchParams.get('type') || ''
    const status   = searchParams.get('status') || ''

    let query = supabase
      .from('slideshow_slides')
      .select('*', { count: 'exact' })
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1)

    if (search) query = query.ilike('title', `%${search}%`)
    if (source) query = query.eq('source', source)
    if (type)   query = query.eq('media_type', type)
    if (status) query = query.eq('status', status)

    const { data: slides, count, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({
      slides: slides || [],
      pagination: { page, pageSize, total: count || 0, totalPages: Math.ceil((count || 0) / pageSize) },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}

// POST /api/admin/slideshow  — create slide
export async function POST(req: Request) {
  try {
    const auth = await requireAdmin()
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { user, supabase } = auth

    const body = await req.json()
    const { title, media_url, media_type, alt_text, source, status, display_order } = body

    if (!title || !media_url) return NextResponse.json({ error: 'title and media_url are required' }, { status: 400 })

    // Auto-assign display_order if not provided
    let order = typeof display_order === 'number' ? display_order : null
    if (order === null) {
      const { data: last } = await supabase
        .from('slideshow_slides')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)
      order = ((last?.[0]?.display_order) ?? -1) + 1
    }

    const { data: slide, error } = await supabase
      .from('slideshow_slides')
      .insert({
        title: title.trim(),
        media_url: media_url.trim(),
        media_type: media_type || 'image',
        alt_text: alt_text?.trim() || null,
        source: source || 'custom',
        status: status || 'active',
        display_order: order,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ slide }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}

// PUT /api/admin/slideshow  — update slide (body must include id)
export async function PUT(req: Request) {
  try {
    const auth = await requireAdmin()
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { supabase } = auth

    const body = await req.json()
    const { id, title, media_url, media_type, alt_text, source, status, display_order } = body
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const update: Record<string, any> = {}
    if (title        !== undefined) update.title         = title.trim()
    if (media_url    !== undefined) update.media_url     = media_url.trim()
    if (media_type   !== undefined) update.media_type    = media_type
    if (alt_text     !== undefined) update.alt_text      = alt_text?.trim() || null
    if (source       !== undefined) update.source        = source
    if (status       !== undefined) update.status        = status
    if (display_order !== undefined) update.display_order = Number(display_order)

    const { data: slide, error } = await supabase
      .from('slideshow_slides')
      .update(update)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ slide })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}

// DELETE /api/admin/slideshow?id=...  — delete slide
export async function DELETE(req: Request) {
  try {
    const auth = await requireAdmin()
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { supabase } = auth

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const { error } = await supabase.from('slideshow_slides').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}

// PATCH /api/admin/slideshow  — bulk action or reorder
// body: { action: 'activate'|'deactivate'|'delete'|'reorder', ids?: string[], slides?: {id,display_order}[] }
export async function PATCH(req: Request) {
  try {
    const auth = await requireAdmin()
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { supabase } = auth

    const body = await req.json()
    const { action, ids, slides } = body

    if (action === 'reorder' && Array.isArray(slides)) {
      for (const s of slides) {
        await supabase
          .from('slideshow_slides')
          .update({ display_order: s.display_order })
          .eq('id', s.id)
      }
      return NextResponse.json({ ok: true })
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'ids array is required' }, { status: 400 })
    }

    if (action === 'delete') {
      await supabase.from('slideshow_slides').delete().in('id', ids)
    } else if (action === 'activate') {
      await supabase.from('slideshow_slides').update({ status: 'active' }).in('id', ids)
    } else if (action === 'deactivate') {
      await supabase.from('slideshow_slides').update({ status: 'inactive' }).in('id', ids)
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
