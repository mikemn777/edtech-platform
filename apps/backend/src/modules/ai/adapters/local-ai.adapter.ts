import { Injectable } from '@nestjs/common';
import type {
  AIProviderPort, AssistantQuery, AssistantReply, Recommendation, RecommendationQuery,
} from '../domain/ai-provider.port';

/**
 * Default AI adapter — a deterministic, provider-independent implementation with
 * NO external vendor dependency (the concrete AI provider is a Pending Technical
 * Decision). It provides safe, non-hallucinating behavior: the assistant returns
 * a guarded response and recommendations are a ranked pass over candidates the
 * application already fetched. Replacing this with a real provider adapter is a
 * configuration change only (Art. VII).
 */
@Injectable()
export class LocalAIAdapter implements AIProviderPort {
  readonly providerKey = 'local-default';

  async assist(query: AssistantQuery): Promise<AssistantReply> {
    const trimmed = query.prompt.trim().slice(0, 500);
    // Guarded, non-authoritative response; does not fabricate facts.
    return {
      answer:
        `Thanks for your question: "${trimmed}". A learning assistant provider is ` +
        `not yet configured, so here is general guidance: break the topic into ` +
        `smaller goals, practice with examples, and review with your tutor.`,
      providerKey: this.providerKey,
    };
  }

  async recommend(query: RecommendationQuery, candidates: Recommendation[]): Promise<Recommendation[]> {
    // Deterministic ranking placeholder: preserve candidate order, cap to limit.
    return candidates.slice(0, query.limit);
  }
}
