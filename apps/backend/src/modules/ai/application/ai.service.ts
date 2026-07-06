import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { AuditService } from '../../audit/application/audit.service';
import { AI_PROVIDER, AIProviderPort, Recommendation } from '../domain/ai-provider.port';
import type { AssistDto, RecommendQueryDto } from '../contracts/ai.dto';

/**
 * AI service — Learning Assistant + Recommendations (Business Domain Model §15).
 * Consumes AI ONLY through the provider-independent port (Constitution Art. VII).
 * Every interaction is governed and audited (Art. 7.4). For minors, no external
 * data-sharing occurs with the default adapter; provider data policies are
 * Pending Business/Legal Decisions enforced at the port when a provider is added.
 */
@Injectable()
export class AIService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    @Inject(AI_PROVIDER) private readonly provider: AIProviderPort,
  ) {}

  async assist(accountId: string, dto: AssistDto, correlationId?: string) {
    const reply = await this.provider.assist({
      requestorAccountId: accountId,
      prompt: dto.prompt,
      contextReference: dto.contextReference,
    });
    await this.recordInteraction(accountId, 'ASSISTANT', reply.providerKey, dto.contextReference, correlationId);
    return { answer: reply.answer };
  }

  async recommend(accountId: string, dto: RecommendQueryDto, correlationId?: string) {
    // The APPLICATION gathers candidates (published courses); the provider only
    // ranks. This keeps data access under platform control (privacy).
    const courses = await this.prisma.course.findMany({
      where: { status: 'PUBLISHED', isDeleted: false, ...(dto.subject ? { subject: dto.subject.toLowerCase() } : {}) },
      select: { id: true, title: true, subject: true },
      take: 50,
    });
    const candidates: Recommendation[] = courses.map((c) => ({
      kind: 'course',
      refId: c.id,
      reason: `Published course in ${c.subject}: ${c.title}`,
    }));

    const ranked = await this.provider.recommend(
      { requestorAccountId: accountId, subject: dto.subject, limit: dto.limit },
      candidates,
    );
    await this.recordInteraction(accountId, 'RECOMMENDATION', this.provider.providerKey, undefined, correlationId);
    return { recommendations: ranked };
  }

  private async recordInteraction(
    accountId: string,
    capability: 'ASSISTANT' | 'RECOMMENDATION',
    providerKey: string,
    contextReference: string | undefined,
    correlationId?: string,
  ): Promise<void> {
    await this.prisma.aIInteraction.create({
      data: { requestorAccountId: accountId, capability, providerKey, contextReference: contextReference ?? null },
    });
    await this.audit.record({
      actorAccountId: accountId,
      action: `ai.${capability.toLowerCase()}.used`,
      entityType: 'AIInteraction',
      authorityContext: { providerKey },
      classification: 'personal',
      correlationId,
    });
  }
}
