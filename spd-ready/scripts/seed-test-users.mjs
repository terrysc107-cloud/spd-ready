import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://wbznovoufjdlzmjrzsfu.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indiem5vdm91ZmpkbHptanJ6c2Z1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjU0MDE5NiwiZXhwIjoyMDkyMTE2MTk2fQ.RJSg_6ang-9Aaq99QYwhVrZEPL6i-YYWxoXidl0sDLs'

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
