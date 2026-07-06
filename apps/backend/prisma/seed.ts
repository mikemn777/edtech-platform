/* eslint-disable no-console */
/**
 * Seed System (module 25).
 *
 * Seeds ONLY foundational, non-invented data that the governance stack has
 * authoritatively established:
 *   - Foundational roles (User Roles & Permissions v1.0 §1.2)
 *   - Foundational permission catalog (Roles §15.2 — explicit grants)
 *   - Launch languages: English, Arabic (RTL), Turkish (Constitution Art. III)
 *   - Launch countries: Türkiye, Lebanon (Constitution Art. 2.1)
 *   - A bootstrap Super Admin (from env; dev convenience / first-run only)
 *
 * It invents NO business rule, currency set, or jurisdiction attribute value —
 * those remain Pending Business Decisions (Constitution Art. IX). Idempotent:
 * safe to run repeatedly (upserts only).
 */
import { PrismaClient, RoleFamily, TextDirection } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

// ---- Role → permission grants (foundational; Roles doc §6-13) ----
const PERMISSIONS = {
  USER_READ: 'user.account.read',
  USER_MANAGE: 'user.account.manage',
  ROLE_ASSIGN: 'user.role.assign',
  RELATIONSHIP_MANAGE: 'user.relationship.manage',
  COUNTRY_READ: 'country.country.read',
  COUNTRY_MANAGE: 'country.country.manage',
  LOCALIZATION_READ: 'localization.resource.read',
  LOCALIZATION_MANAGE: 'localization.resource.manage',
  SETTING_READ: 'settings.setting.read',
  SETTING_MANAGE: 'settings.setting.manage',
  AUDIT_READ: 'audit.record.read',
  NOTIFICATION_SEND: 'notification.message.send',
  NOTIFICATION_MANAGE: 'notification.channel.manage',
  FILE_READ: 'file.object.read',
  FILE_WRITE: 'file.object.write',
} as const;

const ALL_PERMISSIONS = Object.values(PERMISSIONS);
const HIGH_RISK = new Set<string>([PERMISSIONS.ROLE_ASSIGN, PERMISSIONS.USER_MANAGE]);

const PERMISSION_DOMAIN: Record<string, string> = {
  [PERMISSIONS.USER_READ]: 'user-management',
  [PERMISSIONS.USER_MANAGE]: 'user-management',
  [PERMISSIONS.ROLE_ASSIGN]: 'user-management',
  [PERMISSIONS.RELATIONSHIP_MANAGE]: 'user-management',
  [PERMISSIONS.COUNTRY_READ]: 'countries',
  [PERMISSIONS.COUNTRY_MANAGE]: 'countries',
  [PERMISSIONS.LOCALIZATION_READ]: 'localization',
  [PERMISSIONS.LOCALIZATION_MANAGE]: 'localization',
  [PERMISSIONS.SETTING_READ]: 'settings',
  [PERMISSIONS.SETTING_MANAGE]: 'settings',
  [PERMISSIONS.AUDIT_READ]: 'audit',
  [PERMISSIONS.NOTIFICATION_SEND]: 'notifications',
  [PERMISSIONS.NOTIFICATION_MANAGE]: 'notifications',
  [PERMISSIONS.FILE_READ]: 'file-storage',
  [PERMISSIONS.FILE_WRITE]: 'file-storage',
};

interface RoleSeed {
  name: string;
  family: RoleFamily;
  description: string;
  permissions: string[];
}

// Foundational roles. Actor roles (student/parent/tutor) hold NO operational
// permissions (Roles §5.3). Detailed actor permissions are added later as PBDs
// resolve; here they are seeded with an empty operational grant set.
const ROLES: RoleSeed[] = [
  {
    name: 'super_admin',
    family: RoleFamily.OPERATIONAL,
    description: 'Ultimate stewardship of platform integrity, security, and governance.',
    permissions: ALL_PERMISSIONS, // reserved; always audited (Roles §13.3)
  },
  {
    name: 'admin',
    family: RoleFamily.OPERATIONAL,
    description: 'Day-to-day operational governance within scope.',
    permissions: [
      PERMISSIONS.USER_READ,
      PERMISSIONS.USER_MANAGE,
      PERMISSIONS.ROLE_ASSIGN,
      PERMISSIONS.COUNTRY_READ,
      PERMISSIONS.COUNTRY_MANAGE,
      PERMISSIONS.LOCALIZATION_READ,
      PERMISSIONS.LOCALIZATION_MANAGE,
      PERMISSIONS.SETTING_READ,
      PERMISSIONS.SETTING_MANAGE,
      PERMISSIONS.AUDIT_READ,
    ],
  },
  {
    name: 'moderator',
    family: RoleFamily.OPERATIONAL,
    description: 'Safeguards health/safety of interactions and content.',
    permissions: [PERMISSIONS.USER_READ],
  },
  {
    name: 'finance',
    family: RoleFamily.OPERATIONAL,
    description: 'Stewardship of commercial/monetary operations (bounded).',
    permissions: [PERMISSIONS.USER_READ],
  },
  {
    name: 'support',
    family: RoleFamily.OPERATIONAL,
    description: 'Helps actors resolve problems (purpose-bound, least privilege).',
    permissions: [PERMISSIONS.USER_READ],
  },
  {
    name: 'tutor',
    family: RoleFamily.ACTOR,
    description: 'Delivers teaching; manages own professional presence.',
    permissions: [],
  },
  {
    name: 'parent',
    family: RoleFamily.ACTOR,
    description: 'Oversees a linked student within the guardianship relationship.',
    permissions: [],
  },
  {
    name: 'student',
    family: RoleFamily.ACTOR,
    description: 'Learns; manages own learning experience.',
    permissions: [],
  },
];

const LANGUAGES = [
  { code: 'en', name: 'English', direction: TextDirection.LTR },
  { code: 'ar', name: 'العربية', direction: TextDirection.RTL },
  { code: 'tr', name: 'Türkçe', direction: TextDirection.LTR },
];

// Launch countries (Constitution Art. 2.1). No country is privileged; these are
// simply the first onboarded (Art. 2.3). No per-country legal/fiscal attribute
// values are seeded — those are PBD/legal.
const COUNTRIES = [
  { code: 'TR', name: 'Türkiye' },
  { code: 'LB', name: 'Lebanon' },
];

async function seedPermissions(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  for (const key of ALL_PERMISSIONS) {
    const perm = await prisma.permission.upsert({
      where: { key },
      update: {},
      create: {
        key,
        description: key,
        domainArea: PERMISSION_DOMAIN[key] ?? 'platform',
        sensitivity: HIGH_RISK.has(key) ? 'high_risk' : 'normal',
      },
    });
    map.set(key, perm.id);
  }
  console.log(`Seeded ${map.size} permissions.`);
  return map;
}

async function seedRoles(permIds: Map<string, string>): Promise<void> {
  for (const roleSeed of ROLES) {
    const role = await prisma.role.upsert({
      where: { name: roleSeed.name },
      update: { description: roleSeed.description, family: roleSeed.family, isSystemRole: true },
      create: {
        name: roleSeed.name,
        family: roleSeed.family,
        description: roleSeed.description,
        isSystemRole: true,
      },
    });
    for (const permKey of roleSeed.permissions) {
      const permissionId = permIds.get(permKey);
      if (!permissionId) continue;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId } },
        update: { isDeleted: false },
        create: { roleId: role.id, permissionId },
      });
    }
  }
  console.log(`Seeded ${ROLES.length} foundational roles with grants.`);
}

async function seedLanguages(): Promise<void> {
  for (const lang of LANGUAGES) {
    await prisma.language.upsert({
      where: { languageCode: lang.code },
      update: { name: lang.name, direction: lang.direction, status: 'active' },
      create: { languageCode: lang.code, name: lang.name, direction: lang.direction },
    });
  }
  console.log(`Seeded ${LANGUAGES.length} launch languages (en, ar[RTL], tr).`);
}

async function seedCountries(): Promise<void> {
  for (const c of COUNTRIES) {
    await prisma.country.upsert({
      where: { countryCode: c.code },
      update: { name: c.name },
      create: { countryCode: c.code, name: c.name, status: 'ACTIVE' },
    });
  }
  console.log(`Seeded ${COUNTRIES.length} launch countries (Türkiye, Lebanon).`);
}

async function seedSuperAdmin(): Promise<void> {
  const email = process.env.SEED_SUPERADMIN_EMAIL;
  const password = process.env.SEED_SUPERADMIN_PASSWORD;
  if (!email || !password) {
    console.log('Skipping Super Admin seed (SEED_SUPERADMIN_EMAIL/PASSWORD not set).');
    return;
  }
  const normalized = email.toLowerCase().trim();
  const existing = await prisma.identity.findUnique({ where: { primaryEmail: normalized } });
  if (existing) {
    console.log('Super Admin already exists; skipping.');
    return;
  }
  const secretReference = await argon2.hash(password, { type: argon2.argon2id });
  const role = await prisma.role.findUnique({ where: { name: 'super_admin' } });
  if (!role) throw new Error('super_admin role missing; seed roles first.');

  await prisma.$transaction(async (tx) => {
    const identity = await tx.identity.create({ data: { primaryEmail: normalized } });
    await tx.authCredential.create({
      data: { identityId: identity.id, method: 'PASSWORD', secretReference },
    });
    const account = await tx.userAccount.create({
      data: { identityId: identity.id, displayName: 'Super Admin' },
    });
    await tx.accountRole.create({ data: { accountId: account.id, roleId: role.id } });
  });
  console.log('Seeded bootstrap Super Admin.');
}

async function main(): Promise<void> {
  console.log('Seeding foundational data (module 25)...');
  const permIds = await seedPermissions();
  await seedRoles(permIds);
  await seedLanguages();
  await seedCountries();
  await seedSuperAdmin();
  console.log('Seed complete.');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
