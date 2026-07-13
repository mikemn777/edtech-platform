import type { Prisma } from '@prisma/client';

/**
 * Postgres transaction-scoped advisory lock, keyed by an arbitrary string
 * (hashed server-side via hashtextextended — PG11+). Serializes concurrent
 * writers within an interactive transaction; released automatically on
 * commit/rollback (P0-3, Production Readiness Review finding B2).
 *
 * Use to make a check-then-write sequence atomic where a DB-level exclusion
 * constraint isn't in place — e.g. "no overlapping booking/availability for
 * this tutor" is enforced in application code, not by a range type, so two
 * concurrent requests could otherwise both pass the check and collide.
 */
export async function lockForWrite(
  tx: Prisma.TransactionClient,
  key: string,
): Promise<void> {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${key}::text, 0))`;
}
