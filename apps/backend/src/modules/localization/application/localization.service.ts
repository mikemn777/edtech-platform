import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { RedisService } from '../../../shared/redis/redis.service';
import { translate as staticTranslate, directionFor, DEFAULT_LANGUAGE } from '@edu/localization';
import type { TextDirection } from '@edu/types';

/**
 * Localization runtime service (module 14; Business Domain Model §24).
 * Resolves languages, direction (RTL first-class — Art. 3.3), and translated
 * values with graceful fallback (Blueprint §7.4 / Requirements EC-006).
 * DB-backed translations are cached in Redis (cache never source of truth §14.2).
 */
@Injectable()
export class LocalizationService {
  private static readonly CACHE_TTL = 300; // seconds

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async listLanguages(): Promise<Array<{ code: string; name: string; direction: string }>> {
    const langs = await this.prisma.language.findMany({
      where: { isDeleted: false, status: 'active' },
      orderBy: { languageCode: 'asc' },
    });
    // Fall back to the static launch set if DB not yet seeded.
    if (langs.length === 0) {
      return [
        { code: 'en', name: 'English', direction: 'ltr' },
        { code: 'ar', name: 'العربية', direction: 'rtl' },
        { code: 'tr', name: 'Türkçe', direction: 'ltr' },
      ];
    }
    return langs.map((l) => ({
      code: l.languageCode,
      name: l.name,
      direction: l.direction.toLowerCase(),
    }));
  }

  direction(language: string): TextDirection {
    return directionFor(language);
  }

  /**
   * Resolve a translation key for a language. Prefers DB values (cached), then
   * falls back to bundled resources, then to the default language, then the key
   * itself — never throws for a missing translation (EC-006).
   */
  async translate(language: string, key: string): Promise<string> {
    const cacheKey = `i18n:${language}:${key}`;
    const cached = await this.safeCacheGet(cacheKey);
    if (cached !== null) return cached;

    const dbValue = await this.prisma.translationValue.findFirst({
      where: {
        translationKey: { keyName: key },
        language: { languageCode: language },
        isDeleted: false,
      },
      select: { value: true },
    });

    const value = dbValue?.value ?? staticTranslate(language, key);
    await this.safeCacheSet(cacheKey, value);
    return value;
  }

  get defaultLanguage(): string {
    return DEFAULT_LANGUAGE;
  }

  private async safeCacheGet(key: string): Promise<string | null> {
    try {
      return await this.redis.client.get(key);
    } catch {
      return null; // cache is optional; fall through to source
    }
  }

  private async safeCacheSet(key: string, value: string): Promise<void> {
    try {
      await this.redis.client.set(key, value, 'EX', LocalizationService.CACHE_TTL);
    } catch {
      /* non-fatal */
    }
  }
}
