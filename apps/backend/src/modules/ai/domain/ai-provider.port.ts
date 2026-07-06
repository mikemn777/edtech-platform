/**
 * AI provider PORT (Constitution Art. VII — ABSOLUTE provider independence;
 * System Architecture §10). The application consumes AI only through this port.
 * Any provider (Claude, OpenAI, Gemini, self-hosted, or none) is an ADAPTER;
 * swapping providers requires ZERO application change. No provider identifier,
 * model name, or proprietary type crosses this boundary.
 */
export interface AssistantQuery {
  requestorAccountId: string;
  prompt: string;
  contextReference?: string;
}

export interface AssistantReply {
  answer: string;
  providerKey: string; // opaque adapter tag for audit only
}

export interface RecommendationQuery {
  requestorAccountId: string;
  subject?: string;
  limit: number;
}

export interface Recommendation {
  kind: 'course' | 'tutor';
  refId: string;
  reason: string;
}

export interface AIProviderPort {
  readonly providerKey: string;
  assist(query: AssistantQuery): Promise<AssistantReply>;
  recommend(query: RecommendationQuery, candidates: Recommendation[]): Promise<Recommendation[]>;
}

export const AI_PROVIDER = Symbol('AI_PROVIDER');
