import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { DomainError } from '../../../platform/errors/domain-error';
import { paginate } from '../../../shared/pagination/pagination.dto';
import type { PaginatedResult } from '@edu/types';
import type { TutorSearchQueryDto } from '../contracts/search.dto';

/**
 * Marketplace service (Business Domain Model §7; Product Vision §7). Provides
 * tutor discovery, filtering, and public profiles.
 *
 * Two invariants enforced here:
 *  1. Only VERIFIED tutors are discoverable (BR-002 eligibility gate).
 *  2. Public/discovery views expose NO sensitive or minor-related data
 *     (Constitution Art. VI; privacy by default) — only professional,
 *     tutor-authored, display-safe fields.
 */
@Injectable()
export class MarketplaceService {
  constructor(private readonly prisma: PrismaService) {}

  /** Tutor discovery with filters (modules 9-11). Verified + discoverable only. */
  async search(query: TutorSearchQueryDto): Promise<PaginatedResult<unknown>> {
    if (query.minPrice !== undefined && query.maxPrice !== undefined && query.minPrice > query.maxPrice) {
      throw DomainError.validation('minPrice cannot exceed maxPrice.');
    }

    // Offering-level constraints (subject/price/currency) — only ACTIVE offerings.
    const offeringConstraints: Prisma.TutorOfferingWhereInput = {
      status: 'ACTIVE',
      isDeleted: false,
      ...(query.subject ? { subject: query.subject.toLowerCase().trim() } : {}),
      ...(query.currencyId ? { currencyId: query.currencyId } : {}),
      ...(query.minPrice !== undefined || query.maxPrice !== undefined
        ? {
            basePrice: {
              ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
              ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
            },
          }
        : {}),
    };

    const hasOfferingFilter =
      query.subject !== undefined ||
      query.currencyId !== undefined ||
      query.minPrice !== undefined ||
      query.maxPrice !== undefined;

    const where: Prisma.TutorProfileWhereInput = {
      isDeleted: false,
      // Eligibility gate — non-negotiable (BR-002).
      verificationStatus: 'VERIFIED',
      ...(query.jurisdictionId ? { jurisdictionId: query.jurisdictionId } : {}),
      // Must have at least one active offering to be discoverable.
      offerings: { some: hasOfferingFilter ? offeringConstraints : { status: 'ACTIVE', isDeleted: false } },
      ...(query.q
        ? {
            OR: [
              { headline: { contains: query.q, mode: 'insensitive' } },
              { bio: { contains: query.q, mode: 'insensitive' } },
              { offerings: { some: { ...offeringConstraints, title: { contains: query.q, mode: 'insensitive' } } } },
              { offerings: { some: { ...offeringConstraints, subject: { contains: query.q.toLowerCase(), mode: 'insensitive' } } } },
            ],
          }
        : {}),
    };

    const orderBy: Prisma.TutorProfileOrderByWithRelationInput =
      query.sort === 'newest' ? { createdAt: 'desc' } : { ratingAverage: 'desc' };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.tutorProfile.findMany({
        where,
        orderBy,
        skip: query.skip,
        take: query.pageSize,
        select: this.discoverySelect(offeringConstraints, hasOfferingFilter),
      }),
      this.prisma.tutorProfile.count({ where }),
    ]);

    return paginate(rows.map((r) => this.toDiscoveryCard(r)), total, query.page, query.pageSize);
  }

  /** Public tutor profile (module 12). Verified only; privacy-safe fields only. */
  async publicProfile(tutorId: string): Promise<unknown> {
    const tutor = await this.prisma.tutorProfile.findFirst({
      where: { id: tutorId, isDeleted: false, verificationStatus: 'VERIFIED' },
      select: {
        id: true,
        headline: true,
        bio: true,
        ratingAverage: true,
        ratingCount: true,
        jurisdictionId: true,
        offerings: {
          where: { status: 'ACTIVE', isDeleted: false },
          select: {
            id: true,
            subject: true,
            title: true,
            description: true,
            basePrice: true,
            currencyId: true,
          },
        },
      },
    });
    // 404 for unverified/nonexistent: do not disclose the existence of an
    // unverified/private tutor (privacy + no enumeration).
    if (!tutor) throw DomainError.notFound('Tutor not found.');

    return {
      id: tutor.id,
      headline: tutor.headline,
      bio: tutor.bio,
      rating: {
        average: tutor.ratingAverage ? Number(tutor.ratingAverage) : null,
        count: tutor.ratingCount,
      },
      jurisdictionId: tutor.jurisdictionId,
      offerings: tutor.offerings.map((o) => ({
        id: o.id,
        subject: o.subject,
        title: o.title,
        description: o.description,
        // Currency-explicit money (DB Arch §12) — indicative only; rules PBD.
        price: o.basePrice !== null ? { amount: Number(o.basePrice), currencyId: o.currencyId } : null,
      })),
    };
  }

  private discoverySelect(
    offeringConstraints: Prisma.TutorOfferingWhereInput,
    hasOfferingFilter: boolean,
  ): Prisma.TutorProfileSelect {
    return {
      id: true,
      headline: true,
      ratingAverage: true,
      ratingCount: true,
      jurisdictionId: true,
      offerings: {
        where: hasOfferingFilter ? offeringConstraints : { status: 'ACTIVE', isDeleted: false },
        select: { subject: true, title: true, basePrice: true, currencyId: true },
        take: 5,
      },
    };
  }

  private toDiscoveryCard(r: {
    id: string;
    headline: string | null;
    ratingAverage: unknown;
    ratingCount: number;
    jurisdictionId: string | null;
    offerings: Array<{ subject: string; title: string; basePrice: unknown; currencyId: string | null }>;
  }) {
    return {
      id: r.id,
      headline: r.headline,
      rating: { average: r.ratingAverage ? Number(r.ratingAverage) : null, count: r.ratingCount },
      jurisdictionId: r.jurisdictionId,
      subjects: [...new Set(r.offerings.map((o) => o.subject))],
      offerings: r.offerings.map((o) => ({
        subject: o.subject,
        title: o.title,
        price: o.basePrice !== null ? { amount: Number(o.basePrice), currencyId: o.currencyId } : null,
      })),
    };
  }
}
