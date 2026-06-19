// Seed a demo competency org for SPD Ready.
//   1 organization, 1 department, 1 manager + 2 techs,
//   1 competency template ("Steam Sterilization Basics") with items,
//   1 assignment (template -> tech1).
//
// Runs with the service_role key (bypasses RLS). Set env vars first:
//   SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY
// Then: node --env-file=.env.local scripts/seed-competency.mjs
import { createClient } from '@supabase/supabase-js'

const URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !KEY) {
  console.error('❌ Set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const auth = { autoRefreshToken: false, persistSession: false }
const adminAuth = createClient(URL, KEY, { auth })
const db = createClient(URL, KEY, { auth, db: { schema: 'spd_ready' } })

async function ensureUser(email, password, name) {
  const { data, error } = await adminAuth.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  })
  if (!error) return data.user.id
  if (!String(error.message).includes('already')) throw error
  // Already exists — find the id
  const { data: list } = await adminAuth.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const found = list.users.find(u => u.email === email)
  if (!found) throw new Error(`Could not resolve existing user ${email}`)
  return found.id
}

async function main() {
  console.log('Seeding demo competency org…')

  const managerId = await ensureUser('manager@demo-spd.test', 'Password123!', 'Morgan Manager')
  const tech1Id = await ensureUser('tech1@demo-spd.test', 'Password123!', 'Taylor Tech')
  const tech2Id = await ensureUser('tech2@demo-spd.test', 'Password123!', 'Jordan Tech')

  // Organization + department
  const { data: org } = await db
    .from('organizations')
    .insert({ name: 'Northland Demo Hospital — SPD' })
    .select('id')
    .single()
  const orgId = org.id
  const { data: dept } = await db
    .from('departments')
    .insert({ org_id: orgId, name: 'Main SPD', code: 'SPD-A' })
    .select('id')
    .single()
  const deptId = dept.id

  // Profiles (upsert over the trigger-created rows; set org/dept/role/name)
  await db.from('profiles').upsert([
    { id: managerId, org_id: orgId, department_id: deptId, name: 'Morgan Manager', role: 'manager', legacy_user_id: managerId },
    { id: tech1Id, org_id: orgId, department_id: deptId, name: 'Taylor Tech', role: 'tech', legacy_user_id: tech1Id },
    { id: tech2Id, org_id: orgId, department_id: deptId, name: 'Jordan Tech', role: 'tech', legacy_user_id: tech2Id },
  ], { onConflict: 'id' })

  // Competency template + items
  const { data: tmpl } = await db
    .from('competency_templates')
    .insert({
      org_id: orgId,
      name: 'Steam Sterilization Basics',
      description: 'Core steam sterilization competency for SPD technicians.',
      domain: 'sterilization',
      pass_threshold: 80,
      created_by: managerId,
    })
    .select('id')
    .single()
  const templateId = tmpl.id

  await db.from('competency_items').insert([
    { template_id: templateId, label: 'Operate steam sterilizer controls', domain: 'sterilization', evidence_type: 'training', weight: 2, item_order: 1 },
    { template_id: templateId, label: 'Read and interpret a sterilizer printout', domain: 'sterilization', evidence_type: 'either', weight: 2, item_order: 2 },
    { template_id: templateId, label: 'Don PPE correctly before decontamination', evidence_type: 'observation', weight: 1, item_order: 3 },
  ])

  // Assign to tech1
  await db.from('competency_assignments').upsert(
    { org_id: orgId, template_id: templateId, staff_id: tech1Id, assigned_by: managerId, status: 'assigned' },
    { onConflict: 'template_id,staff_id' }
  )

  console.log('✅ Seed complete.')
  console.log('   Manager: manager@demo-spd.test / Password123!')
  console.log('   Tech:    tech1@demo-spd.test    / Password123!')
  console.log('   Tech:    tech2@demo-spd.test    / Password123!')
}

main().catch(err => {
  console.error('❌ Seed failed:', err.message)
  process.exit(1)
})
