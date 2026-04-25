-- ============================================================
-- 005_seed_assessment_questions.sql
-- 30 SPD-specific readiness assessment questions
-- 5 questions per category: technical, situational, process, behavioral, instrument, reliability
-- options_json: {"A": "text", "B": "text", "C": "text", "D": "text"}
-- scoring_key_json: {"correct": "X", "score_map": {"A": 0, "B": 1, "C": 0.25, "D": 0}}
-- Uses ON CONFLICT (id) DO NOTHING for idempotent re-runs
-- NOTE: category uses 'behavioral' (not 'behavior') per schema CHECK constraint
-- ============================================================

INSERT INTO assessment_questions
  (id, category, type, prompt, options_json, scoring_key_json, active)
VALUES

-- ── TECHNICAL KNOWLEDGE (5) ────────────────────────────────────────────────

('a1000000-0000-0000-0000-000000000001', 'technical', 'multiple_choice',
 'A biological indicator (BI) for steam sterilization uses spores of which organism?',
 '{"A": "Geobacillus stearothermophilus", "B": "Bacillus atrophaeus", "C": "Staphylococcus aureus", "D": "Bacillus subtilis"}',
 '{"correct": "A", "score_map": {"A": 1.0, "B": 0.0, "C": 0.0, "D": 0.25}}',
 true),

('a1000000-0000-0000-0000-000000000002', 'technical', 'multiple_choice',
 'The minimum required exposure time for a 132°C gravity steam sterilization cycle is:',
 '{"A": "3 minutes", "B": "4 minutes", "C": "10 minutes", "D": "20 minutes"}',
 '{"correct": "B", "score_map": {"A": 0.25, "B": 1.0, "C": 0.0, "D": 0.0}}',
 true),

('a1000000-0000-0000-0000-000000000003', 'technical', 'multiple_choice',
 'High-level disinfection (HLD) differs from sterilization in that it:',
 '{"A": "Kills all microbial life including prions", "B": "Eliminates all organisms except high numbers of bacterial spores", "C": "Reduces microbial count by 99.9%", "D": "Is used for critical-class instruments only"}',
 '{"correct": "B", "score_map": {"A": 0.0, "B": 1.0, "C": 0.0, "D": 0.0}}',
 true),

('a1000000-0000-0000-0000-000000000004', 'technical', 'multiple_choice',
 'Which Spaulding classification applies to instruments that contact intact mucous membranes?',
 '{"A": "Critical", "B": "Semi-critical", "C": "Non-critical", "D": "Minimal risk"}',
 '{"correct": "B", "score_map": {"A": 0.0, "B": 1.0, "C": 0.0, "D": 0.0}}',
 true),

('a1000000-0000-0000-0000-000000000005', 'technical', 'multiple_choice',
 'An ethylene oxide (EtO) sterilization cycle requires aeration after the run because:',
 '{"A": "The instruments are too hot to handle", "B": "EtO residuals must off-gas to safe levels before patient contact", "C": "The humidity must normalize", "D": "The cycle indicator needs time to change color"}',
 '{"correct": "B", "score_map": {"A": 0.0, "B": 1.0, "C": 0.25, "D": 0.0}}',
 true),

-- ── SITUATIONAL JUDGMENT (5) ───────────────────────────────────────────────

('a1000000-0000-0000-0000-000000000006', 'situational', 'multiple_choice',
 'You receive a tray from the OR with visible bioburden on the instruments. Your first action is:',
 '{"A": "Immediately sterilize the tray to kill the bioburden", "B": "Point-of-use pre-clean, then transport to decontam for full manual cleaning", "C": "Notify your supervisor before touching the tray", "D": "Soak in enzyme solution directly at the sterile assembly table"}',
 '{"correct": "B", "score_map": {"A": 0.0, "B": 1.0, "C": 0.25, "D": 0.0}}',
 true),

('a1000000-0000-0000-0000-000000000007', 'situational', 'multiple_choice',
 'During assembly, you find a crack in the hinge of a needle driver. You should:',
 '{"A": "Reassemble the tray — hairline cracks are cosmetic", "B": "Mark the instrument as out of service, set it aside, and document it", "C": "File the crack smooth and return it to service", "D": "Soak in glutaraldehyde to strengthen the joint"}',
 '{"correct": "B", "score_map": {"A": 0.0, "B": 1.0, "C": 0.0, "D": 0.0}}',
 true),

('a1000000-0000-0000-0000-000000000008', 'situational', 'multiple_choice',
 'The sterility maintenance time (event-related sterility) for a wrapped tray depends on:',
 '{"A": "The number of days since sterilization", "B": "How the package has been stored and handled since sterilization", "C": "The temperature of the storage area", "D": "The type of sterilizer used"}',
 '{"correct": "B", "score_map": {"A": 0.0, "B": 1.0, "C": 0.25, "D": 0.0}}',
 true),

('a1000000-0000-0000-0000-000000000009', 'situational', 'multiple_choice',
 'You accidentally breach your sterile field while opening a peel pouch. The correct action is:',
 '{"A": "Continue — the outer packaging protected the contents", "B": "Discard the item and obtain a new sterile one", "C": "Wipe the item with alcohol and proceed", "D": "Place the item in a sterile basin before using"}',
 '{"correct": "B", "score_map": {"A": 0.0, "B": 1.0, "C": 0.0, "D": 0.25}}',
 true),

('a1000000-0000-0000-0000-000000000010', 'situational', 'multiple_choice',
 'A surgeon calls requesting a custom tray not on the standard pick list. You should:',
 '{"A": "Tell them it is impossible without a 24-hour notice", "B": "Check the preference card, verify instrument availability, and communicate an accurate ETA", "C": "Build the tray from memory to save time", "D": "Escalate immediately to the charge nurse without gathering information first"}',
 '{"correct": "B", "score_map": {"A": 0.0, "B": 1.0, "C": 0.0, "D": 0.25}}',
 true),

-- ── PROCESS DISCIPLINE (5) ─────────────────────────────────────────────────

('a1000000-0000-0000-0000-000000000011', 'process', 'multiple_choice',
 'Traceability in sterile processing means:',
 '{"A": "Tracking how many packs were processed per shift", "B": "Linking each sterilized item to the load, sterilizer, operator, date, and patient it was used on", "C": "Verifying that biological indicators are run weekly", "D": "Keeping a log of sterilizer maintenance dates"}',
 '{"correct": "B", "score_map": {"A": 0.0, "B": 1.0, "C": 0.25, "D": 0.25}}',
 true),

('a1000000-0000-0000-0000-000000000012', 'process', 'multiple_choice',
 'A chemical integrator inside a sterilization pack that fails to reach pass status indicates:',
 '{"A": "The pack was not sterilized and must be recalled", "B": "Sterilization conditions may not have been met; escalate per your department recall policy", "C": "The sterilizer is malfunctioning and must be taken out of service", "D": "The pack was loaded incorrectly and should be re-wrapped and re-processed immediately"}',
 '{"correct": "B", "score_map": {"A": 0.25, "B": 1.0, "C": 0.0, "D": 0.0}}',
 true),

('a1000000-0000-0000-0000-000000000013', 'process', 'multiple_choice',
 'The ANSI/AAMI ST79 standard is the primary guidance document for:',
 '{"A": "Flexible endoscope reprocessing", "B": "Comprehensive guide to steam sterilization and sterility assurance in health care", "C": "Chemical disinfectant selection and efficacy testing", "D": "Instrument repair and maintenance schedules"}',
 '{"correct": "B", "score_map": {"A": 0.0, "B": 1.0, "C": 0.0, "D": 0.0}}',
 true),

('a1000000-0000-0000-0000-000000000014', 'process', 'multiple_choice',
 'When is it acceptable to skip the decontamination step and send an instrument directly to assembly?',
 '{"A": "When the instrument came from a clean procedure", "B": "When the surgeon requests a fast turn", "C": "Never — all used instruments must go through decontam", "D": "Only for non-lumened instruments"}',
 '{"correct": "C", "score_map": {"A": 0.0, "B": 0.0, "C": 1.0, "D": 0.0}}',
 true),

('a1000000-0000-0000-0000-000000000015', 'process', 'multiple_choice',
 'A wet pack is discovered after steam sterilization. The correct action is:',
 '{"A": "Allow it to air dry on the counter", "B": "Reject the pack, investigate the cause, rewrap and re-process", "C": "Use the items immediately — drying time is only needed for shelf storage", "D": "Document it in the log and use the items if the BI was negative"}',
 '{"correct": "B", "score_map": {"A": 0.0, "B": 1.0, "C": 0.0, "D": 0.0}}',
 true),

-- ── BEHAVIORAL / CULTURE FIT (5) — category stored as 'behavioral' ─────────

('a1000000-0000-0000-0000-000000000016', 'behavioral', 'multiple_choice',
 'A coworker routinely skips the manual cleaning step when the department is busy. You should:',
 '{"A": "Match their workflow to keep up with volume", "B": "Report them to management anonymously", "C": "Address it professionally with your coworker, then escalate to the supervisor if the behavior continues", "D": "Leave a note in the communication log"}',
 '{"correct": "C", "score_map": {"A": 0.0, "B": 0.25, "C": 1.0, "D": 0.25}}',
 true),

('a1000000-0000-0000-0000-000000000017', 'behavioral', 'multiple_choice',
 'During a rush at end of shift, you realize you do not have time to finish a complex tray before handoff. You should:',
 '{"A": "Finish as fast as possible and mark it complete", "B": "Leave the tray where it is without comment", "C": "Communicate the status clearly to the oncoming shift and document where you left off", "D": "Ask a coworker to finish it without telling them the current state"}',
 '{"correct": "C", "score_map": {"A": 0.0, "B": 0.0, "C": 1.0, "D": 0.0}}',
 true),

('a1000000-0000-0000-0000-000000000018', 'behavioral', 'multiple_choice',
 'A new hospital policy requires double-checking instrument counts with a partner before releasing OR sets. Your initial reaction is:',
 '{"A": "This is unnecessary extra work and wastes time", "B": "Implement the policy, recognizing that count checks reduce errors and liability", "C": "Do it only when supervisors are watching", "D": "Ask to be exempt because you have never had a count error"}',
 '{"correct": "B", "score_map": {"A": 0.0, "B": 1.0, "C": 0.0, "D": 0.0}}',
 true),

('a1000000-0000-0000-0000-000000000019', 'behavioral', 'multiple_choice',
 'An OR charge nurse tells you a tray you assembled had a wrong instrument count. You should:',
 '{"A": "Deny it — you double-checked the count", "B": "Apologize, take responsibility, investigate your process, and implement a corrective action", "C": "Blame the OR tech who used the tray", "D": "Report it to the OR manager as an OR error"}',
 '{"correct": "B", "score_map": {"A": 0.0, "B": 1.0, "C": 0.0, "D": 0.0}}',
 true),

('a1000000-0000-0000-0000-000000000020', 'behavioral', 'multiple_choice',
 'The most important reason to wear full PPE in the decontamination room is:',
 '{"A": "To comply with hospital policy and avoid disciplinary action", "B": "To prevent exposure to bloodborne pathogens and sharps injuries", "C": "Because it makes you look professional", "D": "To keep your uniform clean"}',
 '{"correct": "B", "score_map": {"A": 0.25, "B": 1.0, "C": 0.0, "D": 0.0}}',
 true),

-- ── INSTRUMENT / WORKFLOW FAMILIARITY (5) ─────────────────────────────────

('a1000000-0000-0000-0000-000000000021', 'instrument', 'multiple_choice',
 'A box-lock instrument should be inspected in the OPEN position during assembly because:',
 '{"A": "It is easier to count instruments when open", "B": "Box-lock joints may trap debris and show wear that is invisible when the instrument is closed", "C": "Sterilant does not penetrate closed instruments as effectively", "D": "Instrument strings require open configuration"}',
 '{"correct": "B", "score_map": {"A": 0.0, "B": 1.0, "C": 0.25, "D": 0.0}}',
 true),

('a1000000-0000-0000-0000-000000000022', 'instrument', 'multiple_choice',
 'Which of the following instruments is used for blunt dissection and tissue manipulation, not cutting?',
 '{"A": "Metzenbaum scissors", "B": "Kelly hemostat", "C": "Adson forceps", "D": "#15 blade scalpel"}',
 '{"correct": "B", "score_map": {"A": 0.0, "B": 1.0, "C": 0.25, "D": 0.0}}',
 true),

('a1000000-0000-0000-0000-000000000023', 'instrument', 'multiple_choice',
 'Instruments with tungsten carbide inserts are typically identified by:',
 '{"A": "A gold ring or dot on the handle", "B": "A blue marker on the tip", "C": "A rubber ring at the hinge", "D": "A silver stripe on the shank"}',
 '{"correct": "A", "score_map": {"A": 1.0, "B": 0.0, "C": 0.0, "D": 0.0}}',
 true),

('a1000000-0000-0000-0000-000000000024', 'instrument', 'multiple_choice',
 'A preference card for a laparoscopic cholecystectomy lists 5mm trocar x3, 10mm trocar x1. During assembly you find only two 5mm trocars available. You should:',
 '{"A": "Substitute with a 12mm trocar for the third port", "B": "Notify the scheduler and OR nurse, and hold the case tray until the correct count is available or a substitution is approved", "C": "Send the tray with a note saying the third trocar is missing", "D": "Reassign the tray to a different case that needs fewer trocars"}',
 '{"correct": "B", "score_map": {"A": 0.0, "B": 1.0, "C": 0.25, "D": 0.0}}',
 true),

('a1000000-0000-0000-0000-000000000025', 'instrument', 'multiple_choice',
 'The purpose of using an ultrasonic cleaner in SPD is:',
 '{"A": "To sterilize instruments at low temperatures", "B": "To use cavitation to remove soil from instrument crevices and lumens that manual cleaning cannot reach", "C": "To replace manual scrubbing for all instruments", "D": "To remove rust and discoloration from stainless steel"}',
 '{"correct": "B", "score_map": {"A": 0.0, "B": 1.0, "C": 0.0, "D": 0.25}}',
 true),

-- ── RELIABILITY (5) ────────────────────────────────────────────────────────

('a1000000-0000-0000-0000-000000000026', 'reliability', 'multiple_choice',
 'The SPD department functions on a just-in-time model. Missing a scheduled shift has the most direct impact on:',
 '{"A": "The department overtime budget", "B": "OR case scheduling and patient safety if sterile instruments are unavailable", "C": "Your performance review rating", "D": "Coworker morale"}',
 '{"correct": "B", "score_map": {"A": 0.25, "B": 1.0, "C": 0.0, "D": 0.25}}',
 true),

('a1000000-0000-0000-0000-000000000027', 'reliability', 'multiple_choice',
 'You are feeling slightly ill before a shift. The professional action is:',
 '{"A": "Come to work and try to push through", "B": "Call in as soon as possible so staffing can be arranged, and follow your facility illness reporting protocol", "C": "Wait until the shift starts to decide", "D": "Ask a friend to cover informally without notifying the supervisor"}',
 '{"correct": "B", "score_map": {"A": 0.0, "B": 1.0, "C": 0.0, "D": 0.0}}',
 true),

('a1000000-0000-0000-0000-000000000028', 'reliability', 'multiple_choice',
 'You are assigned to finish instrument assembly for a trauma set before the end of shift, but you are running low on time. The right approach is:',
 '{"A": "Rush through assembly without checking the count", "B": "Communicate the situation to your supervisor before the deadline, not after", "C": "Leave the tray incomplete and hope the next shift has time", "D": "Skip documentation to save time"}',
 '{"correct": "B", "score_map": {"A": 0.0, "B": 1.0, "C": 0.0, "D": 0.0}}',
 true),

('a1000000-0000-0000-0000-000000000029', 'reliability', 'multiple_choice',
 'Your externship site asks you to be available for an extra day next month for a high-volume case day. You:',
 '{"A": "Decline — the externship agreement only covers set hours", "B": "Check your schedule and respond promptly with a clear yes or no", "C": "Say yes but do not confirm via the preferred communication channel", "D": "Ask why you were chosen before deciding"}',
 '{"correct": "B", "score_map": {"A": 0.0, "B": 1.0, "C": 0.25, "D": 0.0}}',
 true),

('a1000000-0000-0000-0000-000000000030', 'reliability', 'multiple_choice',
 'At the end of your first week, your preceptor gives you corrective feedback on instrument inspection technique. You:',
 '{"A": "Explain that you learned a different method in your training program", "B": "Thank them for the feedback, apply it immediately, and ask a clarifying question if needed", "C": "Nod but continue your original technique", "D": "Report the feedback difference to your program coordinator"}',
 '{"correct": "B", "score_map": {"A": 0.0, "B": 1.0, "C": 0.0, "D": 0.25}}',
 true)

ON CONFLICT (id) DO NOTHING;
