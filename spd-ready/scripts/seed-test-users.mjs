import { createClient } from '@supabase/supabase-js'

// Secrets come from the environment — never hardcode a service_role key.
// Set these in .env.local (see .env.example) and load via your shell or `node --env-file`.
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing env vars. Set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.')
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const testUsers = [
  { email: 'student@test.com', password: 'Password123!', role: 'student' },
  { email: 'hospital@test.com', password: 'Password123!', role: 'hospital' },
]

for (const u of testUsers) {
  // Create the auth user
  const { data, error } = await admin.auth.admin.createUser({
    email: u.email,
    password: u.password,
    app_metadata: { role: u.role },
    email_confirm: true,
  })

  if (error) {
    if (error.message.includes('already been registered')) {
      console.log(`⚠️  ${u.email} already exists — skipping`)
      continue
    }
    console.error(`❌ Failed to create ${u.email}:`, error.message)
    continue
  }

  const userId = data.user.id

  // Upsert into public.users
  const { error: rowError } = await admin
    .from('users')
    .upsert({ id: userId, email: u.email, role: u.role }, { onConflict: 'id' })

  if (rowError) {
    console.error(`❌ Failed to insert public.users row for ${u.email}:`, rowError.message)
  } else {
    console.log(`✅ Created ${u.role}: ${u.email} / Password123!`)
  }
}
