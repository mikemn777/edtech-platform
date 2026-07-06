/* eslint-disable no-console */
/**
 * DEMO family link — connects parent@demo.edu to student@demo.edu with an ACTIVE
 * guardianship so the parent monitoring experience works locally. Idempotent.
 *
 * Run:
 *   $env:DATABASE_URL="postgresql://edu_app:change_me_in_local_only@localhost:5432/edu_platform?schema=public"
 *   pnpm --filter @edu/backend exec ts-node --transpile-only prisma/seed.demo-family.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function accountByEmail(email: string) {
  const idn = await prisma.identity.findUnique({ where: { primaryEmail: email } });
  if (!idn) return null;
  return prisma.userAccount.findFirst({ where: { identityId: idn.id, isDeleted: false } });
}

async function main(): Promise<void> {
  const parent = await accountByEmail('parent@demo.edu');
  const student = await accountByEmail('student@demo.edu');
  if (!parent || !student) throw new Error('Demo parent/student accounts missing — run seed.demo-accounts first.');

  const existing = await prisma.accountRelationship.findFirst({
    where: { fromAccountId: parent.id, toAccountId: student.id, relationshipType: 'guardian_of', isDeleted: false },
  });
  if (existing) {
    if (existing.status !== 'active') {
      await prisma.accountRelationship.update({ where: { id: existing.id }, data: { status: 'active' } });
      console.log('Guardianship activated.');
    } else console.log('Guardianship already active.');
  } else {
    await prisma.accountRelationship.create({
      data: { fromAccountId: parent.id, toAccountId: student.id, relationshipType: 'guardian_of', status: 'active', createdBy: parent.id },
    });
    console.log('Guardianship created ACTIVE: parent@demo.edu -> student@demo.edu');
  }
  console.log('Demo family complete.');
}

main()
  .catch((err) => { console.error('Demo family seed failed:', err); process.exitCode = 1; })
  .finally(() => { void prisma.$disconnect(); });
