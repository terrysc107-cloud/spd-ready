---
phase: 06-learning-engine-intern-companion-ohiohealth-validated-framew
plan: 06
subsystem: certificates-marketing
tags: [nextjs, server-components, certificates, ce-credits, marketing]

requires:
  - phase: 06-01
    provides: Certificate type, LearningDomain, LEARNING_DOMAIN_META, store certificates[]
  - phase: 06-03
    provides: LikertSelfAssessment.tsx (extended here)
provides:
  - CE_CREDITS_BY_DOMAIN, DEFAULT_PARTNER_ISSUER, issueCertificate, getCertificatesForStudent, getCEStats DAL
  - issueCertificateOnCompletionAction Server Action
  - CertificateList component
  - /student/profile extended with CE stats + certificate list
  - (marketing)/page.tsx extended with OhioHealth-validated section
affects: []

tech-stack:
  added: []
  patterns: [cache() reads, single writeStore() per mutation, Server Component certificate list]

key-files:
  created:
    - spd-ready/src/lib/dal/certificates.ts
    - spd-ready/src/actions/certificates.ts
    - spd-ready/src/components/student/CertificateList.tsx
  modified:
    - spd-ready/src/components/student/LikertSelfAssessment.tsx
    - spd-ready/src/app/(student)/student/profile/page.tsx
    - spd-ready/src/app/(marketing)/page.tsx

key-decisions:
  - "Store certificates[] is an array — getCertificatesForStudent uses .filter(c => c.student_user_id === id)"
  - "issueCertificate uses .find() to mark only OLDEST open assignment complete (1:1 cert-to-assignment semantics)"
  - "Single writeStore() call after all mutations — cert push + assignment completion in one write"
  - "OHStat helper named OHStat (not Stat) to avoid conflict with any existing Stat in the file"

requirements-completed: []

duration: ~inline
completed: 2026-04-25
---

# Plan 06-06: Mock CE Certificates + Marketing Update Summary

**Certificate issuance on module completion, profile CE section, OhioHealth-validated marketing section**

## Performance

- **Duration:** inline execution
- **Tasks:** 3 of 3
- **Files created/modified:** 6

## Accomplishments
- `certificates.ts` DAL: `CE_CREDITS_BY_DOMAIN` (hld/decontamination=3, others 1-2), `issueCertificate` with 1:1 assignment completion, `getCEStats`
- `issueCertificateOnCompletionAction` fires after Likert submit inside `LikertSelfAssessment`
- `CertificateList` Server Component renders domain icon, issued date, partner_issuer, CE credits
- `/student/profile` read-only branch shows CE credits total + certificate list
- Marketing landing page `/` now includes "OhioHealth-validated framework" section with +41pp K, +29pp C, 40% error reduction, $500k/SPD/yr stats and source citation

## Task Commits

1. **Task 1: Certificates DAL + Action** — `35e4f32`
2. **Task 2: LikertSelfAssessment + CertificateList + profile** — `35e4f32`
3. **Task 3: Marketing landing update** — `35e4f32`

## Key Deviations
- Adapted store access from `store.certificates[studentUserId]` (Record pattern in plan) to `store.certificates.filter(...)` (actual array)
- Named helper `OHStat` instead of `Stat` to avoid potential shadowing in the marketing page file

---
*Phase: 06-learning-engine-intern-companion-ohiohealth-validated-framew*
*Completed: 2026-04-25*
