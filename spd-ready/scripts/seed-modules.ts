// Load research-grounded GENERATED learning modules into spd_ready as DRAFTS.
// Phase A OUTPUT stage (mirrors scripts/load-generated.ts). For each module it:
//   1. inserts the module's check questions into spd_ready.questions
//      (kind='study', source='generated', source_ref='module:<slug>:<i>', status='draft')
//   2. inserts the learning_modules row (status='draft') with check_question_ids
//      pointing at those questions.
// Idempotent: clears a module's prior questions (by source_ref prefix) + the
// module row (by slug) before reloading. A human promotes drafts -> active with
// scripts/promote-modules.ts.
//
//   node --env-file=.env.local --import tsx scripts/seed-modules.ts [path]
// default: scripts/content/modules-batch-1.json
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

const PATH = process.argv[2] || 'scripts/content/modules-batch-1.json'

const URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !KEY) { console.error('❌ Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'); process.exit(1) }
const db = createClient(URL, KEY, { auth: { autoRefreshToken: false, persistSession: false }, db: { schema: 'spd_ready' } })

const LETTERS = ['A', 'B', 'C', 'D'] as const
const DOMAINS = new Set(['foundational', 'decontamination', 'high_level_disinfection', 'iap', 'sterilization', 'sterile_storage', 'spd_judgment'])
const DIFFS = new Set(['foundational', 'intermediate', 'advanced'])

type Check = {
  stem: string
  options: { A: string; B: string; C: string; D: string }
  correct: 'A' | 'B' | 'C' | 'D'
  partial_credit?: 'A' | 'B' | 'C' | 'D' | null
  explanation: string
  difficulty: string
  concept_id: string
  real_world_standard?: string
  standard_refs?: unknown[]
}
type Section = { heading: string; body: string; image_url?: string | null; video_url?: string | null }
type Module = {
  slug: string
  domain: string
  concept_ids: string[]
  title: string
  summary?: string
  objectives: string[]
  estimated_minutes?: number
  difficulty: string
  sections: Section[]
  checks: Check[]
}

function contentHash(parts: string): string {
  return createHash('sha256').update(parts).digest('hex')
}
function qHash(stem: string, options: Record<string, string>): string {
  const norm = stem.trim().toLowerCase().replace(/\s+/g, ' ')
  const opts = Object.keys(options).sort().map(k => String(options[k]).trim().toLowerCase()).join('|')
  return contentHash(`study::${norm}::${opts}`)
}

function validModule(m: Module): string[] {
  const problems: string[] = []
  if (!m.slug?.trim()) problems.push('empty slug')
  if (!DOMAINS.has(m.domain)) problems.push(`bad domain=${m.domain}`)
  if (!DIFFS.has(m.difficulty)) problems.push(`bad difficulty=${m.difficulty}`)
  if (!m.title?.trim()) problems.push('empty title')
  if (!Array.isArray(m.sections) || m.sections.length === 0) problems.push('no sections')
  if (!Array.isArray(m.checks)) problems.push('no checks array')
  for (const [i, c] of (m.checks ?? []).entries()) {
    if (!c.stem?.trim()) problems.push(`check ${i}: empty stem`)
    if (!c.options || LETTERS.some(l => !c.options?.[l]?.trim())) problems.push(`check ${i}: missing option`)
    if (!LETTERS.includes(c.correct)) problems.push(`check ${i}: bad correct`)
    if (!DIFFS.has(c.difficulty)) problems.push(`check ${i}: bad difficulty`)
  }
  return problems
}

async function main() {
  const raw = JSON.parse(readFileSync(PATH, 'utf8')) as Module[]
  if (!Array.isArray(raw)) throw new Error('Batch file must be a JSON array')
  console.log(`Loaded ${raw.length} modules from ${PATH}.`)

  // existing question hashes (avoid unique-constraint collisions)
  const { data: existing } = await db.from('questions').select('content_hash')
  const taken = new Set((existing ?? []).map(r => r.content_hash as string).filter(Boolean))

  for (const m of raw) {
    const problems = validModule(m)
    if (problems.length) { console.warn(`⚠️  skipping "${m.slug}": ${problems.join('; ')}`); continue }

    // idempotent: clear prior load for this module
    await db.from('questions').delete().like('source_ref', `module:${m.slug}:%`)
    await db.from('learning_modules').delete().eq('slug', m.slug)

    // 1. insert check questions
    const seen = new Set<string>()
    const qRows = m.checks.map((c, i) => {
      let hash: string | null = qHash(c.stem, c.options)
      if (taken.has(hash) || seen.has(hash)) hash = null // skip dedup rather than fail the unique index
      else seen.add(hash)
      return {
        kind: 'study', stem: c.stem, options: c.options, correct: c.correct,
        partial_credit: c.partial_credit ?? null, score_map: null, explanation: c.explanation,
        image: null, category: null, track_domain: null, learning_domain: m.domain,
        concept_id: c.concept_id ?? m.concept_ids[0] ?? null, difficulty: c.difficulty,
        judgment_type: null, error_categories: [], real_world_standard: c.real_world_standard ?? null,
        standard_refs: c.standard_refs ?? [], source: 'generated', source_ref: `module:${m.slug}:${i}`,
        status: 'draft', content_hash: hash,
      }
    })
    let questionIds: string[] = []
    if (qRows.length) {
      const { data: inserted, error: qErr } = await db.from('questions').insert(qRows).select('id, source_ref')
      if (qErr) throw qErr
      // preserve order by source_ref index
      questionIds = (inserted ?? [])
        .sort((a, b) => Number((a.source_ref as string).split(':')[2]) - Number((b.source_ref as string).split(':')[2]))
        .map(r => r.id as string)
    }

    // 2. insert the module row
    const { error: mErr } = await db.from('learning_modules').insert({
      slug: m.slug, domain: m.domain, concept_ids: m.concept_ids ?? [], title: m.title,
      summary: m.summary ?? null, objectives: m.objectives ?? [], sections: m.sections,
      check_question_ids: questionIds, estimated_minutes: m.estimated_minutes ?? null,
      difficulty: m.difficulty, status: 'draft', source: 'generated',
      source_ref: `module:${m.slug}`, content_hash: contentHash(`module::${m.slug}`),
    })
    if (mErr) throw mErr
    console.log(`  ✅ ${m.slug}: module + ${questionIds.length} check question(s) (draft)`)
  }
  console.log('Done. Promote with: node --env-file=.env.local --import tsx scripts/promote-modules.ts all')
}

main().catch(err => { console.error('❌ seed-modules failed:', err.message); process.exit(1) })
