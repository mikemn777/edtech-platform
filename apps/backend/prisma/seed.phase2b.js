"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-console */
/**
 * Phase 2b seed (additive; run after Phase 1 and Phase 2 seeds). Registers the
 * Phase 2b permission catalog and grants OPERATIONAL permissions to operational
 * roles. Actor-role self-service grants (student managing own goals, tutor own
 * catalog) still await self-scope enforcement and remain deferred (deny-by-default
 * protects data, especially minors — Art. VI). Idempotent.
 */
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const P = {
    TUTOR_SUBJECT_MANAGE: 'tutor.subject.manage',
    TUTOR_LANGUAGE_MANAGE: 'tutor.language.manage',
    TUTOR_RATE_MANAGE: 'tutor.rate.manage',
    TUTOR_DASHBOARD_READ: 'tutor.dashboard.read',
    STUDENT_GOAL_MANAGE: 'student.goal.manage',
    STUDENT_GOAL_READ: 'student.goal.read',
    STUDENT_PROGRESS_MANAGE: 'student.progress.manage',
    STUDENT_PROGRESS_READ: 'student.progress.read',
    CHILD_MONITOR_READ: 'parent.child.monitor',
    FAVORITE_MANAGE: 'marketplace.favorite.manage',
    BOOKING_CREATE: 'booking.request.create',
    BOOKING_READ: 'booking.request.read',
    BOOKING_DECIDE: 'booking.request.decide',
    BOOKING_CANCEL: 'booking.request.cancel',
};
const ALL = Object.values(P);
const HIGH_RISK = new Set([P.BOOKING_DECIDE, P.CHILD_MONITOR_READ]);
const DOMAIN = Object.fromEntries(ALL.map((k) => [k, k.split('.')[0]]));
// Operational roles only (audited, trusted). Admin gets broad operational reach;
// booking decisions also belong to tutors, but tutor is an ACTOR role requiring
// self-scope enforcement — deferred, so not granted here.
const GRANTS = {
    super_admin: ALL,
    admin: ALL,
    support: [P.BOOKING_READ, P.STUDENT_GOAL_READ, P.STUDENT_PROGRESS_READ, P.TUTOR_DASHBOARD_READ],
    moderator: [P.TUTOR_DASHBOARD_READ],
};
async function main() {
    console.log('Seeding Phase 2b permissions...');
    const ids = new Map();
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
        ids.set(key, perm.id);
    }
    for (const [roleName, keys] of Object.entries(GRANTS)) {
        const role = await prisma.role.findUnique({ where: { name: roleName } });
        if (!role) {
            console.warn(`Role ${roleName} missing; run earlier seeds first. Skipping.`);
            continue;
        }
        for (const key of keys) {
            const permissionId = ids.get(key);
            if (!permissionId)
                continue;
            await prisma.rolePermission.upsert({
                where: { roleId_permissionId: { roleId: role.id, permissionId } },
                update: { isDeleted: false },
                create: { roleId: role.id, permissionId },
            });
        }
    }
    console.log(`Phase 2b seed complete: ${ALL.length} permissions.`);
}
main()
    .catch((err) => {
    console.error('Phase 2b seed failed:', err);
    process.exitCode = 1;
})
    .finally(() => void prisma.$disconnect());
//# sourceMappingURL=seed.phase2b.js.map