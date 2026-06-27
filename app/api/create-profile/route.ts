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

  const { id, full_name, role = 'donor' } = body || {}
  if (!id) return NextResponse.json({ error: 'Missing user id' }, { status: 400 })

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE)

  try {
    const { error } = await supabase.from('profiles').upsert({ id, full_name, role })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
