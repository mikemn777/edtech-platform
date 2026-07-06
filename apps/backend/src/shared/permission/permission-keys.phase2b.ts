/**
 * Phase 2b permission catalog (Roles §15.2 — explicit grants only). Additive to
 * the Phase 1 and Phase 2 catalogs; merged at runtime; deny-by-default holds.
 */
export const PHASE2B_PERMISSIONS = {
  // Tutor catalog (self-managed by the tutor)
  TUTOR_SUBJECT_MANAGE: 'tutor.subject.manage',
  TUTOR_LANGUAGE_MANAGE: 'tutor.language.manage',
  TUTOR_RATE_MANAGE: 'tutor.rate.manage',
  TUTOR_DASHBOARD_READ: 'tutor.dashboard.read',

  // Student learning
  STUDENT_GOAL_MANAGE: 'student.goal.manage',
  STUDENT_GOAL_READ: 'student.goal.read',
  STUDENT_PROGRESS_MANAGE: 'student.progress.manage',
  STUDENT_PROGRESS_READ: 'student.progress.read',

  // Parent child monitoring (guardianship-gated; oversight rules PBD)
  CHILD_MONITOR_READ: 'parent.child.monitor',

  // Favorites
  FAVORITE_MANAGE: 'marketplace.favorite.manage',

  // Booking
  BOOKING_CREATE: 'booking.request.create',
  BOOKING_READ: 'booking.request.read',
  BOOKING_DECIDE: 'booking.request.decide', // tutor/admin confirm/reject
  BOOKING_CANCEL: 'booking.request.cancel',
} as const;

export type Phase2bPermissionKey =
  (typeof PHASE2B_PERMISSIONS)[keyof typeof PHASE2B_PERMISSIONS];
