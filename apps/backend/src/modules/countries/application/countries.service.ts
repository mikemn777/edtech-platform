import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { AuditService } from '../../audit/application/audit.service';
import { DomainError } from '../../../platform/errors/domain-error';
import { paginate } from '../../../shared/pagination/pagination.dto';
import type { PaginatedResult } from '@edu/types';
import type { CreateCountryDto, CountryStatusDto } from '../contracts/country.dto';

/**
 * Countries service (module 13; Business Domain Model §25). Countries are
 * configurable data — onboarding a country is configuration, never a code change
 * (Constitution Art. 2.3, 2.4). No country is privileged.
 */
@Injectable()
export class CountriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async list(page: number, pageSize: number, skip: number): Promise<PaginatedResult<unknown>> {
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.country.findMany({
        where: { isDeleted: false },
        skip,
        take: pageSize,
        orderBy: { countryCode: 'asc' },
      }),
      this.prisma.country.count({ where: { isDeleted: false } }),
    ]);
    return paginate(rows, total, page, pageSize);
  }

  async create(dto: CreateCountryDto, actorAccountId: string, correlationId?: string) {
    const code = dto.countryCode.toUpperCase();
    const existing = await this.prisma.country.findUnique({ where: { countryCode: code } });
    if (existing) throw DomainError.conflict('Country already exists.');

    const country = await this.prisma.country.create({
      data: { countryCode: code, name: dto.name, status: dto.status ?? 'ONBOARDING', createdBy: actorAccountId },
    });
    await this.audit.record({
      actorAccountId,
      action: 'country.created',
      entityType: 'Country',
      entityReference: country.id,
      correlationId,
    });
    return country;
  }

  async setStatus(
    id: string,
    status: CountryStatusDto,
    actorAccountId: string,
    correlationId?: string,
  ) {
    const country = await this.prisma.country.findFirst({ where: { id, isDeleted: false } });
    if (!country) throw DomainError.notFound('Country not found.');
    const updated = await this.prisma.country.update({
      where: { id },
      data: { status, updatedBy: actorAccountId },
    });
    await this.audit.record({
      actorAccountId,
      action: 'country.status_changed',
      entityType: 'Country',
      entityReference: id,
      authorityContext: { status },
      correlationId,
    });
    return updated;
  }
}
