// Promote vetted DRAFT learning modules (and their check questions) -> active.
// The human review gate of the module authoring loop. Active modules go live
// immediately via RLS; their check questions become schedulable by the mastery
// engine. Run AFTER reviewing the drafts.
//
//   node --env-file=.env.local --import tsx scripts/promote-modules.ts <slug|all> [--dry]
// e.g. scripts/promote-modules.ts all
//      scripts/promote-modules.ts decon-ppe-safety
import { createClient } from '@supabase/supabase-js'

const TARGET = process.argv[2]
const DRY = process.argv.includes('--dry')
if (!TARGET) { console.error('❌ usage: promote-modules.ts <slug|all> [--dry]'); process.exit(1) }

const URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !KEY) { console.error('❌ Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'); process.exit(1) }
const db = createClient(URL, KEY, { auth: { autoRefreshToken: false, persistSession: false }, db: { schema: 'spd_ready' } })

async function main() {
  const all = TARGET === 'all'
  const nowIso = new Date().toISOString()

  // find target draft modules
  let mq = db.from('learning_modules').select('id, slug, status').eq('status', 'draft')
  if (!all) mq = mq.eq('slug', TARGET)
  const { data: modules, error } = await mq
  if (error) throw error
  const slugs = (modules ?? []).map(m => m.slug as string)
  console.log(`${slugs.length} draft module(s) eligible: ${slugs.join(', ') || '(none)'}`)
  if (!slugs.length) return
  if (DRY) { console.log('(dry run — no changes written)'); return }

  // promote the modules
  const moduleIds = (modules ?? []).map(m => m.id as string)
  const { error: mErr } = await db.from('learning_modules')
    .update({ status: 'active', updated_at: nowIso }).in('id', moduleIds)
  if (mErr) throw mErr

  // promote their check questions (source_ref like 'module:<slug>:%')
  let promotedQ = 0
  for (const slug of slugs) {
    const { data: qs } = await db.from('questions').select('id').eq('status', 'draft').like('source_ref', `module:${slug}:%`)
    const ids = (qs ?? []).map(q => q.id as string)
    if (ids.length) {
      const { error: qErr, count } = await db.from('questions')
        .update({ status: 'active', updated_at: nowIso }, { count: 'exact' }).in('id', ids)
      if (qErr) throw qErr
      promotedQ += count ?? ids.length
    }
  }
  console.log(`✅ Promoted ${slugs.length} module(s) + ${promotedQ} check question(s) draft → active.`)
}

main().catch(err => { console.error('❌ promote-modules failed:', err.message); process.exit(1) })
