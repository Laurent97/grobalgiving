#!/usr/bin/env node
// Creates an admin user in Supabase using the service role key.
// Usage:
// SUPABASE_URL=https://xyz.supabase.co SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/create_admin.js
// Optionally set ADMIN_EMAIL and ADMIN_PASSWORD env vars.

const { createClient } = require('@supabase/supabase-js')
const crypto = require('crypto')

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in the environment.')
  process.exit(1)
}

const email = process.env.ADMIN_EMAIL || `admin+${Date.now()}@example.com`
const password = process.env.ADMIN_PASSWORD || crypto.randomBytes(12).toString('base64url')

async function main() {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

  console.log('Creating admin user:', email)
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) {
    console.error('Failed to create user:', error.message || error)
    process.exit(1)
  }

  const user = data.user || data
  console.log('User created with id:', user.id)

  // Upsert profile with role 'admin'
  const { error: pError } = await supabase
    .from('profiles')
    .upsert({ id: user.id, full_name: 'Administrator', role: 'admin', created_at: new Date().toISOString() })

  if (pError) {
    console.error('Failed to upsert profile:', pError.message || pError)
    process.exit(1)
  }

  console.log('Profile upserted as admin.')
  console.log('Credentials:')
  console.log('  Email:', email)
  console.log('  Password:', password)
  console.log('\nStore the password securely. You can override via ADMIN_EMAIL and ADMIN_PASSWORD env vars.')
}

main().catch(err => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
