/* eslint-disable no-console */
/**
 * Phase 2 seed (additive; run after the Phase 1 seed).
 *
 * Registers the Phase 2 permission catalog and grants the new OPERATIONAL
 * permissions to operational roles only (super_admin, admin, moderator).
 *
 * Actor-role (student/parent/tutor) self-service grants are intentionally NOT
 * seeded: broad permission grants without per-object self-scope enforcement
 * would let any actor edit another's profile — unsafe, especially for minor data
 * (Constitution Art. VI; Roles §16.2). Those grants await self-scope enforcement
 * and the relevant Pending Business Decisions (BR-102). Deny-by-default holds.
 *
 * Idempotent (upserts only); does not modify Phase 1 seed data.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PHASE2_PERMISSIONS = {
  STUDENT_PROFILE_READ: 'student.profile.read',
  STUDENT_PROFILE_MANAGE: 'student.profile.manage',
  PARENT_PROFILE_READ: 'parent.profile.read',
  PARENT_PROFILE_MANAGE: 'parent.profile.manage',
  TUTOR_PROFILE_READ: 'tutor.profile.read',
  TUTOR_PROFILE_MANAGE: 'tutor.profile.manage',
  TUTOR_OFFERING_MANAGE: 'tutor.offering.manage',
  TUTOR_AVAILABILITY_MANAGE: 'tutor.availability.manage',
  TUTOR_VERIFICATION_READ: 'tutor.verification.read',
  TUTOR_VERIFICATION_MANAGE: 'tutor.verification.manage',
  TUTOR_VERIFICATION_DECIDE: 'tutor.verification.decide',
  RELATIONSHIP_READ: 'relationship.link.read',
  RELATIONSHIP_MANAGE: 'relationship.link.manage',
} as const;

const ALL = Object.values(PHASE2_PERMISSIONS);
const HIGH_RISK = new Set<string>([
  PHASE2_PERMISSIONS.TUTOR_VERIFICATION_DECIDE,
  PHASE2_PERMISSIONS.RELATIONSHIP_MANAGE,
]);

const DOMAIN: Record<string, string> = {
  'student.profile.read': 'student',
  'student.profile.manage': 'student',
  'parent.profile.read': 'parent',
  'parent.profile.manage': 'parent',
  'tutor.profile.read': 'tutor',
  'tutor.profile.manage': 'tutor',
  'tutor.offering.manage': 'tutor',
  'tutor.availability.manage': 'tutor-availability',
  'tutor.verification.read': 'tutor-verification',
  'tutor.verification.manage': 'tutor-verification',
  'tutor.verification.decide': 'tutor-verification',
  'relationship.link.read': 'relationships',
  'relationship.link.manage': 'relationships',
};

const ROLE_GRANTS: Record<string, string[]> = {
  super_admin: ALL,
  admin: [
    PHASE2_PERMISSIONS.STUDENT_PROFILE_READ,
    PHASE2_PERMISSIONS.STUDENT_PROFILE_MANAGE,
    PHASE2_PERMISSIONS.PARENT_PROFILE_READ,
    PHASE2_PERMISSIONS.PARENT_PROFILE_MANAGE,
    PHASE2_PERMISSIONS.TUTOR_PROFILE_READ,
    PHASE2_PERMISSIONS.TUTOR_PROFILE_MANAGE,
    PHASE2_PERMISSIONS.TUTOR_OFFERING_MANAGE,
    PHASE2_PERMISSIONS.TUTOR_AVAILABILITY_MANAGE,
    PHASE2_PERMISSIONS.TUTOR_VERIFICATION_READ,
    PHASE2_PERMISSIONS.TUTOR_VERIFICATION_MANAGE,
    PHASE2_PERMISSIONS.TUTOR_VERIFICATION_DECIDE,
    PHASE2_PERMISSIONS.RELATIONSHIP_READ,
    PHASE2_PERMISSIONS.RELATIONSHIP_MANAGE,
  ],
  moderator: [
    PHASE2_PERMISSIONS.TUTOR_PROFILE_READ,
    PHASE2_PERMISSIONS.TUTOR_VERIFICATION_READ,
    PHASE2_PERMISSIONS.TUTOR_VERIFICATION_MANAGE,
    PHASE2_PERMISSIONS.TUTOR_VERIFICATION_DECIDE,
  ],
};

async function seedPermissions(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  for (const key of ALL) {
    const perm = await prisma.permission.upsert({
      where: { key },
      update: {},
      create: {
        key,
        description: key,
        domainArea: DOMAIN[key] ?? 'platform',
        sensitivity: HIGH_RISK.has(key) ? 'high_risk' : 'normal',
      },
    });
    map.set(key, perm.id);
  }
  console.log(`Seeded ${map.size} Phase 2 permissions.`);
  return map;
}

async function grant(permIds: Map<string, string>): Promise<void> {
  for (const [roleName, keys] of Object.entries(ROLE_GRANTS)) {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) {
      console.warn(`Role ${roleName} missing; run the Phase 1 seed first. Skipping.`);
      continue;
    }
    for (const key of keys) {
      const permissionId = permIds.get(key);
      if (!permissionId) continue;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId } },
        update: { isDeleted: false },
        create: { roleId: role.id, permissionId },
      });
    }
  }
  console.log('Granted Phase 2 permissions to operational roles.');
}

async function main(): Promise<void> {
  console.log('Seeding Phase 2 marketplace permissions...');
  const permIds = await seedPermissions();
  await grant(permIds);
  console.log('Phase 2 seed complete.');
}

main()
  .catch((err) => {
    console.error('Phase 2 seed failed:', err);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
