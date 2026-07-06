# MASTER DATABASE SCHEMA

### The Complete Logical Data Design for the Education Ecosystem Platform

---

| Field | Value |
|---|---|
| **Document Title** | Master Database Schema (Logical) |
| **Document Class** | Tier 2 — Design Artifact (subordinate to Tier 0/1 governance) |
| **Version** | 1.0 |
| **Status** | Ratified — Active |
| **Owner** | Lead System Architect & Product Owner |
| **Date of Ratification** | 2 July 2026 |
| **Governing Authority** | Project Constitution v1.0 (Tier 0) |
| **Directly Governed By** | Database Master Architecture v1.0; System Architecture Master Document v1.0; Business Domain Model v1.0 |
| **Constitutional Basis** | Articles II, III, VI, VIII, IX, X, XIV |

---

## READER'S NOTE ON SCOPE, SOURCING, AND DEFERRALS

This document is the **complete logical data model** of the Platform: every entity, its attributes, relationships, constraints, index recommendations, business rules, audit fields, and expansion notes. It is a *logical* design — technology-neutral and expressed in conceptual data types.

Per the task and Constitution Article VIII, it contains **no SQL, no ORM/Prisma models, and no physical/implementation detail.** Data types are logical (see glossary); physical types, engine specifics, and storage are Pending Technical Decisions per the Database Master Architecture.

Per Constitution Article IX, it **invents no business rule.** Each entity's "Business Rules" field distinguishes: (a) **established** rules derived from ratified documents; and (b) **Pending Business Decision (PBD)** rules whose content must be set by an authoritative owner (Art. XIV) and recorded in the Project Decision Log before enforcement. **PTD** marks technology choices deferred to the Decision Log (category TEC).

This schema conforms to the Database Master Architecture: globally-unique non-semantic identifiers (§6–7), standard audit fields and soft delete (§8–9), currency-explicit money (§12), absolute-time storage (§13), configurable references for country/currency/language/school-system/payment-method (§10–12, Art. IX/X), boundary-owned data (§2), and integrity by design (§24).

---

## LOGICAL DATA TYPE GLOSSARY

Types are conceptual, not engine-specific (physical mapping = PTD):

- **Identifier** — globally-unique, non-semantic, non-enumerable key (UUID-style; DB Arch §7).
- **Reference(Entity)** — a relationship reference to another entity's Identifier (within a boundary a direct reference; across boundaries a governed reference/projection per DB Arch §2.3).
- **String** — short bounded text. **Text** — long unbounded text.
- **Boolean**, **Integer**, **Decimal** — as named.
- **MoneyAmount** — exact-precision monetary value; ALWAYS paired with **Reference(Currency)** (DB Arch §12).
- **Timestamp(UTC)** — absolute-time instant; local time derived at presentation (DB Arch §13).
- **Date** — calendar date (locale-formatted at presentation).
- **Enum(Configured)** — a value drawn from governed configuration/reference data, NOT a hardcoded literal (Art. X). The value *set* is often PBD.
- **LocalizedText** — text with multiple language representations + fallback (DB Arch §11).
- **Classification** — sensitivity tag (Personal / Financial / Minor-Related / Operational) driving encryption, access, retention (DB Arch §4.5).
- **JSONDocument** — structured, schema-governed nested data (logical; physical form PTD).

---

## COMMON STANDARD FIELDS (APPLIED TO EVERY ENTITY)

Per DB Architecture §4.2, §8, §9, every entity carries these **Standard Fields** unless explicitly noted. They are not re-listed per entity; each entity's "Audit Fields" notes only additions or emphasis.

| Field | Type | Req | Purpose |
|---|---|---|---|
| `id` | Identifier | Yes | Primary key (DB Arch §6–7). Immutable. |
| `created_at` | Timestamp(UTC) | Yes | Creation instant. |
| `updated_at` | Timestamp(UTC) | Yes | Last modification instant. |
| `created_by` | Reference(UserAccount) | Yes* | Actor who created (system actor where applicable). |
| `updated_by` | Reference(UserAccount) | Yes* | Actor who last modified. |
| `is_deleted` | Boolean | Yes | Soft-delete marker; default false (DB Arch §8). |
| `deleted_at` | Timestamp(UTC) | No | Soft-delete instant. |
| `deleted_by` | Reference(UserAccount) | No | Actor who soft-deleted. |
| `record_version` | Integer | Yes | Optimistic-concurrency / versioning (DB Arch §22). |

*Attribution may reference a system actor for automated events. Legal hard-erasure/anonymization overrides soft delete where required (DB Arch §8.3; PBD/legal).

**Standard Index Recommendations (every entity):** primary index on `id`; index on `is_deleted` (default-exclude queries); indexes on frequent `Reference(...)` foreign keys and on `created_at` for time-ranged access. These are not repeated per entity; entity sections list only *additional* recommended indexes.

**Cardinality notation:** `1—1`, `1—N`, `N—1`, `N—M` (with a named association entity for `N—M`).

---

## ENTITY CATALOG BY DOMAIN AREA

The catalog spans all twenty-nine domains (Business Domain Model). Each entity lists: Description · Attributes (with Types, Required/Optional) · Relationships & Cardinality · Constraints · Index Recommendations · Business Rules · Audit Fields · Future Expansion.

---

## AREA 1 — IDENTITY & PEOPLE

### Domain: Authentication

#### Entity: Identity
- **Description.** The abstract identity behind an account; the subject of authentication (Domain Model §1).
- **Attributes.** `primary_email` String (Optional*), `primary_phone` String (Optional*), `status` Enum(Configured: active/suspended/locked) (Req), `classification` Classification=Personal (Req). *At least one contact identifier required (constraint).
- **Required.** status, classification, standard fields. **Optional.** primary_email, primary_phone.
- **Relationships & Cardinality.** Identity `1—1` UserAccount; Identity `1—N` AuthCredential; Identity `1—N` AuthSession; Identity `1—N` AuthEvent; Identity `1—N` MFAFactor.
- **Constraints.** Unique non-deleted primary_email; unique non-deleted primary_phone; at least one contact identifier present.
- **Index Recommendations.** Unique index on primary_email (non-deleted); unique index on primary_phone (non-deleted); index on status.
- **Business Rules.** Established: an Identity maps to exactly one UserAccount. PBD: identifier verification requirements, lockout thresholds (Requirements FR-001).
- **Audit Fields.** Standard; authentication-sensitive changes additionally audited (Domain Model §28).
- **Future Expansion.** Additional identifier types (e.g., federated identity) added as configuration.

#### Entity: AuthCredential
- **Description.** A credential enabling authentication via a specific method (secret material is NOT stored here in plaintext; only protected representations — physical protection PTD).
- **Attributes.** `identity_id` Reference(Identity) (Req), `method` Enum(Configured: password/otp/federated/…) (Req), `secret_reference` String (Req; opaque protected reference, never plaintext), `status` Enum(Configured) (Req), `expires_at` Timestamp(UTC) (Optional), `classification` Classification=Personal (Req).
- **Required.** identity_id, method, secret_reference, status. **Optional.** expires_at.
- **Relationships & Cardinality.** AuthCredential `N—1` Identity.
- **Constraints.** One active credential per (identity, method) unless method allows multiples; secret material never stored in plaintext (DB Arch §21).
- **Index Recommendations.** Index on identity_id; index on (identity_id, method).
- **Business Rules.** Established: credentials are protected/encrypted (Constitution Art. VI; DB Arch §21). PBD: credential strength, rotation, expiry policy.
- **Audit Fields.** Standard; credential create/rotate/revoke audited.
- **Future Expansion.** New methods (passwordless, biometrics) as configured adapters (System Arch §11.2 PTD).

#### Entity: AuthSession
- **Description.** An authenticated presence/session (business concept; token specifics are implementation/PTD).
- **Attributes.** `identity_id` Reference(Identity) (Req), `established_at` Timestamp(UTC) (Req), `expires_at` Timestamp(UTC) (Req), `status` Enum(Configured: active/expired/revoked) (Req), `context` JSONDocument (Optional; device/locale/jurisdiction context, non-sensitive).
- **Relationships & Cardinality.** AuthSession `N—1` Identity.
- **Constraints.** expires_at ≥ established_at; revoked sessions cannot be reactivated.
- **Index Recommendations.** Index on identity_id; index on status; index on expires_at.
- **Business Rules.** Established: sessions auditable (Art. 6.5). PBD: session lifetime, step-up/re-auth rules.
- **Audit Fields.** Standard; establish/revoke audited.
- **Future Expansion.** Continuous/adaptive session evaluation.

#### Entity: MFAFactor
- **Description.** A registered multi-factor authentication factor for an identity.
- **Attributes.** `identity_id` Reference(Identity) (Req), `factor_type` Enum(Configured) (Req), `status` Enum(Configured) (Req), `enrolled_at` Timestamp(UTC) (Req), `classification` Classification=Personal (Req).
- **Relationships & Cardinality.** MFAFactor `N—1` Identity.
- **Constraints.** Factor material protected; unique per (identity, factor_type) where applicable.
- **Index Recommendations.** Index on identity_id.
- **Business Rules.** PBD: whether/when MFA is required (by role/jurisdiction).
- **Audit Fields.** Standard; enroll/remove audited.
- **Future Expansion.** New factor types as configuration.

#### Entity: AuthEvent
- **Description.** An append-only record of authentication-relevant events (sign-in success/failure, sign-out, lockout).
- **Attributes.** `identity_id` Reference(Identity) (Optional; may be unknown on failed attempts), `event_type` Enum(Configured) (Req), `occurred_at` Timestamp(UTC) (Req), `outcome` Enum(Configured) (Req), `context` JSONDocument (Optional; non-sensitive).
- **Relationships & Cardinality.** AuthEvent `N—1` Identity.
- **Constraints.** Append-only (no update/delete; DB Arch §9.2).
- **Index Recommendations.** Index on identity_id; index on (event_type, occurred_at).
- **Business Rules.** Established: append-only, auditable. PBD: failed-attempt thresholds.
- **Audit Fields.** This entity IS an audit-class record; immutable.
- **Future Expansion.** Feeds security analytics (System Arch §22).

---

### Domain: User Management

#### Entity: UserAccount
- **Description.** The governed account for an actor; anchor for roles, permissions, and profile specialization (Domain Model §2).
- **Attributes.** `identity_id` Reference(Identity) (Req), `display_name` String (Req), `status` Enum(Configured: active/suspended/deactivated) (Req), `primary_locale` Reference(Locale) (Optional), `primary_jurisdiction` Reference(Jurisdiction) (Optional), `classification` Classification=Personal (Req).
- **Relationships & Cardinality.** UserAccount `1—1` Identity; UserAccount `1—N` AccountRole; UserAccount `1—0..1` each of StudentProfile/ParentProfile/TutorProfile (role specialization); UserAccount `1—N` AccountRelationship.
- **Constraints.** One account per identity; status transitions governed (Requirements VR-003).
- **Index Recommendations.** Unique index on identity_id; index on status; index on primary_jurisdiction.
- **Business Rules.** Established: authorization only via explicit roles (Roles doc §15). PBD: account lifecycle specifics (e.g., deactivation consequences).
- **Audit Fields.** Standard; role/status changes audited.
- **Future Expansion.** Institutional/tenant accounts (Roles doc §14 — PBD).

#### Entity: Role
- **Description.** A named set of permissions (Roles doc §1). Foundational roles established; catalog extensible.
- **Attributes.** `name` Enum(Configured: SuperAdmin/Admin/Moderator/Finance/Support/Tutor/Parent/Student/…) (Req), `family` Enum(Configured: operational/actor) (Req), `description` LocalizedText (Req), `is_system_role` Boolean (Req).
- **Relationships & Cardinality.** Role `N—M` Permission via RolePermission; Role `1—N` AccountRole.
- **Constraints.** Unique role name; system roles protected from deletion.
- **Index Recommendations.** Unique index on name.
- **Business Rules.** Established: foundational role set (Roles doc §1.2); explicit grants only; new roles are governed decisions (Roles doc §14). PBD: full permission catalog per role.
- **Audit Fields.** Standard; role definition changes audited (governance-critical).
- **Future Expansion.** Custom/tenant-scoped roles (Roles doc §14 — PBD).

#### Entity: Permission
- **Description.** An atomic, explicit capability grantable to roles (Roles doc §15.2).
- **Attributes.** `key` Enum(Configured) (Req), `description` LocalizedText (Req), `domain_area` Enum(Configured) (Req), `sensitivity` Enum(Configured: normal/high-risk) (Req).
- **Relationships & Cardinality.** Permission `N—M` Role via RolePermission.
- **Constraints.** Unique permission key; deny-by-default (absence = denied, Roles doc §15.4).
- **Index Recommendations.** Unique index on key; index on domain_area.
- **Business Rules.** Established: explicit, least-privilege (Roles doc §15). PBD: the concrete permission set.
- **Audit Fields.** Standard; changes audited.
- **Future Expansion.** New permissions as capabilities are added (governed).

#### Entity: RolePermission (association, N—M)
- **Description.** Grants a permission to a role.
- **Attributes.** `role_id` Reference(Role) (Req), `permission_id` Reference(Permission) (Req).
- **Relationships & Cardinality.** Resolves Role `N—M` Permission.
- **Constraints.** Unique (role_id, permission_id).
- **Index Recommendations.** Unique composite index (role_id, permission_id); index on permission_id.
- **Business Rules.** Established: separation-of-duties may forbid certain combinations (Roles doc §16.5 — specifics PBD).
- **Audit Fields.** Standard; grant/revoke audited.
- **Future Expansion.** Conditional/attribute-scoped grants.

#### Entity: AccountRole (association, N—M)
- **Description.** Assigns a role to a user account, optionally scoped (e.g., to a jurisdiction).
- **Attributes.** `account_id` Reference(UserAccount) (Req), `role_id` Reference(Role) (Req), `scope_type` Enum(Configured: self/relationship/jurisdiction/platform) (Req), `scope_reference` Identifier (Optional; e.g., a Jurisdiction id).
- **Relationships & Cardinality.** Resolves UserAccount `N—M` Role.
- **Constraints.** Unique (account_id, role_id, scope_type, scope_reference); combined roles yield union of explicit permissions (Roles doc §5.4).
- **Index Recommendations.** Index on account_id; index on role_id; index on (scope_type, scope_reference).
- **Business Rules.** Established: no implicit escalation (Roles doc §5.4). PBD: scope-assignment rules.
- **Audit Fields.** Standard; assignment changes audited.
- **Future Expansion.** Delegated/tenant-scoped assignments.

#### Entity: AccountRelationship
- **Description.** A structural relationship between accounts (e.g., guardianship, enrollment linkage) — structure only; rules are PBD (Domain Model §2; Roles doc §4.4).
- **Attributes.** `from_account_id` Reference(UserAccount) (Req), `to_account_id` Reference(UserAccount) (Req), `relationship_type` Enum(Configured: guardian_of/…); (Req), `status` Enum(Configured) (Req), `established_at` Timestamp(UTC) (Req), `classification` Classification=Personal (Req).
- **Relationships & Cardinality.** UserAccount `N—M` UserAccount via this entity.
- **Constraints.** No self-relationship; unique active (from, to, type); guardianship establishment rules PBD/legal.
- **Index Recommendations.** Index on from_account_id; index on to_account_id; index on relationship_type.
- **Business Rules.** Established: relationship-derived authority exists (Roles doc §4.4). PBD/legal: how guardianship is established, consent, oversight scope, multi-guardian (Requirements BR-102).
- **Audit Fields.** Standard; relationship changes audited (minor-sensitive).
- **Future Expansion.** Institutional relationships; multiple guardians.

#### Entity: StudentProfile
- **Description.** Learner specialization of an account (Domain Model §3).
- **Attributes.** `account_id` Reference(UserAccount) (Req), `date_of_birth` Date (Optional; drives minor determination — rules PBD/legal), `is_minor` Boolean (Derived/Optional; authoritative rule PBD), `learning_context` JSONDocument (Optional), `jurisdiction_id` Reference(Jurisdiction) (Optional), `classification` Classification=Minor-Related (Req).
- **Relationships & Cardinality.** StudentProfile `1—1` UserAccount; `1—N` ProgramEnrollment; `1—N` LearningPlan; `1—N` Booking (as learner); `1—N` AssessmentSubmission; `1—N` HomeworkSubmission.
- **Constraints.** One profile per account.
- **Index Recommendations.** Unique index on account_id; index on jurisdiction_id.
- **Business Rules.** Established: minors receive heightened protection; default most-restrictive absent rule (Art. VI; BR-003). PBD/legal: minor age thresholds, safeguarding.
- **Audit Fields.** Standard; heightened for minor data.
- **Future Expansion.** Adult-learner and cohort learner types.

#### Entity: ParentProfile
- **Description.** Parent/guardian specialization of an account (Domain Model §4).
- **Attributes.** `account_id` Reference(UserAccount) (Req), `oversight_context` JSONDocument (Optional), `classification` Classification=Personal (Req).
- **Relationships & Cardinality.** ParentProfile `1—1` UserAccount; linked to StudentProfile via AccountRelationship (guardianship).
- **Constraints.** One profile per account.
- **Index Recommendations.** Unique index on account_id.
- **Business Rules.** Established: bounded oversight authority (Roles doc §8). PBD/legal: oversight scope, payment responsibility.
- **Audit Fields.** Standard.
- **Future Expansion.** Institutional guardian analogues.

#### Entity: TutorProfile
- **Description.** Educator specialization of an account (Domain Model §5).
- **Attributes.** `account_id` Reference(UserAccount) (Req), `headline` LocalizedText (Optional), `bio` LocalizedText (Optional), `verification_status` Enum(Configured: unverified/pending/verified/revoked) (Req), `jurisdiction_id` Reference(Jurisdiction) (Optional), `classification` Classification=Personal (Req).
- **Relationships & Cardinality.** TutorProfile `1—1` UserAccount; `1—N` TutorOffering; `1—N` TutorAvailability; `1—1` VerificationCase (current); `1—N` Booking (as tutor); `1—1` Wallet (earnings).
- **Constraints.** One profile per account; cannot offer/be booked unless verification_status = verified (BR-002).
- **Index Recommendations.** Index on account_id; index on verification_status; index on jurisdiction_id.
- **Business Rules.** Established: eligibility gate (BR-002). PBD: eligibility criteria, reputation rules.
- **Audit Fields.** Standard; verification_status changes audited.
- **Future Expansion.** Tutor organizations/agencies.

#### Entity: TutorOffering
- **Description.** A teaching offering (subject/service) by a tutor (conceptual; Domain Model §5).
- **Attributes.** `tutor_id` Reference(TutorProfile) (Req), `subject` Enum(Configured) (Req), `title` LocalizedText (Req), `description` LocalizedText (Optional), `base_price` MoneyAmount (Optional) + `currency_id` Reference(Currency) (Optional), `status` Enum(Configured) (Req).
- **Relationships & Cardinality.** TutorOffering `N—1` TutorProfile; `1—N` Booking.
- **Constraints.** Price requires currency; offering active only if tutor verified.
- **Index Recommendations.** Index on tutor_id; index on subject; index on status.
- **Business Rules.** PBD: pricing rules, offering constraints, subject taxonomy (educational-alignment PBD).
- **Audit Fields.** Standard.
- **Future Expansion.** Group/program offerings.

#### Entity: TutorAvailability
- **Description.** A tutor's availability intent (distinct from the Calendar; Domain Model §5, §8).
- **Attributes.** `tutor_id` Reference(TutorProfile) (Req), `start_at` Timestamp(UTC) (Req), `end_at` Timestamp(UTC) (Req), `recurrence` JSONDocument (Optional), `status` Enum(Configured) (Req).
- **Relationships & Cardinality.** TutorAvailability `N—1` TutorProfile; consumed by Scheduling.
- **Constraints.** end_at > start_at; no overlapping active availability (or defined merge — PBD).
- **Index Recommendations.** Index on tutor_id; index on (start_at, end_at).
- **Business Rules.** PBD: scheduling constraint rules (notice, buffers).
- **Audit Fields.** Standard.
- **Future Expansion.** Recurring/complex availability patterns.

#### Entity: TutorRating
- **Description.** Reputation/standing signal for a tutor (conceptual).
- **Attributes.** `tutor_id` Reference(TutorProfile) (Req), `source_reference` Identifier (Optional; e.g., a completed session), `rating_value` Decimal (Req), `comment` LocalizedText (Optional), `status` Enum(Configured) (Req).
- **Relationships & Cardinality.** TutorRating `N—1` TutorProfile.
- **Constraints.** rating_value within configured range; one rating per rateable source per rater (PBD).
- **Index Recommendations.** Index on tutor_id.
- **Business Rules.** PBD: rating eligibility, aggregation, moderation.
- **Audit Fields.** Standard; moderation actions audited.
- **Future Expansion.** Multi-dimensional reputation.

---

### Domain: Tutor Verification

#### Entity: VerificationCase
- **Description.** A case governing a tutor's verification lifecycle (Domain Model §6).
- **Attributes.** `tutor_id` Reference(TutorProfile) (Req), `status` Enum(Configured: open/in_review/approved/rejected/revoked) (Req), `jurisdiction_id` Reference(Jurisdiction) (Optional), `opened_at` Timestamp(UTC) (Req), `decided_at` Timestamp(UTC) (Optional), `decided_by` Reference(UserAccount) (Optional).
- **Relationships & Cardinality.** VerificationCase `N—1` TutorProfile; `1—N` VerificationCheck; `1—N` VerificationDocument.
- **Constraints.** Governed status transitions (VR-003); approval required before tutor verified (BR-002).
- **Index Recommendations.** Index on tutor_id; index on status; index on jurisdiction_id.
- **Business Rules.** Established: gate before offering (BR-002). PBD/legal: verification requirements/checks per jurisdiction (BR-105).
- **Audit Fields.** Standard; all decisions audited.
- **Future Expansion.** Periodic re-verification.

#### Entity: VerificationCheck
- **Description.** An individual check within a case (conceptual — e.g., identity, credential).
- **Attributes.** `case_id` Reference(VerificationCase) (Req), `check_type` Enum(Configured) (Req), `outcome` Enum(Configured: pending/passed/failed) (Req), `performed_at` Timestamp(UTC) (Optional), `classification` Classification=Personal (Req).
- **Relationships & Cardinality.** VerificationCheck `N—1` VerificationCase.
- **Constraints.** Case cannot be approved with a failed required check (rule set PBD).
- **Index Recommendations.** Index on case_id; index on (check_type, outcome).
- **Business Rules.** PBD/legal: required checks and pass criteria.
- **Audit Fields.** Standard; outcomes audited.
- **Future Expansion.** External verification-provider integration (PTD).

#### Entity: VerificationDocument
- **Description.** A reference to a submitted verification document (the file lives in File Storage; this holds the reference + metadata; DB Arch §13).
- **Attributes.** `case_id` Reference(VerificationCase) (Req), `document_type` Enum(Configured) (Req), `storage_reference` String (Req; opaque storage pointer), `status` Enum(Configured) (Req), `classification` Classification=Personal (Req).
- **Relationships & Cardinality.** VerificationDocument `N—1` VerificationCase.
- **Constraints.** Document encrypted at rest (DB Arch §21); access restricted (Roles doc).
- **Index Recommendations.** Index on case_id.
- **Business Rules.** PBD/legal: required documents; retention/erasure (Open Questions).
- **Audit Fields.** Standard; access to sensitive docs audited.
- **Future Expansion.** Automated document verification.

---

*(Area 1 continues the People domains above; Areas 2–9 follow.)*

---

## AREA 2 — ENGAGEMENT & DELIVERY

### Domain: Booking

#### Entity: Booking
- **Description.** An agreement to engage a tutor for teaching; the core marketplace transaction (Domain Model §7).
- **Attributes.** `student_id` Reference(StudentProfile) (Req), `tutor_id` Reference(TutorProfile) (Req), `offering_id` Reference(TutorOffering) (Optional), `booked_by_account_id` Reference(UserAccount) (Req; student or parent), `status` Enum(Configured: requested/confirmed/changed/cancelled/completed) (Req), `scheduled_slot_id` Reference(ScheduleProposal) (Optional), `price` MoneyAmount (Optional) + `currency_id` Reference(Currency) (Optional), `jurisdiction_id` Reference(Jurisdiction) (Optional).
- **Relationships & Cardinality.** Booking `N—1` StudentProfile; `N—1` TutorProfile; `1—0..1` LiveSession; `1—N` BookingStatusHistory; `1—0..1` Payment.
- **Constraints.** Tutor must be verified (BR-002); price requires currency; governed status transitions (VR-003); no double-booking of the same confirmed slot (EC-004).
- **Index Recommendations.** Index on student_id; tutor_id; status; (tutor_id, status); jurisdiction_id.
- **Business Rules.** Established: only verified tutors bookable (BR-002); accountability (BR-006). PBD: who may book, pricing-at-booking, cancellation/refund/matching (BR-100).
- **Audit Fields.** Standard; all status transitions audited.
- **Future Expansion.** Group/program/institutional bookings.

#### Entity: BookingStatusHistory
- **Description.** Append-only history of a booking's status transitions.
- **Attributes.** `booking_id` Reference(Booking) (Req), `from_status` Enum(Configured) (Optional), `to_status` Enum(Configured) (Req), `changed_at` Timestamp(UTC) (Req), `reason` LocalizedText (Optional).
- **Relationships & Cardinality.** BookingStatusHistory `N—1` Booking.
- **Constraints.** Append-only (DB Arch §9.2).
- **Index Recommendations.** Index on booking_id; (booking_id, changed_at).
- **Business Rules.** Established: transitions traceable (BR-006).
- **Audit Fields.** This IS an audit-class record; immutable.
- **Future Expansion.** Richer reason taxonomy.

#### Entity: CancellationRecord
- **Description.** Records a cancellation event and its handling (refund linkage etc.).
- **Attributes.** `booking_id` Reference(Booking) (Req), `cancelled_by_account_id` Reference(UserAccount) (Req), `cancelled_at` Timestamp(UTC) (Req), `reason` LocalizedText (Optional), `refund_id` Reference(Refund) (Optional).
- **Relationships & Cardinality.** CancellationRecord `N—1` Booking; `0..1—1` Refund.
- **Constraints.** One active cancellation per booking.
- **Index Recommendations.** Index on booking_id.
- **Business Rules.** PBD: cancellation windows, penalties, refund eligibility (BR-100/BR-101).
- **Audit Fields.** Standard.
- **Future Expansion.** Automated cancellation policies per jurisdiction.

### Domain: Scheduling

#### Entity: ScheduleProposal
- **Description.** A proposed/agreed time reconciling availability and demand (Domain Model §8).
- **Attributes.** `tutor_id` Reference(TutorProfile) (Req), `student_id` Reference(StudentProfile) (Req), `proposed_start` Timestamp(UTC) (Req), `proposed_end` Timestamp(UTC) (Req), `status` Enum(Configured: proposed/agreed/rejected/rescheduled) (Req).
- **Relationships & Cardinality.** ScheduleProposal `N—1` TutorProfile; `N—1` StudentProfile; `1—N` ReschedulingEvent; referenced by Booking.
- **Constraints.** proposed_end > proposed_start; agreed slot must not collide (EC-004); respects TutorAvailability.
- **Index Recommendations.** Index on tutor_id; student_id; (tutor_id, proposed_start); status.
- **Business Rules.** PBD: scheduling constraints (notice, length, buffers).
- **Audit Fields.** Standard.
- **Future Expansion.** Group/recurring scheduling.

#### Entity: ReschedulingEvent
- **Description.** A record of a reschedule of a proposal/booking.
- **Attributes.** `proposal_id` Reference(ScheduleProposal) (Req), `previous_start` Timestamp(UTC) (Req), `new_start` Timestamp(UTC) (Req), `requested_by_account_id` Reference(UserAccount) (Req), `occurred_at` Timestamp(UTC) (Req).
- **Relationships & Cardinality.** ReschedulingEvent `N—1` ScheduleProposal.
- **Constraints.** Append-only.
- **Index Recommendations.** Index on proposal_id.
- **Business Rules.** PBD: reschedule limits/penalties.
- **Audit Fields.** Audit-class; immutable.
- **Future Expansion.** Reschedule policy automation.

### Domain: Calendar

#### Entity: CalendarEntry
- **Description.** A time-based commitment recorded for an actor (Domain Model §9).
- **Attributes.** `owner_account_id` Reference(UserAccount) (Req), `entry_type` Enum(Configured: session/deadline/milestone/event) (Req), `source_reference` Identifier (Optional; owning object id), `start_at` Timestamp(UTC) (Req), `end_at` Timestamp(UTC) (Optional), `title` LocalizedText (Req), `status` Enum(Configured) (Req).
- **Relationships & Cardinality.** CalendarEntry `N—1` UserAccount; `1—N` Reminder.
- **Constraints.** end_at ≥ start_at where present; presented in owner's resolved timezone (DB Arch §13).
- **Index Recommendations.** Index on owner_account_id; (owner_account_id, start_at); entry_type.
- **Business Rules.** Established: records/presents time; does not decide it (Domain Model §9). PBD: external-calendar integration policy.
- **Audit Fields.** Standard.
- **Future Expansion.** External calendar sync (PTD).

#### Entity: Reminder
- **Description.** A business trigger to notify about a calendar entry (delivered via Notifications).
- **Attributes.** `calendar_entry_id` Reference(CalendarEntry) (Req), `trigger_at` Timestamp(UTC) (Req), `status` Enum(Configured) (Req), `channel_preference` Reference(NotificationChannel) (Optional).
- **Relationships & Cardinality.** Reminder `N—1` CalendarEntry; triggers Notification.
- **Constraints.** trigger_at ≤ entry start (typical; policy PBD).
- **Index Recommendations.** Index on calendar_entry_id; (status, trigger_at).
- **Business Rules.** PBD: default reminder policy.
- **Audit Fields.** Standard.
- **Future Expansion.** Smart/adaptive reminders.

### Domain: Live Sessions

#### Entity: LiveSession
- **Description.** The business lifecycle of a live teaching session (Domain Model §10).
- **Attributes.** `booking_id` Reference(Booking) (Req), `tutor_id` Reference(TutorProfile) (Req), `student_id` Reference(StudentProfile) (Req), `scheduled_start` Timestamp(UTC) (Req), `actual_start` Timestamp(UTC) (Optional), `actual_end` Timestamp(UTC) (Optional), `status` Enum(Configured: scheduled/in_progress/completed/no_show/cancelled) (Req), `media_reference` String (Optional; opaque provider/session ref — provider is PTD), `classification` Classification=Minor-Related (Req, when student is minor).
- **Relationships & Cardinality.** LiveSession `1—1` Booking; `1—N` SessionAttendance; `1—0..1` SessionOutcome; `1—0..1` SessionRecordingRef.
- **Constraints.** Governed status transitions; media technology decoupled (System Arch §18).
- **Index Recommendations.** Index on booking_id; tutor_id; student_id; (status, scheduled_start).
- **Business Rules.** Established: business owns lifecycle, not media (Domain Model §10). PBD/legal: conduct, recording, attendance rules — minor implications (BR-106).
- **Audit Fields.** Standard; lifecycle events audited.
- **Future Expansion.** Group/recorded/hybrid sessions.

#### Entity: SessionAttendance
- **Description.** Attendance of a participant in a session.
- **Attributes.** `session_id` Reference(LiveSession) (Req), `participant_account_id` Reference(UserAccount) (Req), `joined_at` Timestamp(UTC) (Optional), `left_at` Timestamp(UTC) (Optional), `attendance_status` Enum(Configured: present/absent/partial) (Req).
- **Relationships & Cardinality.** SessionAttendance `N—1` LiveSession.
- **Constraints.** Unique (session_id, participant_account_id).
- **Index Recommendations.** Index on session_id; participant_account_id.
- **Business Rules.** PBD: attendance rules/thresholds.
- **Audit Fields.** Standard.
- **Future Expansion.** Group attendance analytics.

#### Entity: SessionOutcome
- **Description.** The recorded outcome/summary of a session, linking to follow-ups.
- **Attributes.** `session_id` Reference(LiveSession) (Req), `summary` LocalizedText (Optional), `follow_up_reference` Identifier (Optional; homework/assessment), `recorded_by` Reference(UserAccount) (Req).
- **Relationships & Cardinality.** SessionOutcome `1—1` LiveSession.
- **Constraints.** One outcome per session.
- **Index Recommendations.** Index on session_id.
- **Business Rules.** PBD: required outcome content.
- **Audit Fields.** Standard.
- **Future Expansion.** AI-assisted session summaries (behind AI abstraction).

#### Entity: SessionRecordingRef
- **Description.** Reference to a session recording (if recording occurs); file in storage; strong privacy/minor controls.
- **Attributes.** `session_id` Reference(LiveSession) (Req), `storage_reference` String (Req), `retention_until` Timestamp(UTC) (Optional; policy PBD/legal), `classification` Classification=Minor-Related (Req).
- **Relationships & Cardinality.** SessionRecordingRef `1—1` LiveSession.
- **Constraints.** Encrypted (DB Arch §21); residency-compliant (§10); access strictly controlled.
- **Index Recommendations.** Index on session_id.
- **Business Rules.** PBD/legal: whether recording is permitted, consent, retention (BR-106) — default most-restrictive (BR-003).
- **Audit Fields.** Standard; all access audited.
- **Future Expansion.** Per-jurisdiction recording policy.

---

## AREA 3 — LEARNING

### Domain: Programs

#### Entity: Program
- **Description.** A structured educational offering (Domain Model §11).
- **Attributes.** `title` LocalizedText (Req), `description` LocalizedText (Optional), `owner_account_id` Reference(UserAccount) (Req; tutor/admin), `educational_system_id` Reference(EducationalSystem) (Optional; configurable, NOT hardcoded), `status` Enum(Configured: draft/published/retired) (Req), `jurisdiction_id` Reference(Jurisdiction) (Optional).
- **Relationships & Cardinality.** Program `1—N` ProgramModule; `1—N` ProgramEnrollment; `N—M` ContentItem (via ProgramContent).
- **Constraints.** Published programs must have ≥1 module (rule PBD).
- **Index Recommendations.** Index on owner_account_id; status; educational_system_id.
- **Business Rules.** PBD/legal: structure, accreditation, per-market educational alignment (BR-104).
- **Audit Fields.** Standard.
- **Future Expansion.** Program templates, marketplace of programs.

#### Entity: ProgramModule
- **Description.** A structural unit within a program (conceptual).
- **Attributes.** `program_id` Reference(Program) (Req), `title` LocalizedText (Req), `sequence_order` Integer (Req), `description` LocalizedText (Optional).
- **Relationships & Cardinality.** ProgramModule `N—1` Program; `N—M` ContentItem.
- **Constraints.** Unique (program_id, sequence_order).
- **Index Recommendations.** Index on program_id; (program_id, sequence_order).
- **Business Rules.** PBD: module structure rules.
- **Audit Fields.** Standard.
- **Future Expansion.** Nested modules/units.

#### Entity: ProgramEnrollment
- **Description.** A student's participation in a program.
- **Attributes.** `program_id` Reference(Program) (Req), `student_id` Reference(StudentProfile) (Req), `enrolled_at` Timestamp(UTC) (Req), `status` Enum(Configured: active/completed/withdrawn) (Req).
- **Relationships & Cardinality.** ProgramEnrollment `N—1` Program; `N—1` StudentProfile; `1—N` ProgramProgress.
- **Constraints.** Unique active (program_id, student_id).
- **Index Recommendations.** Index on program_id; student_id.
- **Business Rules.** PBD: enrollment eligibility.
- **Audit Fields.** Standard.
- **Future Expansion.** Cohort enrollment.

#### Entity: ProgramProgress
- **Description.** Progress of an enrollment through program structure.
- **Attributes.** `enrollment_id` Reference(ProgramEnrollment) (Req), `module_id` Reference(ProgramModule) (Req), `progress_status` Enum(Configured) (Req), `completed_at` Timestamp(UTC) (Optional).
- **Relationships & Cardinality.** ProgramProgress `N—1` ProgramEnrollment; `N—1` ProgramModule.
- **Constraints.** Unique (enrollment_id, module_id).
- **Index Recommendations.** Index on enrollment_id.
- **Business Rules.** PBD: progression/completion rules.
- **Audit Fields.** Standard.
- **Future Expansion.** Competency-based progression.

### Domain: Learning Plans

#### Entity: LearningPlan
- **Description.** An individualized learning path for a student (Domain Model §12).
- **Attributes.** `student_id` Reference(StudentProfile) (Req), `owner_account_id` Reference(UserAccount) (Req; tutor/advisor), `title` LocalizedText (Req), `status` Enum(Configured) (Req), `ai_assisted` Boolean (Req; default false).
- **Relationships & Cardinality.** LearningPlan `N—1` StudentProfile; `1—N` LearningGoal; `1—N` Milestone; `1—N` PlannedActivity.
- **Constraints.** One authoritative plan per (student, context) — policy PBD.
- **Index Recommendations.** Index on student_id; owner_account_id; status.
- **Business Rules.** Established: AI assistance behind provider-independent abstraction (Art. VII). PBD: planning/goal frameworks.
- **Audit Fields.** Standard.
- **Future Expansion.** Deeper AI personalization.

#### Entity: LearningGoal
- **Description.** A goal within a learning plan.
- **Attributes.** `plan_id` Reference(LearningPlan) (Req), `description` LocalizedText (Req), `target_date` Date (Optional), `status` Enum(Configured) (Req).
- **Relationships & Cardinality.** LearningGoal `N—1` LearningPlan.
- **Constraints.** —
- **Index Recommendations.** Index on plan_id.
- **Business Rules.** PBD: goal frameworks.
- **Audit Fields.** Standard.
- **Future Expansion.** Standards-aligned goals.

#### Entity: Milestone
- **Description.** A milestone within a plan (appears on Calendar).
- **Attributes.** `plan_id` Reference(LearningPlan) (Req), `title` LocalizedText (Req), `due_at` Timestamp(UTC) (Optional), `status` Enum(Configured) (Req).
- **Relationships & Cardinality.** Milestone `N—1` LearningPlan; may create CalendarEntry.
- **Constraints.** —
- **Index Recommendations.** Index on plan_id; (plan_id, due_at).
- **Business Rules.** PBD: milestone rules.
- **Audit Fields.** Standard.
- **Future Expansion.** Adaptive milestones.

#### Entity: PlannedActivity
- **Description.** A scheduled/arranged activity within a plan (links to program/assessment/homework).
- **Attributes.** `plan_id` Reference(LearningPlan) (Req), `activity_type` Enum(Configured: program/assessment/homework/session) (Req), `activity_reference` Identifier (Optional), `sequence_order` Integer (Req), `status` Enum(Configured) (Req).
- **Relationships & Cardinality.** PlannedActivity `N—1` LearningPlan.
- **Constraints.** Unique (plan_id, sequence_order).
- **Index Recommendations.** Index on plan_id.
- **Business Rules.** PBD: sequencing/adaptation logic.
- **Audit Fields.** Standard.
- **Future Expansion.** AI-driven sequencing.

### Domain: Assessments

#### Entity: Assessment
- **Description.** An evaluation instrument (Domain Model §13).
- **Attributes.** `title` LocalizedText (Req), `owner_account_id` Reference(UserAccount) (Req), `grading_scheme_id` Reference(GradingScheme) (Optional), `program_reference` Identifier (Optional), `status` Enum(Configured) (Req), `ai_assisted` Boolean (Req).
- **Relationships & Cardinality.** Assessment `1—N` AssessmentSubmission; `N—1` GradingScheme.
- **Constraints.** —
- **Index Recommendations.** Index on owner_account_id; status.
- **Business Rules.** PBD/legal: grading schemes, integrity rules, qualification alignment (BR-104).
- **Audit Fields.** Standard.
- **Future Expansion.** Multiple assessment types.

#### Entity: AssessmentSubmission
- **Description.** A student's submission to an assessment.
- **Attributes.** `assessment_id` Reference(Assessment) (Req), `student_id` Reference(StudentProfile) (Req), `submitted_at` Timestamp(UTC) (Optional), `content_reference` String (Optional; storage), `status` Enum(Configured) (Req), `classification` Classification=Minor-Related (Req when minor).
- **Relationships & Cardinality.** AssessmentSubmission `N—1` Assessment; `N—1` StudentProfile; `1—0..1` AssessmentResult.
- **Constraints.** One active submission per (assessment, student) unless resubmission allowed (PBD).
- **Index Recommendations.** Index on assessment_id; student_id.
- **Business Rules.** PBD: submission/resubmission/integrity rules.
- **Audit Fields.** Standard.
- **Future Expansion.** Timed/proctored submissions.

#### Entity: AssessmentResult
- **Description.** The evaluated result of a submission.
- **Attributes.** `submission_id` Reference(AssessmentSubmission) (Req), `score` Decimal (Optional), `grade` Enum(Configured) (Optional), `evaluated_by` Reference(UserAccount) (Optional; may be AI-assisted), `evaluated_at` Timestamp(UTC) (Optional), `feedback` LocalizedText (Optional).
- **Relationships & Cardinality.** AssessmentResult `1—1` AssessmentSubmission.
- **Constraints.** One result per submission; score within grading scheme range.
- **Index Recommendations.** Index on submission_id.
- **Business Rules.** PBD: grading rules, appeal/moderation.
- **Audit Fields.** Standard; result changes audited.
- **Future Expansion.** AI-assisted evaluation (behind abstraction).

#### Entity: GradingScheme
- **Description.** A configurable grading scheme (NOT hardcoded; per educational system).
- **Attributes.** `name` LocalizedText (Req), `scheme_definition` JSONDocument (Req), `educational_system_id` Reference(EducationalSystem) (Optional), `status` Enum(Configured) (Req).
- **Relationships & Cardinality.** GradingScheme `1—N` Assessment.
- **Constraints.** —
- **Index Recommendations.** Index on educational_system_id.
- **Business Rules.** PBD/legal: grading conventions per market (BR-104).
- **Audit Fields.** Standard.
- **Future Expansion.** Unlimited per-country schemes.

### Domain: Homework

#### Entity: HomeworkAssignment
- **Description.** Assigned practice work (Domain Model §14).
- **Attributes.** `title` LocalizedText (Req), `assigned_by` Reference(UserAccount) (Req), `student_id` Reference(StudentProfile) (Req), `due_at` Timestamp(UTC) (Optional), `status` Enum(Configured) (Req).
- **Relationships & Cardinality.** HomeworkAssignment `N—1` StudentProfile; `1—N` HomeworkSubmission.
- **Constraints.** due_at ≥ created_at where present; deadline appears on Calendar.
- **Index Recommendations.** Index on student_id; assigned_by; (student_id, due_at).
- **Business Rules.** PBD: deadline/resubmission rules.
- **Audit Fields.** Standard.
- **Future Expansion.** Adaptive/AI practice.

#### Entity: HomeworkSubmission
- **Description.** A student's submission of homework.
- **Attributes.** `assignment_id` Reference(HomeworkAssignment) (Req), `student_id` Reference(StudentProfile) (Req), `submitted_at` Timestamp(UTC) (Optional), `content_reference` String (Optional), `status` Enum(Configured) (Req), `classification` Classification=Minor-Related (Req when minor).
- **Relationships & Cardinality.** HomeworkSubmission `N—1` HomeworkAssignment; `1—N` HomeworkFeedback.
- **Constraints.** Resubmission policy PBD.
- **Index Recommendations.** Index on assignment_id; student_id.
- **Business Rules.** PBD: completion/late rules.
- **Audit Fields.** Standard.
- **Future Expansion.** Rich media submissions.

#### Entity: HomeworkFeedback
- **Description.** Feedback on a homework submission.
- **Attributes.** `submission_id` Reference(HomeworkSubmission) (Req), `given_by` Reference(UserAccount) (Req; may be AI-assisted), `feedback` LocalizedText (Req), `given_at` Timestamp(UTC) (Req).
- **Relationships & Cardinality.** HomeworkFeedback `N—1` HomeworkSubmission.
- **Constraints.** —
- **Index Recommendations.** Index on submission_id.
- **Business Rules.** PBD: feedback expectations.
- **Audit Fields.** Standard.
- **Future Expansion.** AI-assisted feedback (behind abstraction).

---

## AREA 4 — INTELLIGENCE

### Domain: AI Services

#### Entity: AIProviderConfig
- **Description.** Configuration of an AI provider adapter behind the provider-independent abstraction (Art. VII; System Arch §10). Holds config/reference only — no provider proprietary logic.
- **Attributes.** `provider_key` Enum(Configured) (Req), `capability` Enum(Configured: assistant/evaluation/feedback/…) (Req), `status` Enum(Configured: active/inactive) (Req), `priority` Integer (Optional; for routing/fallback), `config_reference` String (Req; opaque secure config pointer).
- **Relationships & Cardinality.** AIProviderConfig `1—N` AIInteraction (as resolved provider).
- **Constraints.** Application logic never references provider specifics (Art. 7.2); secrets protected (DB Arch §21).
- **Index Recommendations.** Index on (capability, status, priority).
- **Business Rules.** Established: provider-independent; replaceable without app rewrite (Art. 7.1). PBD: routing/selection policy; PTD: which providers.
- **Audit Fields.** Standard; config changes audited.
- **Future Expansion.** Unlimited providers/capabilities added as adapters.

#### Entity: AIInteraction
- **Description.** A record of an AI interaction/request (governed, auditable; Art. 7.4).
- **Attributes.** `requestor_account_id` Reference(UserAccount) (Req), `capability` Enum(Configured) (Req), `provider_config_id` Reference(AIProviderConfig) (Optional), `context_reference` Identifier (Optional; e.g., learning plan), `status` Enum(Configured) (Req), `occurred_at` Timestamp(UTC) (Req), `classification` Classification (Req; Minor-Related when involving a minor).
- **Relationships & Cardinality.** AIInteraction `N—1` AIProviderConfig; `N—1` UserAccount.
- **Constraints.** Governed by AI policy; minor data handling most-restrictive absent rule (BR-003).
- **Index Recommendations.** Index on requestor_account_id; (capability, occurred_at).
- **Business Rules.** Established: governed/auditable (Art. 7.4). PBD/legal: AI usage/safety/data policies.
- **Audit Fields.** Standard; interactions auditable.
- **Future Expansion.** Multi-provider routing analytics.

#### Entity: AIGovernancePolicy
- **Description.** A governed policy constraining AI behavior (safety, data-handling) — content PBD.
- **Attributes.** `name` LocalizedText (Req), `policy_definition` JSONDocument (Req), `scope_type` Enum(Configured) (Req), `status` Enum(Configured) (Req).
- **Relationships & Cardinality.** Applied to AIInteraction at enforcement.
- **Constraints.** —
- **Index Recommendations.** Index on scope_type.
- **Business Rules.** PBD/legal: policy content (safety, minors, data).
- **Audit Fields.** Standard; policy changes audited.
- **Future Expansion.** Per-jurisdiction AI policy.

---

## AREA 5 — COMMUNICATION

### Domain: Notifications

#### Entity: NotificationChannel
- **Description.** A configurable delivery channel (Domain Model §16). No channel hardcoded.
- **Attributes.** `channel_key` Enum(Configured: email/sms/push/in_app/…) (Req), `status` Enum(Configured) (Req), `config_reference` String (Optional; provider config — PTD).
- **Relationships & Cardinality.** NotificationChannel `1—N` NotificationDelivery; `1—N` NotificationPreference.
- **Constraints.** Unique channel_key.
- **Index Recommendations.** Unique index on channel_key.
- **Business Rules.** PBD: channel availability per jurisdiction; PTD: delivery providers.
- **Audit Fields.** Standard.
- **Future Expansion.** New channels as configuration.

#### Entity: NotificationTemplate
- **Description.** A localized template for a notification type.
- **Attributes.** `template_key` Enum(Configured) (Req), `content` LocalizedText (Req), `channel_id` Reference(NotificationChannel) (Optional), `status` Enum(Configured) (Req).
- **Relationships & Cardinality.** NotificationTemplate `1—N` Notification.
- **Constraints.** Unique (template_key, channel).
- **Index Recommendations.** Index on template_key.
- **Business Rules.** PBD: template content/policy.
- **Audit Fields.** Standard.
- **Future Expansion.** Unlimited languages (Art. III).

#### Entity: Notification
- **Description.** A system-originated notification instance (Domain Model §16).
- **Attributes.** `recipient_account_id` Reference(UserAccount) (Req), `template_id` Reference(NotificationTemplate) (Optional), `trigger_source` Enum(Configured) (Req), `payload` JSONDocument (Optional), `status` Enum(Configured: pending/sent/failed/read) (Req), `created_at_event` Timestamp(UTC) (Req).
- **Relationships & Cardinality.** Notification `N—1` UserAccount; `1—N` NotificationDelivery.
- **Constraints.** Respects recipient preferences and consent (PBD/legal).
- **Index Recommendations.** Index on recipient_account_id; (recipient_account_id, status).
- **Business Rules.** Established: distinct from Messaging. PBD/legal: consent-to-contact (esp. minors).
- **Audit Fields.** Standard.
- **Future Expansion.** Rich/actionable notifications.

#### Entity: NotificationDelivery
- **Description.** A delivery attempt of a notification on a channel.
- **Attributes.** `notification_id` Reference(Notification) (Req), `channel_id` Reference(NotificationChannel) (Req), `attempted_at` Timestamp(UTC) (Req), `outcome` Enum(Configured) (Req).
- **Relationships & Cardinality.** NotificationDelivery `N—1` Notification; `N—1` NotificationChannel.
- **Constraints.** Append-only.
- **Index Recommendations.** Index on notification_id; (channel_id, outcome).
- **Business Rules.** PBD: retry policy.
- **Audit Fields.** Audit-class; immutable.
- **Future Expansion.** Delivery analytics.

#### Entity: NotificationPreference
- **Description.** An actor's per-channel/per-type notification preference.
- **Attributes.** `account_id` Reference(UserAccount) (Req), `channel_id` Reference(NotificationChannel) (Req), `notification_type` Enum(Configured) (Req), `enabled` Boolean (Req).
- **Relationships & Cardinality.** NotificationPreference `N—1` UserAccount; `N—1` NotificationChannel.
- **Constraints.** Unique (account_id, channel_id, notification_type).
- **Index Recommendations.** Index on account_id.
- **Business Rules.** PBD/legal: mandatory vs optional notifications; consent.
- **Audit Fields.** Standard.
- **Future Expansion.** Granular preference management.

### Domain: Messaging

#### Entity: Conversation
- **Description.** A conversation between actors within permitted boundaries (Domain Model §17).
- **Attributes.** `conversation_type` Enum(Configured: direct/group/support) (Req), `subject` LocalizedText (Optional), `status` Enum(Configured) (Req), `context_reference` Identifier (Optional; e.g., booking).
- **Relationships & Cardinality.** Conversation `1—N` ConversationParticipant; `1—N` Message.
- **Constraints.** Participants must be in a permitted relationship (rules PBD; minor-safety).
- **Index Recommendations.** Index on conversation_type; status.
- **Business Rules.** Established: distinct from Notifications; safety-bounded. PBD/legal: who-may-message-whom (esp. minors), moderation (BR-103).
- **Audit Fields.** Standard.
- **Future Expansion.** Group messaging, moderation tooling.

#### Entity: ConversationParticipant (association)
- **Description.** An actor participating in a conversation.
- **Attributes.** `conversation_id` Reference(Conversation) (Req), `account_id` Reference(UserAccount) (Req), `role_in_conversation` Enum(Configured) (Optional), `joined_at` Timestamp(UTC) (Req), `status` Enum(Configured) (Req).
- **Relationships & Cardinality.** Resolves Conversation `N—M` UserAccount.
- **Constraints.** Unique (conversation_id, account_id).
- **Index Recommendations.** Index on conversation_id; account_id.
- **Business Rules.** PBD/legal: participation permission (minor supervision).
- **Audit Fields.** Standard.
- **Future Expansion.** Roles within conversations.

#### Entity: Message
- **Description.** A single message within a conversation.
- **Attributes.** `conversation_id` Reference(Conversation) (Req), `sender_account_id` Reference(UserAccount) (Req), `body` Text (Req), `sent_at` Timestamp(UTC) (Req), `status` Enum(Configured: sent/delivered/read/moderated/removed) (Req), `classification` Classification (Req; Minor-Related if involving minor).
- **Relationships & Cardinality.** Message `N—1` Conversation; `1—N` MessageAttachment.
- **Constraints.** Moderation may change status (Moderator role); content-safety rules PBD.
- **Index Recommendations.** Index on conversation_id; (conversation_id, sent_at); sender_account_id.
- **Business Rules.** PBD/legal: moderation standards, retention.
- **Audit Fields.** Standard; moderation actions audited.
- **Future Expansion.** Rich content, translation.

#### Entity: MessageAttachment
- **Description.** Reference to a file attached to a message (file in storage).
- **Attributes.** `message_id` Reference(Message) (Req), `storage_reference` String (Req), `content_type` String (Req), `classification` Classification (Req).
- **Relationships & Cardinality.** MessageAttachment `N—1` Message.
- **Constraints.** Encrypted; access-controlled; scanned per policy (PBD).
- **Index Recommendations.** Index on message_id.
- **Business Rules.** PBD: attachment policy/limits.
- **Audit Fields.** Standard.
- **Future Expansion.** Media processing.

---

## AREA 6 — COMMERCE

### Domain: Payments

#### Entity: Payment
- **Description.** A payment into/through the Platform (Domain Model §18).
- **Attributes.** `payer_account_id` Reference(UserAccount) (Req), `amount` MoneyAmount (Req) + `currency_id` Reference(Currency) (Req), `payment_method_id` Reference(PaymentMethodConfig) (Req), `purpose_reference` Identifier (Optional; e.g., booking/subscription), `status` Enum(Configured: initiated/authorized/settled/failed/refunded) (Req), `jurisdiction_id` Reference(Jurisdiction) (Optional), `processor_reference` String (Optional; opaque — processor is PTD), `classification` Classification=Financial (Req).
- **Relationships & Cardinality.** Payment `1—N` Transaction; `1—0..1` Refund; may link to Booking/Subscription.
- **Constraints.** amount requires currency; idempotent processing (EC-005); governed transitions (VR-003, VR-006).
- **Index Recommendations.** Index on payer_account_id; status; (status, created_at); jurisdiction_id.
- **Business Rules.** Established: correctness/reconcilability (EC-005); no hardcoded currency/method (Art. X). PBD/legal: pricing, fees, tax, refund, financial-regulatory (BR-101). PTD: processors.
- **Audit Fields.** Standard; all financial events audited.
- **Future Expansion.** Multiple processors per jurisdiction.

#### Entity: Transaction
- **Description.** An individual financial movement within a payment (ledger of processing steps).
- **Attributes.** `payment_id` Reference(Payment) (Req), `transaction_type` Enum(Configured: charge/refund/adjustment) (Req), `amount` MoneyAmount (Req) + `currency_id` Reference(Currency) (Req), `occurred_at` Timestamp(UTC) (Req), `status` Enum(Configured) (Req).
- **Relationships & Cardinality.** Transaction `N—1` Payment.
- **Constraints.** Append-only; sums reconcile with payment (integrity §24).
- **Index Recommendations.** Index on payment_id; (transaction_type, occurred_at).
- **Business Rules.** Established: reconcilable, immutable. PBD: adjustment rules.
- **Audit Fields.** Audit-class; immutable.
- **Future Expansion.** Multi-leg settlements.

#### Entity: PaymentMethodConfig
- **Description.** A configurable payment method available per jurisdiction (NOT hardcoded; Art. X).
- **Attributes.** `method_key` Enum(Configured) (Req), `jurisdiction_id` Reference(Jurisdiction) (Optional), `status` Enum(Configured) (Req), `processor_reference` String (Optional; PTD).
- **Relationships & Cardinality.** PaymentMethodConfig `1—N` Payment.
- **Constraints.** Unique (method_key, jurisdiction).
- **Index Recommendations.** Index on (method_key, jurisdiction_id).
- **Business Rules.** PBD/legal: available methods per country.
- **Audit Fields.** Standard.
- **Future Expansion.** Unlimited methods as configuration.

#### Entity: Refund
- **Description.** A refund against a payment.
- **Attributes.** `payment_id` Reference(Payment) (Req), `amount` MoneyAmount (Req) + `currency_id` Reference(Currency) (Req), `reason` LocalizedText (Optional), `status` Enum(Configured) (Req), `initiated_by` Reference(UserAccount) (Req), `classification` Classification=Financial (Req).
- **Relationships & Cardinality.** Refund `N—1` Payment; `0..1—1` CancellationRecord.
- **Constraints.** Refund ≤ payment amount; currency matches; governed authority (Finance role).
- **Index Recommendations.** Index on payment_id; status.
- **Business Rules.** PBD/legal: refund eligibility/authority (BR-101).
- **Audit Fields.** Standard; refunds audited (high-risk, separation of duties §16.5).
- **Future Expansion.** Partial/automated refunds.

### Domain: Wallet

#### Entity: Wallet
- **Description.** An actor's balance holder (Domain Model §19). Whether offered = PBD.
- **Attributes.** `owner_account_id` Reference(UserAccount) (Req), `currency_id` Reference(Currency) (Req), `balance` MoneyAmount (Req), `status` Enum(Configured) (Req), `classification` Classification=Financial (Req).
- **Relationships & Cardinality.** Wallet `1—N` WalletLedgerEntry; `1—N` WalletHold.
- **Constraints.** Balance derivable from ledger (integrity); one wallet per (account, currency).
- **Index Recommendations.** Unique index on (owner_account_id, currency_id).
- **Business Rules.** Established: balance = movements (Domain Model §19). PBD: whether wallets offered, negative-balance rules.
- **Audit Fields.** Standard; balance changes audited.
- **Future Expansion.** Multi-currency wallets.

#### Entity: WalletLedgerEntry
- **Description.** An append-only credit/debit movement on a wallet.
- **Attributes.** `wallet_id` Reference(Wallet) (Req), `entry_type` Enum(Configured: credit/debit) (Req), `amount` MoneyAmount (Req) + `currency_id` Reference(Currency) (Req), `source_reference` Identifier (Optional), `occurred_at` Timestamp(UTC) (Req).
- **Relationships & Cardinality.** WalletLedgerEntry `N—1` Wallet.
- **Constraints.** Append-only; currency matches wallet; ledger sums to balance (§24).
- **Index Recommendations.** Index on wallet_id; (wallet_id, occurred_at).
- **Business Rules.** Established: immutable ledger. PBD: entry sources/rules.
- **Audit Fields.** Audit-class; immutable.
- **Future Expansion.** Multi-currency conversion entries.

#### Entity: WalletHold
- **Description.** A hold/reservation of wallet funds.
- **Attributes.** `wallet_id` Reference(Wallet) (Req), `amount` MoneyAmount (Req) + `currency_id` Reference(Currency) (Req), `status` Enum(Configured: active/released/captured) (Req), `expires_at` Timestamp(UTC) (Optional).
- **Relationships & Cardinality.** WalletHold `N—1` Wallet.
- **Constraints.** Hold ≤ available balance; governed lifecycle.
- **Index Recommendations.** Index on wallet_id; status.
- **Business Rules.** PBD: hold rules/timeouts.
- **Audit Fields.** Standard.
- **Future Expansion.** Escrow-style holds.

### Domain: Subscription

#### Entity: SubscriptionPlan
- **Description.** A configurable recurring plan (Domain Model §20). Whether offered = PBD.
- **Attributes.** `name` LocalizedText (Req), `price` MoneyAmount (Optional) + `currency_id` Reference(Currency) (Optional), `billing_period` Enum(Configured) (Req), `entitlement_definition` JSONDocument (Req), `jurisdiction_id` Reference(Jurisdiction) (Optional), `status` Enum(Configured) (Req).
- **Relationships & Cardinality.** SubscriptionPlan `1—N` Subscription.
- **Constraints.** Price requires currency.
- **Index Recommendations.** Index on status; jurisdiction_id.
- **Business Rules.** PBD: plan definitions, pricing per market.
- **Audit Fields.** Standard.
- **Future Expansion.** Institutional plans.

#### Entity: Subscription
- **Description.** An actor's subscription instance.
- **Attributes.** `plan_id` Reference(SubscriptionPlan) (Req), `subscriber_account_id` Reference(UserAccount) (Req), `status` Enum(Configured: active/lapsed/cancelled) (Req), `started_at` Timestamp(UTC) (Req), `current_period_end` Timestamp(UTC) (Optional).
- **Relationships & Cardinality.** Subscription `N—1` SubscriptionPlan; `1—N` Entitlement; `1—N` SubscriptionRenewalEvent.
- **Constraints.** Governed transitions.
- **Index Recommendations.** Index on subscriber_account_id; plan_id; status.
- **Business Rules.** PBD: renewal/cancellation rules.
- **Audit Fields.** Standard.
- **Future Expansion.** Multi-party subscriptions.

#### Entity: Entitlement
- **Description.** An access/entitlement conferred by a subscription.
- **Attributes.** `subscription_id` Reference(Subscription) (Req), `entitlement_key` Enum(Configured) (Req), `status` Enum(Configured) (Req), `valid_until` Timestamp(UTC) (Optional).
- **Relationships & Cardinality.** Entitlement `N—1` Subscription; respected by authorization.
- **Constraints.** —
- **Index Recommendations.** Index on subscription_id; entitlement_key.
- **Business Rules.** PBD: entitlement definitions.
- **Audit Fields.** Standard.
- **Future Expansion.** Fine-grained entitlements.

#### Entity: SubscriptionRenewalEvent
- **Description.** Append-only record of renewal/lapse events.
- **Attributes.** `subscription_id` Reference(Subscription) (Req), `event_type` Enum(Configured) (Req), `occurred_at` Timestamp(UTC) (Req), `payment_id` Reference(Payment) (Optional).
- **Relationships & Cardinality.** SubscriptionRenewalEvent `N—1` Subscription.
- **Constraints.** Append-only.
- **Index Recommendations.** Index on subscription_id.
- **Business Rules.** PBD: renewal handling.
- **Audit Fields.** Audit-class; immutable.
- **Future Expansion.** Dunning/retry flows.

---

## AREA 7 — INSIGHT

### Domain: Reports

#### Entity: ReportDefinition
- **Description.** A defined, permissioned report (Domain Model §21).
- **Attributes.** `name` LocalizedText (Req), `audience_role` Reference(Role) (Optional), `definition` JSONDocument (Req), `status` Enum(Configured) (Req).
- **Relationships & Cardinality.** ReportDefinition `1—N` ReportInstance.
- **Constraints.** Access governed by permissions (Roles doc); privacy-respecting.
- **Index Recommendations.** Index on audience_role.
- **Business Rules.** PBD: report catalog/content.
- **Audit Fields.** Standard.
- **Future Expansion.** Institutional reporting.

#### Entity: ReportInstance
- **Description.** A generated report output instance.
- **Attributes.** `definition_id` Reference(ReportDefinition) (Req), `requested_by` Reference(UserAccount) (Req), `generated_at` Timestamp(UTC) (Req), `parameters` JSONDocument (Optional), `output_reference` String (Optional; storage).
- **Relationships & Cardinality.** ReportInstance `N—1` ReportDefinition.
- **Constraints.** Respects requester permissions; minor data privacy-bounded.
- **Index Recommendations.** Index on definition_id; requested_by.
- **Business Rules.** PBD: retention of generated reports.
- **Audit Fields.** Standard; access audited.
- **Future Expansion.** Scheduled reports.

### Domain: Analytics

#### Entity: MetricDefinition
- **Description.** A defined metric/KPI (Domain Model §22; Product Vision §10).
- **Attributes.** `metric_key` Enum(Configured) (Req), `name` LocalizedText (Req), `definition` JSONDocument (Req), `dimension_keys` JSONDocument (Optional), `status` Enum(Configured) (Req).
- **Relationships & Cardinality.** MetricDefinition `1—N` AnalyticsAggregate.
- **Constraints.** Privacy-preserving (no minor PII exposure).
- **Index Recommendations.** Unique index on metric_key.
- **Business Rules.** PBD: KPI definitions/targets (Product Vision §10.3).
- **Audit Fields.** Standard.
- **Future Expansion.** AI-assisted insight (behind abstraction).

#### Entity: AnalyticsEvent
- **Description.** An append-only captured event for analysis (privacy-respecting).
- **Attributes.** `event_key` Enum(Configured) (Req), `occurred_at` Timestamp(UTC) (Req), `actor_reference` Identifier (Optional; pseudonymized where required), `context` JSONDocument (Optional), `classification` Classification (Req).
- **Relationships & Cardinality.** Feeds AnalyticsAggregate.
- **Constraints.** Append-only; minor data minimized/pseudonymized (Art. VI).
- **Index Recommendations.** Index on (event_key, occurred_at).
- **Business Rules.** PBD: privacy-preserving analytics rules.
- **Audit Fields.** Audit-class; immutable.
- **Future Expansion.** Streaming analytics (PTD).

#### Entity: AnalyticsAggregate
- **Description.** A precomputed aggregate/measure over events.
- **Attributes.** `metric_id` Reference(MetricDefinition) (Req), `period_start` Timestamp(UTC) (Req), `period_end` Timestamp(UTC) (Req), `dimensions` JSONDocument (Optional), `value` Decimal (Req).
- **Relationships & Cardinality.** AnalyticsAggregate `N—1` MetricDefinition.
- **Constraints.** Non-authoritative (derived); recomputable.
- **Index Recommendations.** Index on (metric_id, period_start).
- **Business Rules.** PBD: aggregation windows.
- **Audit Fields.** Standard.
- **Future Expansion.** Real-time dashboards.

---

## AREA 8 — CONTENT & CONFIGURATION

### Domain: CMS

#### Entity: ContentItem
- **Description.** A managed content item (Domain Model §23).
- **Attributes.** `content_key` String (Optional), `content_type` Enum(Configured) (Req), `owner_account_id` Reference(UserAccount) (Req), `status` Enum(Configured: draft/in_review/published/retired) (Req), `is_public` Boolean (Req; SEO-relevant surfaces).
- **Relationships & Cardinality.** ContentItem `1—N` ContentVersion; `1—N` ContentTranslation; `N—1` ContentCategory; `N—M` Program/ProgramModule.
- **Constraints.** Published requires an approved version (workflow PBD).
- **Index Recommendations.** Index on content_type; status; is_public.
- **Business Rules.** PBD/legal: governance workflow, IP/ownership.
- **Audit Fields.** Standard; publish/retire audited.
- **Future Expansion.** Unlimited content languages (Art. III).

#### Entity: ContentVersion
- **Description.** A versioned revision of content (append-oriented; DB Arch §22).
- **Attributes.** `content_item_id` Reference(ContentItem) (Req), `version_number` Integer (Req), `body_reference` String (Req; storage), `status` Enum(Configured) (Req), `created_at_event` Timestamp(UTC) (Req).
- **Relationships & Cardinality.** ContentVersion `N—1` ContentItem.
- **Constraints.** Unique (content_item_id, version_number); prior versions preserved.
- **Index Recommendations.** Index on content_item_id.
- **Business Rules.** PBD: review/approval workflow.
- **Audit Fields.** Standard.
- **Future Expansion.** Branching/draft workflows.

#### Entity: ContentTranslation
- **Description.** A language-specific representation of a content item (DB Arch §11).
- **Attributes.** `content_item_id` Reference(ContentItem) (Req), `language_id` Reference(Language) (Req), `translated_body_reference` String (Req), `status` Enum(Configured) (Req).
- **Relationships & Cardinality.** ContentTranslation `N—1` ContentItem; `N—1` Language.
- **Constraints.** Unique (content_item_id, language_id).
- **Index Recommendations.** Index on content_item_id; language_id.
- **Business Rules.** PBD: translation fallback policy (EC-006).
- **Audit Fields.** Standard.
- **Future Expansion.** Unlimited languages, RTL/LTR neutral.

#### Entity: ContentCategory
- **Description.** A category/taxonomy node for content.
- **Attributes.** `name` LocalizedText (Req), `parent_category_id` Reference(ContentCategory) (Optional), `status` Enum(Configured) (Req).
- **Relationships & Cardinality.** ContentCategory `1—N` ContentItem; self-referential hierarchy.
- **Constraints.** No cycles in hierarchy.
- **Index Recommendations.** Index on parent_category_id.
- **Business Rules.** PBD: taxonomy governance.
- **Audit Fields.** Standard.
- **Future Expansion.** Multi-taxonomy.

### Domain: Localization

#### Entity: Language
- **Description.** A configurable supported language (Domain Model §24; Art. III). Launch: Arabic, English, Turkish; unlimited future.
- **Attributes.** `language_code` String (Req; standard code), `name` LocalizedText (Req), `direction` Enum(Configured: rtl/ltr) (Req), `status` Enum(Configured) (Req).
- **Relationships & Cardinality.** Language `1—N` TranslationValue; `1—N` ContentTranslation; referenced widely.
- **Constraints.** Unique language_code.
- **Index Recommendations.** Unique index on language_code.
- **Business Rules.** Established: unlimited languages via configuration (Art. 3.2); RTL first-class (Art. 3.3). PBD: which languages beyond launch.
- **Audit Fields.** Standard.
- **Future Expansion.** Unlimited languages — no schema change (Art. 3.2).

#### Entity: Locale
- **Description.** A configurable locale (language + region formatting), distinct from Language/Country (Art. 3.5).
- **Attributes.** `locale_code` String (Req), `language_id` Reference(Language) (Req), `region_reference` Reference(Country) (Optional), `formatting_rules` JSONDocument (Optional), `status` Enum(Configured) (Req).
- **Relationships & Cardinality.** Locale `N—1` Language; referenced by accounts/presentation.
- **Constraints.** Unique locale_code.
- **Index Recommendations.** Unique index on locale_code; index on language_id.
- **Business Rules.** PBD: locale formatting standards to adopt.
- **Audit Fields.** Standard.
- **Future Expansion.** Unlimited locales.

#### Entity: TranslationKey
- **Description.** A key for a translatable interface string.
- **Attributes.** `key_name` String (Req), `description` Text (Optional), `status` Enum(Configured) (Req).
- **Relationships & Cardinality.** TranslationKey `1—N` TranslationValue.
- **Constraints.** Unique key_name.
- **Index Recommendations.** Unique index on key_name.
- **Business Rules.** Established: interface text externalized (Art. 3.4).
- **Audit Fields.** Standard.
- **Future Expansion.** Namespaced keys.

#### Entity: TranslationValue
- **Description.** A language-specific value for a translation key, with fallback behavior.
- **Attributes.** `translation_key_id` Reference(TranslationKey) (Req), `language_id` Reference(Language) (Req), `value` Text (Req), `status` Enum(Configured) (Req).
- **Relationships & Cardinality.** TranslationValue `N—1` TranslationKey; `N—1` Language.
- **Constraints.** Unique (translation_key_id, language_id).
- **Index Recommendations.** Index on translation_key_id; language_id.
- **Business Rules.** PBD: fallback policy (EC-006).
- **Audit Fields.** Standard.
- **Future Expansion.** Machine-assisted translation.

### Domain: Countries

#### Entity: Country
- **Description.** A configurable country (Domain Model §25; Art. II). No country hardcoded/privileged. Launch: Türkiye, Lebanon.
- **Attributes.** `country_code` String (Req; standard code), `name` LocalizedText (Req), `default_locale_id` Reference(Locale) (Optional), `default_currency_id` Reference(Currency) (Optional), `status` Enum(Configured: active/onboarding/inactive) (Req).
- **Relationships & Cardinality.** Country `1—N` Jurisdiction; `1—N` JurisdictionAttribute (via Jurisdiction); referenced widely.
- **Constraints.** Unique country_code.
- **Index Recommendations.** Unique index on country_code; index on status.
- **Business Rules.** Established: onboarding is configuration, not redesign (Art. 2.3). PBD/legal: all per-country attribute values.
- **Audit Fields.** Standard.
- **Future Expansion.** Unlimited countries — no schema change (Art. 2.3).

#### Entity: Jurisdiction
- **Description.** A jurisdiction (often per country) carrying legal/fiscal/regulatory context.
- **Attributes.** `country_id` Reference(Country) (Req), `name` LocalizedText (Req), `status` Enum(Configured) (Req).
- **Relationships & Cardinality.** Jurisdiction `N—1` Country; `1—N` JurisdictionAttribute; referenced by many domains.
- **Constraints.** —
- **Index Recommendations.** Index on country_id.
- **Business Rules.** PBD/legal: jurisdiction-specific rules.
- **Audit Fields.** Standard.
- **Future Expansion.** Sub-national jurisdictions.

#### Entity: JurisdictionAttribute
- **Description.** A configurable attribute slot for a jurisdiction (legal, fiscal, residency, etc.) — the *slot*; the *value* is PBD/legal.
- **Attributes.** `jurisdiction_id` Reference(Jurisdiction) (Req), `attribute_key` Enum(Configured) (Req), `attribute_value` JSONDocument (Optional; PBD content), `status` Enum(Configured) (Req).
- **Relationships & Cardinality.** JurisdictionAttribute `N—1` Jurisdiction.
- **Constraints.** Unique (jurisdiction_id, attribute_key).
- **Index Recommendations.** Index on jurisdiction_id; attribute_key.
- **Business Rules.** PBD/legal: all attribute values (data residency, tax, consent age, etc.).
- **Audit Fields.** Standard.
- **Future Expansion.** New attribute keys as needs emerge.

#### Entity: Currency
- **Description.** A configurable currency (Art. IX/X; DB Arch §12). No currency hardcoded.
- **Attributes.** `currency_code` String (Req; standard code), `name` LocalizedText (Req), `minor_unit_scale` Integer (Req; precision), `status` Enum(Configured) (Req).
- **Relationships & Cardinality.** Currency referenced by all MoneyAmount attributes.
- **Constraints.** Unique currency_code.
- **Index Recommendations.** Unique index on currency_code.
- **Business Rules.** Established: money always currency-explicit (DB Arch §12). PBD: supported currencies; conversion rules.
- **Audit Fields.** Standard.
- **Future Expansion.** Unlimited currencies.

#### Entity: EducationalSystem
- **Description.** A configurable educational/school system (grades, stages) per country — NOT hardcoded (Art. IX).
- **Attributes.** `name` LocalizedText (Req), `country_id` Reference(Country) (Optional), `structure_definition` JSONDocument (Optional; PBD content), `status` Enum(Configured) (Req).
- **Relationships & Cardinality.** EducationalSystem `1—N` Program; `1—N` GradingScheme.
- **Constraints.** —
- **Index Recommendations.** Index on country_id.
- **Business Rules.** PBD/legal: system structures per market (BR-104).
- **Audit Fields.** Standard.
- **Future Expansion.** Unlimited systems as configuration.

### Domain: Settings

#### Entity: Setting
- **Description.** A governed configurable setting at some scope (Domain Model §26; Art. X).
- **Attributes.** `setting_key` Enum(Configured) (Req), `scope_type` Enum(Configured: platform/country/jurisdiction/role/account) (Req), `scope_reference` Identifier (Optional), `value` JSONDocument (Req), `config_version_id` Reference(ConfigurationVersion) (Optional).
- **Relationships & Cardinality.** Setting `N—1` ConfigurationVersion.
- **Constraints.** Unique (setting_key, scope_type, scope_reference); validated (§24).
- **Index Recommendations.** Index on (setting_key, scope_type, scope_reference).
- **Business Rules.** Established: governed, validated, versioned (Art. 10.3). PBD: setting catalog/defaults.
- **Audit Fields.** Standard; setting changes audited.
- **Future Expansion.** New configurable dimensions.

#### Entity: ConfigurationVersion
- **Description.** A version of configuration for governed, auditable change (Art. 10.3; DB Arch §22).
- **Attributes.** `version_label` String (Req), `status` Enum(Configured: draft/active/superseded) (Req), `activated_at` Timestamp(UTC) (Optional).
- **Relationships & Cardinality.** ConfigurationVersion `1—N` Setting.
- **Constraints.** One active version per scope (policy PBD).
- **Index Recommendations.** Index on status.
- **Business Rules.** Established: configuration is versioned/governed.
- **Audit Fields.** Standard; activation audited.
- **Future Expansion.** Config rollback.

---

## AREA 9 — OPERATIONS & GOVERNANCE

### Domain: Administration

#### Entity: AdminAction
- **Description.** A governed administrative action record (Domain Model §27). Also feeds Audit.
- **Attributes.** `actor_account_id` Reference(UserAccount) (Req), `action_key` Enum(Configured) (Req), `target_reference` Identifier (Optional), `scope_type` Enum(Configured) (Req), `scope_reference` Identifier (Optional), `occurred_at` Timestamp(UTC) (Req), `outcome` Enum(Configured) (Req).
- **Relationships & Cardinality.** AdminAction `N—1` UserAccount; correlates to AuditRecord.
- **Constraints.** Permissioned (Roles doc); append-oriented; no unaudited power (§13.3).
- **Index Recommendations.** Index on actor_account_id; (action_key, occurred_at).
- **Business Rules.** Established: permissioned & audited. PBD: admin action catalog; per-country/institutional admin model.
- **Audit Fields.** Audit-class; immutable.
- **Future Expansion.** Delegated/tenant administration.

#### Entity: AdminScope
- **Description.** A defined scope of administrative authority (e.g., a country) for an admin assignment.
- **Attributes.** `account_id` Reference(UserAccount) (Req), `scope_type` Enum(Configured) (Req), `scope_reference` Identifier (Optional), `status` Enum(Configured) (Req).
- **Relationships & Cardinality.** AdminScope `N—1` UserAccount; complements AccountRole scoping.
- **Constraints.** Unique (account_id, scope_type, scope_reference).
- **Index Recommendations.** Index on account_id.
- **Business Rules.** PBD: scope model (per-country/institutional).
- **Audit Fields.** Standard; scope changes audited.
- **Future Expansion.** Multi-tenant scopes.

### Domain: Audit Logs

#### Entity: AuditRecord
- **Description.** The trustworthy, append-only, tamper-evident record of significant actions (Domain Model §28; Art. 6.5; DB Arch §9).
- **Attributes.** `actor_account_id` Reference(UserAccount) (Optional; system actor allowed), `action` Enum(Configured) (Req), `entity_type` Enum(Configured) (Req), `entity_reference` Identifier (Optional), `authority_context` JSONDocument (Optional; role/permission under which acted), `occurred_at` Timestamp(UTC) (Req), `jurisdiction_id` Reference(Jurisdiction) (Optional), `classification` Classification (Req).
- **Relationships & Cardinality.** AuditRecord references any entity (loose coupling).
- **Constraints.** Append-only, immutable, tamper-evident (§9.2); NEVER updated or deleted; separate store from operational data.
- **Index Recommendations.** Index on (entity_type, entity_reference); (actor_account_id, occurred_at); action; jurisdiction_id. Partition by time (DB Arch §15).
- **Business Rules.** Established: no unaudited power incl. Super Admin (§13.3). PBD/legal: auditable-event catalog & retention periods.
- **Audit Fields.** This entity IS the audit record; immutable by definition.
- **Future Expansion.** Per-jurisdiction audit/retention; tamper-evidence hardening.

### Domain: Support

#### Entity: SupportCase
- **Description.** A support request and its lifecycle (Domain Model §29).
- **Attributes.** `raised_by_account_id` Reference(UserAccount) (Req), `subject` LocalizedText (Req), `category` Enum(Configured) (Req), `status` Enum(Configured: open/triaged/in_progress/resolved/closed) (Req), `assigned_to` Reference(UserAccount) (Optional), `priority` Enum(Configured) (Optional), `jurisdiction_id` Reference(Jurisdiction) (Optional).
- **Relationships & Cardinality.** SupportCase `1—N` SupportInteraction; `1—N` SupportEscalation; may link to a Conversation.
- **Constraints.** Case-necessary access only (least privilege §15.3); governed transitions.
- **Index Recommendations.** Index on raised_by_account_id; status; assigned_to; category.
- **Business Rules.** Established: purpose-bound access (Roles doc §10). PBD: SLAs, escalation, safeguarding (minors).
- **Audit Fields.** Standard; access to case data audited.
- **Future Expansion.** AI-assisted support (behind abstraction).

#### Entity: SupportInteraction
- **Description.** An interaction within a support case.
- **Attributes.** `case_id` Reference(SupportCase) (Req), `actor_account_id` Reference(UserAccount) (Req), `interaction_type` Enum(Configured) (Req), `body` LocalizedText (Optional), `occurred_at` Timestamp(UTC) (Req).
- **Relationships & Cardinality.** SupportInteraction `N—1` SupportCase.
- **Constraints.** Append-oriented.
- **Index Recommendations.** Index on case_id; (case_id, occurred_at).
- **Business Rules.** PBD: interaction handling rules.
- **Audit Fields.** Standard.
- **Future Expansion.** Omnichannel interactions.

#### Entity: SupportEscalation
- **Description.** An escalation of a support case (including safeguarding escalation for minors).
- **Attributes.** `case_id` Reference(SupportCase) (Req), `escalation_type` Enum(Configured) (Req), `escalated_to` Reference(UserAccount) (Optional), `reason` LocalizedText (Optional), `occurred_at` Timestamp(UTC) (Req), `classification` Classification (Req; Minor-Related for safeguarding).
- **Relationships & Cardinality.** SupportEscalation `N—1` SupportCase.
- **Constraints.** Safeguarding escalations follow most-protective handling (BR-003).
- **Index Recommendations.** Index on case_id; escalation_type.
- **Business Rules.** PBD/legal: escalation & safeguarding procedures.
- **Audit Fields.** Standard; escalations audited.
- **Future Expansion.** Automated risk-based escalation.

---

## CROSS-ENTITY RELATIONSHIP MAP (LOGICAL OVERVIEW)

The following summarizes the principal relationships across boundaries. Within a boundary, references are direct; across boundaries they are governed references/projections fed by events (DB Arch §2.3; System Arch §3.3), never shared mutable stores.

**Identity core.** Identity `1—1` UserAccount. UserAccount specializes into StudentProfile / ParentProfile / TutorProfile (`1—0..1` each). UserAccount `N—M` Role (via AccountRole); Role `N—M` Permission (via RolePermission). UserAccount `N—M` UserAccount (via AccountRelationship — guardianship etc.).

**Marketplace flow.** StudentProfile + TutorProfile → Booking → ScheduleProposal → LiveSession → SessionOutcome. Booking `1—0..1` Payment. TutorProfile gated by VerificationCase.

**Learning flow.** StudentProfile → ProgramEnrollment → ProgramProgress; StudentProfile → LearningPlan → (LearningGoal, Milestone, PlannedActivity); Assessment → AssessmentSubmission → AssessmentResult; HomeworkAssignment → HomeworkSubmission → HomeworkFeedback. Programs/Modules `N—M` ContentItem.

**Commerce flow.** Payment `1—N` Transaction; Payment `1—0..1` Refund; Wallet `1—N` WalletLedgerEntry / WalletHold; SubscriptionPlan `1—N` Subscription `1—N` Entitlement.

**Communication.** Conversation `N—M` UserAccount (via ConversationParticipant); Conversation `1—N` Message `1—N` MessageAttachment. Notification `1—N` NotificationDelivery; NotificationPreference per (account, channel, type).

**Configuration backbone (referenced widely).** Country `1—N` Jurisdiction `1—N` JurisdictionAttribute; Currency, Language, Locale, EducationalSystem, Setting/ConfigurationVersion — all configurable reference data consumed across domains (Art. IX/X).

**Cross-cutting.** AuditRecord loosely references any entity; AI entities serve Learning/Assessment/Homework/Messaging/Support behind the provider-independent abstraction; CalendarEntry aggregates time from Booking, Sessions, Homework, Milestones.

---

## DOMAIN COVERAGE CHECK (ALL 29 DOMAINS REPRESENTED)

1. Authentication — Identity, AuthCredential, AuthSession, MFAFactor, AuthEvent.
2. User Management — UserAccount, Role, Permission, RolePermission, AccountRole, AccountRelationship.
3. Student — StudentProfile.
4. Parent — ParentProfile.
5. Tutor — TutorProfile, TutorOffering, TutorAvailability, TutorRating.
6. Tutor Verification — VerificationCase, VerificationCheck, VerificationDocument.
7. Booking — Booking, BookingStatusHistory, CancellationRecord.
8. Scheduling — ScheduleProposal, ReschedulingEvent.
9. Calendar — CalendarEntry, Reminder.
10. Live Sessions — LiveSession, SessionAttendance, SessionOutcome, SessionRecordingRef.
11. Programs — Program, ProgramModule, ProgramEnrollment, ProgramProgress.
12. Learning Plans — LearningPlan, LearningGoal, Milestone, PlannedActivity.
13. Assessments — Assessment, AssessmentSubmission, AssessmentResult, GradingScheme.
14. Homework — HomeworkAssignment, HomeworkSubmission, HomeworkFeedback.
15. AI Services — AIProviderConfig, AIInteraction, AIGovernancePolicy.
16. Notifications — NotificationChannel, NotificationTemplate, Notification, NotificationDelivery, NotificationPreference.
17. Messaging — Conversation, ConversationParticipant, Message, MessageAttachment.
18. Payments — Payment, Transaction, PaymentMethodConfig, Refund.
19. Wallet — Wallet, WalletLedgerEntry, WalletHold.
20. Subscription — SubscriptionPlan, Subscription, Entitlement, SubscriptionRenewalEvent.
21. Reports — ReportDefinition, ReportInstance.
22. Analytics — MetricDefinition, AnalyticsEvent, AnalyticsAggregate.
23. CMS — ContentItem, ContentVersion, ContentTranslation, ContentCategory.
24. Localization — Language, Locale, TranslationKey, TranslationValue.
25. Countries — Country, Jurisdiction, JurisdictionAttribute, Currency, EducationalSystem.
26. Settings — Setting, ConfigurationVersion.
27. Administration — AdminAction, AdminScope.
28. Audit Logs — AuditRecord.
29. Support — SupportCase, SupportInteraction, SupportEscalation.

**Total: 29/29 domains modeled; ~90 logical entities.** Additional association and reference entities are named inline. This catalog is complete for v1.0 at the logical level; new entities are added through governed versioning (DB Arch §22) as PBDs resolve.

---

## CONSOLIDATED DEFERRALS

**Pending Business / Legal Decisions (PBD)** embedded across entities — to be authoritatively established (Art. XIV) and recorded in the PDL before the corresponding rule is enforced: minor age thresholds & safeguarding (StudentProfile, LiveSession, SupportEscalation, throughout); guardianship establishment/oversight/payment responsibility (AccountRelationship, ParentProfile); tutor eligibility & verification requirements per jurisdiction (TutorProfile, VerificationCase/Check/Document); booking/cancellation/matching/pricing (Booking, CancellationRecord); scheduling constraints (ScheduleProposal); session conduct/recording/attendance (LiveSession, SessionRecordingRef); educational alignment/grading (Program, Assessment, GradingScheme, EducationalSystem); payment/financial rules — pricing, fees, tax, refunds (Payment, Refund, PaymentMethodConfig); wallet/subscription rules & whether offered (Wallet, SubscriptionPlan); contact/messaging/moderation rules (Conversation, Message); consent-to-contact (Notification, NotificationPreference); content governance/IP & translation fallback (ContentItem, TranslationValue); KPI definitions/targets & privacy-preserving analytics (MetricDefinition, AnalyticsEvent); report catalog & retention (ReportDefinition, ReportInstance); admin action catalog & per-country/institutional model (AdminAction, AdminScope); auditable-event catalog & retention periods (AuditRecord); support SLAs/escalation (SupportCase); supported countries/currencies/languages/locales/educational-systems attribute values (Country, Currency, Language, Locale, JurisdictionAttribute, EducationalSystem). Minor-sensitive items default to most-restrictive until resolved (BR-003).

**Pending Technical Decisions (PTD)** — physical realization of this logical model: engine(s) and polyglot choices per boundary; physical data types & monetary representation; UUID concrete format; index/partition physical schemes; storage for referenced files (documents, recordings, content, report outputs); provider configs (AI, payment processors, notification channels, media) held as opaque references; audit/analytics store technology. All recorded in the PDL (category TEC).

*No PBD or PTD is resolved here; each is surfaced so it can be decided deliberately and logged, per the Constitution's prohibition on assumptions and requirement to document decisions.*

---

## CLOSING PROVISION

This Master Database Schema provides the complete logical data design of the Education Ecosystem Platform: approximately ninety entities spanning all twenty-nine business domains, each with its description, attributes and logical types, required and optional fields, relationships and cardinality, constraints, index recommendations, business rules, audit fields, and future-expansion notes. It contains no SQL, no ORM or Prisma models, and no physical implementation, and it invents no business rule — conforming to the Database Master Architecture (globally-unique keys, standard audit fields and soft delete, currency-explicit money, absolute-time storage, configurable references, boundary-owned data, integrity by design) while deferring every business rule as a Pending Business Decision and every technology choice as a Pending Technical Decision, to be resolved by the appropriate authority and recorded in the Project Decision Log. The logical model is complete, consistent, and built to expand without rework, exactly as the Constitution requires.

---

MASTER DATABASE SCHEMA VERSION 1.0 COMPLETED
