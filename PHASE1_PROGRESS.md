# Phase 1 Implementation Progress Tracker

> Maintained across implementation turns. Never regenerate completed work; only continue.

## Governance note
Selecting Next.js, NestJS, PostgreSQL, Prisma, Redis, Docker **resolves** the
Pending Technical Decisions from the System Architecture & Implementation
Blueprint. These are to be recorded in the Project Decision Log (category TEC).

## Completed — ALL Phase 1 modules
- [x] 1. Monorepo initialization (pnpm workspaces, turbo, tsconfig base, prettier, commitlint, editorconfig, gitignore)
- [x] 2. Next.js frontend (App Router, i18n routing + middleware, RTL-aware per-language layout, localized home page, typed API client)
- [x] 3. NestJS backend (clean architecture: platform / shared / modules)
- [x] 4. PostgreSQL (docker-compose service + init extensions)
- [x] 5. Prisma (foundation schema: 21 models — config backbone, identity/auth, RBAC, audit)
- [x] 6. Redis (service + module, cache-never-source-of-truth)
- [x] 7. Docker & Docker Compose (multi-stage backend Dockerfile + compose)
- [x] 8. Environment configuration (zod validation, fail-fast, typed AppConfigService)
- [x] 9. Folder structure (domain-first clean architecture)
- [x] 10. Authentication (Argon2id hashing, JWT access + rotating refresh, sessions, register/login/refresh/logout, auth events)
- [x] 11. Authorization (RBAC) (global JwtAuthGuard + PermissionsGuard, PolicyService, @RequirePermissions/@Public/@CurrentUser, deny-by-default, fail-closed, minor-protective default)
- [x] 12. User Management (accounts, profile update, role assignment [audited high-risk], relationships model)
- [x] 13. Countries (configurable onboarding CRUD, no country privileged)
- [x] 14. Localization (AR/EN/TR resources + DB-backed languages/locales/translations, direction/RTL, cached fallback, /languages endpoint)
- [x] 15. Settings Module (scoped, versioned configuration; resolve + upsert; audited)
- [x] 16. Audit Logs (append-only AuditService writing AuditRecord; global)
- [x] 17. Notification Infrastructure (channel port + log/in-app adapter + dispatch service)
- [x] 18. File Storage abstraction (StoragePort + local adapter, path-traversal safe, S3-pluggable)
- [x] 19. Global Error Handling (DomainError taxonomy + GlobalExceptionFilter, uniform envelope, fail-safe)
- [x] 20. Logging (nestjs-pino, correlation ids, redaction of secrets/PII)
- [x] 21. Validation (global ValidationPipe, whitelist + deny-unknown)
- [x] 22. API Versioning (URI versioning /api/v1, version-neutral health)
- [x] 23. Swagger/OpenAPI (documented, bearer auth, gated off in prod)
- [x] 24. Health Checks (live + ready with DB & Redis probes)
- [x] 25. Seed System (permissions, foundational roles + grants, launch languages [en/ar/tr], launch countries [TR/LB], bootstrap Super Admin)
- [x] 26. Database Migrations (initial migration 0000000000000_init: 21 tables, 19 FKs, indexes, enums; migration_lock.toml)
- [x] 27. CI-ready project structure (GitHub Actions pipeline with format/lint/typecheck/test/build/audit gates)
- [x] 28. Testing setup (jest unit + e2e config; specs: env.schema, policy.service, password-hasher)
- [x] 29. Security middleware (helmet, CORS explicit origins, throttler guard, per-route auth throttles)
- [x] 30. Production configuration (multi-stage prod image, non-root, prod secret guard, graceful shutdown)

## Notes / deferred within Phase-1 scope (not blockers)
- Concrete S3 storage adapter, real email/SMS/push notification channels: adapters plug into existing ports — Pending Technical Decisions.
- Actor-role (student/parent/tutor) detailed permission grants: Pending Business Decisions (guardianship, contact rules — BR-102/BR-103). Seeded with empty operational grants (deny-by-default holds).
- `pnpm install` + `prisma generate` must run where the package registry is reachable (blocked in this sandbox); the initial migration SQL was hand-authored to mirror Prisma's canonical DDL so `migrate deploy` applies cleanly and `migrate dev` detects no drift.

## Last generated file
`PHASE1_PROGRESS.md` (this file). Prior: `apps/backend/README.md`, verification specs, frontend app files.

## Next recommended step (Phase 2)
Begin the actor domains and marketplace chain per the Business Domain Model:
Student / Parent / Tutor profiles and guardianship, Tutor Verification, then
Booking → Scheduling → Calendar → Live Sessions — each gated on the relevant
Pending Business Decisions being logged first (guardianship, tutor eligibility,
marketplace commercial rules). Also record the Phase-1 technology selections as
TEC decisions in the Project Decision Log.
