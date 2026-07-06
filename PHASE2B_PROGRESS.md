# Phase 2 (Core Business Platform) Progress Tracker

> Continues from Phase 1 + Phase 2 (Core Marketplace Foundation). Additive only;
> no completed file rewritten. Already-built items (Tutor Profile/Verification/
> Availability, Student Profile, Parent Profile, Marketplace Search/Filters/Public
> Pages) were NOT regenerated.

## Completed this phase (Core Business Platform — the NEW pieces)
### 1. Tutor Module
- [x] Tutor Profile — (already built Phase 2; unchanged)
- [x] Tutor Verification — (already built Phase 2; unchanged)
- [x] Tutor Availability — (already built Phase 2; unchanged)
- [x] Tutor Pricing — TutorRate (currency-explicit indicative rate; supersede-on-update)
- [x] Tutor Subjects — TutorSubject (add/list/remove)
- [x] Tutor Languages — TutorLanguage (configurable language ref + proficiency)
- [x] Tutor Dashboard — read-only aggregation (verification, offerings, subjects, availability, bookings-by-status)

### 2. Student Module
- [x] Student Profile — (already built Phase 2; unchanged)
- [x] Learning Goals — LearningGoal (create/list/status), minor_related + audited
- [x] Progress Tracking — ProgressRecord (record/list, optional goal link)

### 3. Parent Module
- [x] Parent Profile — (already built Phase 2; unchanged)
- [x] Parent-Student Management — (guardianship links built Phase 2; unchanged)
- [x] Child Monitoring — guardianship-gated; fails closed unless link is ACTIVE (oversight rules PBD; denied attempts audited)

### 4. Marketplace
- [x] Tutor Search — (already built Phase 2; unchanged)
- [x] Advanced Filters — (already built Phase 2; unchanged)
- [x] Tutor Public Pages — (already built Phase 2; unchanged)
- [x] Favorites — Favorite (verified-tutor-only, self-scoped add/list/remove)

### 5. Booking System
- [x] Scheduling — slot request validated against availability windows
- [x] Calendar — CalendarService (availability + bookings timeline, UTC, ranged)
- [x] Availability Engine — pure domain (isWithinWindow/overlaps/slotIsBookable) + tests
- [x] Booking Workflow — request → confirm/reject → complete/cancel, verified-tutor gate, collision check
- [x] Booking Status — pure state machine (governed transitions VR-003) + status history + tests

## Data / schema
- Prisma extended (appended) with 8 models (total 36): TutorSubject, TutorLanguage, TutorRate, LearningGoal, ProgressRecord, Favorite, Booking, BookingStatusHistory. 3 new enums (BookingStatus, GoalStatus, RateUnit).
- Cross-references to prior tables use SCALAR foreign keys (FKs enforced at DB level in migration) — no completed model modified. Only new-to-new Prisma relations used (LearningGoal↔ProgressRecord, Booking↔BookingStatusHistory).
- New migration `0000000000002_phase2b_business` (8 tables, 17 FKs, indexes, enums). Prior migrations untouched.

## Governance / correctness invariants enforced in code
- BR-002 eligibility gate: only VERIFIED tutors can be booked or favorited.
- Availability engine prevents out-of-window and colliding bookings (EC-004).
- Booking state machine enforces only governed transitions (VR-003); terminal states are final.
- Art. VI (minors): learner data classified minor_related and audited; Child Monitoring fails closed unless guardianship is authoritatively ACTIVE — oversight rules remain PBD (BR-102), denied attempts audited.
- Commercial rules gated: bookings created REQUESTED, NO payment processed, cancellation applies NO penalty — final price/commission/cancellation policy are PBD (BR-100/101).
- Money is currency-explicit everywhere (TutorRate, Booking.price).
- Every mutation audited; high-risk actions (booking decision, child monitoring) flagged.

## Authorization
- New catalog `permission-keys.phase2b.ts` + reused `RequirePermissionKeys` decorator/guard (deny-by-default).
- `seed.phase2b.ts` grants Phase 2b permissions to operational roles (super_admin/admin, plus read scopes to support/moderator). Actor self-service grants deferred pending self-scope enforcement.

## Tests
- `booking/domain/booking-status.spec.ts` (state machine).
- `booking/domain/availability-engine.spec.ts` (overlap/bookability).
- (Plus Phase 1/2 specs unchanged.)

## Last generated file
`PHASE2B_PROGRESS.md`. Prior: `apps/backend/prisma/seed.phase2b.ts`, booking module, calendar service.

## Run order (DB-enabled env)
`prisma migrate deploy` → `db:seed` (Phase 1) → `ts-node prisma/seed.phase2.ts` → `ts-node prisma/seed.phase2b.ts`.

## Next recommended step
Add SELF-SCOPE enforcement to the authorization layer (an actor may act only on
their OWN profile/goals/bookings) — this unblocks safe actor-role grants. Then
Phase 3: Live Sessions (delivery), Reviews/Ratings, and the commercial layer
(Payments/Wallet/Subscription) once the marketplace commercial-model PBDs
(pricing, commission, cancellation, minor consent) are authoritatively logged.
Record Phase-1/2/2b technology + role decisions as TEC/GOV entries in the PDL.
