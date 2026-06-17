// Feature flags. The student/hospital externship MARKETPLACE is archived
// while SPD Ready is repositioned as the staff competency/training platform.
// Its routes are moved under src/app/_archive_* (not routed by Next.js); this
// flag additionally gates any surviving nav links to those surfaces.
//
// Parked idea: externship placement may return as a feature of SPD Cert Prep.
export const MARKETPLACE_ENABLED =
  process.env.NEXT_PUBLIC_MARKETPLACE_ENABLED === 'true'
