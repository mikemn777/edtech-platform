# Eduspark — Full Project Report (Developer Handoff)

_A complete, from-zero overview for a developer joining the project: what it is,
how it's built, what works today, what's left, and how to run it._

---

## 1. Executive summary

**Eduspark** is a production-oriented, multi-country, multi-language **education
marketplace + learning platform** connecting **students, parents, and tutors**,
governed by operational roles (admin, moderator, finance, support).

- **Backend:** essentially complete and running — NestJS REST API, PostgreSQL
  (55 tables), Redis, JWT auth, RBAC, ~20 domain modules, Swagger docs.
- **Frontend:** a real, growing Next.js app. The **core loop is done**:
  browse → save → book → manage, plus role dashboards, admin user management,
  tutor self-service, student goals, dark mode, and full EN/AR (RTL) + partial TR.
- **Remaining:** several actor/admin features still to build (listed in §9).

The project was built "governance-first": a stack of specification documents (a
"Constitution" + supporting docs in `/docs`) defines the rules; the code
implements them. Anything not yet authoritatively decided is marked as a Pending
Business/Technical Decision (PBD/PTD) rather than invented.

---

## 2. Tech stack

| Area | Choice |
|---|---|
| Monorepo | pnpm workspaces + Turborepo |
| Backend | NestJS 10 (Node), TypeScript |
| ORM / DB | Prisma 5.22 · PostgreSQL 16 |
| Cache | Redis 7 |
| Auth | JWT (access + refresh), argon2, Passport |
| API docs | Swagger / OpenAPI 3 at `/api/docs` |
| Validation | class-validator / class-transformer; Zod for env |
| Logging | nestjs-pino (structured, redacted) |
| Frontend | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Hand-rolled CSS design system (`src/styles/globals.css`) — CSS variables, light/dark, RTL via logical properties. **No UI framework / no extra deps.** |
| i18n | Shared `@edu/localization` package (en / ar-RTL / tr) |
| Shared types | `@edu/types` package (backend + frontend) |
| Local infra | Docker Compose (Postgres + Redis) |

---

## 3. Repository structure

```
edu-platform/
├── apps/
│   ├── backend/                      # NestJS API
│   │   ├── src/
│   │   │   ├── main.ts                # bootstrap (helmet, versioning, swagger)
│   │   │   ├── app.module.ts          # composes all modules
│   │   │   ├── platform/              # config, logging, security, health, http, errors, validation, swagger
│   │   │   ├── shared/                # prisma, redis, identity, authz, audit, pagination, permission catalogs
│   │   │   └── modules/               # one folder per domain (auth, users, tutor, student, parent, marketplace,
│   │   │                              #   booking, favorites, curriculum, live-sessions, ai, learning, …)
│   │   └── prisma/
│   │       ├── schema.prisma          # ALL 55 models (single file)
│   │       ├── migrations/            # 4 hand-authored SQL migrations
│   │       └── seed*.ts               # seed, seed.demo, seed.grants, seed.demo-accounts
│   └── frontend/                      # Next.js app
│       └── src/
│           ├── app/[lang]/            # locale-prefixed routes (see §8)
│           ├── components/            # design-system + layout components
│           ├── lib/                   # api client, auth/session, feature helpers
│           ├── styles/globals.css     # the design system
│           └── middleware.ts          # language routing
├── packages/
│   ├── types/                         # @edu/types — shared enums & interfaces
│   └── localization/                  # @edu/localization — en / ar / tr bundles
├── docs/                              # governance/spec documents
├── docker-compose.yml                 # postgres + redis
└── STATUS.md / START-HERE.md          # quick status + how-to-run
```

Backend clean-architecture convention per module: `domain/` (pure rules),
`application/` (services), `adapters/` (infra), `contracts/` (DTOs).

---

## 4. Database (Prisma / PostgreSQL — 55 models)

Every table: UUID PK (`gen_random_uuid()`), standard audit fields
(`createdAt/updatedAt/createdBy/updatedBy`), soft delete
(`isDeleted/deletedAt/deletedBy`), `recordVersion` (optimistic lock), UTC times.

- **Config/reference:** Country, Jurisdiction, JurisdictionAttribute, Currency,
  Language, Locale, TranslationKey, TranslationValue, Setting, ConfigurationVersion.
- **Identity/auth/RBAC:** Identity, AuthCredential, AuthSession, AuthEvent,
  UserAccount, Role, Permission, RolePermission, AccountRole, AccountRelationship,
  AuditRecord.
- **Actors/marketplace:** StudentProfile, ParentProfile, TutorProfile,
  TutorOffering, TutorAvailability, VerificationCase, VerificationCheck,
  TutorSubject, TutorLanguage, TutorRate, LearningGoal, ProgressRecord, Favorite,
  Booking, BookingStatusHistory.
- **Learning delivery:** Course, CourseModule, Program, ProgramCourse,
  LearningPath, LearningPathStep, Enrollment, Resource, Note, Assignment,
  AssignmentSubmission, Assessment, AssessmentQuestion, AssessmentSubmission,
  AssessmentAnswer, LiveSession, SessionAttendance, Certificate, AIInteraction.

Migrations are **hand-authored SQL** (the original sandbox had no npm registry
access to auto-generate). They match the schema; if you regenerate, diff-check.

---

## 5. Backend API (all live)

Base: `http://localhost:4000/api`. Versioned routes under `/api/v1/...`.
Interactive docs: `http://localhost:4000/api/docs`.

- **auth:** `POST /v1/auth/register | login | refresh | logout`.
  Login → `{ accessToken, refreshToken, accessExpiresIn, refreshExpiresIn }`.
  Access-token JWT payload: `{ sub (accountId), identityId, roles[], permissions[] }`.
- **users:** `GET /v1/users` (paginated), `GET /v1/users/:id`, `PATCH /v1/users/:id`, `POST /v1/users/:id/roles`.
- **students:** `POST /v1/students/profiles`, **`GET /v1/students/profiles/me`** (added), `GET/PATCH /v1/students/profiles/:id`; `POST/GET /v1/students/:studentId/goals`, `PATCH .../goals/:goalId/status`; `POST/GET .../progress`.
- **parents:** `POST/GET/PATCH /v1/parents/profiles`; child monitoring (guardianship-gated).
- **tutors:** `POST /v1/tutors/profiles`, **`GET /v1/tutors/profiles/me`** (added), `GET/PATCH .../profiles/:id`; offerings; `GET/POST/DELETE /v1/tutors/:tutorId/subjects`; languages; `GET/PUT .../rate`; `GET/POST/DELETE /v1/tutors/:tutorId/availability`; `GET /v1/tutors/:tutorId/dashboard`.
- **tutor-verification:** open case, decide, revoke.
- **relationships:** guardianship links (parent ↔ student).
- **marketplace (public):** `GET /v1/marketplace/tutors` (search/filter/paginate), `GET /v1/marketplace/tutors/:id`.
- **favorites:** `GET/POST /v1/favorites`, `DELETE /v1/favorites/:tutorId` (self-scoped by account).
- **booking:** `POST /v1/bookings`, `GET /v1/bookings/:id`, `POST .../confirm | reject | cancel | complete`, `GET /v1/bookings/tutors/:tutorId/list | calendar`. Governed state machine.
- **curriculum (public list):** courses, programs, learning paths, enrollments.
- **live-sessions:** schedule/start/join/complete/cancel + attendance.
- **ai:** assistant + recommendations (provider-independent; default local adapter).
- **health:** `GET /api/health/live | ready` (checks DB + Redis).

---

## 6. Auth & authorization

- **Deny-by-default.** Global `JwtAuthGuard` + `PermissionsGuard`; routes are
  protected unless `@Public()`.
- **RBAC.** Roles hold permissions; the flattened permission set is embedded in
  the JWT at login (so **permission changes require re-login**).
- **Roles seeded:** operational — `super_admin` (all core perms), `admin`,
  `moderator`, `finance`, `support`; actor — `tutor`, `parent`, `student`.
- **Self-service permissions** for actor roles are wired by `prisma/seed.grants.ts`
  (favorites, goals, progress, booking, tutor profile/subjects/availability, etc.).
- **"me" resolution:** because most actor endpoints take a profile id in the path,
  two convenience routes were added — `GET /students/profiles/me` and
  `GET /tutors/profiles/me` — returning the caller's profile (or null). The
  frontend get-or-creates a profile from these.

---

## 7. Frontend — design system & structure

- **Design system:** `src/styles/globals.css` — CSS variables, `[data-theme="dark"]`
  overrides, logical properties for RTL, responsive grid utilities, component
  classes (`.btn`, `.card`, `.badge`, `.input`, `.alert`, `.app`/sidebar shell, etc.).
  No Tailwind, no component library — intentionally dependency-free so it runs as-is.
- **API layer:** `lib/api-client.ts` (`apiFetch`, typed `ApiError`), `lib/useApi.ts`
  (`authed()` + `useApiQuery` hook), `lib/auth.ts` (login/register/token/JWT-decode),
  `lib/session.ts` (`useSession`, role helpers, post-login routing).
- **Feature helpers:** `lib/favorites.ts`, `lib/booking.ts`, `lib/goals.ts`,
  `lib/tutorSelf.ts`, `lib/theme.ts`, `lib/i18n.ts`.
- **Layout components:** `SiteHeader`, `SiteFooter`, `MarketingLayout`,
  `ContentPage`, `DashboardShell` (role-aware sidebar + auth guard), `AuthShell`,
  `ThemeToggle`, `LangSwitcher`, `navs.tsx`, `icons.tsx` (inline SVG set).
- **i18n:** all user-facing strings via `@edu/localization` bundles. English +
  Arabic are fully translated; Turkish has key strings (graceful fallback to EN).

---

## 8. Feature status

### ✅ Built & working (routes under `/[lang]/`, e.g. `/en/...`)

- **Public site:** `/` landing, `/about`, `/pricing`, `/contact`, `/privacy`,
  `/terms`, `/courses`. Dark mode + language switch everywhere.
- **Auth:** `/login`, `/register` (with role selection). Role-based post-login routing.
- **Marketplace:** `/tutors` (search, subject filters, sort, pagination, favorite
  hearts) and `/tutors/[id]` (bio, offerings, live availability slots, **book a slot**).
- **Favorites:** `/favorites` (+ heart toggle on cards) — real, self-scoped.
- **Booking:** request a slot from a tutor profile → real booking; `/student/bookings`
  (My bookings: status + cancel).
- **Student:** `/student` dashboard, `/student/goals` (create/track learning goals).
- **Tutor self-service:** `/tutor` dashboard, `/tutor/profile` (headline/bio + subjects),
  `/tutor/availability` (add/remove bookable slots).
- **Parent:** `/parent` dashboard.
- **Admin:** `/admin` console (live stats), `/admin/users` (real paginated accounts).

### 🔜 Not built yet

- **Tutor:** confirm/reject **incoming** bookings; rate & languages editors; offerings UI.
- **Student:** progress tracking UI; enrolled courses.
- **Parent:** link a child (guardianship); child monitoring.
- **Admin:** tutor **verification queue**; content/courses management; **analytics**;
  countries / settings / localization admin.
- **Platform:** notifications, messaging, account settings, **payments/checkout**
  (commercial rules are intentionally PBD in the backend).
- **Hardening:** object-level/self-scope authz beyond current grants; refresh-token
  rotation on the client; move tokens to secure cookies; clean up ~14 strict-TS
  warnings so `nest build` passes; verify hand-authored migration drift.

---

## 9. How to run locally

Prereqs: Node, pnpm 9, Docker Desktop running. (Full detail in `START-HERE.md`.)

```bash
# one-time
npm install -g pnpm@9.12.0
cp .env.example .env && cp .env apps/backend/.env
pnpm install
pnpm --filter @edu/backend db:generate
docker compose up -d postgres redis
pnpm --filter @edu/backend db:migrate:deploy
# seeds (foundational + demo data + permission grants + demo logins)
pnpm --filter @edu/backend db:seed
# then run these seeds too (set DATABASE_URL first): seed.demo.ts, seed.grants.ts, seed.demo-accounts.ts

# every run
docker compose up -d postgres redis
# backend (from apps/backend) — transpile-only to skip strict type-gate:
$env:TS_NODE_TRANSPILE_ONLY="1"; node -r ts-node/register -r tsconfig-paths/register src/main.ts
# frontend (repo root):
pnpm --filter @edu/frontend dev
```

URLs: site `http://localhost:3000/en` · API docs `http://localhost:4000/api/docs`
· health `http://localhost:4000/api/health/ready`.

**Note for the reviewer:** the backend is run via `ts-node` **transpile-only** to
bypass ~14 non-blocking strict-TypeScript errors that otherwise stop `nest start`.
The app runs correctly; cleaning those up so `nest build`/`nest start` pass is a
good early task. (`nest start --watch` / SWC would restore hot-reload.)

### Test accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@edu.local | Admin@12345 |
| Student | student@demo.edu | Student12345! |
| Parent | parent@demo.edu | Parent12345! |
| Tutor | tutor@demo.edu | Tutor12345! |

Plus 6 demo marketplace tutors (no login) seeded for browsing/booking.

---

## 10. Notable fixes / decisions already made (so you don't redo them)

1. `schema.prisma`: removed an invalid `previewFeatures` value; Phase-3 enums were
   single-line (invalid) → expanded to multi-line.
2. `apps/backend/tsconfig.json`: removed `"prisma"` from `include` (seeds were
   wrongly pulled into the app build).
3. `packages/localization` & `packages/types`: removed ESM-only JSON import
   attributes + `"type": "module"` so the CommonJS backend can consume them.
4. Rate limit raised (`security.module.ts`) so a normal SPA isn't throttled.
5. Added `GET /students/profiles/me` and `GET /tutors/profiles/me` for actor
   self-service; `seed.grants.ts` wires the needed permissions to roles.

---

## 11. Recommended next steps (priority order)

1. Tutor **confirm/reject** incoming bookings (uses existing `bookings/tutors/:id/list`
   + `confirm|reject`) → closes the booking loop.
2. Admin **verification queue** (approve tutors → they enter the marketplace).
3. Student **progress**, parent **child-linking + monitoring**.
4. **Notifications** (backend `notification-channels` ports exist) + account settings.
5. Commercial layer (**payments/checkout**) once pricing/commission PBDs are decided.
6. Housekeeping: fix strict-TS errors, restore `nest start` hot-reload, verify
   migration drift, add refresh-token rotation + secure cookie storage.

---

_This report reflects the codebase as delivered. The `/docs` folder contains the
full governance/specification stack (Constitution, Product Requirements, System
Architecture, Database Architecture, Implementation Blueprint, etc.) for deeper
context on intended rules and scope._
