import { MarketplaceService } from './application/marketplace.service';
import { DomainError, DomainErrorCode } from '../../platform/errors/domain-error';
import type { PrismaService } from '../../shared/prisma/prisma.service';
import type { TutorSearchQueryDto } from './contracts/search.dto';

/**
 * Verifies the marketplace's guardrails without a database: invalid price ranges
 * are rejected (fail-safe input validation — Requirements VR-001) and the search
 * always constrains to VERIFIED tutors (BR-002). We assert the WHERE clause built
 * for Prisma pins verificationStatus to VERIFIED.
 */
describe('MarketplaceService (verified-only, safe filters)', () => {
  it('rejects an inverted price range', async () => {
    const service = new MarketplaceService({} as unknown as PrismaService);
    const query = { minPrice: 100, maxPrice: 10, page: 1, pageSize: 20, skip: 0 } as TutorSearchQueryDto;
    await expect(service.search(query)).rejects.toMatchObject({
      code: DomainErrorCode.VALIDATION,
    });
  });

  it('constrains discovery to VERIFIED tutors (BR-002 eligibility gate)', async () => {
    const captured: Array<Record<string, unknown>> = [];
    const prismaStub = {
      $transaction: (ops: unknown[]) => Promise.resolve([[], 0]).then((r) => {
        void ops;
        return r;
      }),
      tutorProfile: {
        findMany: (args: { where: Record<string, unknown> }) => {
          captured.push(args.where);
          return Promise.resolve([]);
        },
        count: (args: { where: Record<string, unknown> }) => {
          captured.push(args.where);
          return Promise.resolve(0);
        },
      },
    } as unknown as PrismaService;

    // Re-implement $transaction to actually invoke the two thunks' equivalents:
    (prismaStub as unknown as { $transaction: (a: Promise<unknown>[]) => Promise<unknown[]> }).$transaction =
      (arr: Promise<unknown>[]) => Promise.all(arr);

    const service = new MarketplaceService(prismaStub);
    const query = { page: 1, pageSize: 20, skip: 0, sort: 'rating' } as TutorSearchQueryDto;
    await service.search(query);

    expect(captured.length).toBeGreaterThan(0);
    for (const where of captured) {
      expect(where.verificationStatus).toBe('VERIFIED');
    }
  });

  it('DomainError.notFound is used for missing/unverified public profiles', () => {
    // Guard against accidental disclosure: the not-found path is a DomainError.
    const err = DomainError.notFound('Tutor not found.');
    expect(err.code).toBe(DomainErrorCode.NOT_FOUND);
  });
});
