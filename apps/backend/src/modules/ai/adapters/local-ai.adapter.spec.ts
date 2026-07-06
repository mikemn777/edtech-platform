import { LocalAIAdapter } from './local-ai.adapter';
import type { Recommendation } from '../domain/ai-provider.port';

describe('LocalAIAdapter (Art. VII provider independence)', () => {
  const adapter = new LocalAIAdapter();

  it('exposes only an opaque provider key (no vendor identity)', () => {
    expect(adapter.providerKey).toBe('local-default');
  });

  it('assist returns a guarded, non-empty answer', async () => {
    const reply = await adapter.assist({ requestorAccountId: 'a', prompt: 'How do I factor quadratics?' });
    expect(reply.answer.length).toBeGreaterThan(0);
    expect(reply.providerKey).toBe('local-default');
  });

  it('recommend ranks within the requested limit and never invents refs', async () => {
    const candidates: Recommendation[] = Array.from({ length: 10 }, (_, i) => ({
      kind: 'course', refId: `c${i}`, reason: 'x',
    }));
    const out = await adapter.recommend({ requestorAccountId: 'a', limit: 3 }, candidates);
    expect(out).toHaveLength(3);
    expect(out.every((r) => candidates.some((c) => c.refId === r.refId))).toBe(true);
  });
});
