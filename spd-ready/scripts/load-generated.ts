// Load research-grounded GENERATED questions into spd_ready.questions as DRAFTS.
// Phase 3 OUTPUT stage. Reads a verified JSON batch (array of question objects),
// tags them, dedupes on content_hash (incl. overlap with seed/import), and
// upserts as kind='study', source='generated', status='draft' — never active.
// A human promotes drafts → active separately.
//
//   node --env-file=.env.local --import tsx scripts/load-generated.ts [path] [batchId]
// defaults: path=scripts/content/judgment-batch-1.verified.json  batchId=judgment-batch-1
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

const PATH = process.argv[2] || 'scripts/content/judgment-batch-1.verified.json'
const BATCH = process.argv[3] || 'judgment-batch-1'

const URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !KEY) { console.error('❌ Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'); process.exit(1) }
const db = createClient(URL, KEY, { auth: { autoRefreshToken: false, persistSession: false }, db: { schema: 'spd_ready' } })

const LETTERS = ['A', 'B', 'C', 'D'] as const
const DIFFS = new Set(['foundational', 'intermediate', 'advanced'])
const JUDGMENT_TYPES = new Set([
  'safety_ownership', 'moral_standard', 'critical_thinking', 'common_sense',
  'escalation', 'accountability', 'professionalism', 'teamwork',
])

type Gen = {
  stem: string
  options: { A: string; B: string; C: string; D: string }
  correct: 'A' | 'B' | 'C' | 'D'
  partial_credit?: 'A' | 'B' | 'C' | 'D' | null
  explanation: string
  difficulty: string
  judgment_type: string
  real_world_standard?: string
  standard_refs?: unknown[]
}

function contentHash(stem: string, options: Record<string, string>): string {
  const norm = stem.trim().toLowerCase().replace(/\s+/g, ' ')
  const opts = Object.keys(options).sort().map(k => String(options[k]).trim().toLowerCase()).join('|')
  return createHash('sha256').update(`study::${norm}::${opts}`).digest('hex')
}

function valid(q: Gen, i: number): boolean {
  const problems: string[] = []
  if (!q.stem?.trim()) problems.push('empty stem')
  if (!q.options || LETTERS.some(l => !q.options?.[l]?.trim())) problems.push('missing option A-D')
  if (!LETTERS.includes(q.correct)) problems.push(`bad correct=${q.correct}`)
  if (!DIFFS.has(q.difficulty)) problems.push(`bad difficulty=${q.difficulty}`)
  if (!JUDGMENT_TYPES.has(q.judgment_type)) problems.push(`bad judgment_type=${q.judgment_type}`)
  if (!q.explanation?.trim()) problems.push('empty explanation')
  if (problems.length) { console.warn(`  ⚠️  item ${i} skipped: ${problems.join(', ')}`); return false }
  return true
}

async function main() {
  const raw = JSON.parse(readFileSync(PATH, 'utf8')) as Gen[]
  if (!Array.isArray(raw)) throw new Error('Batch file must be a JSON array')
  console.log(`Loaded ${raw.length} generated items from ${PATH} (batch="${BATCH}").`)

  const rows = raw.filter(valid).map((q, i) => ({
    kind: 'study', stem: q.stem, options: q.options, correct: q.correct,
    partial_credit: q.partial_credit ?? null, score_map: null, explanation: q.explanation,
    image: null, category: null, track_domain: 'SPD_JUDGMENT', learning_domain: 'spd_judgment',
    concept_id: null, difficulty: q.difficulty, judgment_type: q.judgment_type, error_categories: [],
    real_world_standard: q.real_world_standard ?? null, standard_refs: q.standard_refs ?? [],
    source: 'generated', source_ref: `gen:${BATCH}:${i}`, status: 'draft',
    content_hash: contentHash(q.stem, q.options),
  }))

  // idempotent: clear this batch's prior load
  const { error: delErr } = await db.from('questions').delete().like('source_ref', `gen:${BATCH}:%`)
  if (delErr) throw delErr

  // dedupe within batch + against everything already in the table
  const { data: existing, error: exErr } = await db.from('questions').select('content_hash')
  if (exErr) throw exErr
  const taken = new Set((existing ?? []).map(r => r.content_hash as string))
  const seen = new Set<string>()
  const fresh = rows.filter(r => {
    const h = r.content_hash
    if (taken.has(h) || seen.has(h)) return false
    seen.add(h); return true
  })
  console.log(`${fresh.length} fresh after dedupe (${rows.length - fresh.length} dropped as dup/invalid-overlap).`)

  if (fresh.length) {
    const { error, count } = await db.from('questions').insert(fresh, { count: 'exact' })
    if (error) throw error
    console.log(`✅ Loaded ${count ?? fresh.length} generated judgment DRAFTS (status='draft', source='generated').`)
  }
}

main().catch(err => { console.error('❌ load-generated failed:', err.message); process.exit(1) })
