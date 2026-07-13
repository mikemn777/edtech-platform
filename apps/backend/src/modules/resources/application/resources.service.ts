import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { AuditService } from '../../audit/application/audit.service';
import { PolicyService } from '../../../shared/authz/policy.service';
import { STORAGE_PORT, type StoragePort } from '../../file-storage/domain/storage.port';
import { DomainError } from '../../../platform/errors/domain-error';
import type { AuthenticatedPrincipal } from '../../../shared/identity/request-context';
import type { CreateResourceDto } from '../contracts/resource.dto';

/**
 * Resources / Files service (Business Domain Model §12). Wraps the
 * provider-independent FileStorage port (Constitution Art. VII) with
 * metadata + access control. Object-level authorization (P0-1): a resource
 * may only be read/managed by its owner or an operational role — broader
 * distribution (e.g. to everyone enrolled in the linked course) is a
 * visibility rule that isn't established yet, so it isn't invented here
 * (same discipline as guardianship/AI/recording elsewhere in this codebase).
 */
@Injectable()
export class ResourcesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly policy: PolicyService,
    @Inject(STORAGE_PORT) private readonly storage: StoragePort,
  ) {}

  async upload(dto: CreateResourceDto, principal: AuthenticatedPrincipal, correlationId?: string) {
    const ownerAccountId = principal.accountId;
    const content = Buffer.from(dto.contentBase64, 'base64');
    const key = `resources/${ownerAccountId}/${randomUUID()}`;
    const stored = await this.storage.put({ key, content, contentType: dto.contentType });

    const resource = await this.prisma.resource.create({
      data: {
        ownerAccountId,
        title: dto.title,
        description: dto.description ?? null,
        storageReference: stored.storageReference,
        contentType: stored.contentType,
        courseId: dto.courseId ?? null,
        createdBy: ownerAccountId,
      },
    });
    await this.audit.record({
      actorAccountId: ownerAccountId,
      action: 'resource.uploaded',
      entityType: 'Resource',
      entityReference: resource.id,
      correlationId,
    });
    return this.toView(resource, stored.sizeBytes);
  }

  async listMine(ownerAccountId: string) {
    const rows = await this.prisma.resource.findMany({
      where: { ownerAccountId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    return rows.map((r) => this.toView(r));
  }

  async getMetadata(id: string, principal: AuthenticatedPrincipal) {
    const resource = await this.getOwnedOrThrow(id, principal);
    return this.toView(resource);
  }

  async getContent(id: string, principal: AuthenticatedPrincipal): Promise<{ content: Buffer; contentType: string; title: string }> {
    const resource = await this.getOwnedOrThrow(id, principal);
    const content = await this.storage.get(resource.storageReference);
    return { content, contentType: resource.contentType, title: resource.title };
  }

  async remove(id: string, principal: AuthenticatedPrincipal, correlationId?: string) {
    const resource = await this.getOwnedOrThrow(id, principal);
    await this.prisma.resource.update({
      where: { id: resource.id },
      data: { isDeleted: true, deletedAt: new Date(), deletedBy: principal.accountId },
    });
    await this.storage.remove(resource.storageReference);
    await this.audit.record({
      actorAccountId: principal.accountId,
      action: 'resource.removed',
      entityType: 'Resource',
      entityReference: resource.id,
      correlationId,
    });
    return { id: resource.id, status: 'removed' };
  }

  private async getOwnedOrThrow(id: string, principal: AuthenticatedPrincipal) {
    const resource = await this.prisma.resource.findFirst({ where: { id, isDeleted: false } });
    if (!resource) throw DomainError.notFound('Resource not found.');
    this.policy.assertIsSelfOrOperational(principal, resource.ownerAccountId);
    return resource;
  }

  private toView(r: {
    id: string; title: string; description: string | null; contentType: string;
    courseId: string | null; createdAt: Date;
  }, sizeBytes?: number) {
    return {
      id: r.id,
      title: r.title,
      description: r.description,
      contentType: r.contentType,
      courseId: r.courseId,
      sizeBytes,
      createdAt: r.createdAt,
    };
  }
}
