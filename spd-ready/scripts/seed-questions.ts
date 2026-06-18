// Seed the existing static question banks into spd_ready.questions.
//   TRACK_QUESTIONS (study, 8 legacy tracks) + HLD_QUESTIONS (study, HLD pseudo)
//   + ASSESSMENT_QUESTIONS (readiness, 6 categories).
//
// Idempotent: deletes prior source='seed' rows, then inserts. Runs with the
// service_role key (bypasses RLS). Run:
//   node --env-file=.env.local --import tsx scripts/seed-questions.ts
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'node:crypto'
import { TRACK_QUESTIONS } from '../src/lib/local-db/track-questions'
import { HLD_QUESTIONS } from '../src/lib/local-db/hld-questions'
import { ASSESSMENT_QUESTIONS } from '../src/lib/local-db/questions'
import { mapLegacyDomain, defaultConceptForLegacyDomain } from '../src/lib/local-db/domain-map'

const URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !KEY) {
  console.error('❌ Set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const db = createClient(URL, KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  db: { schema: 'spd_ready' },
})

function contentHash(kind: string, stem: string, options: Record<string, string>): string {
  const norm = stem.trim().toLowerCase().replace(/\s+/g, ' ')
  const opts = Object.keys(options).sort().map(k => String(options[k]).trim().toLowerCase()).join('|')
  return createHash('sha256').update(`${kind}::${norm}::${opts}`).digest('hex')
}

type Row = Record<string, unknown>

function base(): Row {
  return {
    kind: 'study', stem: '', options: {}, correct: null, partial_credit: null, score_map: null,
    explanation: '', image: null, category: null, track_domain: null, learning_domain: null,
    concept_id: null, difficulty: 'intermediate', judgment_type: null, error_categories: [],
    real_world_standard: null, standard_refs: [], source: 'seed', source_ref: null, status: 'active',
    content_hash: null,
  }
}

const rows: Row[] = []

for (const q of TRACK_QUESTIONS) {
  rows.push({
    ...base(),
    kind: 'study', stem: q.question, options: q.options, correct: q.correct,
    partial_credit: q.partial_credit, explanation: q.explanation, image: q.image ?? null,
    track_domain: q.domain, learning_domain: q.learning_domain ?? mapLegacyDomain(q.domain),
    concept_id: q.concept_id ?? defaultConceptForLegacyDomain(q.domain), difficulty: q.difficulty,
    judgment_type: q.judgment_type ?? null, error_categories: q.error_categories ?? [],
    real_world_standard: q.real_world_standard ?? null, source_ref: q.id,
    content_hash: contentHash('study', q.question, q.options),
  })
}

for (const q of HLD_QUESTIONS) {
  rows.push({
    ...base(),
    kind: 'study', stem: q.question, options: q.options, correct: q.correct,
    partial_credit: q.partial_credit, explanation: q.explanation, image: q.image ?? null,
    track_domain: null, // surfaces only via the HLD pseudo-domain (learning_domain)
    learning_domain: 'high_level_disinfection',
    concept_id: q.concept_id ?? 'concept-hld-chemical-sterilants', difficulty: q.difficulty,
    judgment_type: q.judgment_type ?? null, error_categories: q.error_categories ?? [],
    real_world_standard: q.real_world_standard ?? null, source_ref: q.id,
    content_hash: contentHash('study', q.question, q.options),
  })
}

for (const q of ASSESSMENT_QUESTIONS) {
  rows.push({
    ...base(),
    kind: 'assessment', stem: q.prompt, options: q.options_json,
    correct: q.scoring_key_json.correct, score_map: q.scoring_key_json.score_map,
    category: q.category, source_ref: q.id,
    content_hash: contentHash('assessment', q.prompt, q.options_json),
  })
}

// Dedupe by content_hash (the static bank may repeat a stem+options).
const seen = new Set<string>()
const deduped = rows.filter(r => {
  const h = r.content_hash as string
  if (seen.has(h)) return false
  seen.add(h)
  return true
})

async function main() {
  console.log(`Seeding ${deduped.length} questions (from ${rows.length} rows, ${rows.length - deduped.length} dup)…`)

  const { error: delErr } = await db.from('questions').delete().eq('source', 'seed')
  if (delErr) throw delErr

  const { error: insErr, count } = await db.from('questions').insert(deduped, { count: 'exact' })
  if (insErr) throw insErr

  const study = deduped.filter(r => r.kind === 'study').length
  const assess = deduped.filter(r => r.kind === 'assessment').length
  console.log(`✅ Seeded ${count ?? deduped.length} questions: ${study} study + ${assess} assessment.`)
}

main().catch(err => {
  console.error('❌ Seed failed:', err.message)
  process.exit(1)
})
