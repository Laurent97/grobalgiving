(async () => {
  try {
    const serviceRole = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobmp3bHFwaXZjbmJ6bG93dnh0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDkxMDg5NiwiZXhwIjoyMDk2NDg2ODk2fQ.2qPxsZcCTR_D4_O8ZUICM5zG5ChiKuIGvVjQPocpj_U';
    const supabaseUrl = 'https://chnjwlqpivcnbzlowvxt.supabase.co';
    const email = 'laurentjean535@gmail.com';

    console.log('Looking up user by email:', email)
    const adminUrl = `${supabaseUrl.replace(/\/$/, '')}/auth/v1/admin/users?email=${encodeURIComponent(email)}`

    const res = await fetch(adminUrl, {
      headers: {
        Authorization: `Bearer ${serviceRole}`,
        apikey: serviceRole,
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('Failed to fetch user:', res.status, text)
      process.exit(1)
    }

    const users = await res.json()
    if (!Array.isArray(users) || users.length === 0) {
      console.error('No user found with that email')
      process.exit(1)
    }

    const user = users[0]
    const id = user?.id
    console.log('Found user id:', id)

    if (!id) {
      console.error('User has no id')
      process.exit(1)
    }

    // Upsert profile via PostgREST
    const upsertUrl = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/profiles`
    const payload = [{ id, role: 'admin' }]
    console.log('Upserting profile via', upsertUrl)
    const up = await fetch(upsertUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceRole}`,
        apikey: serviceRole,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify(payload),
    })

    const upText = await up.text()
    console.log('Upsert status:', up.status)
    try {
      console.log('Upsert response JSON:', JSON.parse(upText))
    } catch (e) {
      console.log('Upsert response text:', upText)
    }

    if (up.ok) {
      console.log('Promotion successful: user is now admin')
      process.exit(0)
    } else {
      console.error('Promotion failed')
      process.exit(1)
    }
  } catch (err) {
    console.error('Error', err)
    process.exit(1)
  }
})()
