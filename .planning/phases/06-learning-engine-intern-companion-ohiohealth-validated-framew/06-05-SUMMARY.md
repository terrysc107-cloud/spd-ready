---
phase: 06-learning-engine-intern-companion-ohiohealth-validated-framew
plan: 05
subsystem: hospital-cohort
tags: [nextjs, server-components, cohort, roi, hospital]

requires:
  - phase: 06-01
    provides: LearningDomain types, ModuleAssignment, HospitalCohortMember, ERROR_CATEGORIES, DOMAIN_ERROR_MAP
  - phase: 06-03
    provides: getConceptMastery, getAllDomainAssessments, likertToPct, deltaPp
provides:
  - getCohortMembers DAL — per-member mastery + K/C delta aggregation
  - getCohortMemberDetail DAL — 7-domain breakdown + assignment history
  - getCohortROI DAL — cohort-aggregated savings projection
  - addStudentToCohortAction, assignModuleAction Server Actions
  - /hospital/cohort page with AddStudentForm + CohortTable
  - /hospital/cohort/[studentId] page with domain breakdown + AssignModuleForm
  - /hospital/cohort/roi page with ROIProjection
affects: [06-04 (students see assigned modules), 06-06]

tech-stack:
  added: []
  patterns: [Server Component pages, cache() DAL reads, Client Component forms with useTransition]

key-files:
  created:
    - spd-ready/src/lib/dal/cohort.ts
    - spd-ready/src/actions/cohort.ts
    - spd-ready/src/components/hospital/CohortTable.tsx
    - spd-ready/src/components/hospital/AddStudentForm.tsx
    - spd-ready/src/components/hospital/AssignModuleForm.tsx
    - spd-ready/src/components/hospital/ROIProjection.tsx
    - spd-ready/src/app/(hospital)/hospital/cohort/page.tsx
    - spd-ready/src/app/(hospital)/hospital/cohort/[studentId]/page.tsx
    - spd-ready/src/app/(hospital)/hospital/cohort/roi/page.tsx

key-decisions:
  - "Store arrays (hospital_cohort[], module_assignments[]) require .filter() not Object.values() — plan code adapted"
  - "ROI uses AVERAGE of K-delta and C-delta (not sum) per D-28 clarification — prevents 2x inflation"
  - "AssignModuleForm shows DOMAIN_ERROR_MAP categories so coordinator sees error reduction impact at assignment time"

requirements-completed: []

duration: ~inline
completed: 2026-04-25
---

# Plan 06-05: Hospital Cohort + ROI Summary

**Hospital coordinator cohort table, per-student domain breakdown, module assignment with error-category preview, ROI projection panel**

## Performance

- **Duration:** inline execution
- **Tasks:** 3 of 3
- **Files created:** 9

## Accomplishments
- `cohort.ts` DAL aggregates per-member mastery, K/C deltas, module completion counts, last activity
- `getCohortROI` computes projected savings using OhioHealth benchmarks ($158k/pp, $6,185/event, 40% max)
- `addStudentToCohortAction` looks up student by email against local-db users
- `assignModuleAction` creates assignment and revalidates student study + learning pages
- `/hospital/cohort` lists cohort with AddStudentForm + CohortTable; links to ROI page
- `/hospital/cohort/[studentId]` shows 7-domain breakdown, AssignModuleForm, assignment history
- `/hospital/cohort/roi` renders full ROI projection with methodology footnote
- `AssignModuleForm` shows DOMAIN_ERROR_MAP categories ("Completing this reduces: Missing Indicator risk")

## Task Commits

1. **Task 1: Cohort DAL + Actions** — `2f4e979` (partial)
2. **Task 2: Components** — `2f4e979` (partial)
3. **Task 3: Pages** — `2f4e979` (feat)

## Key Deviations
- Adapted all plan code from `Record<string, ...>` to array access patterns to match actual store schema

---
*Phase: 06-learning-engine-intern-companion-ohiohealth-validated-framew*
*Completed: 2026-04-25*
