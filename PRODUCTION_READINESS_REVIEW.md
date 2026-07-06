# PRODUCTION READINESS REVIEW

### Full-Project Audit Against the Approved Architecture & Governance Stack

---

| Field | Value |
|---|---|
| **Document Title** | Production Readiness Review |
| **Scope** | Phases 1, 2, 2b, 3 (backend + frontend + schema + migrations) |
| **Reviewed Against** | Constitution, Decision Log, Product Vision, Business Domain Model, Roles & Permissions, Product Requirements, System Architecture, Database Master Architecture, Master Database Schema, Implementation Blueprint |
| **Method** | Static review of the implemented code, schema, and migrations; findings verified against the actual files. |
| **Reviewer** | Lead System Architect & Product Owner |
| **Verdict** | **NOT production-ready.** Strong architecture and governance discipline; blocking gaps in authorization enforcement, data-integrity under concurrency/soft-delete, and operational hardening must be closed first. |

> This review identifies gaps only. It proposes **no new product features** — every
> item is about making what exists safe, correct, and operable in production.

---

## EXECUTIVE SUMMARY

The codebase faithfully implements the approved architecture: clean architecture
with ports/adapters, domain-aligned modules, UUID keys + standard audit fields +
soft delete on every entity, currency-explicit money, absolute-time storage,
configurable references, provider-independent AI and Video, deny-by-default
authorization at the guard layer, uniform error envelope, structured logging with
redaction, and PBD-gating of unestablished business/legal rules (notably minor
protection). This is a solid foundation.

However, several **blocking** production issues exist. The most serious is that
authorization is **coarse-grained**: guards verify a caller *holds* a permission
but never that the caller may act on the *specific object* — so any permission
holder can read or mutate any actor's data (including minor-related records). This
is compounded by the fact that **Phase 3 permissions are granted to no role**
(no seed), making those endpoints simultaneously unreachable in practice and
unsafe by design. Data integrity has two concrete defects: **unique constraints
ignore `is_deleted`** (soft-deleting then recreating collides), and **booking/
availability use check-then-insert with no DB-level guard** (double-booking race).
Operationally, migrations are hand-authored (drift risk), there is no real
secrets/observability wiring beyond scaffolding, and the frontend is a foundation
only. None of these require new features to fix — they require hardening.

---

## FINDINGS BY CATEGORY

### A. Security Issues

**A1 (BLOCKER) — No object-level / self-scope authorization.**
`PermissionsGuard` checks only permission possession; `PolicyService.hasAllPermissions`
does not consider the target object's owner. Result: a holder of `student.profile.manage`,
`booking.request.read`, `student.progress.read`, etc. can act on **any** student/
tutor/parent record, not just their own or their relationship's. Directly violates
Roles & Permissions §3.3 (self/relationship scope), §15.3 (least privilege), and
Constitution Art. VI (minor protection). `PolicyService.canActOnMinor` exists but
is never invoked by any guard.
*Fix:* add an ownership/relationship check (resource-owner or active-guardianship)
enforced in the application layer for every actor-scoped route before granting.

**A2 (BLOCKER) — Booking/session actors are unbounded.**
`BookingService.request` and `LiveSessionService.create` accept `studentId` in the
body and never verify the caller is that student or an authorized guardian/tutor.
Combined with A1, any `booking.request.create` holder can book on behalf of any
minor. Violates BR-002 intent and Art. VI.
*Fix:* bind the actor to the resource (caller owns the student profile, or holds an
active guardianship, or is the assigned tutor/operational role).

**A3 (HIGH) — No credential-lifecycle flows.**
No password change, reset/forgot, or email-verification endpoints; no
session-revoke-on-password-change. Verified: none exist under `modules/auth`.
Production auth needs at least password reset + global session revocation.

**A4 (HIGH) — Secrets & key management are scaffolding only.**
Config validates JWT secret strength and refuses default secrets in prod (good),
but there is no integration with a secrets manager and no key rotation
(Blueprint §11 requires a dedicated mechanism). Currently secrets come only from
env. Acceptable for dev; must be wired before prod.

**A5 (MEDIUM) — Global guard ordering is implicit.**
`ThrottlerGuard` (SecurityModule) and `JwtAuthGuard`/`PermissionsGuard`
(AuthorizationModule) are all `APP_GUARD`s registered across modules; execution
order is registration-dependent and not guaranteed to run rate-limiting before
auth. Make ordering explicit.

**A6 (MEDIUM) — Audit writes are best-effort.**
`AuditService.record` swallows failures (logs and continues). The Constitution
(Art. 6.5, "no unaudited power") implies audit for security-critical actions
should be durable. For high-risk actions (verification decide, role assign,
booking decisions) consider transactional audit or an outbox.

**A7 (LOW) — CSP disabled in non-prod; verify prod CSP.**
`helmet` CSP is off in dev and defaulted in prod; confirm a real policy for
prod surfaces (Blueprint §17).

---

### B. Database Inconsistencies

**B1 (BLOCKER) — Unique constraints ignore soft delete.**
`Identity.primaryEmail`, `primaryPhone`, all `accountId @unique` on profiles,
`Favorite(studentAccountId,tutorId)`, `TutorSubject(tutorId,subject)`, etc. are
plain unique indexes. Because soft-deleted rows remain, a soft-deleted record
permanently blocks recreation (e.g., a soft-deleted identity locks its email
forever), and some services work around this with `isDeleted:false` filters that
the DB constraint does not know about. Violates DB Master Architecture §8 (soft
delete must not break correctness).
*Fix:* use partial unique indexes `WHERE is_deleted = false` (Postgres) for all
soft-deletable unique keys.

**B2 (BLOCKER) — Check-then-insert race on bookings and availability.**
`BookingService.request` reads availability + busy slots then inserts with no
DB-level exclusion; two concurrent requests can both pass and double-book.
`TutorAvailabilityService.create` has the same overlap race. Violates Requirements
EC-004 (conflicts prevented) and NFR-007 resilience.
*Fix:* enforce at the DB (exclusion constraint on a time range, or serializable
transaction / advisory lock on the tutor+slot).

**B3 (HIGH) — Scalar cross-boundary FKs lose referential guarantees in Prisma.**
Phase 2/2b/3 reference prior tables by scalar UUID with FKs enforced only in raw
SQL migrations (a deliberate choice to keep completed models intact). The DB
constraints exist, but Prisma cannot cascade, and soft-deleting a parent (e.g., a
`TutorProfile`) leaves children (`TutorOffering`, `Booking`) referencing a
logically-deleted parent with no cascade of `is_deleted`. Document and add
soft-delete cascade handling in services, or reconcile the relations.

**B4 (HIGH) — Hand-authored migrations vs. Prisma drift.**
All three migrations are hand-written to mirror Prisma DDL (registry was
unavailable). Before prod, run `prisma migrate diff`/`migrate dev` against a real
DB to confirm **zero drift**; otherwise `migrate deploy` and the client may
diverge. `updated_at` carries `DEFAULT now()` in SQL while Prisma treats it as
app-managed `@updatedAt` — verify this does not register as drift.

**B5 (MEDIUM) — No retention/erasure enforcement.**
Soft delete is implemented but lawful hard-erasure/anonymization (DB Arch §8.3),
retention periods, and audit-log retention are unimplemented (all PBD/legal, but
the *mechanism* is needed before handling real minor data in production).

---

### C. Performance Issues

**C1 (HIGH) — Marketplace search does unindexed text scans.**
`MarketplaceService.search` uses `contains` + `mode:'insensitive'` on `headline`/
`bio`/offering `title`/`subject` with `OR` and nested `some` — no text index;
`fullTextSearchPostgres` is enabled in Prisma but unused. Full scans at scale
(NFR-006 performance-first).
*Fix:* add trigram/full-text indexes or a search index; precompute discovery
signals.

**C2 (MEDIUM) — Unbounded list queries.**
Verified `findMany` without `take` in: relationships, tutor-catalog (subjects/
languages), booking busy-slot & tutor list inputs, calendar, curriculum
enrollments, tutor-availability list, favorites list, learning goals. Add caps/
pagination to bound result sets and memory.

**C3 (LOW) — Redis available but underused.**
Only localization caches. Hot read paths (public tutor profiles, discovery,
languages) could cache with explicit invalidation (System Arch §14). Optimization,
not a blocker.

---

### D. API Inconsistencies

**D1 (HIGH) — Phase 3 endpoints are unreachable (no permission grants).**
Verified: there is **no `seed.phase3.ts`**, so no role holds any `PHASE3_PERMISSIONS`.
Every curriculum/live-session/AI/notification route is deny-by-default for all
users. Add the Phase 3 seed grants (mirroring seed.phase2/2b) before these APIs
function.

**D2 (MEDIUM) — Inconsistent resource nesting.**
E.g., `bookings/tutors/:tutorId/list` and `bookings/tutors/:tutorId/calendar`
mix collection and sub-resource under `bookings`, while discovery uses
`marketplace/tutors/:id`. Normalize REST resource paths (Blueprint §1.3 uniform
style).

**D3 (LOW) — Error/response envelope not applied to success bodies uniformly.**
Errors use the uniform `ApiErrorBody`; success payloads are ad hoc per handler.
Consider a consistent success envelope or documented convention (Blueprint §1.5).

**D4 (LOW) — OpenAPI is gated off in production.**
Reasonable, but ensure an internal/authenticated way to publish the contract for
consumers (Blueprint §1.7 documentation requirement).

---

### E. UI Inconsistencies

**E1 (HIGH) — Frontend is a foundation only.**
Verified surfaces: root layout, `[lang]` layout, one home page. No auth flow, no
role-specific portals (student/parent/tutor/admin/support), no consumption of the
built APIs. RTL/i18n scaffolding is correct (Art. III) but there are no product
surfaces. This is expected for the current phase but is a large gap for
"production readiness."
*Note:* per the task, not to be built here — tracked as a readiness gap.

**E2 (MEDIUM) — No accessibility verification.**
Blueprint §18 requires accessibility conformance (standard/level is PBD). No a11y
tests or audits exist. Needed before any user-facing surface ships.

---

### F. Business Rule Violations / Gaps

**F1 (BLOCKER) — Actor self-service is unsafe, so it was left ungranted, leaving a contradiction.**
The correct decision (deny actor self-service until self-scope exists) was made,
but it means students/parents/tutors cannot use their own profiles/goals/
bookings at all, while operational roles *can* act on everyone. Production needs
self-scope (A1) so actor grants can be safely enabled — otherwise the platform is
unusable by its actual users.

**F2 (OK, keep) — Minor protection defaults are correct.**
`isMinor` defaults true; guardianship links are PENDING and confer no oversight;
Child Monitoring fails closed; recording not invented. These correctly implement
Art. VI / BR-003 and should be preserved.

**F3 (OK, keep) — Commercial rules correctly gated.**
Bookings create REQUESTED with no payment; cancellation applies no penalty;
pricing is indicative and currency-explicit. Correct PBD-gating (BR-100/101).

**F4 (MEDIUM) — Verification revoke deactivates offerings but not sessions/bookings.**
`TutorVerificationService.revoke` sets offerings INACTIVE but does not cancel
future bookings/live sessions for a now-unverified tutor. Close the loop
(consistency with BR-002).

**F5 (LOW) — Decision Log still empty.**
Phase 1/2/3 selected the stack (Next/Nest/Postgres/Prisma/Redis) and the
foundational roles — these are governed decisions that should be recorded as TEC/
GOV entries in the Project Decision Log (Constitution Art. 8.7). No entries exist.

---

### G. Testing / Verification Gaps

**G1 (HIGH) — Thin automated coverage.**
Only ~7 unit specs (config, policy, hasher, booking domain, availability engine,
AI adapter). No integration tests (guards + DB), no contract/e2e tests for
journeys (Requirements UJ-001…006), no non-functional tests. Blueprint §14
requires proportionate coverage, strongest on auth/authorization/payments/minor
paths.

**G2 (MEDIUM) — No verification that migrations apply / seeds run.**
Because the registry was unavailable, nothing has been executed end-to-end. A
first `docker compose up` + `migrate deploy` + all seeds + `/health/ready` smoke
run is required to prove the stack boots.

---

## PRIORITIZED PRODUCTION READINESS CHECKLIST

### P0 — Blocking (must fix before any production traffic)

- [ ] **P0-1 Object-level authorization / self-scope** (A1, A2, F1): enforce that
      the caller owns the target resource, holds an active guardianship, or is the
      assigned tutor/operational role — for every actor-scoped route. Wire
      `canActOnMinor`. *Acceptance:* a user cannot read/mutate another actor's data;
      integration tests prove deny.
- [ ] **P0-2 Soft-delete-aware uniqueness** (B1): convert all soft-deletable unique
      keys to partial unique indexes `WHERE is_deleted = false`. *Acceptance:*
      soft-delete then recreate succeeds; duplicates still rejected among live rows.
- [ ] **P0-3 Concurrency-safe booking/availability** (B2): DB-level exclusion
      (range exclusion constraint or serializable tx/advisory lock). *Acceptance:*
      concurrent identical booking requests yield exactly one success.
- [ ] **P0-4 Phase 3 permission grants** (D1): add `seed.phase3.ts`; grant to the
      correct roles once self-scope (P0-1) exists. *Acceptance:* Phase 3 endpoints
      reachable by intended roles, denied otherwise.
- [ ] **P0-5 Migration/drift verification** (B4, G2): run against a real Postgres;
      `prisma migrate` reports zero drift; all seeds run; `/health/ready` green.

### P1 — High (fix before general availability)

- [ ] **P1-1 Credential lifecycle** (A3): password change + reset + email
      verification + global session revocation on password change.
- [ ] **P1-2 Secrets & key management** (A4): integrate a secrets manager; define
      key rotation; remove any reliance on plaintext env in prod.
- [ ] **P1-3 Search performance** (C1): add trigram/full-text indexes (or a search
      service); verify discovery latency targets.
- [ ] **P1-4 Soft-delete cascade / referential integrity** (B3): cascade
      `is_deleted` to children or block delete; reconcile scalar-FK relations.
- [ ] **P1-5 Verification revoke closes bookings/sessions** (F4).
- [ ] **P1-6 Test coverage** (G1): integration tests for auth + authorization +
      minor-safety + booking concurrency; e2e for core journeys.
- [ ] **P1-7 Bound all list queries** (C2): add pagination/caps to the unbounded
      `findMany` calls.
- [ ] **P1-8 Guard ordering** (A5): make rate-limit → authenticate → authorize
      order explicit.

### P2 — Medium / hardening (fix before scale)

- [ ] **P2-1 Retention/erasure mechanism** (B5): implement hard-erasure/anonymize
      path + retention jobs (values remain PBD/legal).
- [ ] **P2-2 Durable audit for high-risk actions** (A6): transactional/outbox audit.
- [ ] **P2-3 Observability wiring** (ops): metrics/tracing/alerting beyond
      scaffolding; dashboards for SLOs.
- [ ] **P2-4 Caching hot read paths** (C3) with explicit invalidation.
- [ ] **P2-5 API path normalization + success envelope** (D2, D3).
- [ ] **P2-6 Accessibility audit** (E2) once surfaces exist.
- [ ] **P2-7 Record stack/role decisions in the Decision Log** (F5).
- [ ] **P2-8 Production CSP** (A7).

### P3 — Known scope gaps (not features to add now; tracked)

- [ ] **P3-1 Frontend product surfaces** (E1): role portals consuming the APIs.
- [ ] **P3-2 Remaining Phase 3 modules** (schema ready): Resources/Files, Notes,
      Assignments, Assessments/Quizzes, Student Progress, Certificates.
- [ ] **P3-3 Real AI & Video provider adapters** behind the existing ports (PTDs).
- [ ] **P3-4 Payments/Wallet/Subscription** once commercial-model PBDs are logged.

---

## WHAT IS ALREADY PRODUCTION-GRADE (preserve)

Clean architecture + ports/adapters; provider independence for AI and Video
(Art. VII) verified structurally and by test; UUID keys, standard audit fields,
soft delete, currency-explicit money, absolute-time storage, configurable
references on every entity; deny-by-default guards and fail-closed error handling;
uniform error envelope; structured logging with secret/PII redaction; correct
minor-protection and commercial-rule PBD-gating; consistent API versioning and
health/readiness probes; multi-stage prod image running non-root with a prod
secret guard. These should not be regressed while closing the gaps above.

---

## CLOSING

The project is architecturally sound and governance-disciplined, but **not yet
production-ready**. The blocking items are concentrated and well-understood:
object-level authorization (so real users can safely use the system), soft-delete-
aware uniqueness, concurrency-safe scheduling, Phase 3 permission grants, and an
end-to-end migrate/seed/boot verification. Clearing P0 then P1 yields a safe,
correct, operable baseline without adding a single new feature.
