/**
 * Permission catalog (User Roles & Permissions v1.0 §15.2 — explicit grants only).
 *
 * These are the atomic, explicit capability keys the platform reasons about.
 * They are foundational, not exhaustive; new keys are added as capabilities are
 * built (governed decision, PDL category GOV/SEC). Deny-by-default means the
 * absence of a key is a denial (Roles §15.4).
 *
 * Naming convention (Blueprint §6.2): `<domain>.<resource>.<action>`.
 */
export const PERMISSIONS = {
  // User Management
  USER_READ: 'user.account.read',
  USER_MANAGE: 'user.account.manage',
  ROLE_ASSIGN: 'user.role.assign',
  RELATIONSHIP_MANAGE: 'user.relationship.manage',

  // Countries / configuration backbone
  COUNTRY_READ: 'country.country.read',
  COUNTRY_MANAGE: 'country.country.manage',

  // Localization
  LOCALIZATION_READ: 'localization.resource.read',
  LOCALIZATION_MANAGE: 'localization.resource.manage',

  // Settings
  SETTING_READ: 'settings.setting.read',
  SETTING_MANAGE: 'settings.setting.manage',

  // Audit
  AUDIT_READ: 'audit.record.read',

  // Notifications
  NOTIFICATION_SEND: 'notification.message.send',
  NOTIFICATION_MANAGE: 'notification.channel.manage',

  // File storage
  FILE_READ: 'file.object.read',
  FILE_WRITE: 'file.object.write',
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** Sensitivity flag for separation-of-duties awareness (Roles §16.5). */
export const HIGH_RISK_PERMISSIONS: ReadonlySet<string> = new Set<string>([
  PERMISSIONS.ROLE_ASSIGN,
  PERMISSIONS.USER_MANAGE,
]);
