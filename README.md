# Education Ecosystem Platform — Monorepo

Production-grade, multi-country, multi-language education platform.
**Every artifact in this repository is governed by the Project Constitution v1.0**
and the ratified governance/architecture stack (Decision Log, Product Vision,
Business Domain Model, Roles & Permissions, Product Requirements, System
Architecture, Database Architecture, Master Database Schema, Implementation
Blueprint).

## Stack (Phase 1 — resolves prior Pending Technical Decisions; log under PDL category TEC)

- **Monorepo:** pnpm workspaces + Turborepo
- **Backend:** NestJS (clean architecture, domain-aligned modules)
- **Frontend:** Next.js (added in Phase 1 continuation)
- **Database:** PostgreSQL + Prisma
- **Cache/Queue substrate:** Redis
- **Containerization:** Docker + Docker Compose

## Layout

```
apps/
  backend/     NestJS API — src/{platform,shared,modules}, prisma/
  frontend/    Next.js app (in progress)
packages/
  types/         shared cross-cutting types (@edu/types)
  localization/  AR / EN / TR translation resources (@edu/localization)
docker/          postgres init
.github/workflows/  CI pipeline (Blueprint §15)
```

## Getting started (local dev)

```bash
cp .env.example .env
pnpm install
pnpm docker:up          # postgres + redis
pnpm db:migrate         # apply migrations
pnpm db:seed            # seed foundation data (config, roles, permissions)
pnpm dev                # run apps
```

API docs (non-prod): `http://localhost:4000/api/docs`
Health: `http://localhost:4000/api/health/ready`

## Principles enforced in code

- Clean architecture: domain is pure; infrastructure is behind ports (System Arch §4).
- Everything configurable: no hardcoded country/currency/language (Constitution Art. IX/X).
- Security-first, deny-by-default authorization, minors protected most-restrictively (Art. VI).
- Every entity: UUID key, standard audit fields, soft delete (DB Arch §6-9).
- API-first, versioned, documented; uniform validation and error envelope.
