# SYSTEM ARCHITECTURE MASTER DOCUMENT

### The Authoritative Architecture Blueprint for the Education Ecosystem Platform

---

| Field | Value |
|---|---|
| **Document Title** | System Architecture Master Document |
| **Document Class** | Tier 1 — Governance Instrument (subordinate to the Constitution) |
| **Version** | 1.0 |
| **Status** | Ratified — Active |
| **Owner** | Lead System Architect & Product Owner |
| **Date of Ratification** | 2 July 2026 |
| **Governing Authority** | Project Constitution v1.0 (Tier 0) |
| **Companion Instruments** | Project Decision Log v1.0, Product Vision v1.0, Business Domain Model v1.0, User Roles & Permissions v1.0, Product Requirements & Business Specification v1.0 (Tier 1) |
| **Constitutional Basis** | Articles I–XVII (whole; especially II, III, V, VI, VII, VIII, X, XI, XII) |

---

## READER'S NOTE ON SCOPE, SOURCING, AND TWO KINDS OF DEFERRAL

This document defines the Platform's **architecture** — its structure, boundaries, cross-cutting strategies, and the principles that bind them. It is the most consequential engineering document produced so far, and it is written to the Constitution's standard of "maximum architectural quality" (Constitution Art. VIII).

Consistent with Constitution Article VIII, it contains **no implementation code, no API contracts or endpoints, and no database tables or schema.** It describes *architecture* — patterns, boundaries, responsibilities, qualities, and strategies — not *build artifacts*.

This document uses **two distinct deferral markers**, and the distinction matters:

- **Pending Business Decision (PBD)** — a *business or legal* rule, per Constitution Article IX / XIV, that must be authoritatively established by a business owner. Architecture never invents these; it only ensures the structure *can accommodate* whatever they turn out to be.
- **Pending Technical Decision (PTD)** — a concrete *technology selection* (a specific database engine, cache product, message broker, video provider, cloud region, etc.). Selecting a technology is itself a governed decision (Project Decision Log, category **TEC**), not an assumption to be made casually inside a blueprint. This document therefore specifies the **required properties, patterns, and constraints** a technology must satisfy, and defers the *specific product choice* to a logged TEC decision. This is a deliberate application of Constitution Article 8.7 ("decisions are documented") and Article IX ("never assume").

In short: **architecture here fixes the shape and the constraints; it does not silently pick vendors or invent rules.** Every place a concrete product or a business rule would be chosen is called out as PTD or PBD respectively, to be resolved and recorded in the Project Decision Log.

---

## PART A — FOUNDATIONS

### 1. OVERALL SYSTEM ARCHITECTURE

**1.1 Architectural Vision.** The Platform is a **modular, domain-aligned, API-first, cloud-native system** built as one coherent education ecosystem (Constitution Art. 1.1) rather than a set of disconnected products. Its architecture is organized around the twenty-nine business domains (Business Domain Model) as the primary units of structure, so that the software boundaries mirror the business boundaries.

**1.2 Architectural Style.** The Platform adopts a **service-oriented, domain-partitioned architecture** governed by **Clean Architecture** principles (Section 4) and expressed through **explicit contracts** (Section 28). Whether individual domains are deployed as independent services, grouped services, or a modular monolith with strict internal boundaries is a **PTD** (deployment topology decision, category TEC) — but *whichever topology is chosen, the domain boundaries and dependency rules in this document are binding.* The architecture is designed so that topology can evolve (e.g., extracting a service) without violating boundaries.

**1.3 Guiding Tenets (from the Constitution).** Every architectural decision serves these binding tenets: scalable, modular, maintainable, multi-country, multi-language, role-based, API-first, cloud-ready, security-first, performance-first, AI-ready, mobile-ready, SEO-friendly, accessibility-compliant, production-ready, enterprise-grade (Constitution Art. V). Configurability is supreme: where a tenet conflicts with hardcoding, configurability wins (Art. 5.17).

**1.4 High-Level Structure (conceptual layers of the whole system).**

```
   ┌───────────────────────────────────────────────────────────┐
   │            CONSUMERS (role-based experiences)               │
   │   Student · Parent · Tutor · Admin · Support · Integrations │
   └───────────────────────────────────────────────────────────┘
                              │  (explicit API contracts, §28)
   ┌───────────────────────────────────────────────────────────┐
   │                     API / EDGE LAYER                        │
   │   contract exposure · authN entry · routing · versioning    │
   └───────────────────────────────────────────────────────────┘
                              │
   ┌───────────────────────────────────────────────────────────┐
   │                    APPLICATION LAYER                        │
   │   use-case orchestration · authorization enforcement        │
   └───────────────────────────────────────────────────────────┘
                              │
   ┌───────────────────────────────────────────────────────────┐
   │                      DOMAIN LAYER                           │
   │   the 29 business domains · business logic · pure of tech   │
   └───────────────────────────────────────────────────────────┘
                              │  (ports)
   ┌───────────────────────────────────────────────────────────┐
   │                  INFRASTRUCTURE LAYER (adapters)            │
   │  persistence · messaging · AI providers · payments · video  │
   │  storage · cache · notifications · external integrations    │
   └───────────────────────────────────────────────────────────┘
                              │
   ┌───────────────────────────────────────────────────────────┐
   │        CROSS-CUTTING: Security · Audit · Logging ·          │
   │        Monitoring · Localization · Configuration · Tenancy  │
   └───────────────────────────────────────────────────────────┘
```

**1.5 Rationale.** This structure makes business logic the stable core, keeps technology at the replaceable edge (essential for AI provider independence, Art. VII, and for evolving the tech stack without rewrites, Art. VIII), and lets geography/language/currency/time be resolved as context rather than baked into logic (Art. X).

---

### 2. MODULAR ARCHITECTURE

**2.1 Modules Map to Domains.** Each business domain (Business Domain Model §1–29) is a **module** with a single responsibility, an explicit public contract, and private internals. Modules are the unit of ownership, testing, and evolution (Constitution Art. 5.2, 8.4).

**2.2 Module Rules.** A module: (a) exposes capability only through its contract; (b) hides its internal model; (c) never reaches into another module's internals; (d) depends on others only through their contracts or via events; (e) has exactly one authoritative home for each business rule (no duplication, Art. 8.4).

**2.3 Module Grouping.** Modules are grouped into the areas defined in the Domain Model (Identity & People, Engagement & Delivery, Learning, Intelligence, Communication, Commerce, Insight, Content & Configuration, Operations & Governance). Grouping aids comprehension and may inform deployment topology (PTD) but never weakens boundaries.

**2.4 Shared Kernel (minimal).** A deliberately minimal shared foundation carries only truly cross-cutting concepts (identity context, locale/jurisdiction context, permission context, audit primitives). It is kept small to avoid coupling; anything domain-specific stays in its domain.

**2.5 Rationale.** Modularity delivers maintainability, independent scalability, and safe change — direct constitutional requirements (Art. 5.1–5.3, VIII).

---

### 3. SERVICE BOUNDARIES

**3.1 Boundary Definition.** A service boundary encloses one or more cohesive domain modules that change together and share a consistency need. Boundaries are drawn to **maximize cohesion within and minimize coupling across** (Constitution Art. 5.2).

**3.2 Boundary Contracts.** Cross-boundary interaction occurs only through explicit, versioned contracts (Section 28) or asynchronous events (Section 15). No boundary shares another's private data store; each boundary owns its data (data ownership is architectural even though schemas are out of scope here).

**3.3 Consistency Across Boundaries.** Within a boundary, strong consistency is expected; across boundaries, **eventual consistency via events** is the default, with explicit compensation for failures. Where a business process spans boundaries (e.g., booking → payment → session), it is coordinated as a well-defined, observable, recoverable workflow (saga-style orchestration or choreography — the specific mechanism is a PTD).

**3.4 Boundary Governance.** Introducing, merging, or splitting a service boundary is an architectural decision recorded in the Project Decision Log (category ARC). Boundaries are never redrawn silently.

**3.5 Rationale.** Clear boundaries prevent the entanglement the Constitution forbids (Art. 5.2, 8.5) and enable independent scaling and deployment (Art. 5.1).

---

### 4. CLEAN ARCHITECTURE PRINCIPLES

**4.1 The Dependency Rule.** Dependencies point **inward**. The domain core depends on nothing external; the application layer depends on the domain; infrastructure depends on (implements) interfaces defined by the inner layers. Business logic never depends on frameworks, databases, providers, or delivery mechanisms (Constitution Art. 8.6).

**4.2 Ports and Adapters.** Every external capability (persistence, messaging, AI, payment, video, storage, notification, integration) is expressed as a **port** (an interface owned by the inner layers) implemented by an **adapter** (in infrastructure). This is the structural guarantee behind AI provider independence (Art. VII) and, more broadly, behind the freedom to change any technology without rewriting business logic (Art. VIII).

**4.3 Independence.** The domain is independent of UI, database, delivery mechanism, and external agency. It can be reasoned about and tested in isolation (supports Art. XI verification).

**4.4 Explicitness.** Business rules live in the domain, explicitly, with one authoritative home each (Art. 8.4). Cross-cutting concerns are handled by dedicated mechanisms, not scattered.

**4.5 Rationale.** Clean Architecture is the concrete embodiment of the Constitution's development philosophy: no shortcuts, no debt, no duplication, clean boundaries (Art. VIII).

---

### 5. LAYERED ARCHITECTURE

**5.1 The Layers.**

1. **Presentation / Consumer layer** — role-based experiences (student, parent, tutor, admin, support) and integrations. (UI design is out of scope; this layer *consumes* contracts.)
2. **API / Edge layer** — exposes contracts, terminates authentication, routes, applies versioning and rate/traffic policy.
3. **Application layer** — orchestrates use cases; enforces authorization; coordinates workflows; owns no business rules itself.
4. **Domain layer** — the business logic of the 29 domains; pure of technology.
5. **Infrastructure layer** — adapters implementing ports: persistence, messaging, AI, payments, video, storage, cache, notifications, integrations.
6. **Cross-cutting concerns** — security, audit, logging, monitoring, localization, configuration, tenancy — applied consistently across layers.

**5.2 Layer Rules.** Each layer depends only inward (Section 4.1). Higher layers may use lower ones only through defined interfaces; lower layers never depend on higher ones. Cross-cutting concerns are woven in via consistent mechanisms, not duplicated per feature.

**5.3 Rationale.** Layering gives separation of concerns and testability (Art. 5.3, XI) while keeping the domain the stable center.

---

## PART B — GLOBALIZATION STRATEGIES

*All four strategies operationalize Constitution Articles II, III, and X: nothing hardcoded; everything resolved from configuration and context.*

### 6. MULTI-COUNTRY STRATEGY

**6.1 Country as Configuration.** Country/jurisdiction is a first-class, configurable concept (Business Domain Model §25). No country is privileged; onboarding a new country is a configuration + onboarding activity, never a code change (Constitution Art. 2.3, 2.4).

**6.2 Jurisdiction Context Resolution.** Every request carries or resolves a **jurisdiction context** that determines applicable configuration (legal, fiscal, linguistic, educational, data-residency). Domains consume this context rather than embedding country logic.

**6.3 Per-Jurisdiction Variation.** Any rule may vary by jurisdiction; the architecture provides the *mechanism* for such variation while the *values* are PBD/legal until authoritatively set (Art. II, XIV; Open Questions Register).

**6.4 Data Residency.** The architecture must be capable of honoring per-jurisdiction data-residency and sovereignty requirements (Art. 6.4). The residency *mechanism* (e.g., regional data partitioning) is architectural; the *obligations per country* are PBD/legal; the concrete regional infrastructure is a PTD.

**6.5 Rationale.** Unbounded, low-friction country expansion is a constitutional promise (Art. 2.3).

---

### 7. MULTI-LANGUAGE STRATEGY

**7.1 Externalized, Unlimited Languages.** All user-facing text and content are externalized from logic; unlimited languages are addable purely as configuration (Constitution Art. 3.2; Localization domain §24).

**7.2 First-Class RTL and LTR.** Bidirectional presentation is foundational, not a retrofit; Arabic (RTL) is a launch language (Art. 3.3). Directionality is a property resolved from locale, honored across all consuming experiences.

**7.3 Separation of Language, Locale, Country, Jurisdiction.** These are distinct, combinable concepts (Art. 3.5). Language selection, locale formatting, and jurisdiction rules are resolved independently and composed.

**7.4 Content vs Interface Localization.** Interface text and domain content (CMS §23) are both localizable, through the Localization domain, with a defined fallback strategy for missing translations (fallback policy: PBD; graceful degradation required per Requirements EC-006).

**7.5 Rationale.** Multi-language by construction is constitutional (Art. III); the launch set is Arabic, English, Turkish, with unlimited future languages.

---

### 8. MULTI-CURRENCY STRATEGY

**8.1 Currency as Configuration.** Supported currencies are configurable data, never hardcoded (Constitution Art. IX, X; Payments domain §18).

**8.2 Currency Context.** Amounts carry explicit currency; currency for a transaction is resolved from jurisdiction/user context, not assumed. Presentation formatting is a Localization concern (Section 7); monetary correctness is a Payments concern.

**8.3 Separation of Concerns.** The architecture separates: the *representation* of monetary value, the *currency* it is in, the *formatting* for display, and the *rules* of conversion/pricing. Conversion, pricing, fees, and rounding **rules** are PBD; the architecture ensures they are applied in one authoritative place (Payments), never scattered.

**8.4 Multi-Currency Balances.** Wallet balances (§19) are currency-aware. Whether multi-currency balances are offered, and payout/conversion rules, are PBD.

**8.5 Rationale.** Multi-country commerce demands configurable, correct, non-hardcoded currency handling (Art. II, X).

---

### 9. MULTI-TIMEZONE STRATEGY

**9.1 Unambiguous Time.** All time-bearing events are stored and reasoned about in an unambiguous, absolute reference, and presented in the actor's resolved locale/time zone (Scheduling §8, Calendar §9). Time zone is never assumed from a single country.

**9.2 Context-Resolved Presentation.** Each actor's time zone is resolved from context; scheduling reconciles participants who may be in different zones (essential for cross-border tutoring, Art. II).

**9.3 Correctness Concerns.** The architecture explicitly accounts for daylight-saving transitions, differing calendars/locale conventions (Localization), and cross-zone scheduling collisions (Requirements EC-004). Specific scheduling constraint rules are PBD.

**9.4 Rationale.** A multi-country platform cannot treat time as local; correct global time handling is foundational.

---

## PART C — INTELLIGENCE & SECURITY

### 10. AI ARCHITECTURE

**10.1 Provider Independence (Absolute, Constitutional).** AI is consumed exclusively through an internal **AI abstraction (port)** owned by the Platform. Any provider — Claude, OpenAI, Gemini, future, or self-hosted — is integrated as an **adapter** behind that port and can be added, replaced, or removed **without rewriting the application** (Constitution Art. VII; Business Domain Model §15; Requirements FR-012, NFR-015).

**10.2 No Leakage.** No domain or application logic references a provider's proprietary interface, model identifier, or provider-specific behavior. Such details live only inside adapters.

**10.3 Governance & Safety.** AI interactions are governed to the same standards of security, privacy (especially for minors), accessibility, and auditability as any capability (Art. 7.4, VI). AI usage, safety, and data-handling **policies** are PBD/legal; the architecture ensures they are enforceable at the abstraction.

**10.4 Resilience.** AI features degrade gracefully or fail over across providers on unavailability (Requirements EC-003). Multi-provider routing/fallback is an architectural capability; provider selection and routing policy are PTD/PBD.

**10.5 Rationale.** Provider independence is a non-negotiable constitutional guarantee, not an aspiration (Art. 7.1).

---

### 11. AUTHENTICATION ARCHITECTURE

**11.1 Purpose.** Establish and verify identity, producing a trustworthy identity assertion consumed by all domains (Authentication domain §1; Requirements FR-001).

**11.2 Centralized, Method-Agnostic.** Authentication is a centralized, cross-cutting capability supporting multiple, configurable methods behind a common port. Adding a method is configuration/adapter work; the specific methods are PBD, and any external identity provider is a PTD.

**11.3 Session & Assertion.** Authenticated presence is represented as a governed session/assertion consumed by authorization. Session lifetime, step-up, and credential-strength rules are PBD. Every authentication event is auditable (Section 20).

**11.4 Separation from Authorization.** Authentication proves *who*; authorization decides *what* (Section 12). The two are distinct architectural concerns.

**11.5 Minors & Consent.** Identity/consent handling for minors follows heightened protection (Art. VI); specific consent mechanisms per jurisdiction are PBD/legal.

**11.6 Rationale.** Trustworthy identity underpins every other capability; security-first (Art. 5.9).

---

### 12. AUTHORIZATION ARCHITECTURE (RBAC)

**12.1 Model.** Authorization is **Role-Based Access Control** as defined in the User Roles & Permissions document: explicit grants, least privilege, deny-by-default, separation of duties, scope-bounded authority, full auditability, central reasoning (Roles doc §15–16).

**12.2 Centralized Enforcement.** Authorization is enforced consistently at the application layer for every action (Requirements VR-002), reasoned about centrally rather than re-implemented per feature (Constitution Art. 4.3). The permission context is part of the shared kernel (Section 2.4).

**12.3 Fail-Safe.** On any ambiguity or failure, authorization fails closed (denied) — a security invariant (Roles doc §16.8; Requirements EC-001).

**12.4 Scope Awareness.** Grants are bounded by scope — self, relationship, jurisdiction, or platform — reflecting multi-country operation (Art. II). Relationship-derived authority (e.g., guardianship) is modeled explicitly (Roles doc §4.4).

**12.5 Minor-Sensitive Default.** Absent an authoritative permissive rule, minor-sensitive actions default to the most restrictive outcome (Roles doc §16.2; Requirements BR-003).

**12.6 Governed Evolution.** New roles/permissions are governed decisions (PDL category GOV/SEC), not runtime invention (Roles doc §14).

**12.7 Rationale.** Explicit, auditable, least-privilege authorization is constitutional (Art. IV, VI).

---

### 23. SECURITY ARCHITECTURE

*(Presented here within Part C for coherence; numbering preserved per the required list.)*

**23.1 Security-First by Construction.** Security is a design input to every capability, not a later hardening step (Constitution Art. 5.9, VI). Every capability states its handling of authentication, authorization, secrets, and data protection (Requirements NFR-004).

**23.2 Defense in Depth.** Protection is layered across edge, application, domain, and infrastructure. No single control is relied upon alone.

**23.3 Data Protection & Privacy by Default.** Personal data is minimized, protected in transit and at rest, and retained only as justified (Art. 6.3). Minors receive the highest applicable protection (Art. 6.2); minor-sensitive matters fail closed absent an authoritative rule (Requirements BR-003).

**23.4 Secrets & Trust.** Secrets are managed through a dedicated mechanism (concrete product is a PTD), never embedded. Trust boundaries are explicit; inter-service trust is verified.

**23.5 Auditability & Accountability.** All security-relevant actions are audited (Section 20); no role, including Super Admin, has unaudited power (Roles doc §13.3).

**23.6 Data Residency & Sovereignty.** Enforced per jurisdiction where required (Section 6.4); obligations are PBD/legal.

**23.7 Threat Governance.** Threats are considered per capability; specific standards/controls to adopt are recorded as decisions (PDL category SEC). Compliance obligations are PBD/legal — never assumed (Art. 6.6).

**23.8 Rationale.** Security and the protection of minors are paramount constitutional concerns (Art. VI).

---

## PART D — CROSS-CUTTING INFRASTRUCTURE STRATEGIES

*Each strategy specifies required properties and patterns; the concrete product/technology is a Pending Technical Decision (PTD) to be recorded in the Project Decision Log, category TEC, per the Reader's Note.*

### 13. FILE STORAGE STRATEGY

**13.1 Abstraction.** File/object storage is accessed through a storage **port**; the concrete store is an adapter (PTD). Domains never depend on a specific storage technology.

**13.2 Required Properties.** Durable, scalable, secure (access-controlled and encrypted), region-aware for data residency (Section 6.4), and lifecycle-managed (retention/deletion — periods PBD/legal).

**13.3 Access Control & Privacy.** Stored files are subject to authorization (Section 12) and privacy rules, with heightened care for anything concerning minors (Art. VI).

**13.4 Rationale.** Content, submissions, and artifacts require durable, compliant, replaceable storage.

---

### 14. CACHING STRATEGY

**14.1 Purpose.** Improve performance and scalability (Constitution Art. 5.1, 5.10) without compromising correctness or security.

**14.2 Principles.** Cache is an optimization, never a source of truth; caches are invalidated deterministically; sensitive and minor-related data are cached only within privacy constraints; cross-jurisdiction caching respects residency (Section 6.4). Cache layers (edge, application, data) are used as appropriate.

**14.3 Consistency.** Cache staleness is bounded and explicit; correctness never depends on cache availability (fail through to source).

**14.4 PTD.** The concrete caching technology and topology are a Pending Technical Decision.

---

### 15. QUEUE STRATEGY

**15.1 Purpose.** Enable asynchronous, decoupled, resilient inter-boundary communication and workload leveling (Sections 3.3, 24).

**15.2 Principles.** Events are the default cross-boundary integration mechanism; processing is idempotent; delivery and ordering guarantees are explicit; failed messages are handled via retry and dead-letter with observability; long-running cross-boundary workflows are coordinated recoverably (saga-style).

**15.3 Eventing & Audit.** Significant domain events feed audit (Section 20) and analytics (Insight domains) without coupling producers to consumers.

**15.4 PTD.** The concrete message broker/streaming technology is a Pending Technical Decision.

---

### 16. NOTIFICATION ARCHITECTURE

**16.1 Purpose.** Deliver system-originated notifications across configurable channels (Notifications domain §16; Requirements FR-013).

**16.2 Principles.** Channel-agnostic behind a notification port; triggered by domain events (Section 15); localized (Section 7); preference- and consent-respecting; auditable. New channels are added as adapters/configuration.

**16.3 Boundaries.** Notifications (system-originated) are distinct from Messaging (person-to-person, §17). Contact/consent rules — especially regarding minors — are PBD/legal.

**16.4 PTD.** Concrete delivery providers per channel are Pending Technical Decisions.

---

### 17. PAYMENT ARCHITECTURE

**17.1 Purpose.** Govern money movement, balances, and recurring entitlements (Payments/Wallet/Subscription §18–20; Requirements FR-016).

**17.2 Provider Abstraction.** Payment processing is accessed through a payment **port**; processors are adapters (PTD). No domain logic depends on a specific processor. Multiple processors per jurisdiction are supported as adapters.

**17.3 Correctness & Integrity.** Monetary operations are consistent, reconcilable, idempotent, and resilient to failure/duplication (Requirements EC-005). Currency handling per Section 8. Financial state has one authoritative home.

**17.4 Configurable, Non-Hardcoded.** Currencies and payment methods are configuration (Art. X). Pricing, commission/fee/payout, tax, and refund **rules**, and per-jurisdiction financial-regulatory obligations, are PBD/legal.

**17.5 Security.** Payment data handling follows the strictest applicable security and compliance posture (Art. VI; obligations PBD/legal). Sensitive payment details are isolated behind adapters.

**17.6 Rationale.** Commerce must be correct, compliant, configurable, and provider-independent.

---

### 18. VIDEO SESSION ARCHITECTURE

**18.1 Purpose.** Support the delivery of live teaching sessions (Live Sessions domain §10; Requirements FR-007) at the business level, decoupled from any specific media technology.

**18.2 Provider Abstraction.** Real-time media is accessed through a session-media **port**; the concrete real-time communication technology/provider is an adapter (PTD). The *business* lifecycle of a session (start, conduct, attendance, completion, outcome) is owned by the domain and is independent of the media provider.

**18.3 Quality & Scale.** The media strategy must meet performance and reliability expectations across regions (Sections 24, 27) and degrade gracefully.

**18.4 Safety & Compliance.** Session conduct, recording, and attendance handling carry minor-protection implications; these **rules** are PBD/legal, and recording (if any) is subject to privacy and residency constraints (Sections 6.4, 23).

**18.5 Rationale.** Decoupling media technology preserves provider freedom (Art. VIII) while the business governs the session.

---

### 19. INTEGRATION ARCHITECTURE

**19.1 Purpose.** Connect the Platform to external systems (identity, payment, media, calendars, and future partners) without coupling the core to them.

**19.2 Ports & Adapters, API-First.** All external integrations are adapters behind ports; all Platform capabilities are exposed through explicit contracts (Section 28), making the Platform both integrable and integrating. No capability is reachable only via UI (Art. 5.7).

**19.3 Anti-Corruption.** External models are translated at the adapter boundary so external concepts never leak into the domain (protects Clean Architecture, Section 4).

**19.4 Governance.** Which integrations exist, and their data-sharing implications (privacy, residency, minors), are PBD; concrete external systems are PTD; each integration is a logged decision (PDL category TEC/ARC).

**19.5 Rationale.** Integrability is essential to an enterprise ecosystem and to expansion (Art. II).

---

## PART E — OBSERVABILITY & GOVERNANCE

### 20. AUDIT ARCHITECTURE

**20.1 Purpose.** Provide a trustworthy, append-only record of significant actions — who did what, when, under what authority (Audit Logs domain §28; Constitution Art. 6.5; Requirements FR-018, NFR-014).

**20.2 Principles.** Append-only and tamper-evident; fed by domain events (Section 15) from every domain; attributable to an actor and authority; covering security, privacy, financial, and governance actions; no unaudited power for any role including Super Admin (Roles doc §13.3).

**20.3 Independence.** Audit is distinct from operational logging (Section 21) and from analytics (Insight). Audit answers accountability; logging answers diagnosis.

**20.4 Deferred Specifics.** The catalog of auditable events and retention periods per jurisdiction are PBD/legal; the concrete audit store is a PTD.

**20.5 Rationale.** Accountability is an enterprise-grade constitutional requirement (Art. 5.16, 6.5).

---

### 21. LOGGING STRATEGY

**21.1 Purpose.** Enable diagnosis, debugging, and operational insight (supports maintainability and operability, Art. 5.3, XII).

**21.2 Principles.** Structured, correlated (trace/request correlation across boundaries), leveled, and centralized; privacy-preserving (no sensitive or minor data in logs beyond what is necessary and permitted); consistent across all modules.

**21.3 Separation.** Logging is operational and distinct from Audit (Section 20). Logs are not a substitute for audit and vice versa.

**21.4 PTD.** The concrete logging/aggregation stack is a Pending Technical Decision.

---

### 22. MONITORING STRATEGY

**22.1 Purpose.** Provide observability into health, performance, and behavior; detect and alert on problems before they become outages (Constitution Art. XII; Requirements NFR-013).

**22.2 Principles.** Metrics, tracing, and health signals across all boundaries; alerting on defined thresholds tied to service-level objectives (SLO targets PBD); dashboards for operational and business health; monitoring of security and abuse signals.

**22.3 Ties to SLOs.** Monitoring measures the performance and availability targets (Sections 26, 27); targets themselves are PBD (Open Questions Register).

**22.4 PTD.** The concrete observability platform is a Pending Technical Decision.

---

## PART F — RELIABILITY & PERFORMANCE

### 24. SCALABILITY STRATEGY

**24.1 Horizontal by Default.** The Platform scales horizontally; components are stateless where possible, with state externalized to appropriate stores (Constitution Art. 5.1; Requirements NFR-001).

**24.2 Independent Scaling.** Domain-aligned boundaries (Section 3) allow high-demand domains to scale independently. Asynchronous processing (Section 15) absorbs load and levels spikes.

**24.3 Data Scalability.** Data stores are chosen and partitioned to scale (partitioning by tenant/jurisdiction where appropriate, Section 6); concrete data technologies are PTDs.

**24.4 Growth Without Rework.** Scaling absorbs growth in users, countries, and load without structural redesign — a constitutional requirement (Art. 5.1, 2.3). Specific capacity/load targets are PBD.

---

### 25. DISASTER RECOVERY STRATEGY

**25.1 Purpose.** Ensure the Platform can recover from major failures with bounded data loss and downtime (Constitution Art. XII).

**25.2 Principles.** Regular, tested backups; geographically appropriate redundancy respecting data residency (Section 6.4); documented, rehearsed recovery procedures; recovery objectives (RPO/RTO) defined and verified.

**25.3 Deferred Specifics.** Concrete RPO/RTO **targets** are PBD (business risk tolerance); concrete backup/replication technologies and regions are PTDs.

**25.4 Verification.** DR is tested, not assumed (Art. XI). An untested DR plan is not a DR plan.

---

### 26. HIGH AVAILABILITY STRATEGY

**26.1 No Single Point of Failure.** The architecture eliminates single points of failure through redundancy at every critical tier (Constitution Art. XII; Requirements NFR-007).

**26.2 Resilience Patterns.** Health checking, automated failover, redundancy, graceful degradation (Requirements EC-002), and isolation of failures (bulkheads/circuit-breaking) prevent local failures from becoming systemic.

**26.3 Availability Targets.** Availability SLOs are defined and monitored (Section 22); the **target values** are PBD.

**26.4 Rationale.** Enterprise-grade reliability is constitutional (Art. 5.16, XII).

---

### 27. PERFORMANCE STRATEGY

**27.1 Performance-First.** Performance is a design input with per-capability targets, measured continuously (Constitution Art. 5.10; Requirements NFR-006).

**27.2 Techniques.** Efficient contracts, appropriate caching (Section 14), asynchronous processing (Section 15), and regionally proximate delivery for a multi-country audience (Section 6). Performance is verified, and degradation is treated as a defect (Art. 5.10).

**27.3 Targets.** Concrete per-capability performance targets/SLOs are PBD (Open Questions Register), measured via Monitoring (Section 22).

---

## PART G — INTERFACES & EVOLUTION

### 28. API ARCHITECTURE

**28.1 API-First (Constitutional).** Every capability is defined by an explicit contract before implementation; UIs, mobile, and integrations are consumers of these contracts; no capability is reachable only through a UI (Constitution Art. 5.7; Requirements NFR-011). *(This document defines the architecture of the API layer; it does not define specific endpoints or contracts, which are design artifacts out of scope.)*

**28.2 Contract Principles.** Contracts are explicit, consistent, role-aware (authorization enforced, Section 12), localized and jurisdiction-aware (Parts B), versioned (Section 29), and secure by default (Section 23). Contracts are the stable boundary between consumers and the system.

**28.3 Consistency & Discoverability.** A uniform contract style and conventions apply across all domains for coherence and maintainability (Art. 5.3). Public, SEO-relevant surfaces are architected for discoverability where intended (Art. 5.13).

**28.4 Edge Concerns.** The API/edge layer handles authentication entry, routing, traffic policy, and versioning, keeping such concerns out of the domain.

**28.5 Rationale.** API-first is a binding constitutional principle and the foundation of integrability and mobile-readiness (Art. 5.7, 5.12).

---

### 29. VERSIONING STRATEGY

**29.1 Scope of Versioning.** The architecture versions its **contracts** (external APIs), its **events** (inter-boundary messages), and its **governance documents** (already versioned). *(Data/schema versioning is an implementation concern out of scope here.)*

**29.2 Principles.** Backward compatibility is preserved wherever feasible; breaking changes require a new version and a managed deprecation lifecycle; consumers are never broken silently. This mirrors the disciplined, no-surprises change philosophy of the Constitution (Art. VIII) and the append-only/supersession discipline of the Project Decision Log.

**29.3 Deprecation.** Deprecations are explicit, communicated, and time-bounded; superseded versions are retired deliberately, not abandoned.

**29.4 Governance.** Versioning conventions and any breaking change are recorded as decisions (PDL category ARC/TEC).

**29.5 Rationale.** Predictable evolution protects consumers and enables long-term maintainability (Art. 5.3, VIII).

---

### 30. FUTURE EXPANSION STRATEGY

**30.1 Expansion Is Configuration, Not Rework.** New countries, languages, currencies, payment methods, and educational systems are onboarded through configuration (Parts B; Constitution Art. 2.3, 2.4, X; Requirements FE-001, FE-002).

**30.2 Extensibility Points.** The architecture's ports/adapters (Section 4.2) allow new providers (AI, payment, media, storage, notification, integration) to be added without touching business logic (Art. VII, VIII). New domains or modules are added within the established boundary and dependency rules (Sections 2–5).

**30.3 Multi-Tenancy / Institutional Growth.** Institutional and multi-tenant expansion (delegated administration, tenant-scoped roles) is anticipated and accommodated structurally (Roles doc §14; Requirements FE-003); its model is PBD.

**30.4 Deeper AI.** New AI capabilities are added behind the provider-independent abstraction without violating independence (Section 10; Requirements FE-004).

**30.5 Topology Evolution.** Deployment topology may evolve (e.g., extracting services) without breaking boundaries (Section 1.2); such changes are logged architectural decisions (PDL category ARC).

**30.6 Governance of Expansion.** Every expansion rests on authoritative business/legal inputs (PBD) and concrete technology choices (PTD), each recorded in the Project Decision Log. Expansion is deliberate and documented, never improvised (Art. XIV; PDL).

**30.7 Rationale.** Building for unlimited, low-friction expansion is a core constitutional promise (Art. II, 1.5).

---

## CONSOLIDATED DEFERRALS

**Pending Business / Legal Decisions (PBD)** — to be established by authoritative owners (Art. XIV) and recorded in the PDL: data-residency and compliance obligations per jurisdiction (§6.4, §23); localization fallback policy (§7.4); currency conversion/pricing/fee rules (§8); scheduling constraint rules (§9); AI usage/safety/data policies (§10.3); authentication method/session/consent rules (§11); financial rules — pricing, commission, payout, tax, refund (§17.4); session conduct/recording rules (§18.4); integration data-sharing rules (§19.4); auditable-event catalog and retention (§20.4); SLO/RPO/RTO/performance/availability **targets** (§22, §24–27); multi-tenant/institutional model (§30.3). Minor-sensitive items default to the most restrictive interpretation until resolved (Requirements BR-003).

**Pending Technical Decisions (PTD)** — technology selections to be recorded in the PDL (category TEC): deployment topology (§1.2); data store technologies and partitioning (§24.3); regional infrastructure for residency (§6.4); AI provider adapters and routing (§10.4); external identity providers (§11.2); caching technology (§14); message broker/streaming (§15); notification delivery providers (§16.4); payment processors (§17.2); real-time media provider (§18.2); external integration systems (§19.4); audit store (§20.4); logging stack (§21.4); observability platform (§22.4); backup/replication technology and regions (§25.3).

*No PTD or PBD is resolved in this document; each is called out so it can be decided deliberately and logged, in keeping with the Constitution's prohibition on assumptions and its requirement to document decisions.*

---

## CLOSING PROVISION

This System Architecture Master Document defines the Platform's architecture to the Constitution's standard of maximum quality: a modular, domain-aligned, API-first, cloud-native system governed by Clean Architecture, layered with an inward dependency rule, globalized by construction across country, language, currency, and time, intelligent through a provider-independent AI abstraction, secured and made accountable by design, and engineered for scalability, high availability, disaster recovery, and performance. It contains no implementation, no API contracts, and no database schema, and it invents neither business rule nor vendor choice — fixing the shape and constraints of the system while deferring every business rule as a Pending Business Decision and every technology selection as a Pending Technical Decision, each to be resolved by the appropriate authority and recorded in the Project Decision Log. The architecture is stable, principled, and built to expand without rework, exactly as the Constitution requires.

---

SYSTEM ARCHITECTURE VERSION 1.0 COMPLETED
