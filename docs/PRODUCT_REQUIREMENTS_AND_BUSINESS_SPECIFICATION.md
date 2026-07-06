# PRODUCT REQUIREMENTS & BUSINESS SPECIFICATION

### The Consolidated Requirements Baseline for the Education Ecosystem Platform

---

| Field | Value |
|---|---|
| **Document Title** | Product Requirements & Business Specification |
| **Document Class** | Tier 1 — Governance Instrument (subordinate to the Constitution) |
| **Version** | 1.0 |
| **Status** | Ratified — Active |
| **Owner** | Lead System Architect & Product Owner |
| **Date of Ratification** | 2 July 2026 |
| **Governing Authority** | Project Constitution v1.0 (Tier 0) |
| **Companion Instruments** | Project Decision Log v1.0, Product Vision v1.0, Business Domain Model v1.0, User Roles & Permissions v1.0 (Tier 1) |
| **Constitutional Basis** | Articles I–XVII (whole) |

---

## READER'S NOTE ON SCOPE AND SOURCING

This document consolidates the Platform's requirements into a single baseline. It draws on, and must remain consistent with, all previously ratified documents.

Consistent with Constitution Article VIII, it contains **no implementation code, no user-interface design, and no database structure.** Requirements are stated as *what the business needs*, never *how it is built*.

Consistent with Constitution Article IX (Anti-Assumption Mandate), it **invents no business fact and no legal requirement.** Requirements fall into two kinds:

- **Established requirements** — derived directly from ratified documents (the Constitution's principles, the Domain Model's domains, the Roles model). These are firm.
- **Rule-dependent requirements** — those whose *substance* depends on a business or legal rule not yet authoritatively set (Constitution Article XIV). For these, the requirement to *have a governed rule* is stated as firm, while the rule's *content* is marked **Pending Business Decision (PBD)** and, where relevant, linked to the Constitution's Open Questions Register (Article XVI).

This separation is deliberate: the Platform can commit now to *having* a capability and to the *quality bar* it must meet, without pretending to know business rules that only an authoritative owner may set.

---

## REQUIREMENT CONVENTIONS

**Identifier taxonomy.** Every requirement carries a unique, permanent ID:

| Prefix | Section |
|---|---|
| `SCP` | Product Scope |
| `FR` | Functional Requirement |
| `NFR` | Non-Functional Requirement |
| `UJ` | User Journey |
| `BR` | Core Business Rule |
| `VR` | Validation Rule |
| `EC` | Error & Edge Case |
| `SM` | Success Metric |
| `FE` | Future Expansion Consideration |

IDs are permanent and never reused (mirroring the Project Decision Log's numbering discipline). Gaps are acceptable.

**Priority scale.** `Critical` (foundational; the Platform is not viable or not compliant without it) · `High` (core to the value proposition) · `Medium` (important, not launch-blocking) · `Low` (desirable).

**Per-requirement fields.** Each requirement states: **Description**, **Business Reason**, **Priority**, **Dependencies**, **Acceptance Criteria**. Where a requirement is rule-dependent, its Acceptance Criteria include the meta-criterion that the governing rule has been authoritatively established and recorded in the Project Decision Log before the rule-specific behavior is accepted.

**A note on priority and PBD.** A requirement may be `Critical` (we must have a governed rule for cancellations) while its content is PBD (what the cancellation rule *is*). Priority reflects the necessity of the capability; PBD reflects the absence of the rule.

---

## SECTION 1 — PRODUCT SCOPE

**SCP-001 — Unified Education Ecosystem**
- **Description.** The Platform shall deliver, as one coherent ecosystem, a private tutoring marketplace, a Learning Management System, an AI learning assistant, and dedicated experiences for students, parents, tutors, and enterprise administrators.
- **Business Reason.** This composition is the Platform's defining identity (Constitution Art. 1.2; Product Vision §1–2).
- **Priority.** Critical.
- **Dependencies.** All domains (Business Domain Model).
- **Acceptance Criteria.** The scope of every delivered capability traces to one of these components; no component is treated as a separate, disconnected product.

**SCP-002 — Production & Enterprise Grade from Launch**
- **Description.** The Platform shall be production-ready and enterprise-grade from first release; it shall not be delivered as an MVP or prototype.
- **Business Reason.** Constitutional mandate (Art. 1.1, 5.15, 5.16); Product Vision §11.1.
- **Priority.** Critical.
- **Dependencies.** NFR set (Section 3).
- **Acceptance Criteria.** No delivered capability is labeled temporary; all meet the non-functional bar in Section 3.

**SCP-003 — Multi-Country, Multi-Language by Construction**
- **Description.** The Platform's scope shall include operation across multiple countries and languages, with launch in Türkiye and Lebanon and in Arabic, English, and Turkish, and structural support for unlimited future countries and languages.
- **Business Reason.** Constitution Art. II, III; Product Vision §5, §12.
- **Priority.** Critical.
- **Dependencies.** Countries, Localization, Settings domains.
- **Acceptance Criteria.** No country, language, currency, payment method, or educational system is hardcoded; adding one is a configuration activity (see NFR-010).

**SCP-004 — Out-of-Scope Boundaries**
- **Description.** The Platform shall exclude: clones of competitor products; hardcoded jurisdictional assumptions; features embodying assumed (unestablished) business/legal rules; and AI capabilities that lock the Platform to a single provider.
- **Business Reason.** Constitution Art. 1.4, VII, IX; Product Vision §11.
- **Priority.** Critical.
- **Dependencies.** BR set (Section 5), AI requirements.
- **Acceptance Criteria.** Any proposed feature matching an exclusion is rejected or escalated via the Conflict Protocol (Constitution Art. XVII).

**SCP-005 — Specific Feature-Level Scope List**
- **Description.** The exhaustive, feature-level list of what is in and out of scope for each release.
- **Business Reason.** Needed for release planning; depends on business prioritization.
- **Priority.** High.
- **Dependencies.** Product Vision §11.7 (PBD), business ownership.
- **Acceptance Criteria.** **Pending Business Decision** — to be established by the business and recorded in the Project Decision Log (category PRD).

---

## SECTION 2 — FUNCTIONAL REQUIREMENTS

*Functional requirements state capabilities the Platform must provide. They are organized by domain area. Rule content is PBD where noted; the capability itself is established.*

### Identity & People

**FR-001 — Identity Authentication**
- **Description.** The Platform shall allow actors to prove their identity and establish an authenticated session, supporting multiple, configurable authentication methods.
- **Business Reason.** Every capability depends on trustworthy identity (Business Domain Model §1).
- **Priority.** Critical.
- **Dependencies.** Authentication domain; SCP-002.
- **Acceptance Criteria.** An actor can authenticate and de-authenticate; methods are configurable; every authentication event is auditable. *Specific methods and credential/session rules: PBD.*

**FR-002 — Account & Role Management**
- **Description.** The Platform shall manage account lifecycles and assign/revoke roles and permissions explicitly.
- **Business Reason.** Role-based access is constitutional (Art. IV); User Management domain.
- **Priority.** Critical.
- **Dependencies.** FR-001; User Roles & Permissions document.
- **Acceptance Criteria.** Accounts can be created, governed, and deactivated; roles/permissions are explicit and auditable; no capability is granted by omission.

**FR-003 — Role-Specialized Profiles**
- **Description.** The Platform shall represent Student, Parent, and Tutor as specialized actors with their role-appropriate profiles and relationships (e.g., guardianship linkage).
- **Business Reason.** Distinct actor domains (Business Domain Model §3–5).
- **Priority.** Critical.
- **Dependencies.** FR-002.
- **Acceptance Criteria.** Each actor type has a governed profile; relationships between actors are represented structurally. *Relationship rules (guardianship establishment, oversight scope): PBD/legal.*

**FR-004 — Tutor Verification Gate**
- **Description.** The Platform shall require a tutor to hold valid verification/eligibility before offering or delivering services, and shall maintain and be able to revoke that status.
- **Business Reason.** Trust and safety (Business Domain Model §6; Product Vision §4.5).
- **Priority.** Critical.
- **Dependencies.** FR-003.
- **Acceptance Criteria.** A tutor lacking valid status cannot be booked; status changes are auditable. *Verification criteria and per-jurisdiction requirements: PBD/legal.*

### Engagement & Delivery

**FR-005 — Booking of Tutoring**
- **Description.** The Platform shall allow a student (or a parent on their behalf, per rules) to book an eligible tutor, and shall manage the booking lifecycle (request, confirm, change, cancel).
- **Business Reason.** Core marketplace transaction (Business Domain Model §7).
- **Priority.** Critical.
- **Dependencies.** FR-004, FR-006, FR-016 (payments where applicable).
- **Acceptance Criteria.** A booking can be created against an eligible tutor and progress through its lifecycle; each transition is auditable. *Who may book, pricing-at-booking, cancellation/refund rules: PBD.*

**FR-006 — Scheduling & Calendar**
- **Description.** The Platform shall reconcile tutor availability and learner demand into agreed times (Scheduling) and record/present time commitments to each actor (Calendar), time-zone aware across countries.
- **Business Reason.** Business Domain Model §8–9; multi-country (Art. II).
- **Priority.** Critical.
- **Dependencies.** FR-005; Localization (time zones).
- **Acceptance Criteria.** Agreed times are computed respecting constraints and recorded on the relevant calendars in the correct locale/time zone. *Scheduling constraint rules: PBD.*

**FR-007 — Live Session Delivery Lifecycle**
- **Description.** The Platform shall govern the business lifecycle of a live teaching session (start, conduct, completion, attendance, outcome linkage).
- **Business Reason.** Delivery of teaching (Business Domain Model §10).
- **Priority.** Critical.
- **Dependencies.** FR-005, FR-006.
- **Acceptance Criteria.** A booked session can be conducted and completed with attendance and outcomes represented; events are auditable. *Conduct/recording/attendance rules (with minor-protection): PBD/legal.*

### Learning

**FR-008 — Structured Programs**
- **Description.** The Platform shall represent structured educational offerings (programs) and enrollment/progression within them.
- **Business Reason.** Business Domain Model §11.
- **Priority.** High.
- **Dependencies.** FR-003, FR-014 (content).
- **Acceptance Criteria.** Programs can be defined, enrolled in, and progressed through. *Program structure, accreditation, per-market educational-system alignment: PBD/legal.*

**FR-009 — Individualized Learning Plans**
- **Description.** The Platform shall represent individualized learning plans (goals, milestones, sequenced activities) for a student, adaptable over time.
- **Business Reason.** Business Domain Model §12; personalization (Product Vision §4.7).
- **Priority.** High.
- **Dependencies.** FR-008, FR-015 (AI, optional assist).
- **Acceptance Criteria.** A plan can be created for a student and adapted as progress occurs. *Planning/goal frameworks: PBD.*

**FR-010 — Assessments**
- **Description.** The Platform shall support evaluation of learning (assignment, submission, evaluation, result).
- **Business Reason.** Measuring outcomes (Business Domain Model §13; Product Vision §10).
- **Priority.** High.
- **Dependencies.** FR-008.
- **Acceptance Criteria.** An assessment can be assigned, submitted, evaluated, and produce a result. *Grading schemes, integrity rules, qualification alignment: PBD/legal.*

**FR-011 — Homework**
- **Description.** The Platform shall support assigned practice work between sessions (assignment, completion, submission, feedback).
- **Business Reason.** Business Domain Model §14.
- **Priority.** Medium.
- **Dependencies.** FR-008.
- **Acceptance Criteria.** Homework can be assigned, completed, submitted, and given feedback; deadlines appear on the calendar. *Deadline/resubmission/feedback rules: PBD.*

### Intelligence

**FR-012 — AI Learning Assistant (Provider-Independent)**
- **Description.** The Platform shall provide AI assistance to learners and to other domains through a single, provider-independent abstraction.
- **Business Reason.** Constitution Art. VII (absolute provider independence); Business Domain Model §15.
- **Priority.** High.
- **Dependencies.** FR-001; Settings; Audit Logs.
- **Acceptance Criteria.** AI capability is consumed only through the internal abstraction; an AI provider can be added, replaced, or removed **without rewriting the application**; AI actions are governed and auditable. *AI usage/safety/data policies: PBD/legal.*

### Communication

**FR-013 — Notifications & Messaging**
- **Description.** The Platform shall deliver system-originated notifications (configurable channels/preferences) and governed person-to-person messaging within safety boundaries.
- **Business Reason.** Business Domain Model §16–17.
- **Priority.** High.
- **Dependencies.** FR-002; Localization.
- **Acceptance Criteria.** Notifications are triggered, localized, and preference-respecting; messaging occurs only within permitted relationships. *Who-may-contact-whom (esp. minors), channels, moderation: PBD/legal.*

### Content & Configuration

**FR-014 — Content Management (Multi-Language)**
- **Description.** The Platform shall manage the lifecycle of educational and informational content, supporting multiple languages and SEO-relevant public content.
- **Business Reason.** Business Domain Model §23; Art. III, 5.13.
- **Priority.** High.
- **Dependencies.** FR-002; Localization.
- **Acceptance Criteria.** Content can be authored, reviewed, published, retired, and translated. *Content governance/IP rules: PBD/legal.*

**FR-015 — Configuration, Countries & Localization**
- **Description.** The Platform shall express country, language, locale, currency, payment method, and educational system as governed configuration, enabling onboarding of new ones without application change.
- **Business Reason.** Constitution Art. II, III, X; Business Domain Model §24–26.
- **Priority.** Critical.
- **Dependencies.** Settings, Countries, Localization domains.
- **Acceptance Criteria.** A new country/language/currency/method/educational system can be introduced through configuration only. *The attribute values themselves: PBD/legal.*

### Commerce

**FR-016 — Payments, Wallet & Subscription**
- **Description.** The Platform shall govern money movement (payments), balances (wallet), and recurring entitlements (subscription) as configurable, multi-currency capabilities.
- **Business Reason.** Commercial settlement (Business Domain Model §18–20).
- **Priority.** Critical (capability) — content PBD.
- **Dependencies.** FR-005; Countries/Localization.
- **Acceptance Criteria.** The capability exists and is auditable; currencies/methods are configurable. *Pricing, commission/fee/payout, refund, tax, whether wallets/subscriptions are offered, financial-regulatory constraints: PBD/legal.*

### Insight, Operations & Governance

**FR-017 — Reports & Analytics**
- **Description.** The Platform shall provide permissioned, audience-appropriate reports and aggregate, privacy-respecting analytics.
- **Business Reason.** Business Domain Model §21–22; measure-don't-assume (Art. XI).
- **Priority.** High.
- **Dependencies.** FR-002 (permissions); Security/Privacy.
- **Acceptance Criteria.** Each actor sees only permitted information; analytics respect privacy, especially for minors. *Report catalog, KPI definitions/targets: PBD.*

**FR-018 — Administration & Audit**
- **Description.** The Platform shall provide governed administrative oversight/control and a trustworthy, append-only audit record of significant actions.
- **Business Reason.** Business Domain Model §27–28; accountability (Art. 6.5).
- **Priority.** Critical.
- **Dependencies.** FR-002; User Roles & Permissions document.
- **Acceptance Criteria.** Administrative actions are permissioned and audited; no role (incl. Super Admin) has unaudited power. *Admin action catalog, retention periods: PBD/legal.*

**FR-019 — Support**
- **Description.** The Platform shall enable actors to raise and resolve support cases, with purpose-bound, least-privilege access and safeguarding escalation.
- **Business Reason.** Care sustains trust (Business Domain Model §29).
- **Priority.** High.
- **Dependencies.** FR-002, FR-013.
- **Acceptance Criteria.** A case can be raised, triaged, handled, and resolved with case-necessary access only. *Support policies, SLAs, escalation (esp. minors): PBD/legal.*

---

## SECTION 3 — NON-FUNCTIONAL REQUIREMENTS

*These are the firmest requirements in the document: they derive directly from Constitution Article V and apply to every capability.*

**NFR-001 — Scalability**
- **Description.** The Platform shall scale horizontally to growth in users, countries, and load without structural rework.
- **Business Reason.** Art. 5.1; unbounded expansion (Art. II).
- **Priority.** Critical. **Dependencies.** All FRs.
- **Acceptance Criteria.** Growth is absorbed by scaling, not redesign; verified under load. *Specific load/performance targets: PBD (Open Questions Register).*

**NFR-002 — Modularity**
- **Description.** The Platform shall be composed of well-bounded modules with explicit contracts.
- **Business Reason.** Art. 5.2. **Priority.** Critical. **Dependencies.** Business Domain Model.
- **Acceptance Criteria.** Domain boundaries are respected; no cross-cutting entanglement.

**NFR-003 — Maintainability**
- **Description.** Every artifact shall be understandable, changeable, and testable by a competent engineer who did not author it.
- **Business Reason.** Art. 5.3, VIII. **Priority.** High. **Dependencies.** —
- **Acceptance Criteria.** Change can be made safely with tests; no duplicated logic; no unnecessary complexity.

**NFR-004 — Security-First**
- **Description.** Security shall be a design input for every capability (authN, authZ, secrets, data protection).
- **Business Reason.** Art. 5.9, VI. **Priority.** Critical. **Dependencies.** FR-001, FR-002.
- **Acceptance Criteria.** Each capability states and satisfies its security handling; fails closed on ambiguity.

**NFR-005 — Privacy & Protection of Minors**
- **Description.** The Platform shall apply privacy-by-default and the highest applicable protection wherever minors' data is involved.
- **Business Reason.** Art. VI. **Priority.** Critical. **Dependencies.** NFR-004.
- **Acceptance Criteria.** Data is minimized; minor-sensitive access defaults to most-restrictive until an authoritative rule permits otherwise. *Per-jurisdiction legal thresholds: PBD/legal.*

**NFR-006 — Performance-First**
- **Description.** Performance shall be a design input, defined per capability and measured.
- **Business Reason.** Art. 5.10. **Priority.** High. **Dependencies.** NFR-001.
- **Acceptance Criteria.** Each capability has performance targets and is verified against them. *Target values: PBD (Open Questions Register).*

**NFR-007 — Availability & Resilience**
- **Description.** The Platform shall have no single point of failure and shall recover from component failure.
- **Business Reason.** Art. XII. **Priority.** Critical. **Dependencies.** NFR-001.
- **Acceptance Criteria.** Failure of any single component does not cause systemic outage; recovery is verified. *SLO targets: PBD.*

**NFR-008 — Accessibility**
- **Description.** Every user-facing surface shall be usable by people with disabilities.
- **Business Reason.** Art. 5.14. **Priority.** Critical. **Dependencies.** All user-facing FRs.
- **Acceptance Criteria.** Surfaces conform to the adopted standard/level. *Specific standard & level: PBD (Open Questions Register).*

**NFR-009 — Internationalization & RTL**
- **Description.** The Platform shall treat multi-language, locale formatting, and both RTL and LTR as first-class.
- **Business Reason.** Art. III. **Priority.** Critical. **Dependencies.** FR-015.
- **Acceptance Criteria.** Any supported language (incl. Arabic RTL) renders and formats correctly; unlimited languages addable by configuration.

**NFR-010 — Configurability ("No Hardcoding")**
- **Description.** Countries, currencies, languages, school systems, and payment methods shall never be hardcoded; all variation is configurable.
- **Business Reason.** Art. IX, X. **Priority.** Critical. **Dependencies.** FR-015.
- **Acceptance Criteria.** Introducing any such item requires no application code change.

**NFR-011 — API-First**
- **Description.** Every capability shall be defined by an explicit contract; no capability is reachable only via a UI.
- **Business Reason.** Art. 5.7. **Priority.** Critical. **Dependencies.** All FRs.
- **Acceptance Criteria.** Each capability has a defined contract that UIs and integrations consume. *(Contract content is design, out of scope here.)*

**NFR-012 — Mobile-Ready**
- **Description.** Mobile experiences shall be first-class consumers of the same contracts.
- **Business Reason.** Art. 5.12. **Priority.** High. **Dependencies.** NFR-011.
- **Acceptance Criteria.** Capabilities are usable on mobile without reduced integrity.

**NFR-013 — Cloud-Ready & Observable**
- **Description.** The Platform shall be designed for elastic, observable, resilient cloud operation with no manual operational steps.
- **Business Reason.** Art. 5.8, XII. **Priority.** Critical. **Dependencies.** NFR-001, NFR-007.
- **Acceptance Criteria.** Deploy/rollback/config change are safe, repeatable, observable.

**NFR-014 — Auditability**
- **Description.** Security-, privacy-, and governance-relevant actions shall be traceable (who, what, when, under what authority).
- **Business Reason.** Art. 6.5. **Priority.** Critical. **Dependencies.** FR-018.
- **Acceptance Criteria.** Such actions produce append-only audit records. *Auditable-event scope & retention: PBD/legal.*

**NFR-015 — AI Provider Independence**
- **Description.** The AI subsystem shall permit replacing any AI provider without application rewrite.
- **Business Reason.** Art. VII. **Priority.** Critical. **Dependencies.** FR-012.
- **Acceptance Criteria.** Provider change is a configuration/adapter activity behind the abstraction.

---

## SECTION 4 — USER JOURNEYS

*Journeys are described at the business level (steps and intent), not as UI flows. Each depends on rule content marked PBD where relevant.*

**UJ-001 — Student Learning Journey**
- **Description.** A student authenticates, accesses their learning context, engages in booked sessions/programs, uses the AI assistant, completes homework/assessments, and views their progress.
- **Business Reason.** Core value delivery to the primary learner (Product Vision §6.1).
- **Priority.** Critical. **Dependencies.** FR-001, FR-005–FR-012, FR-017.
- **Acceptance Criteria.** A student can traverse the journey end-to-end within self-scoped permissions; minor-condition constraints (PBD) are honored.

**UJ-002 — Parent Oversight Journey**
- **Description.** A parent authenticates, views a linked student's progress/schedule, stays informed via notifications, communicates within bounds, and (if the paying party) manages payment/subscription.
- **Business Reason.** Parental engagement (Product Vision §6.2).
- **Priority.** High. **Dependencies.** FR-003, FR-013, FR-016, FR-017.
- **Acceptance Criteria.** A parent completes oversight within the guardianship boundary. *Oversight scope & payment responsibility: PBD/legal.*

**UJ-003 — Tutor Delivery Journey**
- **Description.** A tutor becomes verified, sets offerings/availability, receives bookings, delivers sessions, manages teaching artifacts, and views earnings.
- **Business Reason.** Supply side of the marketplace (Product Vision §6.3).
- **Priority.** Critical. **Dependencies.** FR-004–FR-011, FR-016.
- **Acceptance Criteria.** A verified tutor completes the journey; an unverified tutor is gated at offering/booking. *Eligibility, earnings rules: PBD.*

**UJ-004 — Booking-to-Session Journey**
- **Description.** Demand is matched to an eligible tutor, scheduled, paid for (where applicable), delivered as a session, and followed by outcomes.
- **Business Reason.** The end-to-end marketplace transaction.
- **Priority.** Critical. **Dependencies.** FR-004–FR-007, FR-016.
- **Acceptance Criteria.** The chain completes with each step auditable. *Booking/cancellation/payment rules: PBD.*

**UJ-005 — Operational Governance Journeys (Admin / Support / Finance / Moderator)**
- **Description.** Operational roles perform their governance/care/commerce/safety duties within permissioned, audited boundaries.
- **Business Reason.** Running the ecosystem (Business Domain Model §27–29; Roles document).
- **Priority.** High. **Dependencies.** FR-018, FR-019, FR-016, FR-013.
- **Acceptance Criteria.** Each operational role completes its duties within its boundary; all actions audited. *Specific action catalogs & policies: PBD.*

**UJ-006 — Country/Language Onboarding Journey**
- **Description.** An administrator onboards a new country and/or language through configuration, without application change.
- **Business Reason.** Unbounded expansion (Art. II, III).
- **Priority.** High. **Dependencies.** FR-015, NFR-010.
- **Acceptance Criteria.** A new country/language becomes operational via configuration only. *Per-country attribute values: PBD/legal.*

---

## SECTION 5 — CORE BUSINESS RULES

*Per Constitution Article IX, no operational business rule is invented here. This section records (a) the **constitutional meta-rules** that are already authoritatively established, and (b) the **rule slots** that must be filled by authoritative decision, marked PBD.*

**Established meta-rules (firm):**

**BR-001 — No Hardcoding of Jurisdictional Facts**
- **Description.** Countries, currencies, languages, school systems, and payment methods must always be configurable, never hardcoded.
- **Business Reason.** Art. IX, X. **Priority.** Critical. **Dependencies.** NFR-010.
- **Acceptance Criteria.** No delivered logic embeds any such fact.

**BR-002 — Tutor Eligibility Gate**
- **Description.** Only validly verified/eligible tutors may offer or deliver services.
- **Business Reason.** Trust/safety (Art. VI; Business Domain Model §6).
- **Priority.** Critical. **Dependencies.** FR-004.
- **Acceptance Criteria.** Ineligible tutors cannot be booked. *Eligibility criteria: PBD.*

**BR-003 — Protection of Minors Takes Precedence**
- **Description.** Where a rule affecting a minor is unestablished, behavior defaults to the most protective/restrictive interpretation until an authoritative rule states otherwise.
- **Business Reason.** Art. VI; Roles doc §16.2.
- **Priority.** Critical. **Dependencies.** NFR-005.
- **Acceptance Criteria.** Minor-sensitive actions fail closed absent an authoritative permissive rule.

**BR-004 — Explicit, Least-Privilege Authorization**
- **Description.** Access is granted only through explicit, role-based, least-privilege permissions; deny-by-default applies.
- **Business Reason.** Art. IV; Roles doc §15.
- **Priority.** Critical. **Dependencies.** FR-002.
- **Acceptance Criteria.** No capability is available without an explicit grant.

**BR-005 — AI Provider Independence**
- **Description.** No business process may depend on a specific AI provider in a way preventing replacement.
- **Business Reason.** Art. VII. **Priority.** Critical. **Dependencies.** FR-012, NFR-015.
- **Acceptance Criteria.** Provider substitution requires no application rewrite.

**BR-006 — Full Accountability**
- **Description.** Every significant action is attributable and audited; no role has unaudited power.
- **Business Reason.** Art. 6.5. **Priority.** Critical. **Dependencies.** FR-018, NFR-014.
- **Acceptance Criteria.** Significant actions produce audit records.

**Rule slots requiring authoritative decision (PBD):**

**BR-100 — Marketplace Commercial Rules** — pricing, matching, who-may-book, cancellation/refund. **Priority.** Critical. **Dependencies.** FR-005, FR-016. **Acceptance Criteria. Pending Business Decision** (record in PDL, category BUS).

**BR-101 — Payment/Financial Rules** — currencies, methods, commission/fee/payout, tax, refunds. **Priority.** Critical. **Dependencies.** FR-016. **Acceptance Criteria. Pending Business Decision / legal.**

**BR-102 — Guardianship & Oversight Rules** — establishment, consent authority, oversight scope, multi-guardian, payment responsibility. **Priority.** Critical. **Dependencies.** FR-003, UJ-002. **Acceptance Criteria. Pending Business Decision / legal.**

**BR-103 — Communication/Contact Rules** — who may contact whom, especially regarding minors; moderation standards. **Priority.** Critical. **Dependencies.** FR-013. **Acceptance Criteria. Pending Business Decision / legal.**

**BR-104 — Educational Alignment Rules** — school systems, grading, accreditation per country. **Priority.** High. **Dependencies.** FR-008, FR-010. **Acceptance Criteria. Pending Business Decision / legal.**

**BR-105 — Verification Rules** — tutor verification checks/standards per jurisdiction. **Priority.** Critical. **Dependencies.** FR-004. **Acceptance Criteria. Pending Business Decision / legal.**

**BR-106 — Session Conduct Rules** — recording, attendance, conduct (with minor protections). **Priority.** High. **Dependencies.** FR-007. **Acceptance Criteria. Pending Business Decision / legal.**

---

## SECTION 6 — VALIDATION RULES

*Validation rules state that inputs and state transitions must be validated. Business-specific thresholds are PBD; the requirement to validate is firm.*

**VR-001 — Universal Input Validation**
- **Description.** All inputs shall be validated for integrity before acceptance; invalid inputs are rejected safely.
- **Business Reason.** Security-first, data integrity (Art. 5.9, VIII).
- **Priority.** Critical. **Dependencies.** NFR-004.
- **Acceptance Criteria.** No invalid input is accepted; rejection is safe and informative within privacy limits.

**VR-002 — Authorization Validation on Every Action**
- **Description.** Every action shall validate that the actor holds an explicit permission for it.
- **Business Reason.** BR-004; Art. IV.
- **Priority.** Critical. **Dependencies.** FR-002.
- **Acceptance Criteria.** Unpermitted actions are denied and audited.

**VR-003 — State-Transition Validation**
- **Description.** Lifecycle transitions (booking, session, payment, verification, etc.) shall be validated against permitted transitions.
- **Business Reason.** Integrity of business processes.
- **Priority.** Critical. **Dependencies.** FR-004–FR-016.
- **Acceptance Criteria.** Only permitted transitions succeed. *Permitted-transition specifics per process: partly PBD.*

**VR-004 — Localization & Jurisdiction Validation**
- **Description.** Inputs tied to locale/jurisdiction (currency, language, formats) shall be validated against active configuration.
- **Business Reason.** Multi-country integrity (Art. II, X).
- **Priority.** High. **Dependencies.** FR-015.
- **Acceptance Criteria.** Values inconsistent with configured jurisdiction are rejected.

**VR-005 — Minor-Sensitive Validation**
- **Description.** Actions touching minors shall validate that required guardian authority/consent conditions are satisfied.
- **Business Reason.** Art. VI; BR-003.
- **Priority.** Critical. **Dependencies.** BR-102, BR-103.
- **Acceptance Criteria.** Absent an authoritative permissive rule, such actions are denied. *Consent conditions: PBD/legal.*

**VR-006 — Financial Validation**
- **Description.** Financial actions shall validate amounts, currency, balances, and authority within configured rules.
- **Business Reason.** Commercial integrity.
- **Priority.** Critical. **Dependencies.** FR-016.
- **Acceptance Criteria.** Invalid financial actions are rejected. *Thresholds/limits/dual-control: PBD.*

---

## SECTION 7 — ERROR & EDGE CASES

*These state required behavior under failure and boundary conditions.*

**EC-001 — Fail Closed on Authorization Ambiguity**
- **Description.** On any authorization ambiguity or failure, access shall be denied.
- **Business Reason.** Security-first, fail-safe (Art. 5.9; Roles doc §16.8).
- **Priority.** Critical. **Dependencies.** VR-002.
- **Acceptance Criteria.** Ambiguous cases resolve to denial, audited.

**EC-002 — Graceful Degradation**
- **Description.** On component failure, the Platform shall degrade gracefully without systemic outage or data corruption.
- **Business Reason.** Resilience (Art. XII; NFR-007).
- **Priority.** Critical. **Dependencies.** NFR-007, NFR-013.
- **Acceptance Criteria.** Single-component failure is contained; state remains consistent.

**EC-003 — AI Provider Unavailability**
- **Description.** If an AI provider is unavailable or replaced, the Platform shall continue operating and route through the abstraction without application change.
- **Business Reason.** Provider independence (Art. VII).
- **Priority.** High. **Dependencies.** FR-012, NFR-15.
- **Acceptance Criteria.** AI-dependent features fail gracefully or fail over; no hard dependency on one provider.

**EC-004 — Booking/Scheduling Conflicts**
- **Description.** Conflicting or double bookings and scheduling collisions shall be prevented or safely resolved.
- **Business Reason.** Marketplace integrity.
- **Priority.** High. **Dependencies.** FR-005, FR-006.
- **Acceptance Criteria.** Conflicts are detected and handled deterministically. *Resolution policy: PBD.*

**EC-005 — Payment Failure & Reconciliation**
- **Description.** Failed, partial, or duplicate payments shall be handled without loss of financial integrity.
- **Business Reason.** Financial correctness.
- **Priority.** Critical. **Dependencies.** FR-016, VR-006.
- **Acceptance Criteria.** Financial state remains correct and reconcilable under failure. *Refund/retry policy: PBD.*

**EC-006 — Localization Gaps**
- **Description.** Missing translations or locale data shall degrade safely (e.g., to a configured fallback), never breaking the experience.
- **Business Reason.** Multi-language robustness (Art. III).
- **Priority.** Medium. **Dependencies.** FR-015, NFR-009.
- **Acceptance Criteria.** A missing translation yields a defined fallback, not a failure. *Fallback policy: PBD.*

**EC-007 — Minor-Data Edge Handling**
- **Description.** Edge conditions involving minors (e.g., unverifiable guardianship) shall resolve to the most protective outcome.
- **Business Reason.** Art. VI; BR-003.
- **Priority.** Critical. **Dependencies.** VR-005.
- **Acceptance Criteria.** Ambiguity around minors resolves restrictively. *Definitive rules: PBD/legal.*

---

## SECTION 8 — SUCCESS METRICS

*Per Product Vision §10, success is measured along defined dimensions; specific targets are PBD.*

**SM-001 — Educational Outcome Metrics** — measures of learning improvement. **Priority.** High. **Dependencies.** FR-010, FR-017. **Acceptance Criteria.** Metrics defined and instrumented; *definitions/targets/method: PBD.*

**SM-002 — Engagement Metrics** — active use across student/parent/tutor. **Priority.** High. **Dependencies.** FR-017. **Acceptance Criteria.** Instrumented; *targets: PBD.*

**SM-003 — Marketplace Health Metrics** — supply/demand balance, successful engagements. **Priority.** High. **Dependencies.** FR-005. **Acceptance Criteria.** Instrumented; *definitions/targets: PBD.*

**SM-004 — Trust & Safety Metrics** — security, privacy, minor-protection performance. **Priority.** Critical. **Dependencies.** NFR-004, NFR-005. **Acceptance Criteria.** Instrumented; *targets: PBD.*

**SM-005 — Reliability & Performance Metrics** — availability, per-capability performance vs SLOs. **Priority.** Critical. **Dependencies.** NFR-006, NFR-007. **Acceptance Criteria.** Instrumented; *SLO targets: PBD (Open Questions Register).*

**SM-006 — Accessibility & Reach Metrics** — conformance, language/country coverage. **Priority.** High. **Dependencies.** NFR-008, NFR-009. **Acceptance Criteria.** Instrumented; *targets & standard: PBD.*

**SM-007 — Growth Metrics** — user and market growth over time. **Priority.** Medium. **Dependencies.** FR-017. **Acceptance Criteria.** Instrumented; *targets: PBD.*

---

## SECTION 9 — FUTURE EXPANSION CONSIDERATIONS

**FE-001 — Unlimited Country Expansion** — new countries onboarded via configuration. **Priority.** High. **Dependencies.** FR-015, NFR-010. **Acceptance Criteria.** New country requires no code change. *Sequencing/timing: PBD.*

**FE-002 — Unlimited Language Expansion** — new languages via configuration, LTR/RTL. **Priority.** High. **Dependencies.** FR-015, NFR-009. **Acceptance Criteria.** New language requires no code change.

**FE-003 — Institutional / Multi-Tenant Expansion** — enterprise/institutional deployments, delegated administration, tenant-scoped roles. **Priority.** Medium. **Dependencies.** Roles doc §14. **Acceptance Criteria. Pending Business Decision** (record in PDL).

**FE-004 — Deeper AI Capabilities** — added behind the provider-independent abstraction. **Priority.** Medium. **Dependencies.** FR-012, NFR-15. **Acceptance Criteria.** New AI capability added without violating provider independence. *Scope: PBD.*

**FE-005 — Expanded Learning & Assessment Types** — new program/assessment/homework types and per-market educational alignment. **Priority.** Medium. **Dependencies.** FR-008–FR-011. **Acceptance Criteria.** Added as configuration/extension. *Content & alignment: PBD/legal.*

**FE-006 — Payment & Monetization Expansion** — new methods, currencies, monetization models. **Priority.** Medium. **Dependencies.** FR-016. **Acceptance Criteria.** Added as configuration. *Models & rules: PBD.*

**FE-007 — External Integrations** — external calendars, identity, payment, and other systems. **Priority.** Low–Medium. **Dependencies.** NFR-011. **Acceptance Criteria.** Enabled via governed integration. *Which integrations: PBD.*

---

## CONSOLIDATED PENDING BUSINESS DECISIONS

The following are the requirement areas whose *content* awaits authoritative business/legal ownership (Constitution Art. XIV) and will be recorded in the Project Decision Log when set; several map to the Constitution's Open Questions Register (Art. XVI). Minor-sensitive items default to the most restrictive safe interpretation until resolved (BR-003).

Feature-level release scope (SCP-005) · Authentication methods & session rules (FR-001) · Guardianship/oversight & payment responsibility (FR-003, BR-102, UJ-002) · Tutor verification & eligibility (FR-004, BR-105) · Booking/cancellation/matching (FR-005, BR-100) · Scheduling constraints (FR-006) · Session conduct/recording (FR-007, BR-106) · Educational alignment (FR-008, FR-010, BR-104) · Learning-plan/grading frameworks (FR-009, FR-010) · Homework rules (FR-011) · AI usage/safety/data policies (FR-012, BR-103 for contact) · Contact/messaging/moderation rules (FR-013, BR-103) · Content governance/IP (FR-014) · Per-jurisdiction attribute values (FR-015) · Payment/financial rules (FR-016, BR-101) · Report catalog & KPI definitions/targets (FR-017, SM-001–007) · Admin action catalog & retention (FR-018, NFR-014) · Support policies/SLAs/escalation (FR-019) · Performance/availability/accessibility targets & standard (NFR-006, NFR-007, NFR-008 — Open Questions Register) · Institutional/multi-tenant model (FE-003) · Monetization & integration expansion (FE-006, FE-007).

---

## CLOSING PROVISION

This Product Requirements & Business Specification consolidates the Platform's scope, functional and non-functional requirements, user journeys, business and validation rules, error and edge cases, success metrics, and future-expansion considerations into a single baseline — every requirement carrying a unique ID, business reason, priority, dependencies, and acceptance criteria. Consistent with the Constitution, it commits firmly to capabilities and quality bars derived from ratified documents while inventing no business or legal fact, marking each unestablished item as a Pending Business Decision and defaulting minor-sensitive matters to the safest interpretation. The requirements are stable and extensible; each Pending Business Decision will be resolved by the appropriate authority and recorded in the Project Decision Log, at which point the corresponding rule-specific acceptance criteria become testable.

---

PRODUCT REQUIREMENTS & BUSINESS SPECIFICATION VERSION 1.0 COMPLETED
