/**
 * Phase 2 permission catalog extension (Roles §15.2 — explicit grants only).
 *
 * Added as a separate module to avoid modifying the Phase 1 catalog. Merged into
 * the effective catalog via `ALL_PERMISSION_KEYS`. Deny-by-default still holds:
 * absence of a key is a denial (Roles §15.4). Actor-role grants for these remain
 * Pending Business Decisions (guardianship/eligibility — BR-102/BR-105).
 */
export const PHASE2_PERMISSIONS = {
  // Actor profiles (self-managed by the owning actor)
  STUDENT_PROFILE_READ: 'student.profile.read',
  STUDENT_PROFILE_MANAGE: 'student.profile.manage',
  PARENT_PROFILE_READ: 'parent.profile.read',
  PARENT_PROFILE_MANAGE: 'parent.profile.manage',
  TUTOR_PROFILE_READ: 'tutor.profile.read',
  TUTOR_PROFILE_MANAGE: 'tutor.profile.manage',

  // Tutor offerings & availability (self-managed by the tutor)
  TUTOR_OFFERING_MANAGE: 'tutor.offering.manage',
  TUTOR_AVAILABILITY_MANAGE: 'tutor.availability.manage',

  // Tutor verification (operational — Moderator/Admin per Roles §12)
  TUTOR_VERIFICATION_READ: 'tutor.verification.read',
  TUTOR_VERIFICATION_MANAGE: 'tutor.verification.manage',
  TUTOR_VERIFICATION_DECIDE: 'tutor.verification.decide',

  // Parent–Student relationships (guardianship — rules PBD)
  RELATIONSHIP_READ: 'relationship.link.read',
  RELATIONSHIP_MANAGE: 'relationship.link.manage',
} as const;

export type Phase2PermissionKey =
  (typeof PHASE2_PERMISSIONS)[keyof typeof PHASE2_PERMISSIONS];

/** High-risk Phase 2 actions requiring separation-of-duties care (Roles §16.5). */
export const PHASE2_HIGH_RISK: ReadonlySet<string> = new Set<string>([
  PHASE2_PERMISSIONS.TUTOR_VERIFICATION_DECIDE,
  PHASE2_PERMISSIONS.RELATIONSHIP_MANAGE,
]);
