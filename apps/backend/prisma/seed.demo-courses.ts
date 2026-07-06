/* eslint-disable no-console */
/**
 * DEMO courses — a few PUBLISHED courses so the catalog and enrollments have
 * real content in local development. Idempotent by title.
 *
 * Run (from repo root, database up):
 *   $env:DATABASE_URL="postgresql://edu_app:change_me_in_local_only@localhost:5432/edu_platform?schema=public"
 *   pnpm --filter @edu/backend exec ts-node --transpile-only prisma/seed.demo-courses.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const COURSES = [
  { title: 'Algebra Foundations', subject: 'mathematics', description: 'Master equations, functions, and graphs step by step.' },
  { title: 'Physics: Mechanics Essentials', subject: 'physics', description: 'Motion, forces, and energy with worked examples.' },
  { title: 'English Writing Workshop', subject: 'english', description: 'Structure clear paragraphs and essays with confidence.' },
  { title: 'Intro to Programming with Python', subject: 'computer science', description: 'Learn coding logic by building small projects.' },
];

async function main(): Promise<void> {
  console.log('Seeding demo courses...');
  const admin = await prisma.identity.findUnique({ where: { primaryEmail: 'admin@edu.local' } });
  const account = admin ? await prisma.userAccount.findFirst({ where: { identityId: admin.id } }) : null;
  if (!account) throw new Error('Admin account not found — run the main seed first.');

  let created = 0;
  for (const c of COURSES) {
    const existing = await prisma.course.findFirst({ where: { title: c.title, isDeleted: false } });
    if (existing) { console.log(`  • ${c.title} — exists`); continue; }
    await prisma.course.create({
      data: { title: c.title, subject: c.subject, description: c.description, ownerAccountId: account.id, status: 'PUBLISHED', createdBy: account.id },
    });
    console.log(`  ✓ ${c.title}`);
    created++;
  }
  console.log(`Demo courses complete. ${created} created, ${COURSES.length - created} already present.`);
}

main()
  .catch((err) => { console.error('Demo courses seed failed:', err); process.exitCode = 1; })
  .finally(() => { void prisma.$disconnect(); });
