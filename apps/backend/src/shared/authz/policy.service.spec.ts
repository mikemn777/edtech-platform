import { PolicyService } from './policy.service';
import { PermissionScope } from '@edu/types';
import type { AuthenticatedPrincipal } from '../identity/request-context';
import { PERMISSIONS } from '../permission/permission-keys';

describe('PolicyService (Roles §15-16 — deny-by-default, fail closed)', () => {
  const policy = new PolicyService(); // no Prisma injected — object-level methods fail closed

  const principal = (permissions: string[]): AuthenticatedPrincipal => ({
    accountId: 'acc-1',
    identityId: 'id-1',
    roles: ['admin'],
    permissions,
    scopes: [{ type: PermissionScope.PLATFORM }],
  });

  it('denies when principal is undefined (fails closed)', () => {
    expect(policy.hasAllPermissions(undefined, [PERMISSIONS.USER_READ])).toBe(false);
  });

  it('grants when all required permissions are present', () => {
    const p = principal([PERMISSIONS.USER_READ, PERMISSIONS.USER_MANAGE]);
    expect(policy.hasAllPermissions(p, [PERMISSIONS.USER_READ])).toBe(true);
  });

  it('denies when any required permission is missing (least privilege)', () => {
    const p = principal([PERMISSIONS.USER_READ]);
    expect(policy.hasAllPermissions(p, [PERMISSIONS.USER_READ, PERMISSIONS.ROLE_ASSIGN])).toBe(
      false,
    );
  });

  it('grants when no permissions are required', () => {
    expect(policy.hasAllPermissions(principal([]), [])).toBe(true);
  });

  it('never permits acting on a minor absent an authoritative rule (BR-003)', () => {
    expect(policy.canActOnMinor(principal(Object.values(PERMISSIONS)))).toBe(false);
  });
});

describe('PolicyService — object-level / self-scope authorization (P0-1)', () => {
  const policy = new PolicyService(); // no Prisma — DB-backed checks (guardianship) fail closed

  const withRole = (accountId: string, roles: string[]): AuthenticatedPrincipal => ({
    accountId,
    identityId: `identity-${accountId}`,
    roles,
    permissions: [],
    scopes: [{ type: PermissionScope.PLATFORM }],
  });

  it('isOperational is true for staff role families and false for actor roles', () => {
    expect(policy.isOperational(withRole('acc-1', ['admin']))).toBe(true);
    expect(policy.isOperational(withRole('acc-1', ['support']))).toBe(true);
    expect(policy.isOperational(withRole('acc-1', ['student']))).toBe(false);
    expect(policy.isOperational(withRole('acc-1', ['tutor']))).toBe(false);
    expect(policy.isOperational(undefined)).toBe(false);
  });

  it('isSelf only matches the caller\'s own account', () => {
    const p = withRole('acc-1', ['student']);
    expect(policy.isSelf(p, 'acc-1')).toBe(true);
    expect(policy.isSelf(p, 'acc-2')).toBe(false);
    expect(policy.isSelf(p, undefined)).toBe(false);
  });

  it('isSelfOrOperational denies a non-owning, non-staff caller (the core A1 defect)', () => {
    const otherStudent = withRole('acc-2', ['student']);
    expect(policy.isSelfOrOperational(otherStudent, 'acc-1')).toBe(false);
  });

  it('isSelfOrOperational allows the owner and any operational role', () => {
    expect(policy.isSelfOrOperational(withRole('acc-1', ['student']), 'acc-1')).toBe(true);
    expect(policy.isSelfOrOperational(withRole('acc-9', ['admin']), 'acc-1')).toBe(true);
  });

  it('canActOnStudentAccount fails closed for an unrelated actor without Prisma-backed guardianship', async () => {
    const otherParent = withRole('acc-parent', ['parent']);
    await expect(policy.canActOnStudentAccount(otherParent, 'acc-student')).resolves.toBe(false);
  });

  it('resolveStudentAccountId / resolveTutorAccountId return null without Prisma (fail closed, not throw)', async () => {
    await expect(policy.resolveStudentAccountId('profile-1')).resolves.toBeNull();
    await expect(policy.resolveTutorAccountId('profile-1')).resolves.toBeNull();
  });
});
