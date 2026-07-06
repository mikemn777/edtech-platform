import { PolicyService } from './policy.service';
import { PermissionScope } from '@edu/types';
import type { AuthenticatedPrincipal } from '../identity/request-context';
import { PERMISSIONS } from '../permission/permission-keys';

describe('PolicyService (Roles §15-16 — deny-by-default, fail closed)', () => {
  const policy = new PolicyService();

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
