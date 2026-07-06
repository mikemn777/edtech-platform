/* eslint-disable no-console */
/**
 * DEMO login accounts — one per actor role so you can sign in and experience each
 * side of the platform (student, parent, tutor). Idempotent by email.
 *
 * Creates identity + password credential + account + role + a matching profile.
 * The tutor also gets a VERIFIED profile with an offering and availability, so it
 * appears in the marketplace and can be booked.
 *
 * Run (from repo root, database up):
 *   $env:DATABASE_URL="postgresql://edu_app:change_me_in_local_only@localhost:5432/edu_platform?schema=public"
 *   pnpm --filter @edu/backend exec ts-node --transpile-only prisma/seed.demo-accounts.ts
 *
 * Logins created:
 *   student@demo.edu / Student12345!
 *   parent@demo.edu  / Parent12345!
 *   tutor@demo.edu   / Tutor12345!
 */
import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function baseAccount(email: string, name: string, password: string, roleName: string): Promise<string | null> {
  const normalized = email.toLowerCase().trim();
  const existing = await prisma.identity.findUnique({ where: { primaryEmail: normalized } });
  if (existing) { console.log(`  • ${name} already exists — skipping.`); return null; }

  const secretReference = await argon2.hash(password, { type: argon2.argon2id });
  const role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) throw new Error(`Role ${roleName} missing — run the main seed first.`);

  const accountId = await prisma.$transaction(async (tx) => {
    const identity = await tx.identity.create({ data: { primaryEmail: normalized } });
    await tx.authCredential.create({ data: { identityId: identity.id, method: 'PASSWORD', secretReference } });
    const account = await tx.userAccount.create({ data: { identityId: identity.id, displayName: name } });
    await tx.accountRole.create({ data: { accountId: account.id, roleId: role.id, createdBy: account.id } });
    return account.id;
  });
  console.log(`  ✓ ${name} (${roleName}) — ${email}`);
  return accountId;
}

function upcomingSlots(): { startAt: Date; endAt: Date }[] {
  const slots: { startAt: Date; endAt: Date }[] = [];
  const now = new Date();
  for (let day = 1; day <= 5; day++) {
    for (const hour of [15, 17]) {
      const start = new Date(now); start.setDate(now.getDate() + day); start.setHours(hour, 0, 0, 0);
      const end = new Date(start); end.setHours(hour + 1);
      slots.push({ startAt: start, endAt: end });
    }
  }
  return slots;
}

async function main(): Promise<void> {
  console.log('Seeding demo login accounts...');

  const studentId = await baseAccount('student@demo.edu', 'Demo Student', 'Student12345!', 'student');
  if (studentId) await prisma.studentProfile.create({ data: { accountId: studentId, isMinor: false } });

  const parentId = await baseAccount('parent@demo.edu', 'Demo Parent', 'Parent12345!', 'parent');
  if (parentId) await prisma.parentProfile.create({ data: { accountId: parentId } });

  const tutorId = await baseAccount('tutor@demo.edu', 'Demo Tutor', 'Tutor12345!', 'tutor');
  if (tutorId) {
    const profile = await prisma.tutorProfile.create({
      data: {
        accountId: tutorId,
        headline: 'Demo Tutor — Mathematics & Science',
        bio: 'A demo tutor account so you can experience the tutor side of the platform.',
        verificationStatus: 'VERIFIED', ratingAverage: 4.8, ratingCount: 24,
      },
    });
    await prisma.tutorSubject.create({ data: { tutorId: profile.id, subject: 'mathematics' } });
    await prisma.tutorOffering.create({ data: { tutorId: profile.id, subject: 'mathematics', title: 'Maths Tutoring (Demo)', description: 'One-on-one maths help.', basePrice: 38, status: 'ACTIVE' } });
    for (const s of upcomingSlots()) await prisma.tutorAvailability.create({ data: { tutorId: profile.id, startAt: s.startAt, endAt: s.endAt, status: 'ACTIVE' } });
  }

  console.log('Demo accounts complete.');
  console.log('  student@demo.edu / Student12345!');
  console.log('  parent@demo.edu  / Parent12345!');
  console.log('  tutor@demo.edu   / Tutor12345!');
}

main()
  .catch((err) => { console.error('Demo accounts seed failed:', err); process.exitCode = 1; })
  .finally(() => { void prisma.$disconnect(); });