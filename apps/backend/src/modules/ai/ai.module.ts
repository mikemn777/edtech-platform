import { Module } from '@nestjs/common';
import { AIController } from './ai.controller';
import { AIService } from './application/ai.service';
import { LocalAIAdapter } from './adapters/local-ai.adapter';
import { AI_PROVIDER } from './domain/ai-provider.port';

/**
 * AI module (Business Domain Model §15). Binds the AI_PROVIDER port to a
 * provider-independent default adapter. Swapping in Claude/OpenAI/Gemini/etc. is
 * a configuration change here only — the absolute provider-independence guarantee
 * (Constitution Art. VII).
 */
@Module({
  controllers: [AIController],
  providers: [AIService, LocalAIAdapter, { provide: AI_PROVIDER, useExisting: LocalAIAdapter }],
  exports: [AIService],
})
export class AIModule {}
