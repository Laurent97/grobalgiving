import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-create-profile-secret')
  if (!process.env.CREATE_PROFILE_SECRET) {
    return NextResponse.json({ error: 'Server misconfigured: CREATE_PROFILE_SECRET missing' }, { status: 500 })
  }
  if (!secret || secret !== process.env.CREATE_PROFILE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE) {
    return NextResponse.json({ error: 'Server misconfigured: Supabase env vars missing' }, { status: 500 })
  }

  let body: any
  try {
    body = await req.json()
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { email, role = 'admin' } = body || {}
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })

  try {
    // Lookup user via Supabase GoTrue admin REST endpoint
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, '')}/auth/v1/admin/users?email=${encodeURIComponent(
      email
    )}`

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE}`,
        apikey: process.env.SUPABASE_SERVICE_ROLE,
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: `Could not fetch user: ${res.status} ${text}` }, { status: 500 })
    }

    const users = await res.json()
    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: 'No user found with that email' }, { status: 404 })
    }

    const user = users[0]
    const id = user?.id
    if (!id) return NextResponse.json({ error: 'User has no id' }, { status: 500 })

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE)
    const { error } = await supabase.from('profiles').upsert({ id, role })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true, id })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
