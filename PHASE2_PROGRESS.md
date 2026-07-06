# Phase 2 Implementation Progress Tracker — Core Marketplace Foundation

> Continues from completed Phase 1. Additive only; no Phase 1 file was rewritten.

## Completed — ALL Phase 2 modules
- [x] 1. Student Domain (StudentService, profile lifecycle, minor-protective default)
- [x] 2. Parent Domain (ParentService, profile lifecycle)
- [x] 3. Tutor Domain (TutorService, profile + offerings, verification-gated activation)
- [x] 4. Tutor Verification (case lifecycle, approve/reject/revoke, status transitions, high-risk audited)
- [x] 5. Tutor Availability (absolute-time windows, overlap prevention, list/cancel)
- [x] 6. Tutor Profiles (create/read/update; starts UNVERIFIED)
- [x] 7. Student Profiles (create/read/update; isMinor defaults true — BR-003)
- [x] 8. Parent–Student Relationships (guardianship link on Phase 1 AccountRelationship; created PENDING, confers no oversight — rules PBD)
- [x] 9. Marketplace Search Foundation (MarketplaceService.search, verified-only, paginated)
- [x] 10. Tutor Discovery (public /marketplace/tutors with query + sort)
- [x] 11. Tutor Filters (subject, jurisdiction, currency, price range, free-text q)
- [x] 12. Tutor Public Profiles (public /marketplace/tutors/:id, verified-only, privacy-safe fields only)

## Data / schema
- Prisma schema extended (appended) with 7 models: StudentProfile, ParentProfile, TutorProfile, TutorOffering, TutorAvailability, VerificationCase, VerificationCheck (total 28 models). 4 new enums.
- Cross-boundary references to Phase 1 tables (user_account, currency) kept as SCALAR foreign keys — no Prisma relation into Phase 1 models — so Phase 1 models are untouched. FKs enforced at DB level in the migration.
- New migration `0000000000001_phase2_marketplace` (7 tables, 8 FKs, indexes, enums). Phase 1 migration unchanged.

## Governance / correctness invariants enforced in code
- BR-002 eligibility gate: only VERIFIED tutors are discoverable; offerings can only be ACTIVATED when the tutor is VERIFIED; revoking verification deactivates active offerings.
- Art. VI (minors): student `isMinor` defaults true; guardianship links created PENDING with no oversight until an authoritative rule is logged (BR-102). Guardianship + minor data changes classified `minor_related` and audited.
- Privacy: public/discovery views expose only professional, display-safe fields; unverified/missing tutors return 404 (no enumeration/disclosure).
- Money is currency-explicit everywhere; pricing/commission rules remain PBD (BR-100/101).
- Every mutation audited; high-risk actions (verification decision, guardianship) flagged.

## Authorization
- New permission catalog `permission-keys.phase2.ts` + additive `RequirePermissionKeys` decorator (reuses Phase 1 metadata key + guard; deny-by-default holds).
- `seed.phase2.ts` grants Phase 2 permissions to operational roles only (super_admin/admin/moderator). Actor-role self-service grants deferred pending self-scope enforcement (most-protective default).

## Files of note (last generated last)
- `apps/backend/prisma/schema.prisma` (appended Phase 2 models)
- `apps/backend/prisma/migrations/0000000000001_phase2_marketplace/migration.sql`
- 7 domain modules under `apps/backend/src/modules/{student,parent,tutor,tutor-verification,tutor-availability,relationships,marketplace}`
- `apps/backend/src/shared/permission/permission-keys.phase2.ts`
- `apps/backend/src/shared/authz/require-permission-keys.decorator.ts`
- `apps/backend/prisma/seed.phase2.ts`
- `apps/backend/src/modules/marketplace/marketplace.service.spec.ts`
- `apps/backend/src/app.module.ts` (additive Phase 2 registration only)

## Notes / deferred (not blockers)
- Self-scope authorization (an actor may manage only their OWN profile): needs an object-ownership check in the guard/policy — deferred; until then actor-role profile permissions are NOT seeded (deny-by-default protects minor data).
- Booking/Scheduling/Calendar/Live Sessions are Phase 3 (gated on marketplace + PBDs: guardianship, marketplace commercial rules, session conduct).
- Run order in a DB-enabled env: `prisma migrate deploy` → `db:seed` (Phase 1) → `ts-node prisma/seed.phase2.ts`.

## Next recommended step (Phase 3)
Booking → Scheduling → Calendar → Live Sessions, each gated on its Pending
Business Decisions being logged first (marketplace commercial model, cancellation/
refund, session conduct/recording, guardianship consent). Also add self-scope
enforcement to the authorization layer, and record Phase-1/2 technology and role
decisions as TEC/GOV entries in the Project Decision Log.
