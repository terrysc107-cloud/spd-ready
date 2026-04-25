import type { LearningDomain, ConceptId, ErrorCategory } from './types'

export type TrackDomain =
  | 'INSTRUMENT_ID'
  | 'DECONTAMINATION'
  | 'PREPARATION'
  | 'STERILIZATION'
  | 'STERILITY_ASSURANCE'
  | 'STORAGE_DISTRIBUTION'
  | 'COMPLIANCE_SAFETY'
  | 'SPD_JUDGMENT'

export type TrackQuestion = {
  id: string
  domain: TrackDomain
  difficulty: 'foundational' | 'intermediate' | 'advanced'
  question: string
  options: { A: string; B: string; C: string; D: string }
  correct: 'A' | 'B' | 'C' | 'D'
  partial_credit: 'A' | 'B' | 'C' | 'D' | null
  explanation: string
  image?: string
  judgment_type?: string
  real_world_standard?: string
  // Phase 6 additions (per D-04 — keep legacy domain alongside)
  legacy_domain?: TrackDomain  // populated for old questions
  learning_domain?: LearningDomain  // new framework domain
  concept_id?: ConceptId
  error_categories?: ErrorCategory[]
}

export const DOMAIN_META: Record<TrackDomain, { label: string; description: string; icon: string; topics: string }> = {
  INSTRUMENT_ID: {
    label: 'Instrument Identification',
    description: 'Names, uses, inspection, and common defects',
    icon: '🔧',
    topics: 'Scissors, hemostats, needle holders, retractors, box locks, ratchets, tungsten carbide',
  },
  DECONTAMINATION: {
    label: 'Decontamination',
    description: 'Safe handling and cleaning of contaminated instruments',
    icon: '🧼',
    topics: 'PPE, manual cleaning, enzymatic soaking, ultrasonic cleaners, dirty-to-clean workflow',
  },
  PREPARATION: {
    label: 'Preparation & Packaging',
    description: 'Inspection, assembly, wrapping, and tray accuracy',
    icon: '📦',
    topics: 'Inspection, count sheets, peel pouches, sequential wrap, tip protectors, IFU',
  },
  STERILIZATION: {
    label: 'Sterilization',
    description: 'Methods, cycle selection, and required parameters',
    icon: '⚗️',
    topics: 'Steam, gravity vs pre-vac, exposure time, load configuration, drying, cycle records',
  },
  STERILITY_ASSURANCE: {
    label: 'Sterility Assurance',
    description: 'Monitoring, indicators, release criteria, and failure response',
    icon: '✅',
    topics: 'Biological indicators, chemical indicators, Bowie-Dick, wet packs, failed BI protocol',
  },
  STORAGE_DISTRIBUTION: {
    label: 'Storage & Distribution',
    description: 'Maintaining sterility from SPD to point of use',
    icon: '🏪',
    topics: 'Event-related sterility, package inspection, transport, stock rotation, moisture',
  },
  COMPLIANCE_SAFETY: {
    label: 'Compliance & Safety',
    description: 'Safety standards, infection prevention, regulatory readiness',
    icon: '🛡️',
    topics: 'OSHA bloodborne pathogens, AAMI ST79, sharps safety, competency, hand hygiene',
  },
  SPD_JUDGMENT: {
    label: 'SPD Judgment & Professional Standards',
    description: 'Situational questions that test how you think under pressure',
    icon: '🧠',
    topics: 'Accountability, escalation, safety ownership, teamwork, professionalism, moral standards',
  },
}

export const TRACK_QUESTIONS: TrackQuestion[] = [
  // ─── INSTRUMENT_ID (10 questions) ───────────────────────────────────────────
  {
    id: 'tq-instrument-001',
    domain: 'INSTRUMENT_ID',
    difficulty: 'foundational',
    question: 'What is the primary purpose of a hemostat in a surgical tray?',
    options: {
      A: 'To cut dense tissue',
      B: 'To clamp blood vessels or small tissue structures',
      C: 'To retract deep tissue',
      D: 'To measure wound depth',
    },
    correct: 'B',
    partial_credit: 'C',
    explanation:
      'A hemostat is designed to clamp vessels or small tissue structures and control bleeding during a procedure. Retractors hold tissue back, but they do not clamp vessels. Knowing the difference helps prevent incorrect tray assembly and delays in the OR.',
    image: '/instruments/kelly-hemostat.svg',
  },
  {
    id: 'tq-instrument-002',
    domain: 'INSTRUMENT_ID',
    difficulty: 'foundational',
    question:
      'Which part of a ring-handled instrument should be inspected closely for cracks, debris, and proper movement?',
    options: {
      A: 'The shank',
      B: 'The box lock',
      C: 'The finger ring',
      D: 'The instrument tip only',
    },
    correct: 'B',
    partial_credit: 'D',
    explanation:
      'The box lock is a common area where bioburden can hide and where cracks or stiffness may affect function. The tips should also be inspected, but only checking the tips can miss a major failure point. A complete inspection includes the box lock, jaws, ratchets, and overall movement.',
    image: '/instruments/box-lock-detail.svg',
  },
  {
    id: 'tq-instrument-003',
    domain: 'INSTRUMENT_ID',
    difficulty: 'foundational',
    question: 'What does gold-colored finger ring plating usually indicate on scissors or needle holders?',
    options: {
      A: 'The instrument is disposable',
      B: 'The instrument has tungsten carbide inserts',
      C: 'The instrument is only used for laparoscopic surgery',
      D: 'The instrument has failed inspection',
    },
    correct: 'B',
    partial_credit: null,
    explanation:
      'Gold handles commonly indicate tungsten carbide inserts, which provide a stronger gripping or cutting surface. These instruments still require inspection for wear, cracks, and jaw alignment. Color alone does not prove the instrument is functional.',
    image: '/instruments/needle-holder.svg',
  },
  {
    id: 'tq-instrument-004',
    domain: 'INSTRUMENT_ID',
    difficulty: 'intermediate',
    question:
      'During inspection, a needle holder closes unevenly and the jaws do not meet properly. What should the technician do?',
    options: {
      A: 'Place it in the tray because it still locks',
      B: 'Send it for repair or remove it from service',
      C: 'Wrap it separately to protect the jaws',
      D: 'Clean it again and return it to the tray',
    },
    correct: 'B',
    partial_credit: 'D',
    explanation:
      'Poor jaw alignment can prevent the instrument from holding a needle safely during surgery. Cleaning again may be needed if soil is present, but it does not fix a mechanical defect. The correct action is to remove it from service or send it for repair according to department process.',
    image: '/instruments/needle-holder.svg',
  },
  {
    id: 'tq-instrument-005',
    domain: 'INSTRUMENT_ID',
    difficulty: 'foundational',
    question: 'What is the main use of a retractor?',
    options: {
      A: 'To hold tissue or organs away from the surgical site',
      B: 'To clamp bleeding vessels',
      C: 'To cut suture material',
      D: 'To hold a needle during suturing',
    },
    correct: 'A',
    partial_credit: null,
    explanation:
      'Retractors are used to hold tissue, organs, or wound edges out of the way to improve exposure. Hemostats clamp, scissors cut, and needle holders hold needles. Correct identification prevents substitutions that could affect the procedure.',
    image: '/instruments/army-navy-retractor.svg',
  },
  {
    id: 'tq-instrument-006',
    domain: 'INSTRUMENT_ID',
    difficulty: 'foundational',
    question: 'What should be checked when inspecting surgical scissors?',
    options: {
      A: 'Only the outside surface',
      B: 'Sharpness, alignment, loose screws, and smooth cutting action',
      C: 'Whether the handles are shiny',
      D: 'Whether the scissors are placed on top of the tray',
    },
    correct: 'B',
    partial_credit: 'A',
    explanation:
      'Scissors must be checked for sharpness, proper alignment, loose parts, and smooth function. A clean outside surface matters, but it is not enough to confirm the scissors will work properly. Poor scissors can cause OR delays or tissue damage.',
    image: '/instruments/mayo-scissors.svg',
  },
  {
    id: 'tq-instrument-007',
    domain: 'INSTRUMENT_ID',
    difficulty: 'intermediate',
    question: 'A laparoscopic grasper should be inspected for which issue before assembly?',
    options: {
      A: 'Whether the instrument is heavier than other instruments',
      B: 'Jaw movement, insulation damage, and clean internal channels when applicable',
      C: 'Whether it fits into a peel pouch',
      D: 'Whether it has a bright finish',
    },
    correct: 'B',
    partial_credit: 'C',
    explanation:
      'Laparoscopic instruments require careful inspection for jaw function, insulation damage, and cleanliness of channels or hard-to-clean areas. Packaging fit matters later, but it does not replace functional and safety inspection. Damaged insulation can create patient safety risks during use.',
    image: '/instruments/laparoscopic-grasper.svg',
  },
  {
    id: 'tq-instrument-008',
    domain: 'INSTRUMENT_ID',
    difficulty: 'foundational',
    question: 'What is the purpose of ratchets on a clamp or needle holder?',
    options: {
      A: 'To help the instrument stay closed at different tension levels',
      B: 'To make the instrument easier to sterilize',
      C: 'To identify the instrument manufacturer',
      D: 'To prevent the instrument from rusting',
    },
    correct: 'A',
    partial_credit: null,
    explanation:
      'Ratchets allow the instrument to lock closed at different levels of pressure. They should be tested to make sure they hold securely and release properly. A weak or broken ratchet can make the instrument unsafe or unusable during a case.',
    image: '/instruments/ratchet-mechanism.svg',
  },
  {
    id: 'tq-instrument-009',
    domain: 'INSTRUMENT_ID',
    difficulty: 'intermediate',
    question: 'A technician finds an orthopedic instrument with a dull cutting edge. What is the best action?',
    options: {
      A: 'Place it in the tray because orthopedic instruments are strong',
      B: 'Send it for sharpening or repair according to policy',
      C: 'Wipe it with alcohol and return it to the tray',
      D: 'Put it at the bottom of the tray so it is protected',
    },
    correct: 'B',
    partial_credit: 'D',
    explanation:
      'A dull cutting edge can affect surgical performance and should be removed from service for repair or sharpening. Protecting the instrument in the tray does not correct the defect. Inspection is meant to catch these problems before the tray reaches the OR.',
    image: '/instruments/orthopedic-rongeur.svg',
  },
  {
    id: 'tq-instrument-010',
    domain: 'INSTRUMENT_ID',
    difficulty: 'foundational',
    question: 'Why is instrument identification important during tray assembly?',
    options: {
      A: 'It helps the technician finish the tray faster even if substitutes are used',
      B: 'It ensures the correct instruments are available for the intended procedure',
      C: 'It eliminates the need for count sheets',
      D: 'It allows damaged instruments to stay in circulation',
    },
    correct: 'B',
    partial_credit: 'A',
    explanation:
      'Correct instrument identification ensures the tray supports the surgical procedure and matches the count sheet or preference needs. Speed matters, but accuracy matters more. Wrong or missing instruments can delay care and create frustration in the OR.',
  },

  // ─── DECONTAMINATION (10 questions) ─────────────────────────────────────────
  {
    id: 'tq-decontamination-001',
    domain: 'DECONTAMINATION',
    difficulty: 'foundational',
    question: 'What is the main purpose of point-of-use treatment before instruments are sent to decontamination?',
    options: {
      A: 'To sterilize the instruments before transport',
      B: 'To keep soil from drying on the instruments',
      C: 'To replace manual cleaning in decontamination',
      D: 'To identify which instruments belong in the tray',
    },
    correct: 'B',
    partial_credit: 'D',
    explanation:
      'Point-of-use treatment helps prevent blood and bioburden from drying on instruments before cleaning. It does not sterilize instruments or replace cleaning in decontamination. Identifying instruments is helpful, but it is not the main purpose.',
  },
  {
    id: 'tq-decontamination-002',
    domain: 'DECONTAMINATION',
    difficulty: 'foundational',
    question: 'Which PPE is typically required when working in decontamination?',
    options: {
      A: 'Gloves only',
      B: 'Surgical mask only',
      C: 'Fluid-resistant gown, gloves, face protection, and appropriate shoe/head covering',
      D: 'Lab coat and clean gloves',
    },
    correct: 'C',
    partial_credit: 'A',
    explanation:
      'Decontamination exposes staff to blood, body fluids, splashes, and contaminated sharps, so full protective PPE is required. Gloves alone do not protect the face, arms, or clothing from splashes. PPE must match the risk of the work being performed.',
  },
  {
    id: 'tq-decontamination-003',
    domain: 'DECONTAMINATION',
    difficulty: 'foundational',
    question: 'What workflow principle must be followed in decontamination?',
    options: {
      A: 'Clean instruments first, then dirty instruments',
      B: 'Move from dirty to clean without crossing contaminated items into clean areas',
      C: 'Move clean trays back into decontamination for faster assembly',
      D: 'Keep all doors open to improve traffic flow',
    },
    correct: 'B',
    partial_credit: 'A',
    explanation:
      'The dirty-to-clean principle prevents cross-contamination and protects processed items. Clean items should not be moved back into contaminated spaces. Traffic flow and physical separation are core parts of safe SPD design.',
  },
  {
    id: 'tq-decontamination-004',
    domain: 'DECONTAMINATION',
    difficulty: 'intermediate',
    question: 'Why should hinged instruments be opened during manual cleaning and washer-disinfector processing?',
    options: {
      A: 'To make the tray look organized',
      B: 'To expose surfaces that soil can hide on',
      C: 'To reduce the number of instruments in the tray',
      D: 'To make the instruments dry faster only',
    },
    correct: 'B',
    partial_credit: 'D',
    explanation:
      'Hinged instruments must be opened so cleaning solution, brushing, and mechanical action can reach hidden surfaces. Drying may improve when instruments are opened, but the key reason is cleaning access. Closed instruments can trap soil in box locks and joints.',
  },
  {
    id: 'tq-decontamination-005',
    domain: 'DECONTAMINATION',
    difficulty: 'foundational',
    question: 'What should be done with instruments that have visible soil after cleaning?',
    options: {
      A: 'Send them to prep and pack for inspection',
      B: 'Reclean them before they move forward',
      C: 'Sterilize them longer',
      D: 'Place a chemical indicator in the tray',
    },
    correct: 'B',
    partial_credit: 'C',
    explanation:
      'Visible soil means the cleaning process was not successful, so the item must be recleaned. Sterilization does not make a dirty instrument acceptable. Organic material can block sterilant contact and create patient safety risks.',
  },
  {
    id: 'tq-decontamination-006',
    domain: 'DECONTAMINATION',
    difficulty: 'intermediate',
    question: 'What is the purpose of an ultrasonic cleaner?',
    options: {
      A: 'To sterilize instruments using sound waves',
      B: 'To remove soil from difficult-to-clean areas through cavitation',
      C: 'To dry instruments before packaging',
      D: 'To replace all manual cleaning steps',
    },
    correct: 'B',
    partial_credit: 'D',
    explanation:
      'Ultrasonic cleaners use cavitation to loosen soil from joints, serrations, and hard-to-reach areas. They do not sterilize instruments and do not automatically replace required manual cleaning. Items must be compatible and processed according to the IFU.',
  },
  {
    id: 'tq-decontamination-007',
    domain: 'DECONTAMINATION',
    difficulty: 'foundational',
    question: 'Why should enzymatic solutions be mixed according to the manufacturer\'s instructions?',
    options: {
      A: 'Too much or too little chemical can reduce cleaning effectiveness',
      B: 'Stronger solution always cleans better',
      C: 'The solution is only used for odor control',
      D: 'Mixing instructions only apply to sterilization chemicals',
    },
    correct: 'A',
    partial_credit: 'B',
    explanation:
      'Enzymatic solutions must be diluted and used according to the manufacturer\'s instructions to work correctly. Stronger is not automatically better and can damage instruments or create residue. Proper concentration, temperature, and contact time matter.',
  },
  {
    id: 'tq-decontamination-008',
    domain: 'DECONTAMINATION',
    difficulty: 'intermediate',
    question: 'A cannulated instrument arrives in decontamination. What is a key cleaning step?',
    options: {
      A: 'Wipe only the outside surface',
      B: 'Brush and flush the lumen according to the instrument IFU',
      C: 'Place it directly in the sterilizer',
      D: 'Put it in a closed peel pouch',
    },
    correct: 'B',
    partial_credit: 'A',
    explanation:
      'Lumened instruments require brushing and flushing so internal surfaces are cleaned. Wiping only the outside misses the area most likely to retain soil. The instrument IFU should guide brush size, flushing method, and cleaning steps.',
  },
  {
    id: 'tq-decontamination-009',
    domain: 'DECONTAMINATION',
    difficulty: 'foundational',
    question: 'What is the correct response if a contaminated sharp is found loose in a tray?',
    options: {
      A: 'Reach in quickly and remove it by hand',
      B: 'Use safe handling technique and report according to department process',
      C: 'Ignore it because sharps are expected in trays',
      D: 'Send the tray to prep and pack',
    },
    correct: 'B',
    partial_credit: 'C',
    explanation:
      'Loose sharps create injury and exposure risk and must be handled safely using department-approved tools and process. They should also be reported so the source issue can be addressed. Treating loose sharps as normal allows unsafe behavior to continue.',
  },
  {
    id: 'tq-decontamination-010',
    domain: 'DECONTAMINATION',
    difficulty: 'intermediate',
    question: 'Why is cleaning verification important for complex instruments?',
    options: {
      A: 'It proves the instrument is sterile',
      B: 'It helps detect residual soil that may not be visible',
      C: 'It replaces biological monitoring',
      D: 'It removes the need to follow the IFU',
    },
    correct: 'B',
    partial_credit: 'A',
    explanation:
      'Cleaning verification helps identify residual soil or protein that may not be seen during visual inspection. It does not prove sterility and does not replace sterilization monitoring. It gives the department a stronger process control for high-risk items.',
  },

  // ─── PREPARATION (10 questions) ─────────────────────────────────────────────
  {
    id: 'tq-preparation-001',
    domain: 'PREPARATION',
    difficulty: 'foundational',
    question: 'What should happen before an instrument is placed into a tray during assembly?',
    options: {
      A: 'It should be inspected for cleanliness, function, and damage',
      B: 'It should be wrapped immediately',
      C: 'It should be sterilized by itself first',
      D: 'It should be counted only after sterilization',
    },
    correct: 'A',
    partial_credit: null,
    explanation:
      'Instruments must be inspected before assembly to confirm they are clean, functional, and safe to use. Packaging a dirty or broken instrument only moves the problem downstream. Prep and pack is a major quality checkpoint in SPD.',
  },
  {
    id: 'tq-preparation-002',
    domain: 'PREPARATION',
    difficulty: 'foundational',
    question: 'What is the purpose of a count sheet during tray assembly?',
    options: {
      A: 'To show the tray weight only',
      B: 'To guide accurate instrument assembly and verify tray contents',
      C: 'To replace instrument inspection',
      D: 'To document sterilizer temperature',
    },
    correct: 'B',
    partial_credit: 'C',
    explanation:
      'A count sheet helps the technician assemble the tray accurately and confirm required items are present. It does not replace inspection of each instrument. A correct count with poor-quality instruments is still a failed tray.',
  },
  {
    id: 'tq-preparation-003',
    domain: 'PREPARATION',
    difficulty: 'intermediate',
    question:
      'A peel pouch is too small and the instrument tip presses tightly against the seal. What should the technician do?',
    options: {
      A: 'Use the pouch anyway if the seal closes',
      B: 'Select a larger pouch or different packaging method',
      C: 'Add extra tape over the seal',
      D: 'Double pouch it tightly',
    },
    correct: 'B',
    partial_credit: 'D',
    explanation:
      'Packaging must allow proper sterilant contact, drying, and seal integrity. A pouch that is too tight can tear, stress the seal, or compromise sterility. Double pouching does not fix poor fit and can create more problems if done incorrectly.',
  },
  {
    id: 'tq-preparation-004',
    domain: 'PREPARATION',
    difficulty: 'foundational',
    question: 'Why are tip protectors used on certain instruments?',
    options: {
      A: 'To keep instruments from being cleaned',
      B: 'To protect delicate tips and prevent package damage',
      C: 'To replace wrapping',
      D: 'To identify contaminated instruments',
    },
    correct: 'B',
    partial_credit: null,
    explanation:
      'Tip protectors help prevent delicate tips from being damaged and reduce the chance of puncturing the package. They must be compatible with sterilization and allow sterilant contact. They do not replace proper packaging or cleaning.',
  },
  {
    id: 'tq-preparation-005',
    domain: 'PREPARATION',
    difficulty: 'intermediate',
    question: 'During assembly, a technician finds moisture inside a container from the previous process. What should they do?',
    options: {
      A: 'Ignore it because sterilization will dry it',
      B: 'Stop and follow the department process for wet or compromised items',
      C: 'Add an extra chemical indicator',
      D: 'Place heavier instruments on top',
    },
    correct: 'B',
    partial_credit: 'A',
    explanation:
      'Moisture can compromise sterility and may indicate a drying, loading, container, or process issue. Adding indicators or changing instrument placement does not correct the problem. Wet or compromised items need to be addressed before release.',
  },
  {
    id: 'tq-preparation-006',
    domain: 'PREPARATION',
    difficulty: 'foundational',
    question: 'What is a key requirement when using sequential wrapping?',
    options: {
      A: 'Use two separate wraps applied one after the other',
      B: 'Use one wrap folded twice in the same direction',
      C: 'Use no chemical indicator',
      D: 'Place instruments directly on the wrapper without a tray',
    },
    correct: 'A',
    partial_credit: 'B',
    explanation:
      'Sequential wrapping uses two separate wraps applied in sequence. This supports package integrity and aseptic presentation when done correctly. Using one wrap as if it were two does not meet the same packaging expectation.',
  },
  {
    id: 'tq-preparation-007',
    domain: 'PREPARATION',
    difficulty: 'foundational',
    question: 'What should a technician do if the count sheet and tray contents do not match?',
    options: {
      A: 'Guess the missing item based on memory',
      B: 'Resolve the discrepancy before the tray is packaged',
      C: 'Package the tray and let the OR decide',
      D: 'Remove the count sheet',
    },
    correct: 'B',
    partial_credit: 'A',
    explanation:
      'Count sheet discrepancies must be resolved before packaging so the tray is accurate and reliable. Guessing from memory creates risk, especially with complex or specialty trays. The issue should be escalated if the technician cannot resolve it.',
  },
  {
    id: 'tq-preparation-008',
    domain: 'PREPARATION',
    difficulty: 'intermediate',
    question: 'Why should heavy instruments usually be placed on the bottom of a tray?',
    options: {
      A: 'To protect lighter and delicate instruments from damage',
      B: 'To make the tray harder to lift',
      C: 'To improve the color of the wrapper',
      D: 'To hide instruments that are missing',
    },
    correct: 'A',
    partial_credit: null,
    explanation:
      'Heavy instruments can damage delicate instruments if placed on top of them. Proper tray organization protects instruments, supports sterilant contact, and improves presentation in the OR. Tray layout should be intentional, not random.',
  },
  {
    id: 'tq-preparation-009',
    domain: 'PREPARATION',
    difficulty: 'foundational',
    question: 'What should be included inside a wrapped instrument tray before sterilization?',
    options: {
      A: 'An internal chemical indicator',
      B: 'A used biological indicator',
      C: 'A wet towel',
      D: 'A patient label',
    },
    correct: 'A',
    partial_credit: null,
    explanation:
      'An internal chemical indicator is placed inside the package to show that sterilization conditions reached the inside of the tray. It does not prove sterility by itself, but it is an important part of load and package monitoring. Used biological indicators and wet materials do not belong inside a tray.',
  },
  {
    id: 'tq-preparation-010',
    domain: 'PREPARATION',
    difficulty: 'intermediate',
    question: 'What is the best reason to follow the instrument manufacturer\'s IFU during assembly?',
    options: {
      A: 'It gives required instructions for cleaning, inspection, packaging, and sterilization compatibility',
      B: 'It only tells the purchase price',
      C: 'It replaces department policy',
      D: 'It is optional when staff are experienced',
    },
    correct: 'A',
    partial_credit: 'C',
    explanation:
      'The IFU tells staff how the device must be processed, including cleaning, inspection, packaging, and sterilization requirements. Department policy should align with the IFU, not replace it. Experience does not override manufacturer instructions.',
  },

  // ─── STERILIZATION (10 questions) ───────────────────────────────────────────
  {
    id: 'tq-sterilization-001',
    domain: 'STERILIZATION',
    difficulty: 'foundational',
    question: 'What are the basic conditions needed for steam sterilization to be effective?',
    options: {
      A: 'Steam contact, correct temperature, pressure, and exposure time',
      B: 'Bright lighting and dry storage',
      C: 'Detergent residue and high humidity',
      D: 'Cold water and short cycle time',
    },
    correct: 'A',
    partial_credit: null,
    explanation:
      'Steam sterilization depends on steam contact and the required parameters being met for the correct exposure time. If air removal, temperature, pressure, or time are not correct, the cycle may not be effective. Sterilization is a controlled process, not just heating items.',
  },
  {
    id: 'tq-sterilization-002',
    domain: 'STERILIZATION',
    difficulty: 'foundational',
    question: 'What is the main difference between gravity displacement and pre-vacuum steam cycles?',
    options: {
      A: 'Pre-vacuum cycles actively remove air before steam exposure',
      B: 'Gravity cycles use no steam',
      C: 'Pre-vacuum cycles are only for storage carts',
      D: 'Gravity cycles require no exposure time',
    },
    correct: 'A',
    partial_credit: null,
    explanation:
      'Pre-vacuum cycles use mechanical air removal to help steam penetrate the load. Gravity displacement relies on steam pushing air out of the chamber. Choosing the wrong cycle for the device or load can affect sterilization effectiveness.',
  },
  {
    id: 'tq-sterilization-003',
    domain: 'STERILIZATION',
    difficulty: 'intermediate',
    question: 'Why is load configuration important in the sterilizer?',
    options: {
      A: 'It affects air removal, sterilant contact, and drying',
      B: 'It only affects how fast staff can unload',
      C: 'It replaces the need for indicators',
      D: 'It allows trays to be stacked tightly',
    },
    correct: 'A',
    partial_credit: 'B',
    explanation:
      'Load configuration affects steam circulation, air removal, sterilant contact, and drying. Overloading or tight stacking can cause wet packs or failed sterilization conditions. Fast unloading does not matter if the load is not processed correctly.',
  },
  {
    id: 'tq-sterilization-004',
    domain: 'STERILIZATION',
    difficulty: 'foundational',
    question: 'What should a technician verify before selecting a sterilization cycle?',
    options: {
      A: 'The device IFU and department policy',
      B: 'The color of the tray',
      C: 'The number of staff working',
      D: 'The room temperature only',
    },
    correct: 'A',
    partial_credit: null,
    explanation:
      'Sterilization cycle selection must match the device IFU and department policy. Different items may require specific cycle types, temperatures, exposure times, or drying times. Guessing can lead to a cycle that is not validated for the device.',
  },
  {
    id: 'tq-sterilization-005',
    domain: 'STERILIZATION',
    difficulty: 'intermediate',
    question: 'What is a risk of overloading a steam sterilizer?',
    options: {
      A: 'Poor sterilant contact and drying problems',
      B: 'Faster sterilization',
      C: 'Automatic load release',
      D: 'Elimination of wet packs',
    },
    correct: 'A',
    partial_credit: 'D',
    explanation:
      'Overloading can restrict steam movement, interfere with air removal, and create drying problems. This increases the risk of wet packs and compromised loads. A full chamber is not the same as a correctly loaded chamber.',
  },
  {
    id: 'tq-sterilization-006',
    domain: 'STERILIZATION',
    difficulty: 'foundational',
    question: 'What does exposure time mean in a sterilization cycle?',
    options: {
      A: 'The time items are exposed to the required sterilization conditions',
      B: 'The total time the load sits in storage',
      C: 'The time it takes to wrap a tray',
      D: 'The time items spend in decontamination',
    },
    correct: 'A',
    partial_credit: null,
    explanation:
      'Exposure time is the period when the load is held at the required sterilization conditions. It is not the same as total cycle time, which may include conditioning and drying. The correct exposure time must be met for the selected cycle.',
  },
  {
    id: 'tq-sterilization-007',
    domain: 'STERILIZATION',
    difficulty: 'intermediate',
    question: 'Which item is generally sensitive to moisture and may require low-temperature sterilization instead of steam?',
    options: {
      A: 'Some heat- or moisture-sensitive flexible endoscopes or devices',
      B: 'Stainless steel forceps',
      C: 'Basic towel clips',
      D: 'Mayo scissors',
    },
    correct: 'A',
    partial_credit: 'B',
    explanation:
      'Some devices cannot tolerate steam because of heat, moisture, or material limitations and may require low-temperature sterilization if allowed by the IFU. Basic stainless steel instruments are commonly steam sterilized when validated. The IFU determines the correct method.',
  },
  {
    id: 'tq-sterilization-008',
    domain: 'STERILIZATION',
    difficulty: 'foundational',
    question: 'What must be checked before releasing a sterilized load?',
    options: {
      A: 'The physical cycle printout or record, indicators, and load documentation',
      B: 'Only the outside tape color',
      C: 'Only the time the load finished',
      D: 'Whether the tray feels warm',
    },
    correct: 'A',
    partial_credit: 'B',
    explanation:
      'Load release requires checking the cycle record, required indicators, and documentation according to policy. External tape only shows the package was exposed to a process; it does not prove all parameters were met. Load release is a decision based on multiple controls.',
  },
  {
    id: 'tq-sterilization-009',
    domain: 'STERILIZATION',
    difficulty: 'intermediate',
    question: 'Why should sterilized items be allowed to cool before handling?',
    options: {
      A: 'Handling hot packages can cause moisture wicking and compromise package integrity',
      B: 'Hot packages are always sterile regardless of handling',
      C: 'Cooling replaces drying time',
      D: 'Warm trays do not need inspection',
    },
    correct: 'A',
    partial_credit: 'C',
    explanation:
      'Handling hot packages too soon can cause condensation or moisture wicking, which may compromise sterility. Cooling does not replace the drying phase of the cycle. Staff should follow department policy for cool-down and handling.',
  },
  {
    id: 'tq-sterilization-010',
    domain: 'STERILIZATION',
    difficulty: 'foundational',
    question: 'What is the role of drying time in a steam sterilization cycle?',
    options: {
      A: 'To remove moisture from packages so sterility can be maintained',
      B: 'To increase the number of instruments in the tray',
      C: 'To clean instruments after sterilization',
      D: 'To replace biological monitoring',
    },
    correct: 'A',
    partial_credit: null,
    explanation:
      'Drying time helps remove moisture so packages can be handled and stored without compromising sterility. Wet packages may allow microorganisms to travel through packaging. Drying is part of the validated cycle and should not be shortened without approval.',
  },

  // ─── STERILITY_ASSURANCE (10 questions) ─────────────────────────────────────
  {
    id: 'tq-sterility_assurance-001',
    domain: 'STERILITY_ASSURANCE',
    difficulty: 'foundational',
    question: 'What does a biological indicator test?',
    options: {
      A: 'Whether microorganisms were killed under sterilization conditions',
      B: 'Whether the wrapper color changed',
      C: 'Whether the tray was assembled quickly',
      D: 'Whether the package is easy to open',
    },
    correct: 'A',
    partial_credit: 'B',
    explanation:
      'A biological indicator uses resistant microorganisms to challenge the sterilization process. It provides direct evidence about the process\'s ability to kill microbial spores under the conditions tested. External color change alone is not enough to prove sterilization effectiveness.',
  },
  {
    id: 'tq-sterility_assurance-002',
    domain: 'STERILITY_ASSURANCE',
    difficulty: 'foundational',
    question: 'What does a Class 1 chemical indicator usually show?',
    options: {
      A: 'The item was exposed to a sterilization process',
      B: 'The item is sterile',
      C: 'The BI passed',
      D: 'The tray was cleaned correctly',
    },
    correct: 'A',
    partial_credit: 'B',
    explanation:
      'A Class 1 indicator, such as external indicator tape, shows exposure to a process. It does not prove sterility or confirm that all critical parameters were met. It helps distinguish processed from unprocessed packages.',
  },
  {
    id: 'tq-sterility_assurance-003',
    domain: 'STERILITY_ASSURANCE',
    difficulty: 'intermediate',
    question: 'What is the purpose of a Bowie-Dick test?',
    options: {
      A: 'To detect air removal and steam penetration problems in pre-vacuum sterilizers',
      B: 'To test peel pouch seal strength',
      C: 'To confirm every instrument is sharp',
      D: 'To replace daily biological monitoring',
    },
    correct: 'A',
    partial_credit: 'D',
    explanation:
      'The Bowie-Dick test checks air removal and steam penetration in pre-vacuum steam sterilizers. It does not replace biological monitoring or package inspection. A failed test can signal a sterilizer problem that needs investigation before use.',
  },
  {
    id: 'tq-sterility_assurance-004',
    domain: 'STERILITY_ASSURANCE',
    difficulty: 'foundational',
    question: 'What should happen if a biological indicator is positive after a sterilization cycle?',
    options: {
      A: 'Follow the failed BI protocol and quarantine or recall affected items as required',
      B: 'Ignore it if the chemical indicator changed',
      C: 'Release the load because the cycle printout finished',
      D: 'Run the load again without documenting the failure',
    },
    correct: 'A',
    partial_credit: 'B',
    explanation:
      'A positive BI must be treated as a serious process failure and handled according to policy. Chemical indicators and printouts do not override a failed biological result. The response may include quarantine, recall, investigation, and documentation.',
  },
  {
    id: 'tq-sterility_assurance-005',
    domain: 'STERILITY_ASSURANCE',
    difficulty: 'intermediate',
    question: 'What is a chemical integrator designed to do?',
    options: {
      A: 'React to multiple critical sterilization parameters',
      B: 'Identify the technician who wrapped the tray',
      C: 'Replace cleaning verification',
      D: 'Prove the instrument was used correctly in surgery',
    },
    correct: 'A',
    partial_credit: null,
    explanation:
      'Chemical integrators are designed to respond to multiple critical parameters of a sterilization process. They help evaluate whether conditions inside the package were adequate. They do not replace cleaning, biological monitoring, or documentation requirements.',
  },
  {
    id: 'tq-sterility_assurance-006',
    domain: 'STERILITY_ASSURANCE',
    difficulty: 'foundational',
    question: 'What should be done with a wet pack after sterilization?',
    options: {
      A: 'Treat it as compromised and do not release it for use',
      B: 'Place it in storage to dry',
      C: 'Put extra tape on it',
      D: 'Send it to the OR if the case is urgent',
    },
    correct: 'A',
    partial_credit: 'B',
    explanation:
      'A wet pack is considered compromised because moisture can allow contamination to pass through packaging. It should not be placed in storage or sent for use. The cause should be investigated so the issue does not repeat.',
  },
  {
    id: 'tq-sterility_assurance-007',
    domain: 'STERILITY_ASSURANCE',
    difficulty: 'intermediate',
    question: 'Why is load documentation important?',
    options: {
      A: 'It creates traceability for cycle results, contents, and release decisions',
      B: 'It only helps count how many trays were processed',
      C: 'It replaces physical monitoring',
      D: 'It is only needed for implant loads',
    },
    correct: 'A',
    partial_credit: 'B',
    explanation:
      'Load documentation supports traceability, recall decisions, quality review, and survey readiness. Counting production volume is useful, but documentation has a deeper safety purpose. Every load should be documented according to department policy.',
  },
  {
    id: 'tq-sterility_assurance-008',
    domain: 'STERILITY_ASSURANCE',
    difficulty: 'foundational',
    question: 'Where should an internal chemical indicator be placed?',
    options: {
      A: 'Inside the package or tray in an area that represents sterilant access',
      B: 'Only on the outside of the wrapper',
      C: 'In the storage room',
      D: 'On the count sheet after sterilization',
    },
    correct: 'A',
    partial_credit: 'B',
    explanation:
      'An internal chemical indicator is placed inside the package to help show that sterilant reached the interior. External indicators only show exposure on the outside. Internal monitoring is important because the inside of the tray is what matters during use.',
  },
  {
    id: 'tq-sterility_assurance-009',
    domain: 'STERILITY_ASSURANCE',
    difficulty: 'intermediate',
    question: 'What does it mean if the physical printout shows the cycle did not meet the required parameters?',
    options: {
      A: 'The load should not be released until the issue is resolved according to policy',
      B: 'The load can be released if the tape changed color',
      C: 'The load can be released if the instruments look dry',
      D: 'The load can be released if the OR needs it urgently',
    },
    correct: 'A',
    partial_credit: 'B',
    explanation:
      'Physical monitoring confirms whether the sterilizer reached the required cycle conditions. If required parameters are not met, the load cannot be released based on tape color or urgency. Patient safety depends on following release criteria every time.',
  },
  {
    id: 'tq-sterility_assurance-010',
    domain: 'STERILITY_ASSURANCE',
    difficulty: 'foundational',
    question: 'Why should implant loads have special monitoring and release requirements?',
    options: {
      A: 'Implants remain in the patient\'s body and carry higher risk if sterility is not assured',
      B: 'Implants are easier to clean than other instruments',
      C: 'Implants never require biological monitoring',
      D: 'Implants do not need documentation',
    },
    correct: 'A',
    partial_credit: null,
    explanation:
      'Implants carry higher risk because they remain in the body and can cause serious harm if contaminated. Many policies require biological monitoring and documented release before implant use, except in defined emergencies. The higher risk requires stronger assurance.',
  },

  // ─── STORAGE_DISTRIBUTION (10 questions) ────────────────────────────────────
  {
    id: 'tq-storage_distribution-001',
    domain: 'STORAGE_DISTRIBUTION',
    difficulty: 'foundational',
    question: 'What does event-related sterility mean?',
    options: {
      A: 'A package remains sterile unless an event compromises it',
      B: 'A package becomes unsterile after exactly 30 days',
      C: 'A package is sterile only if stored in the OR',
      D: 'A package does not need inspection before use',
    },
    correct: 'A',
    partial_credit: 'B',
    explanation:
      'Event-related sterility means sterility is maintained until something compromises the package, such as moisture, tears, improper handling, or contamination. Some facilities still use expiration dating based on policy or product IFU, but the core concept is event related. Packages still require inspection before use.',
  },
  {
    id: 'tq-storage_distribution-002',
    domain: 'STORAGE_DISTRIBUTION',
    difficulty: 'foundational',
    question: 'What should be checked before a sterile package is distributed or used?',
    options: {
      A: 'Package integrity, dryness, correct labeling, and indicator results as applicable',
      B: 'Only whether the package is heavy',
      C: 'Only the color of the wrapper',
      D: 'Whether the tray looks new',
    },
    correct: 'A',
    partial_credit: 'C',
    explanation:
      'Sterile packages should be checked for tears, holes, moisture, labeling, and indicator acceptability. Wrapper color alone does not confirm integrity or sterility. A package can look clean but still be compromised.',
  },
  {
    id: 'tq-storage_distribution-003',
    domain: 'STORAGE_DISTRIBUTION',
    difficulty: 'intermediate',
    question: 'Why should sterile items be stored away from floors, ceilings, exterior walls, and sinks?',
    options: {
      A: 'To reduce risk from contamination, moisture, dust, and environmental exposure',
      B: 'To make the room look empty',
      C: 'To increase traffic through storage',
      D: 'To avoid having to inspect packages',
    },
    correct: 'A',
    partial_credit: null,
    explanation:
      'Storage location affects sterility maintenance. Floors, sinks, ceilings, and exterior walls can introduce moisture, dust, pests, temperature shifts, or contamination risk. Good storage protects the work already done in SPD.',
  },
  {
    id: 'tq-storage_distribution-004',
    domain: 'STORAGE_DISTRIBUTION',
    difficulty: 'foundational',
    question: 'What should happen if a sterile package is found torn?',
    options: {
      A: 'It should be considered compromised and not used',
      B: 'It should be taped closed and sent out',
      C: 'It should be placed on the top shelf',
      D: 'It should be used first',
    },
    correct: 'A',
    partial_credit: 'B',
    explanation:
      'A torn package is compromised because the sterile barrier has been broken. Tape does not restore validated package integrity. The item should be removed from circulation and reprocessed if appropriate.',
  },
  {
    id: 'tq-storage_distribution-005',
    domain: 'STORAGE_DISTRIBUTION',
    difficulty: 'intermediate',
    question: 'Why is controlled transport important for sterile items?',
    options: {
      A: 'Transport can damage packages or expose them to contamination',
      B: 'Transport makes items sterile',
      C: 'Transport replaces storage requirements',
      D: 'Transport allows wet packs to dry',
    },
    correct: 'A',
    partial_credit: null,
    explanation:
      'Sterile items can be compromised during transport if carts are dirty, open, overloaded, or handled roughly. The sterile barrier must be protected from the department to the point of use. Transport is part of sterility maintenance, not an afterthought.',
  },
  {
    id: 'tq-storage_distribution-006',
    domain: 'STORAGE_DISTRIBUTION',
    difficulty: 'foundational',
    question: 'What is the best action if a package is found wet in sterile storage?',
    options: {
      A: 'Remove it from use and treat it as compromised',
      B: 'Let it air dry on the shelf',
      C: 'Wipe the outside with a disinfectant and use it',
      D: 'Move it to a warmer shelf',
    },
    correct: 'A',
    partial_credit: 'B',
    explanation:
      'Moisture compromises the sterile barrier and can allow contamination to pass through packaging. Air drying on the shelf does not restore sterility. The item should be removed and the source of moisture investigated.',
  },
  {
    id: 'tq-storage_distribution-007',
    domain: 'STORAGE_DISTRIBUTION',
    difficulty: 'intermediate',
    question: 'What does proper stock rotation help prevent?',
    options: {
      A: 'Older or expiring items being missed while newer items are used first',
      B: 'The need for package inspection',
      C: 'The need for sterilization records',
      D: 'All instrument damage',
    },
    correct: 'A',
    partial_credit: null,
    explanation:
      'Stock rotation helps ensure older items or items with expiration dates are used before newer stock. It supports inventory control and reduces waste. It does not eliminate package inspection or documentation requirements.',
  },
  {
    id: 'tq-storage_distribution-008',
    domain: 'STORAGE_DISTRIBUTION',
    difficulty: 'foundational',
    question: 'Why should sterile storage traffic be limited?',
    options: {
      A: 'To reduce dust, handling, and contamination risk',
      B: 'To make it harder for staff to find trays',
      C: 'To prevent trays from being counted',
      D: 'To increase humidity',
    },
    correct: 'A',
    partial_credit: null,
    explanation:
      'The more traffic and handling in sterile storage, the higher the chance of dust, damage, and contamination. Limiting unnecessary access protects package integrity. Storage is a controlled area, not a general supply hallway.',
  },
  {
    id: 'tq-storage_distribution-009',
    domain: 'STORAGE_DISTRIBUTION',
    difficulty: 'intermediate',
    question: 'A sterile tray falls from a cart during transport. What should the technician do?',
    options: {
      A: 'Inspect it carefully and follow policy; if compromised, remove it from use',
      B: 'Use it if there are no visible instruments falling out',
      C: 'Send it to the OR because the outside wrapper is still blue',
      D: 'Put it back on the cart without reporting',
    },
    correct: 'A',
    partial_credit: 'B',
    explanation:
      'A dropped tray may have hidden damage, seal stress, or compromised packaging. It must be inspected and handled according to policy. Even if no instruments fall out, the sterile barrier may no longer be reliable.',
  },
  {
    id: 'tq-storage_distribution-010',
    domain: 'STORAGE_DISTRIBUTION',
    difficulty: 'foundational',
    question: 'What is the main goal of sterile storage and distribution?',
    options: {
      A: 'To maintain sterility until the item is needed for patient care',
      B: 'To make trays look organized only',
      C: 'To speed up decontamination',
      D: 'To reduce the need for sterilization',
    },
    correct: 'A',
    partial_credit: 'B',
    explanation:
      'Sterile storage and distribution protect the sterile barrier until the item reaches the point of use. Organization helps, but the main goal is sterility maintenance. Poor storage can undo the work of cleaning, assembly, and sterilization.',
  },

  // ─── COMPLIANCE_SAFETY (10 questions) ───────────────────────────────────────
  {
    id: 'tq-compliance_safety-001',
    domain: 'COMPLIANCE_SAFETY',
    difficulty: 'foundational',
    question: 'What is the purpose of OSHA\'s bloodborne pathogens standard in SPD?',
    options: {
      A: 'To protect workers from exposure to blood and potentially infectious materials',
      B: 'To decide surgical case order',
      C: 'To create count sheets',
      D: 'To determine tray weight limits only',
    },
    correct: 'A',
    partial_credit: null,
    explanation:
      'OSHA\'s bloodborne pathogens standard is designed to reduce worker exposure to blood and potentially infectious materials. SPD staff face exposure risk in decontamination and during contaminated item handling. Safe work practices, PPE, and exposure response are part of compliance.',
  },
  {
    id: 'tq-compliance_safety-002',
    domain: 'COMPLIANCE_SAFETY',
    difficulty: 'foundational',
    question: 'What should a technician do after a sharps injury?',
    options: {
      A: 'Follow the facility exposure protocol immediately',
      B: 'Finish the tray first and report it later',
      C: 'Wash the sharp and place it back in the tray',
      D: 'Ignore it if there is no bleeding',
    },
    correct: 'A',
    partial_credit: 'B',
    explanation:
      'Sharps injuries require immediate action according to the facility exposure protocol. Delaying reporting can delay treatment, testing, and documentation. Even small injuries can carry exposure risk.',
  },
  {
    id: 'tq-compliance_safety-003',
    domain: 'COMPLIANCE_SAFETY',
    difficulty: 'intermediate',
    question: 'Why are AAMI standards important in sterile processing?',
    options: {
      A: 'They provide nationally recognized guidance for safe and effective processing practices',
      B: 'They replace all manufacturer IFUs',
      C: 'They are only used by the OR',
      D: 'They only apply to new employees',
    },
    correct: 'A',
    partial_credit: 'B',
    explanation:
      'AAMI standards help guide sterile processing practices, quality systems, sterilization, and safety. They do not replace manufacturer IFUs; departments must consider both. Strong SPD programs align policy, IFUs, standards, and real workflow.',
  },
  {
    id: 'tq-compliance_safety-004',
    domain: 'COMPLIANCE_SAFETY',
    difficulty: 'foundational',
    question: 'What is the safest way to handle contaminated instruments?',
    options: {
      A: 'Handle them as if they may contain infectious material',
      B: 'Handle them only with clean gloves',
      C: 'Carry them uncovered through clean areas',
      D: 'Rinse them in a handwashing sink',
    },
    correct: 'A',
    partial_credit: 'B',
    explanation:
      'Contaminated instruments should always be treated as potentially infectious. Clean gloves alone may not provide enough protection depending on the task and area. Transport, PPE, and workflow must reduce exposure and cross-contamination.',
  },
  {
    id: 'tq-compliance_safety-005',
    domain: 'COMPLIANCE_SAFETY',
    difficulty: 'intermediate',
    question: 'Why is competency documentation important in SPD?',
    options: {
      A: 'It shows staff have been trained and assessed on required tasks',
      B: 'It replaces daily quality checks',
      C: 'It is only needed after an incident',
      D: 'It proves no errors will happen',
    },
    correct: 'A',
    partial_credit: 'C',
    explanation:
      'Competency documentation shows that staff have received training and have been assessed on critical tasks. It supports quality, accountability, and survey readiness. It does not eliminate the need for daily quality checks or ongoing coaching.',
  },
  {
    id: 'tq-compliance_safety-006',
    domain: 'COMPLIANCE_SAFETY',
    difficulty: 'foundational',
    question: 'Why should food and drinks not be allowed in sterile processing work areas?',
    options: {
      A: 'They can create contamination and safety risks',
      B: 'They help staff work faster',
      C: 'They improve humidity control',
      D: 'They are allowed if covered',
    },
    correct: 'A',
    partial_credit: null,
    explanation:
      'Food and drinks can introduce contamination, pests, spills, and unsafe behavior into controlled work areas. SPD spaces require clean, disciplined practices. Covered drinks still do not belong in processing areas.',
  },
  {
    id: 'tq-compliance_safety-007',
    domain: 'COMPLIANCE_SAFETY',
    difficulty: 'intermediate',
    question: 'What is the best reason to report repeated tray errors or process failures?',
    options: {
      A: 'To identify trends and fix system problems',
      B: 'To blame one technician',
      C: 'To avoid documenting issues',
      D: 'To make the OR responsible for SPD quality',
    },
    correct: 'A',
    partial_credit: 'B',
    explanation:
      'Reporting repeated errors helps leadership identify trends, training gaps, workflow issues, or resource problems. The goal is process improvement, not blame. Strong departments use error data to correct the system before failures reach patients.',
  },
  {
    id: 'tq-compliance_safety-008',
    domain: 'COMPLIANCE_SAFETY',
    difficulty: 'foundational',
    question: 'What does infection prevention mean in sterile processing practice?',
    options: {
      A: 'Using processes that reduce the risk of transmitting microorganisms to patients and staff',
      B: 'Only wearing gloves in the OR',
      C: 'Only cleaning floors',
      D: 'Sterilizing items without inspection',
    },
    correct: 'A',
    partial_credit: 'C',
    explanation:
      'Infection prevention in SPD includes cleaning, inspection, sterilization, storage, PPE, traffic control, and safe handling. Environmental cleaning supports infection prevention, but it is only one part. Every step in SPD affects patient safety.',
  },
  {
    id: 'tq-compliance_safety-009',
    domain: 'COMPLIANCE_SAFETY',
    difficulty: 'intermediate',
    question: 'How should a technician respond if the IFU, department practice, and current workflow do not match?',
    options: {
      A: 'Escalate the concern so policy and practice can be reviewed',
      B: 'Follow the fastest method',
      C: 'Ignore the IFU if the department has always done it another way',
      D: 'Ask the OR to decide during the case',
    },
    correct: 'A',
    partial_credit: 'C',
    explanation:
      'When the IFU and practice do not match, the concern should be escalated for review. Continuing an unverified practice creates compliance and safety risk. The department should align policy, training, equipment, and workflow with current requirements.',
  },
  {
    id: 'tq-compliance_safety-010',
    domain: 'COMPLIANCE_SAFETY',
    difficulty: 'foundational',
    question: 'Why are hand hygiene and proper glove use important in SPD?',
    options: {
      A: 'They reduce contamination and protect staff and processed items',
      B: 'They replace environmental cleaning',
      C: 'They make instruments sterile',
      D: 'They are only required in decontamination',
    },
    correct: 'A',
    partial_credit: 'D',
    explanation:
      'Hand hygiene and proper glove use reduce contamination risk and protect both staff and items being processed. They are important across SPD, not only in decontamination. Gloves do not replace hand hygiene or other controls.',
  },

  // ─── SPD_JUDGMENT (30 questions) ──────────────────────────────────────────
  {
    id: 'tq-judgment-001',
    domain: 'SPD_JUDGMENT',
    difficulty: 'intermediate',
    judgment_type: 'moral_standard',
    question:
      'You are assembling a tray and notice dried blood inside the box lock of one instrument. The tray is needed for a case in 30 minutes. What is the best action?',
    options: {
      A: 'Wipe the visible area and continue assembling the tray',
      B: 'Remove the instrument, send it back for cleaning, and follow the department process',
      C: 'Place the instrument in the tray because sterilization will kill microorganisms',
      D: 'Hide the instrument under heavier items so the tray can go out on time',
    },
    correct: 'B',
    partial_credit: 'A',
    explanation:
      'Visible soil means the instrument is not clean and cannot move forward. Sterilization does not make a dirty instrument acceptable because soil can block sterilant contact. The right decision protects the patient even when there is pressure from the schedule.',
    real_world_standard:
      'A safe SPD technician stops the process when cleanliness, sterility, or patient safety is in question.',
  },
  {
    id: 'tq-judgment-002',
    domain: 'SPD_JUDGMENT',
    difficulty: 'foundational',
    judgment_type: 'common_sense',
    question:
      'A sterile package falls off a cart onto the floor. The wrapper does not appear torn at first glance. What should you do?',
    options: {
      A: 'Put it back on the cart because it looks fine',
      B: 'Inspect it carefully and follow the department process for dropped sterile items',
      C: 'Send it to the OR because the case is starting soon',
      D: 'Add more tape to the wrapper',
    },
    correct: 'B',
    partial_credit: 'A',
    explanation:
      'A dropped sterile item may have hidden damage or contamination risk. Even if it looks fine, it should be inspected and handled according to policy. Common sense in SPD means slowing down when sterility may be compromised.',
    real_world_standard:
      'Sterile items that are dropped or mishandled must be evaluated before they are used.',
  },
  {
    id: 'tq-judgment-003',
    domain: 'SPD_JUDGMENT',
    difficulty: 'intermediate',
    judgment_type: 'critical_thinking',
    question:
      'Several trays from the same sterilizer load are found wet after the cycle. What should the technician think first?',
    options: {
      A: 'The trays can be used once they air dry',
      B: 'There may be a load, drying, sterilizer, or packaging issue that needs investigation',
      C: 'Wet trays are normal if the department is busy',
      D: 'The OR should decide whether to use them',
    },
    correct: 'B',
    partial_credit: 'A',
    explanation:
      'Multiple wet trays suggest a process issue, not a single random event. Wet packs are compromised and should not be released for use. Critical thinking means recognizing patterns and escalating problems before they reach the patient.',
    real_world_standard:
      'Wet packs are process failures that require removal from use and investigation.',
  },
  {
    id: 'tq-judgment-004',
    domain: 'SPD_JUDGMENT',
    difficulty: 'foundational',
    judgment_type: 'professionalism',
    question:
      'You are assigned to decontamination, but the workload is heavy and you feel overwhelmed. What is the best response?',
    options: {
      A: 'Leave the area until someone else catches up',
      B: 'Tell the supervisor or lead what is happening and ask for support or prioritization',
      C: 'Skip steps so the instruments move faster',
      D: 'Stop answering the phone and ignore requests',
    },
    correct: 'B',
    partial_credit: null,
    explanation:
      'When the workload becomes unsafe or unmanageable, the right move is to communicate early and ask for direction. Skipping steps creates patient safety risk. Professional technicians do not disappear; they communicate and help solve the problem.',
    real_world_standard:
      'A professional technician communicates early when workload, safety, or priorities become unmanageable.',
  },
  {
    id: 'tq-judgment-005',
    domain: 'SPD_JUDGMENT',
    difficulty: 'intermediate',
    judgment_type: 'safety_ownership',
    question:
      'You see a coworker leave decontamination wearing contaminated gloves and touch a clean workstation. What should you do?',
    options: {
      A: 'Ignore it because they are experienced',
      B: 'Clean the affected area if needed and report or address the issue according to department expectations',
      C: 'Wait until the end of the week to mention it',
      D: 'Assume the clean area is still safe because it looks dry',
    },
    correct: 'B',
    partial_credit: null,
    explanation:
      'Contaminated gloves can transfer bioburden into clean areas and break the dirty-to-clean workflow. The area may need to be cleaned and the behavior addressed. Safety ownership means correcting risks in real time, not waiting until they become normal.',
    real_world_standard:
      'Contamination risks should be corrected when they are seen, not ignored because the person involved is experienced.',
  },
  {
    id: 'tq-judgment-006',
    domain: 'SPD_JUDGMENT',
    difficulty: 'intermediate',
    judgment_type: 'accountability',
    question:
      'You realize that a tray you assembled earlier may have been missing an instrument, and the tray has already left the department. What should you do?',
    options: {
      A: 'Stay quiet because you are not completely sure',
      B: 'Notify the lead or supervisor immediately so the tray can be checked before use',
      C: 'Wait to see if the OR calls about it',
      D: 'Blame the previous shift',
    },
    correct: 'B',
    partial_credit: 'C',
    explanation:
      'A possible missing instrument must be communicated immediately because the tray may still be intercepted before the case. Waiting for the OR to discover the problem creates avoidable risk and delays. Accountability means speaking up quickly, even when it is uncomfortable.',
    real_world_standard:
      'If a technician suspects an error may have reached the OR, they must escalate immediately.',
  },
  {
    id: 'tq-judgment-007',
    domain: 'SPD_JUDGMENT',
    difficulty: 'intermediate',
    judgment_type: 'escalation',
    question:
      'You are asked to process an unfamiliar device, but the IFU is not available and nobody on shift knows the correct steps. What is the best action?',
    options: {
      A: 'Process it the same way as a similar-looking device',
      B: 'Stop and escalate until the correct IFU or approved process is available',
      C: 'Run it through the washer and sterilizer twice to be safe',
      D: 'Ask the OR how they want it processed',
    },
    correct: 'B',
    partial_credit: 'C',
    explanation:
      'Similar-looking devices may have very different cleaning or sterilization requirements. Running extra cycles does not replace the correct IFU. The safe decision is to escalate until validated instructions are available.',
    real_world_standard:
      'Devices should not be processed by guesswork when the IFU or approved process is missing.',
  },
  {
    id: 'tq-judgment-008',
    domain: 'SPD_JUDGMENT',
    difficulty: 'advanced',
    judgment_type: 'moral_standard',
    question:
      'A supervisor is under pressure from the OR and tells you to release a questionable tray even though the internal indicator did not respond correctly. What should you do?',
    options: {
      A: 'Release it because the supervisor told you to',
      B: 'Refuse to release it silently and leave it on the counter',
      C: 'Respectfully escalate the concern and follow load release policy',
      D: 'Send it to the OR with a note saying the indicator looked questionable',
    },
    correct: 'C',
    partial_credit: 'B',
    explanation:
      'A questionable internal indicator means the tray should not be released until the issue is resolved according to policy. Authority pressure does not override patient safety or sterility assurance requirements. The best response is respectful escalation, not silent resistance or unsafe release.',
    real_world_standard:
      'Patient safety and release criteria must be followed even when there is pressure from leadership or the OR.',
  },
  {
    id: 'tq-judgment-009',
    domain: 'SPD_JUDGMENT',
    difficulty: 'foundational',
    judgment_type: 'teamwork',
    question:
      'A new technician is struggling to assemble a tray and keeps looking around but does not ask for help. You are nearby and caught up on your work. What should you do?',
    options: {
      A: 'Ignore them because everyone has to learn the hard way',
      B: 'Offer help or notify the lead so they can get support',
      C: 'Take over the tray without explaining anything',
      D: 'Tell other coworkers the new tech is too slow',
    },
    correct: 'B',
    partial_credit: 'C',
    explanation:
      'Helping or getting support protects tray quality and helps the new technician learn. Taking over without teaching may get the tray done but does not build competence. Strong SPD teams notice when someone is struggling and respond before errors happen.',
    real_world_standard:
      'Teamwork means helping others succeed while protecting the quality of the work.',
  },
  {
    id: 'tq-judgment-010',
    domain: 'SPD_JUDGMENT',
    difficulty: 'foundational',
    judgment_type: 'common_sense',
    question:
      'You see a peel pouch with a seal that looks wrinkled and uneven. The item inside is needed soon. What should you do?',
    options: {
      A: 'Send it because the seal is mostly closed',
      B: 'Treat the package as questionable and repackage or escalate according to policy',
      C: 'Add tape over the wrinkled seal',
      D: 'Place it in a larger tray to hide the pouch',
    },
    correct: 'B',
    partial_credit: null,
    explanation:
      'A questionable seal can compromise the sterile barrier. Tape does not restore a validated seal or fix poor pouching technique. The item should be repackaged or escalated according to department process.',
    real_world_standard:
      'Package integrity must be clear before an item is released for use.',
  },
  {
    id: 'tq-judgment-011',
    domain: 'SPD_JUDGMENT',
    difficulty: 'intermediate',
    judgment_type: 'critical_thinking',
    question:
      'The same tray has been returned three times this week for missing or incorrect instruments. What is the best way to think about this problem?',
    options: {
      A: 'The OR is probably being too picky',
      B: 'There may be a system issue with the count sheet, tray layout, training, or instrument availability',
      C: 'The next person who makes the mistake should be written up immediately',
      D: 'The tray should be removed from service permanently',
    },
    correct: 'B',
    partial_credit: 'C',
    explanation:
      'Repeated errors usually point to a process problem that needs review. Discipline may be appropriate in some cases, but the first step is to understand the pattern and fix the system. Critical thinking looks beyond one person and asks why the failure keeps happening.',
    real_world_standard:
      'Repeated tray errors should trigger trend review and process correction, not just blame.',
  },
  {
    id: 'tq-judgment-012',
    domain: 'SPD_JUDGMENT',
    difficulty: 'foundational',
    judgment_type: 'professionalism',
    question:
      'The OR calls upset about a tray delay and speaks to you rudely. What is the best response?',
    options: {
      A: 'Match their tone so they know SPD is busy too',
      B: 'Stay professional, give accurate information, and escalate if needed',
      C: 'Hang up because they are disrespectful',
      D: 'Promise the tray will be ready even if you are unsure',
    },
    correct: 'B',
    partial_credit: 'D',
    explanation:
      'SPD communication must stay professional even when the other department is frustrated. Giving false promises can make the situation worse and damage trust. The right response is calm, accurate communication and escalation when needed.',
    real_world_standard:
      'Professional communication protects trust between SPD and the OR during pressure.',
  },
  {
    id: 'tq-judgment-013',
    domain: 'SPD_JUDGMENT',
    difficulty: 'foundational',
    judgment_type: 'safety_ownership',
    question:
      'You find a loose blade in a contaminated tray during decontamination. What should you do?',
    options: {
      A: 'Pick it up quickly with your fingers and throw it away',
      B: 'Use safe sharps handling technique and report the issue according to process',
      C: 'Leave it for the next person because you did not put it there',
      D: 'Place it back in the tray so the OR can identify it',
    },
    correct: 'B',
    partial_credit: 'D',
    explanation:
      'Loose sharps create exposure risk and must be handled with safe technique. Reporting the issue helps prevent repeat occurrences and protects the team. Placing the blade back in the tray keeps the hazard active.',
    real_world_standard:
      'Loose sharps must be handled safely and reported so the source behavior can be corrected.',
  },
  {
    id: 'tq-judgment-014',
    domain: 'SPD_JUDGMENT',
    difficulty: 'intermediate',
    judgment_type: 'accountability',
    question:
      'A coworker asks you to document that a quality check was completed even though neither of you performed it. What should you do?',
    options: {
      A: 'Document it because the coworker said it was probably fine',
      B: 'Refuse to falsify the record and notify the appropriate lead or supervisor if needed',
      C: 'Leave the field blank without telling anyone',
      D: 'Sign it only if the department is busy',
    },
    correct: 'B',
    partial_credit: 'C',
    explanation:
      'Documentation must reflect what actually happened. Falsifying quality records destroys trust, creates compliance risk, and can hide unsafe conditions. Leaving it blank may avoid lying, but the missed quality check still needs to be addressed.',
    real_world_standard:
      'Quality documentation must be truthful, complete, and tied to work that was actually performed.',
  },
  {
    id: 'tq-judgment-015',
    domain: 'SPD_JUDGMENT',
    difficulty: 'intermediate',
    judgment_type: 'escalation',
    question:
      'A loaner tray arrives late, incomplete, and without clear processing instructions. The case is scheduled soon. What is the best action?',
    options: {
      A: 'Process whatever arrived and hope the missing items are not needed',
      B: 'Escalate immediately to the lead, OR, vendor process, and follow policy for loaner instrumentation',
      C: 'Mix similar instruments from another tray without telling anyone',
      D: 'Cancel the case yourself',
    },
    correct: 'B',
    partial_credit: 'A',
    explanation:
      'Late or incomplete loaner trays create major processing, documentation, and case-readiness risks. The issue must be escalated quickly so the correct people can make informed decisions. Guessing, substituting, or staying quiet can create unsafe or incomplete surgical support.',
    real_world_standard:
      'Loaner tray issues must be escalated early because they affect processing safety and surgical readiness.',
  },
  {
    id: 'tq-judgment-016',
    domain: 'SPD_JUDGMENT',
    difficulty: 'foundational',
    judgment_type: 'common_sense',
    question:
      'You notice a sterile tray sitting near a sink where water is splashing onto the counter. The tray packaging is still dry. What should you do?',
    options: {
      A: 'Leave it there because it is not wet yet',
      B: 'Move it to an appropriate storage area and check for compromise',
      C: 'Cover it with a towel',
      D: 'Wait for environmental services to move it',
    },
    correct: 'B',
    partial_credit: 'A',
    explanation:
      'Sterile packages should be protected from moisture risk before they become compromised. A sink area is not appropriate for sterile storage or staging. Common sense means preventing the problem instead of waiting for visible damage.',
    real_world_standard:
      'Sterile items must be stored and staged away from moisture and contamination risks.',
  },
  {
    id: 'tq-judgment-017',
    domain: 'SPD_JUDGMENT',
    difficulty: 'intermediate',
    judgment_type: 'critical_thinking',
    question:
      'A sterilizer printout shows a cycle parameter that does not match the required setting, but the external tape changed color. What should you do?',
    options: {
      A: 'Release the load because the tape changed',
      B: 'Hold the load and escalate because the physical monitor may show a failed cycle',
      C: 'Open the trays and check if the instruments look clean',
      D: 'Send only the urgent trays to the OR',
    },
    correct: 'B',
    partial_credit: 'A',
    explanation:
      'External tape only shows exposure to a process; it does not prove the correct cycle parameters were met. The physical monitor is a key part of load release. If the cycle record is questionable, the load must be held and escalated.',
    real_world_standard:
      'Load release requires all required monitoring results to be acceptable, not just external tape change.',
  },
  {
    id: 'tq-judgment-018',
    domain: 'SPD_JUDGMENT',
    difficulty: 'foundational',
    judgment_type: 'professionalism',
    question:
      'You are assigned to an area where you have not been fully trained. What is the best response?',
    options: {
      A: 'Say nothing and try to figure it out alone',
      B: 'Tell the lead or supervisor your training status and ask for guidance',
      C: 'Avoid the assignment by disappearing',
      D: 'Do only the easy tasks and ignore the rest',
    },
    correct: 'B',
    partial_credit: 'D',
    explanation:
      'A technician should be honest about their training level so they can work safely with support. Trying to figure it out alone can lead to errors, damaged instruments, or unsafe processing. Professionalism includes knowing when to ask for direction.',
    real_world_standard:
      'Staff should not perform unfamiliar critical tasks without proper training, support, or supervision.',
  },
  {
    id: 'tq-judgment-019',
    domain: 'SPD_JUDGMENT',
    difficulty: 'intermediate',
    judgment_type: 'moral_standard',
    question:
      'A coworker says, "We always skip that step when we are behind. Nothing bad has happened." What is the best response?',
    options: {
      A: 'Skip the step because experience matters more than policy',
      B: 'Ask what the step is for and escalate if the practice does not match policy or IFU',
      C: 'Skip the step only when the OR is waiting',
      D: 'Ignore the coworker but do not tell anyone',
    },
    correct: 'B',
    partial_credit: 'D',
    explanation:
      'Unsafe shortcuts can become normalized when no one challenges them. If a practice does not match policy or IFU, it needs to be reviewed and corrected. Moral standards in SPD mean doing the right thing even when the shortcut is common.',
    real_world_standard:
      '"We always do it this way" does not override policy, IFU, or patient safety.',
  },
  {
    id: 'tq-judgment-020',
    domain: 'SPD_JUDGMENT',
    difficulty: 'intermediate',
    judgment_type: 'teamwork',
    question:
      'Decontamination is backed up, prep and pack is waiting, and the OR is calling for updates. What should the team focus on first?',
    options: {
      A: 'Everyone should work independently without communicating',
      B: 'Communicate priorities, assign roles, and move work safely through the process',
      C: 'Skip inspection to catch up',
      D: 'Only answer the OR and stop processing trays',
    },
    correct: 'B',
    partial_credit: 'A',
    explanation:
      'During high-volume pressure, the team needs communication, role clarity, and prioritization. Working in silence can create duplication, missed steps, and confusion. The answer is not to skip quality steps; it is to organize the work safely.',
    real_world_standard:
      'High-pressure SPD work requires communication, role clarity, and safe prioritization.',
  },
  {
    id: 'tq-judgment-021',
    domain: 'SPD_JUDGMENT',
    difficulty: 'foundational',
    judgment_type: 'safety_ownership',
    question:
      'You notice someone eating a snack at a workstation near clean instruments. What is the best action?',
    options: {
      A: 'Ignore it because it is not your responsibility',
      B: 'Address it respectfully or notify the lead according to department expectations',
      C: 'Move the clean instruments closer to them',
      D: 'Join them if the department is slow',
    },
    correct: 'B',
    partial_credit: 'A',
    explanation:
      'Food and drinks do not belong near sterile processing work areas because they create contamination and safety concerns. Addressing the issue protects the workspace and reinforces standards. Ignoring it allows unsafe habits to become normal.',
    real_world_standard:
      'Controlled work areas require professional behavior that protects cleanliness and safety.',
  },
  {
    id: 'tq-judgment-022',
    domain: 'SPD_JUDGMENT',
    difficulty: 'advanced',
    judgment_type: 'escalation',
    question:
      'You notice a repeated trend of scopes being stored incorrectly after reprocessing, but the issue has not caused a known patient event. What should you do?',
    options: {
      A: 'Wait until an infection concern is reported',
      B: 'Escalate the trend and recommend review of storage practice, training, and monitoring',
      C: 'Assume it is acceptable because no event has occurred',
      D: 'Only tell the newest technician to be more careful',
    },
    correct: 'B',
    partial_credit: 'D',
    explanation:
      'Waiting for harm before acting is poor safety practice. Repeated incorrect storage is a process risk that should be reviewed before it becomes a patient event. Focusing only on one technician may miss a broader training or system issue.',
    real_world_standard:
      'SPD risks should be corrected when trends appear, not only after harm occurs.',
  },
  {
    id: 'tq-judgment-023',
    domain: 'SPD_JUDGMENT',
    difficulty: 'foundational',
    judgment_type: 'accountability',
    question:
      'You are running late for your shift and know your assigned area will be short until you arrive. What is the best action?',
    options: {
      A: 'Say nothing and arrive when you arrive',
      B: 'Notify the appropriate person as soon as possible according to department process',
      C: 'Ask a coworker to clock in for you',
      D: 'Wait until the end of the shift to explain',
    },
    correct: 'B',
    partial_credit: 'A',
    explanation:
      'SPD work depends on staffing, coverage, and handoff. Notifying leadership early allows the department to adjust assignments and protect workflow. Accountability includes communication before your absence or lateness affects the team.',
    real_world_standard:
      'Reliable communication is part of professional responsibility in a time-sensitive department.',
  },
  {
    id: 'tq-judgment-024',
    domain: 'SPD_JUDGMENT',
    difficulty: 'advanced',
    judgment_type: 'critical_thinking',
    question:
      'A tray passes sterilization, but when opened in the OR, staff report a strong chemical odor. What should SPD consider?',
    options: {
      A: 'The tray is fine because the sterilizer cycle passed',
      B: 'There may be a cleaning, rinsing, drying, chemical residue, or process issue that needs investigation',
      C: 'The OR should ignore the odor if the indicator changed',
      D: 'The tray should be sent back only if instruments are missing',
    },
    correct: 'B',
    partial_credit: 'A',
    explanation:
      'A strong odor may signal chemical residue, incomplete rinsing, drying issues, or another process concern. A passed cycle does not automatically explain or dismiss every problem. Critical thinking means connecting unusual findings to possible upstream process failures.',
    real_world_standard:
      'Unusual findings after processing should be investigated even when one part of the process appears acceptable.',
  },
  {
    id: 'tq-judgment-025',
    domain: 'SPD_JUDGMENT',
    difficulty: 'intermediate',
    judgment_type: 'professionalism',
    question:
      'A coworker corrects your tray assembly in front of others. You feel embarrassed, but the correction is accurate. What is the best response?',
    options: {
      A: 'Argue back so you do not look weak',
      B: 'Accept the correction, fix the tray, and ask questions if needed',
      C: 'Refuse to work with that coworker again',
      D: 'Ignore the correction and continue your way',
    },
    correct: 'B',
    partial_credit: 'A',
    explanation:
      'Professional growth requires accepting accurate correction, especially when patient safety and tray quality are involved. The delivery may not feel good, but the priority is fixing the work and learning from the issue. Strong technicians do not let ego block improvement.',
    real_world_standard:
      'Correction should be used to improve performance, not treated as a personal attack when the standard is valid.',
  },
  {
    id: 'tq-judgment-026',
    domain: 'SPD_JUDGMENT',
    difficulty: 'advanced',
    judgment_type: 'moral_standard',
    question:
      'You discover that a coworker has been marking trays complete without fully inspecting each instrument. What should you do?',
    options: {
      A: 'Ignore it because reporting coworkers creates conflict',
      B: 'Follow the department escalation process because incomplete inspection can affect patient safety',
      C: 'Start doing the same thing so you can keep up',
      D: 'Only mention it to coworkers during break',
    },
    correct: 'B',
    partial_credit: 'A',
    explanation:
      'Incomplete inspection can allow dirty, damaged, or incorrect instruments to reach the OR. This is not gossip or personal conflict; it is a patient safety and quality concern. Moral courage means escalating unsafe behavior through the right process.',
    real_world_standard:
      'Known unsafe documentation or inspection practices must be escalated through the proper chain.',
  },
  {
    id: 'tq-judgment-027',
    domain: 'SPD_JUDGMENT',
    difficulty: 'foundational',
    judgment_type: 'common_sense',
    question:
      'You are unsure whether an instrument is the correct one for a tray. What should you do?',
    options: {
      A: 'Put it in the tray and hope it is close enough',
      B: 'Check the count sheet, image reference, IFU, or ask a qualified person before completing the tray',
      C: 'Leave the instrument out without documenting anything',
      D: 'Use the most similar instrument available',
    },
    correct: 'B',
    partial_credit: 'D',
    explanation:
      'When unsure, the safest action is to verify before the tray is completed. Similar instruments may not perform the same function and can create surgical delays. Asking for help is better than guessing.',
    real_world_standard: 'Uncertainty should trigger verification, not guessing.',
  },
  {
    id: 'tq-judgment-028',
    domain: 'SPD_JUDGMENT',
    difficulty: 'intermediate',
    judgment_type: 'teamwork',
    question:
      'You finish your assigned trays early while another area is falling behind. What is the best action?',
    options: {
      A: 'Stay at your station and scroll on your phone',
      B: 'Ask the lead where help is needed and support the team',
      C: 'Leave the department because your work is done',
      D: 'Tell the slower area they need to work faster',
    },
    correct: 'B',
    partial_credit: null,
    explanation:
      'SPD success depends on the whole process, not only one person\'s station. When one area falls behind, it affects the OR and the rest of the department. A strong technician looks for the next best way to support the workflow.',
    real_world_standard:
      'Finishing your assignment does not end your responsibility to the department workflow.',
  },
  {
    id: 'tq-judgment-029',
    domain: 'SPD_JUDGMENT',
    difficulty: 'intermediate',
    judgment_type: 'escalation',
    question:
      'You find a chemical indicator in a tray that looks different from what your department normally uses. What should you do?',
    options: {
      A: 'Ignore it if the color changed',
      B: 'Verify that the indicator is approved for the process and escalate if unsure',
      C: 'Remove it and send the tray without an indicator',
      D: 'Assume all indicators work the same way',
    },
    correct: 'B',
    partial_credit: 'A',
    explanation:
      'Different indicators are designed for specific processes and performance requirements. A color change alone does not mean the indicator was appropriate for that cycle. When an unfamiliar indicator is found, the technician should verify before release.',
    real_world_standard:
      'Monitoring products must match the sterilization process and department policy.',
  },
  {
    id: 'tq-judgment-030',
    domain: 'SPD_JUDGMENT',
    difficulty: 'advanced',
    judgment_type: 'accountability',
    question:
      'You notice that your department\'s current practice does not match the written policy, but the practice has been accepted for a long time. What is the best action?',
    options: {
      A: 'Keep following the practice because long-term habits are automatically acceptable',
      B: 'Raise the concern so leadership can compare policy, IFU, standards, and actual workflow',
      C: 'Rewrite the policy yourself without telling anyone',
      D: 'Stop following all related processes until someone fixes it',
    },
    correct: 'B',
    partial_credit: 'A',
    explanation:
      'A gap between policy and practice creates compliance and patient safety risk. The right response is to raise the concern so leadership can review the policy, IFUs, standards, and real workflow. Long-standing habits still need to be validated.',
    real_world_standard:
      'Policy, practice, IFU, and standards should be aligned instead of relying on inherited habits.',
  },
]

import { mapLegacyDomain, defaultConceptForLegacyDomain } from './domain-map'
import { DOMAIN_ERROR_MAP } from './error-categories'

/**
 * Returns the learning_domain for a question, falling back to the legacy domain mapping.
 * Per D-04: existing questions are auto-mapped via mapLegacyDomain at read time.
 */
export function getLearningDomain(q: TrackQuestion): LearningDomain {
  return q.learning_domain ?? mapLegacyDomain(q.domain)
}

export function getConceptId(q: TrackQuestion): ConceptId {
  return q.concept_id ?? defaultConceptForLegacyDomain(q.domain)
}

export function getErrorCategories(q: TrackQuestion): ErrorCategory[] {
  if (q.error_categories && q.error_categories.length > 0) return q.error_categories
  return DOMAIN_ERROR_MAP[getLearningDomain(q)]
}
