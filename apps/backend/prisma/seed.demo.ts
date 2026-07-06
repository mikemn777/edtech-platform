/* eslint-disable no-console */
/**
 * DEMO seed — sample verified tutors so the marketplace and tutor profiles show
 * real content in local development. Safe to run repeatedly (idempotent by email).
 *
 * This creates: an identity + user account per tutor, a VERIFIED tutor profile,
 * ACTIVE offerings (subjects stored lowercase to match discovery filters), a few
 * subjects, and upcoming availability slots. It invents no business/pricing rule —
 * prices are indicative only (currency left unset), consistent with the Constitution.
 *
 * Run (from apps/backend, with the database up):
 *   $env:DATABASE_URL="postgresql://edu_app:change_me_in_local_only@localhost:5432/edu_platform?schema=public"
 *   npx ts-node --transpile-only prisma/seed.demo.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface DemoOffering { subject: string; title: string; description: string; basePrice: number }
interface DemoTutor {
  email: string;
  name: string;
  headline: string;
  bio: string;
  subjects: string[];
  ratingAverage: number;
  ratingCount: number;
  offerings: DemoOffering[];
}

const TUTORS: DemoTutor[] = [
  {
    email: 'sara.math@demo.edu', name: 'Sara Ahmed',
    headline: 'Sara Ahmed — Mathematics & Physics',
    bio: 'Experienced STEM tutor helping high-school students master mathematics and physics with clear, step-by-step methods.',
    subjects: ['mathematics', 'physics'], ratingAverage: 4.9, ratingCount: 128,
    offerings: [
      { subject: 'mathematics', title: 'High School Mathematics', description: 'Algebra, calculus, and exam preparation.', basePrice: 40 },
      { subject: 'physics', title: 'High School Physics', description: 'Mechanics, electricity, and problem solving.', basePrice: 45 },
    ],
  },
  {
    email: 'omar.eng@demo.edu', name: 'Omar Khalil',
    headline: 'Omar Khalil — English Language & IELTS',
    bio: 'Certified English tutor focused on speaking confidence, writing, and IELTS band improvement.',
    subjects: ['english'], ratingAverage: 4.8, ratingCount: 96,
    offerings: [
      { subject: 'english', title: 'English Conversation & Writing', description: 'Fluency, grammar, and academic writing.', basePrice: 35 },
    ],
  },
  {
    email: 'layla.chem@demo.edu', name: 'Layla Nasser',
    headline: 'Layla Nasser — Chemistry & Biology',
    bio: 'Biochemistry graduate making science intuitive for middle and high-school learners.',
    subjects: ['chemistry', 'biology'], ratingAverage: 5.0, ratingCount: 61,
    offerings: [
      { subject: 'chemistry', title: 'Chemistry Foundations', description: 'Atomic structure, reactions, and lab concepts.', basePrice: 42 },
      { subject: 'biology', title: 'Biology Made Simple', description: 'Cells, genetics, and human systems.', basePrice: 42 },
    ],
  },
  {
    email: 'yusuf.cs@demo.edu', name: 'Yusuf Demir',
    headline: 'Yusuf Demir — Computer Science & Coding',
    bio: 'Software engineer teaching programming, algorithms, and problem solving for beginners to advanced.',
    subjects: ['computer science'], ratingAverage: 4.7, ratingCount: 74,
    offerings: [
      { subject: 'computer science', title: 'Intro to Programming', description: 'Python, logic, and building real projects.', basePrice: 50 },
    ],
  },
  {
    email: 'huda.arabic@demo.edu', name: 'Huda Salem',
    headline: 'Huda Salem — Arabic Language',
    bio: 'Native Arabic educator specializing in grammar, reading, and writing for all levels.',
    subjects: ['arabic'], ratingAverage: 4.9, ratingCount: 143,
    offerings: [
      { subject: 'arabic', title: 'Arabic for All Levels', description: 'Reading, grammar (nahw), and composition.', basePrice: 30 },
    ],
  },
  {
    email: 'ali.math2@demo.edu', name: 'Ali Rahman',
    headline: 'Ali Rahman — Elementary & Middle School Math',
    bio: 'Patient tutor building strong foundations and confidence for younger learners.',
    subjects: ['mathematics'], ratingAverage: 4.6, ratingCount: 38,
    offerings: [
      { subject: 'mathematics', title: 'Foundational Mathematics', description: 'Arithmetic, fractions, and early algebra.', basePrice: 28 },
    ],
  },
];

function upcomingSlots(): { startAt: Date; endAt: Date }[] {
  const slots: { startAt: Date; endAt: Date }[] = [];
  const now = new Date();
  for (let day = 1; day <= 5; day++) {
    for (const hour of [16, 18]) {
      const start = new Date(now);
      start.setDate(now.getDate() + day);
      start.setHours(hour, 0, 0, 0);
      const end = new Date(start);
      end.setHours(hour + 1);
      slots.push({ startAt: start, endAt: end });
    }
  }
  return slots;
}

async function seedTutor(dt: DemoTutor): Promise<string> {
  const email = dt.email.toLowerCase().trim();
  const existing = await prisma.identity.findUnique({ where: { primaryEmail: email } });
  if (existing) {
    console.log(`  • ${dt.name} already seeded — skipping.`);
    return 'skipped';
  }

  const identity = await prisma.identity.create({ data: { primaryEmail: email } });
  const account = await prisma.userAccount.create({ data: { identityId: identity.id, displayName: dt.name } });

  const profile = await prisma.tutorProfile.create({
    data: {
      accountId: account.id,
      headline: dt.headline,
      bio: dt.bio,
      verificationStatus: 'VERIFIED',
      ratingAverage: dt.ratingAverage,
      ratingCount: dt.ratingCount,
    },
  });

  for (const s of dt.subjects) {
    await prisma.tutorSubject.create({ data: { tutorId: profile.id, subject: s } });
  }
  for (const o of dt.offerings) {
    await prisma.tutorOffering.create({
      data: { tutorId: profile.id, subject: o.subject, title: o.title, description: o.description, basePrice: o.basePrice, status: 'ACTIVE' },
    });
  }
  for (const slot of upcomingSlots()) {
    await prisma.tutorAvailability.create({
      data: { tutorId: profile.id, startAt: slot.startAt, endAt: slot.endAt, status: 'ACTIVE' },
    });
  }
  console.log(`  ✓ ${dt.name} (verified, ${dt.offerings.length} offering(s))`);
  return 'created';
}

async function main(): Promise<void> {
  console.log('Seeding demo tutors...');
  let created = 0;
  for (const dt of TUTORS) {
    const r = await seedTutor(dt);
    if (r === 'created') created++;
  }
  console.log(`Demo seed complete. ${created} new tutor(s), ${TUTORS.length - created} already present.`);
}

main()
  .catch((err) => { console.error('Demo seed failed:', err); process.exitCode = 1; })
  .finally(() => { void prisma.$disconnect(); });