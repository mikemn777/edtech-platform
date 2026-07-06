/**
 * @edu/types — cross-cutting types shared across apps.
 * These are the ubiquitous-language primitives from the Business Domain Model,
 * used by both backend and frontend so contracts stay consistent (Blueprint §1, §6).
 */

/** Foundational role names (User Roles & Permissions v1.0 §1.2). */
export enum SystemRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  FINANCE = 'finance',
  SUPPORT = 'support',
  TUTOR = 'tutor',
  PARENT = 'parent',
  STUDENT = 'student',
}

/** Role family (Roles doc §1.1). */
export enum RoleFamily {
  OPERATIONAL = 'operational',
  ACTOR = 'actor',
}

/** Permission scope gradient (Roles doc §3.3, §12.4). */
export enum PermissionScope {
  SELF = 'self',
  RELATIONSHIP = 'relationship',
  JURISDICTION = 'jurisdiction',
  PLATFORM = 'platform',
}

/** Data sensitivity classification (Database Master Architecture §4.5). */
export enum DataClassification {
  PERSONAL = 'personal',
  FINANCIAL = 'financial',
  MINOR_RELATED = 'minor_related',
  OPERATIONAL = 'operational',
}

/** Standardized, paginated list envelope (Blueprint §1.3, §16.2). */
export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/** Uniform API error envelope (Blueprint §1.5, §13.2). */
export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    correlationId: string;
    timestamp: string;
    details?: unknown;
  };
}

/** Supported launch languages (Constitution Art. III; unlimited future via config). */
export type LanguageCode = 'en' | 'ar' | 'tr' | string;

/** Text direction — RTL is first-class (Constitution Art. 3.3). */
export type TextDirection = 'ltr' | 'rtl';
