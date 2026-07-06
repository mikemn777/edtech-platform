# Backend — NestJS (Clean Architecture)

Domain-aligned modules behind explicit contracts. The domain core is pure; all
infrastructure (DB, cache, providers) sits behind ports (System Architecture §4).

## Layout

```
src/
  platform/     cross-cutting: config, logging, errors, validation, security, swagger, health, http
  shared/       identity context, prisma, redis, authz (guards/policy), permission catalog, pagination
  modules/
    audit/          append-only audit records (Art. 6.5)
    auth/           registration, login, refresh rotation, logout (Argon2id + JWT)
    authorization/  global JWT + RBAC guards (deny-by-default)
    user-management/ accounts, roles, relationships
    countries/      configurable country onboarding
    localization/   languages, direction (RTL), translations (cached)
    settings/       scoped, versioned configuration
    notifications/  channel-agnostic dispatch (port + adapters)
    file-storage/   storage port + local adapter (S3 pluggable)
prisma/
  schema.prisma            foundation models (config, identity, RBAC, audit)
  migrations/0000000000000_init  initial DDL
  seed.ts                  foundational roles, permissions, launch countries/languages
```

## Global guarantees (enforced in code)

- Deny-by-default authorization on every route unless `@Public()` (Roles §15.4).
- Fails closed on auth ambiguity (Roles §16.8).
- Minor-sensitive actions default to most-restrictive (BR-003).
- Every mutation is audited; no role has unaudited power (Roles §13.3).
- Correlation id + resolved language on every request (§12, §14).
- Uniform error envelope; no sensitive/PII/secret leakage (§13).

## Commands

```bash
pnpm db:migrate:deploy   # apply migrations
pnpm db:seed             # seed foundational data
pnpm dev                 # run with watch
pnpm test                # unit tests
```
