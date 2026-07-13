/* eslint-disable no-console */
/**
 * Self-service permission grants — enables actor features (favorites now; goals,
 * progress, and booking next) by ensuring the Phase-2b permission rows exist and
 * granting them to the appropriate roles. Idempotent (upserts only).
 *
 * This does NOT invent business rules; it wires the already-defined permission
 * catalog (Roles §15.2) to roles so the built endpoints are reachable.
 *
 * Run (from repo root, database up):
 *   $env:DATABASE_URL="postgresql://edu_app:change_me_in_local_only@localhost:5432/edu_platform?schema=public"
 *   pnpm --filter @edu/backend exec ts-node --transpile-only prisma/seed.grants.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Perm { key: string; domain: string; high?: boolean }

const PERMS: Perm[] = [
  { key: 'marketplace.favorite.manage', domain: 'marketplace' },
  { key: 'student.profile.read', domain: 'student' },
  { key: 'student.profile.manage', domain: 'student' },
  { key: 'student.goal.manage', domain: 'student' },
  { key: 'student.goal.read', domain: 'student' },
  { key: 'student.progress.manage', domain: 'student' },
  { key: 'student.progress.read', domain: 'student' },
  { key: 'parent.child.monitor', domain: 'parent', high: true },
  { key: 'booking.request.create', domain: 'booking' },
  { key: 'booking.request.read', domain: 'booking' },
  { key: 'booking.request.decide', domain: 'booking', high: true },
  { key: 'booking.request.cancel', domain: 'booking' },
  { key: 'tutor.subject.manage', domain: 'tutor' },
  { key: 'tutor.language.manage', domain: 'tutor' },
  { key: 'tutor.rate.manage', domain: 'tutor' },
  { key: 'tutor.dashboard.read', domain: 'tutor' },
  { key: 'tutor.profile.read', domain: 'tutor' },
  { key: 'tutor.profile.manage', domain: 'tutor' },
  { key: 'tutor.availability.manage', domain: 'tutor' },
  { key: 'course.course.read', domain: 'curriculum' },
  { key: 'course.course.manage', domain: 'curriculum' },
  { key: 'course.enrollment.manage', domain: 'curriculum' },
  { key: 'tutor.verification.read', domain: 'tutor', high: false },
  { key: 'tutor.verification.manage', domain: 'tutor', high: true },
  { key: 'tutor.verification.decide', domain: 'tutor', high: true },
  { key: 'relationship.link.read', domain: 'relationships' },
  { key: 'relationship.link.manage', domain: 'relationships', high: true },
  { key: 'assignment.assignment.manage', domain: 'assignment' },
  { key: 'assignment.assignment.read', domain: 'assignment' },
  { key: 'assignment.submission.manage', domain: 'assignment' },
  { key: 'assessment.assessment.manage', domain: 'assessment' },
  { key: 'assessment.assessment.read', domain: 'assessment' },
  { key: 'assessment.submission.manage', domain: 'assessment' },
  // Live sessions: safe to grant now that object-level authorization (P0-1)
  // restricts start/join/complete/cancel to the two assigned parties.
  { key: 'livesession.session.manage', domain: 'livesession', high: true },
  { key: 'livesession.session.join', domain: 'livesession', high: true },
  { key: 'resource.resource.manage', domain: 'resource' },
  { key: 'resource.resource.read', domain: 'resource' },
  { key: 'note.note.manage', domain: 'note' },
  { key: 'certificate.certificate.issue', domain: 'certificate', high: true },
  { key: 'certificate.certificate.read', domain: 'certificate' },
  { key: 'progress.progress.read', domain: 'progress' },
];

const GRANTS: Record<string, string[]> = {
  super_admin: PERMS.map((p) => p.key), // admin test account can use everything
  student: [
    'marketplace.favorite.manage',
    'student.profile.read', 'student.profile.manage',
    'student.goal.manage', 'student.goal.read', 'student.progress.read',
    'booking.request.create', 'booking.request.read', 'booking.request.cancel',
    'course.course.read', 'course.enrollment.manage',
    'assignment.assignment.read', 'assignment.submission.manage',
    'assessment.assessment.read', 'assessment.submission.manage',
    'livesession.session.join',
    'note.note.manage', 'certificate.certificate.read', 'progress.progress.read',
  ],
  parent: [
    'marketplace.favorite.manage', 'parent.child.monitor', 'booking.request.read',
    'relationship.link.read', 'relationship.link.manage',
    'note.note.manage',
  ],
  tutor: [
    'tutor.profile.read', 'tutor.profile.manage', 'tutor.availability.manage',
    'tutor.subject.manage', 'tutor.language.manage', 'tutor.rate.manage', 'tutor.dashboard.read',
    'booking.request.decide', 'booking.request.read', 'booking.request.cancel',
    'assignment.assignment.manage', 'assignment.assignment.read',
    'assessment.assessment.manage', 'assessment.assessment.read',
    'livesession.session.manage', 'livesession.session.join',
    'note.note.manage', 'resource.resource.manage', 'resource.resource.read',
    'certificate.certificate.issue',
  ],
};

async function main(): Promise<void> {
  console.log('Ensuring self-service permissions exist...');
  const idByKey = new Map<string, string>();
  for (const p of PERMS) {
    const perm = await prisma.permission.upsert({
      where: { key: p.key },
      update: {},
      create: { key: p.key, description: p.key, domainArea: p.domain, sensitivity: p.high ? 'high_risk' : 'normal' },
    });
    idByKey.set(p.key, perm.id);
  }

  let grants = 0;
  for (const [roleName, keys] of Object.entries(GRANTS)) {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) { console.log(`  ! role "${roleName}" not found — skipping`); continue; }
    for (const key of keys) {
      const permissionId = idByKey.get(key);
      if (!permissionId) continue;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId } },
        update: { isDeleted: false },
        create: { roleId: role.id, permissionId },
      });
      grants++;
    }
    console.log(`  ✓ ${roleName}: ${keys.length} permissions`);
  }
  console.log(`Grants complete. ${PERMS.length} permissions ensured, ${grants} role grants applied.`);
  console.log('NOTE: sign out and sign back in so your new permissions load into your session token.');
}

main()
  .catch((err) => { console.error('Grants seed failed:', err); process.exitCode = 1; })
  .finally(() => { void prisma.$disconnect(); });
