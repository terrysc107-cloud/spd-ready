// Promote vetted DRAFT questions → active (the human review gate of the Phase 3
// loop). Active questions go live immediately via RLS + are scheduled by the
// mastery engine — no app deploy. Run AFTER a human has reviewed the drafts.
//
//   node --env-file=.env.local --import tsx scripts/promote-questions.ts <batchId> [--dry]
// e.g. scripts/promote-questions.ts judgment-batch-1
// --dry prints what would change without writing.
import { createClient } from '@supabase/supabase-js'

const BATCH = process.argv[2]
const DRY = process.argv.includes('--dry')
if (!BATCH) { console.error('❌ usage: promote-questions.ts <batchId> [--dry]'); process.exit(1) }

const URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !KEY) { console.error('❌ Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'); process.exit(1) }
const db = createClient(URL, KEY, { auth: { autoRefreshToken: false, persistSession: false }, db: { schema: 'spd_ready' } })

async function main() {
  const { data: drafts, error } = await db.from('questions')
    .select('id, status, source_ref')
    .like('source_ref', `gen:${BATCH}:%`)
    .eq('status', 'draft')
  if (error) throw error
  const ids = (drafts ?? []).map(d => d.id as string)
  console.log(`Batch "${BATCH}": ${ids.length} draft(s) eligible for promotion.`)
  if (!ids.length) return
  if (DRY) { console.log('(dry run — no changes written)'); return }

  const { error: upErr, count } = await db.from('questions')
    .update({ status: 'active', updated_at: new Date().toISOString() }, { count: 'exact' })
    .in('id', ids)
  if (upErr) throw upErr
  console.log(`✅ Promoted ${count ?? ids.length} question(s) draft → active.`)
}

main().catch(err => { console.error('❌ promote failed:', err.message); process.exit(1) })
