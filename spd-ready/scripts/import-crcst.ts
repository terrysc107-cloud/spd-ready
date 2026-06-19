// Import the SPD Cert Prep (crcst) question banks into spd_ready.questions.
//   CRCST (689): core tech content -> the 7 domains (aligned active, off-mission draft)
//   CER   (276): endoscope reprocessing -> high_level_disinfection (active; fills the thin HLD bank)
//   CHL   (461): leadership/management -> parked as draft (future manager track)
//
// Normalizes both option formats to {A,B,C,D}+correct, maps crcst domains to
// SPD Ready's learning_domain + a legacy track_domain (so active study content
// shows in the quiz UI) + a coarse concept_id, dedupes on content_hash, and
// upserts under source='crcst_import'. Idempotent (deletes prior import first).
//
//   node --env-file=.env.local --import tsx scripts/import-crcst.ts
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'node:crypto'
import { QUESTIONS as CRCST } from '../../../crcst/lib/questions'
import { cerQuestions as CER } from '../../../crcst/lib/questions-cer'
import { chlQuestions as CHL } from '../../../crcst/lib/questions-chl'

const URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !KEY) {
  console.error('❌ Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}
const db = createClient(URL, KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  db: { schema: 'spd_ready' },
})

type Map = { ld: string; td: string | null; cid: string | null; status: 'active' | 'draft' }

// CRCST domain -> {learning_domain, track_domain, concept_id, status}
const CRCST_MAP: Record<string, Map> = {
  'Sterilization':            { ld: 'sterilization', td: 'STERILIZATION', cid: 'concept-steril-steam-cycle', status: 'active' },
  'Equipment':                { ld: 'sterilization', td: 'STERILIZATION', cid: 'concept-steril-steam-cycle', status: 'active' },
  'Decontamination':          { ld: 'decontamination', td: 'DECONTAMINATION', cid: 'concept-decon-manual-cleaning', status: 'active' },
  'Disinfection':             { ld: 'high_level_disinfection', td: null, cid: 'concept-hld-chemical-sterilants', status: 'active' },
  'Endoscope Reprocessing':   { ld: 'high_level_disinfection', td: null, cid: 'concept-hld-chemical-sterilants', status: 'active' },
  'Packaging':                { ld: 'iap', td: 'PREPARATION', cid: 'concept-iap-inspection', status: 'active' },
  'Assembly':                 { ld: 'iap', td: 'PREPARATION', cid: 'concept-iap-inspection', status: 'active' },
  'Instrumentation':          { ld: 'foundational', td: 'INSTRUMENT_ID', cid: 'concept-foundational-instrument-id', status: 'active' },
  'Sterile Storage':          { ld: 'sterile_storage', td: 'STORAGE_DISTRIBUTION', cid: 'concept-storage-event-related', status: 'active' },
  'Inventory & Distribution': { ld: 'sterile_storage', td: 'STORAGE_DISTRIBUTION', cid: 'concept-storage-event-related', status: 'active' },
  'Safety':                   { ld: 'foundational', td: 'COMPLIANCE_SAFETY', cid: 'concept-foundational-osha-bbp', status: 'active' },
  'Infection Prevention':     { ld: 'foundational', td: 'COMPLIANCE_SAFETY', cid: 'concept-foundational-osha-bbp', status: 'active' },
  'Quality & Regulatory':     { ld: 'foundational', td: 'COMPLIANCE_SAFETY', cid: 'concept-foundational-osha-bbp', status: 'active' },
  'SPD Overview':             { ld: 'foundational', td: 'COMPLIANCE_SAFETY', cid: 'concept-foundational-osha-bbp', status: 'active' },
  // off-mission for hands-on tech competency -> draft for a human cull
  'Anatomy':                  { ld: 'foundational', td: 'INSTRUMENT_ID', cid: 'concept-foundational-instrument-id', status: 'draft' },
  'Microbiology':             { ld: 'foundational', td: 'COMPLIANCE_SAFETY', cid: 'concept-foundational-osha-bbp', status: 'draft' },
  'Medical Terminology':      { ld: 'foundational', td: 'INSTRUMENT_ID', cid: 'concept-foundational-instrument-id', status: 'draft' },
  'Professional Development': { ld: 'foundational', td: 'COMPLIANCE_SAFETY', cid: null, status: 'draft' },
  'Information Technology':   { ld: 'foundational', td: 'COMPLIANCE_SAFETY', cid: null, status: 'draft' },
}
const CRCST_FALLBACK: Map = { ld: 'foundational', td: 'COMPLIANCE_SAFETY', cid: null, status: 'draft' }

// CER is all endoscope reprocessing -> HLD (active). track_domain null = HLD pseudo-domain.
const CER_MAP: Map = { ld: 'high_level_disinfection', td: null, cid: 'concept-hld-chemical-sterilants', status: 'active' }

// CHL is manager/leadership content -> parked as draft (future manager track).
const CHL_LD: Record<string, string> = {
  'Sterilization': 'sterilization', 'Decontamination': 'decontamination',
  'Instrument Management': 'iap', 'Sterile Storage': 'sterile_storage',
}
function chlMap(domain: string): Map {
  return { ld: CHL_LD[domain] ?? 'foundational', td: null, cid: null, status: 'draft' }
}

const DIFF: Record<string, string> = { easy: 'foundational', medium: 'intermediate', hard: 'advanced' }
const LETTERS = ['A', 'B', 'C', 'D']

function contentHash(stem: string, options: Record<string, string>): string {
  const norm = stem.trim().toLowerCase().replace(/\s+/g, ' ')
  const opts = Object.keys(options).sort().map(k => String(options[k]).trim().toLowerCase()).join('|')
  return createHash('sha256').update(`study::${norm}::${opts}`).digest('hex')
}

type Row = Record<string, unknown>
function makeRow(p: {
  stem: string; options: Record<string, string>; correct: string; explanation: string
  difficulty: string; m: Map; sourceRef: string
}): Row {
  return {
    kind: 'study', stem: p.stem, options: p.options, correct: p.correct, partial_credit: null,
    score_map: null, explanation: p.explanation, image: null, category: null,
    track_domain: p.m.td, learning_domain: p.m.ld, concept_id: p.m.cid,
    difficulty: DIFF[p.difficulty] ?? 'intermediate', judgment_type: null, error_categories: [],
    real_world_standard: null, standard_refs: [], source: 'crcst_import', source_ref: p.sourceRef,
    status: p.m.status, content_hash: contentHash(p.stem, p.options),
  }
}

const rows: Row[] = []

// CRCST: options string[] + correct_answer index
for (const q of CRCST as Array<{ id: string; question: string; options: string[]; correct_answer: number; domain: string; difficulty: string; explanation: string }>) {
  const options: Record<string, string> = {}
  q.options.forEach((o, i) => { if (i < 4) options[LETTERS[i]] = o })
  rows.push(makeRow({
    stem: q.question, options, correct: LETTERS[q.correct_answer] ?? 'A',
    explanation: q.explanation, difficulty: q.difficulty,
    m: CRCST_MAP[q.domain] ?? CRCST_FALLBACK, sourceRef: `crcst:${q.id}`,
  }))
}

// CER + CHL: options {a,b,c?,d?} + correct letter
function fromLettered(q: { id: string; question: string; options: Record<string, string>; correct: string; explanation: string; difficulty: string; domain: string }, m: Map, prefix: string): Row {
  const options: Record<string, string> = {}
  for (const k of ['a', 'b', 'c', 'd']) if (q.options[k] != null) options[k.toUpperCase()] = q.options[k]
  return makeRow({
    stem: q.question, options, correct: q.correct.toUpperCase(),
    explanation: q.explanation, difficulty: q.difficulty, m, sourceRef: `${prefix}:${q.id}`,
  })
}
for (const q of CER as Array<{ id: string; question: string; options: Record<string, string>; correct: string; explanation: string; difficulty: string; domain: string }>) {
  rows.push(fromLettered(q, CER_MAP, 'cer'))
}
for (const q of CHL as Array<{ id: string; question: string; options: Record<string, string>; correct: string; explanation: string; difficulty: string; domain: string }>) {
  rows.push(fromLettered(q, chlMap(q.domain), 'chl'))
}

async function main() {
  console.log(`Transformed ${rows.length} crcst questions (CRCST ${CRCST.length} + CER ${CER.length} + CHL ${CHL.length}).`)

  // idempotent: clear prior import
  const { error: delErr } = await db.from('questions').delete().eq('source', 'crcst_import')
  if (delErr) throw delErr

  // dedupe within import + against everything already in the table (seed etc.)
  const { data: existing, error: exErr } = await db.from('questions').select('content_hash')
  if (exErr) throw exErr
  const taken = new Set((existing ?? []).map(r => r.content_hash as string))
  const seen = new Set<string>()
  const fresh = rows.filter(r => {
    const h = r.content_hash as string
    if (taken.has(h) || seen.has(h)) return false
    seen.add(h); return true
  })
  console.log(`${fresh.length} fresh after dedupe (${rows.length - fresh.length} dropped as dup/overlap).`)

  // insert in chunks
  let inserted = 0
  for (let i = 0; i < fresh.length; i += 500) {
    const chunk = fresh.slice(i, i + 500)
    const { error, count } = await db.from('questions').insert(chunk, { count: 'exact' })
    if (error) throw error
    inserted += count ?? chunk.length
  }
  const active = fresh.filter(r => r.status === 'active').length
  const draft = fresh.filter(r => r.status === 'draft').length
  console.log(`✅ Imported ${inserted}: ${active} active + ${draft} draft.`)
}

main().catch(err => { console.error('❌ Import failed:', err.message); process.exit(1) })
