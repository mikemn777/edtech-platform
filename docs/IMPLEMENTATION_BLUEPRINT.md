# IMPLEMENTATION BLUEPRINT

### The Final Engineering Reference Before Development of the Education Ecosystem Platform

---

| Field | Value |
|---|---|
| **Document Title** | Implementation Blueprint |
| **Document Class** | Tier 1 — Governance Instrument (engineering standards) |
| **Version** | 1.0 |
| **Status** | Ratified — Active |
| **Owner** | Lead System Architect & Product Owner |
| **Date of Ratification** | 2 July 2026 |
| **Governing Authority** | Project Constitution v1.0 (Tier 0) |
| **Companion Instruments** | Decision Log, Product Vision, Business Domain Model, Roles & Permissions, Product Requirements, System Architecture, Database Master Architecture, Master Database Schema |
| **Constitutional Basis** | Articles V, VI, VII, VIII, X, XI, XII, XIV |

---

## READER'S NOTE ON SCOPE, SOURCING, AND DEFERRALS

This Blueprint is the **final documentation artifact before implementation.** It defines the engineering standards, conventions, and checklists that all development must follow. When development begins, this document — together with the governance stack above — is the reference against which every contribution is measured.

Per the task and Constitution Article VIII, it contains **no application code.** Illustrative *conventions* (folder trees, branch names, commit formats, checklists) are standards, not implementation, and are included to make the standards concrete.

Two deferral markers carry forward from the architecture documents:

- **Pending Technical Decision (PTD)** — a concrete technology selection (language, framework, CI system, secrets manager, test tooling). This Blueprint states the **required properties and rules** a technology must satisfy and defers the *specific product* to a logged decision (Project Decision Log, category TEC). Choosing tooling is a governed decision, not an assumption (Art. IX, 8.7).
- **Pending Business Decision (PBD)** — a business/legal rule; never invented here (Art. IX, XIV).

This Blueprint is deliberately **technology-neutral where selection is a PTD** and **prescriptive where the Constitution already binds** (security-first, accessibility, clean architecture, verification, no debt). Where an example names a convention (e.g., a branch prefix), the *convention* is the standard; any concrete tool that implements it is a PTD.

---

## 1. API DESIGN STANDARDS

**1.1 API-First (Constitutional).** Every capability is defined by an explicit contract before implementation; UIs, mobile, and integrations consume contracts; no capability is reachable only via a UI (Constitution Art. 5.7; Requirements NFR-011; System Architecture §28). *(This section defines standards for contracts; it does not define specific endpoints — those are design artifacts produced per module.)*

**1.2 Contract Principles.** Contracts are: explicit and documented before build; consistent in style across all modules; role-aware (authorization enforced per action, Roles doc); localized and jurisdiction-aware (Parts B of System Architecture); versioned (Section on versioning below and System Architecture §29); secure and deny-by-default; and stable as the boundary between consumers and the system.

**1.3 Consistency Rules.** A single, uniform API style is adopted platform-wide (resource modeling, request/response shape, pagination, filtering, sorting, error envelope). The concrete API paradigm (e.g., REST, GraphQL, or a combination) is a **PTD** (category TEC); whichever is chosen, these consistency rules bind.

**1.4 Idempotency & Safety.** Mutating operations that can be retried are idempotent (supports resilience, Requirements EC-002/EC-005). Read operations are side-effect-free.

**1.5 Error Semantics.** Errors follow a uniform, documented envelope with stable, machine-readable codes and localized, privacy-respecting messages (Section 13). Never leak sensitive or minor-related detail in errors.

**1.6 Versioning of Contracts.** Contracts are versioned; breaking changes require a new version and a managed deprecation lifecycle; consumers are never broken silently (System Architecture §29).

**1.7 Documentation.** Every contract is documented and kept in sync with reality; an undocumented contract is incomplete (Art. 8.7).

---

## 2. UI/UX DESIGN STANDARDS

*(Standards only; no UI is generated. These govern how experiences must be built.)*

**2.1 Accessibility-First.** Every user-facing surface must be usable by people with disabilities (Constitution Art. 5.14). The specific conformance standard/level is a **PBD** (Open Questions Register); until set, teams build to the strictest reasonable interpretation. See Section 18 (Accessibility Checklist).

**2.2 Internationalization & RTL.** All surfaces support unlimited languages and both RTL and LTR as first-class (Art. III). No user-facing string is hardcoded; all text flows through localization (Database Schema: TranslationKey/Value). Layouts are direction-agnostic.

**2.3 Role-Appropriate Experiences.** Each role (student, parent, tutor, admin, support) receives an experience fit for its responsibilities and permissions (Roles doc). Minor-facing experiences follow heightened safety/privacy standards (Art. VI).

**2.4 Mobile-Ready & Responsive.** Experiences are first-class on mobile, consuming the same contracts (Art. 5.12; NFR-012).

**2.5 Consistency & Design System.** A single design system (tokens, components, patterns) ensures visual and interaction consistency. Its concrete tooling/library is a **PTD**; the requirement for one is firm.

**2.6 Performance-Perceived.** UX is designed for perceived performance (loading states, graceful degradation, EC-002/EC-006). Degradation is never a broken experience.

**2.7 Clarity & Trust.** Interfaces are clear, honest, and privacy-respecting; consent and safety touchpoints (especially for minors and payments) are explicit and understandable.

---

## 3. FRONTEND ARCHITECTURE RULES

**3.1 Clean Separation.** Frontend consumes contracts only (Section 1); it holds no business rules that belong in the domain (Constitution Art. 8.6). Presentation logic and domain logic are distinct.

**3.2 Modularity.** Frontend is organized by feature/domain boundaries mirroring the Business Domain Model, with shared, reusable components in a controlled shared layer (Art. 5.2).

**3.3 State Discipline.** Application state is managed deliberately and predictably; server state and client state are distinguished; no ad hoc global mutable state. Concrete state-management tooling is a **PTD**.

**3.4 No Hardcoding.** No hardcoded countries, currencies, languages, or endpoints; all come from configuration and contracts (Art. IX, X).

**3.5 Localization & Accessibility Built-In.** Every component is localizable, direction-aware, and accessible by construction (Sections 2, 18).

**3.6 Security.** No secrets in the frontend; no trust of client input; authorization is always enforced server-side (client checks are UX only) (Art. VI; Roles doc §16).

**3.7 Testability.** Components and flows are testable in isolation (Section 14). Frameworks/libraries are **PTDs** chosen to satisfy these rules.

---

## 4. BACKEND ARCHITECTURE RULES

**4.1 Clean Architecture & Ports/Adapters.** Backend follows the dependency rule inward; domain logic is pure of frameworks, databases, and providers; all external capabilities are ports with adapters (System Architecture §4). This is the structural guarantee of AI/provider independence (Art. VII).

**4.2 Domain-Aligned Modules.** Backend modules map to domains/boundaries (Business Domain Model; System Architecture §2–3). Each owns its data (Database Master Architecture §2); no shared mutable store across boundaries.

**4.3 Explicit Contracts & Events.** Cross-boundary interaction is via contracts or events; eventual consistency with compensation across boundaries (System Architecture §3.3, §15).

**4.4 Authorization Everywhere.** Every action enforces explicit, least-privilege, deny-by-default authorization; fails closed (Roles doc §15–16; Requirements EC-001).

**4.5 No Business Rule Invention.** Where a business/legal rule is unestablished (PBD), the code path is gated (deny/most-restrictive for minors) until an authoritative rule exists (Art. IX; Requirements BR-003). Rules are never hardcoded guesses.

**4.6 Configuration-Driven.** Country/currency/language/school-system/payment-method behavior is resolved from configuration (Art. X; Schema configuration entities).

**4.7 Statelessness & Scalability.** Services are stateless where possible; state is externalized; designed for horizontal scale (System Architecture §24).

**4.8 Observability & Auditability by Construction.** Every module emits structured logs (Section 12), metrics (Section 22 monitoring), and audit events for significant actions (Art. 6.5). Language/framework/runtime are **PTDs** chosen to satisfy these rules.

---

## 5. FOLDER STRUCTURE STANDARDS

**5.1 Principle.** Structure follows **domain and clean-architecture boundaries**, not technical type. A reader should locate a capability by its domain (Art. 5.3 maintainability).

**5.2 Illustrative Backend Structure (convention, technology-neutral).**

```
/backend
  /modules
    /<domain>                 (e.g., booking, payments, tutor-verification)
      /domain                 business logic (pure; no framework)
      /application            use cases, authorization orchestration
      /adapters               persistence, providers, messaging (infra)
      /contracts              the module's API/event contracts (definitions)
      /tests                  unit + integration for this module
  /shared                     minimal shared kernel (identity, locale, permission, audit primitives)
  /platform                   cross-cutting: config, logging, monitoring, security
  /migrations                 governed schema/config migrations (no ad hoc changes)
```

**5.3 Illustrative Frontend Structure (convention).**

```
/frontend
  /features/<domain>          feature-aligned modules
  /components                 shared, accessible, localizable components (design system)
  /localization              translation resources (keys/values; unlimited languages)
  /config                     runtime configuration consumption (no hardcoding)
  /tests                      component + flow tests
```

**5.4 Rules.** Boundaries in folders mirror service boundaries (§3–4); shared layers are deliberately minimal (avoid coupling); tests live with the code they cover; migrations are governed. The concrete language/framework may adjust idioms, but the **domain-first, clean-architecture organization is binding.**

---

## 6. NAMING CONVENTIONS

**6.1 Principle.** Names are consistent, explicit, unambiguous, and drawn from the domain's ubiquitous language (Business Domain Model; Database Master Architecture §3). No obscure abbreviations.

**6.2 Uniform Conventions (applied platform-wide).**

- **Domain concepts** use the exact vocabulary of the Domain Model and Schema (e.g., `Booking`, `LearningPlan`, `AuditRecord`).
- **Casing** is consistent per artifact type and defined once in the adopted style guide (a **PTD** detail per language, but *a single convention per language is mandatory*).
- **Files/folders** are named for their domain/feature and responsibility.
- **Contracts** name resources and operations consistently (Section 1).
- **Configuration keys, permission keys, event names, metric keys** each follow a single documented pattern.
- **Booleans** read as assertions; **timestamps** carry an explicit `_at` and are UTC (Schema convention); **identifiers** end in `_id`.

**6.3 No Hardcoded Semantics in Names.** Structural names are language-neutral; user-facing values are localized (Art. III; Schema §11).

**6.4 Governance.** The concrete style guide per language is ratified as a decision (PDL category TEC) and applied without exception; deviations are defects.

---

## 7. CODING STANDARDS

**7.1 Constitutional Development Philosophy (binding).** No shortcuts; no temporary hacks; no technical debt; no duplicated logic; no unnecessary complexity; clean architecture always; decisions documented (Constitution Art. VIII). These are enforced, not aspirational.

**7.2 Readability & Maintainability.** Code is written to be understood by a competent engineer who did not write it (Art. 5.3). Clarity beats cleverness.

**7.3 Single Responsibility & DRY.** Each unit has one responsibility; each rule has one authoritative home (Art. 8.4). Duplication is a defect.

**7.4 Explicitness.** No hidden side effects; no implicit authorization; no hardcoded jurisdictional facts (Art. IX, X). Dependencies are explicit (clean architecture).

**7.5 Automated Enforcement.** Formatting and linting are automated and required in the pipeline (Section 15); style is not debated in review. Concrete linter/formatter are **PTDs**; their *presence and enforcement* are mandatory.

**7.6 Documentation of Intent.** Non-obvious decisions are documented in-context and, when significant, in the Decision Log (Art. 8.7). Public contracts are documented (Section 1.7).

**7.7 Security & Privacy by Construction.** Input is validated (Requirements VR-001); output is safe; secrets are never in code (Section 11); sensitive/minor data handled per classification (Schema; Art. VI).

**7.8 Verification Built-In.** Code is accompanied by tests proportionate to risk (Section 14); untested code is incomplete (Art. XI).

---

## 8. GIT BRANCHING STRATEGY

**8.1 Principle.** A simple, disciplined, trunk-oriented branching model that supports continuous integration, clean history, and safe releases (supports Art. VIII, XII). The concrete hosting platform is a **PTD**; the strategy is binding.

**8.2 Branch Types (convention).**

- `main` — always releasable, protected; no direct commits.
- `develop` (optional, if a staged flow is adopted) — integration branch.
- `feature/<domain>-<short-description>` — short-lived feature work.
- `fix/<domain>-<short-description>` — bug fixes.
- `hotfix/<short-description>` — urgent production fixes.
- `chore/<short-description>` — non-feature maintenance.

**8.3 Rules.** Branches are short-lived and small; work is merged via reviewed pull/merge requests only; protected branches require passing checks (Section 15) and review; no force-push to protected branches; history is kept clean (linear or curated per the ratified convention).

**8.4 Traceability.** Branches and PRs reference the requirement/decision they implement (Requirements IDs, PDL IDs), preserving traceability to governance.

**8.5 Review Discipline.** Every change is reviewed against this Blueprint and the governance stack; a reviewer confirms Definition of Done (Section 21) is on track. The exact branch model variant is ratified as a decision (PDL category TEC/GOV).

---

## 9. COMMIT MESSAGE STANDARDS

**9.1 Principle.** Commit messages are clear, consistent, and meaningful, forming an honest history (Art. VIII). A structured convention (e.g., Conventional Commits style) is adopted.

**9.2 Format (convention).**

```
<type>(<scope>): <concise summary>

<body: what and why, not how; reference requirement/decision IDs>

<footer: breaking changes, links to PDL/Requirements IDs>
```

- **type** — e.g., `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `security`.
- **scope** — the domain/module (e.g., `booking`, `payments`).
- **summary** — imperative, concise.

**9.3 Rules.** Reference the governing requirement/decision where applicable; mark breaking changes explicitly (ties to versioning, System Architecture §29); no noise commits on protected history; commits are atomic and coherent.

**9.4 Governance.** The concrete commit convention and any automation (commit linting) are ratified as a decision (PDL category TEC).

---

## 10. ENVIRONMENT CONFIGURATION STRATEGY

**10.1 Principle.** Configuration is externalized from code and varies by environment; nothing environment-specific is hardcoded (Constitution Art. X; System Architecture §13 cloud-ready).

**10.2 Environments (convention).** At minimum: local/development, testing/CI, staging (production-like), production. Additional environments as needed. Each is isolated; production data is never used in lower environments except via approved, privacy-safe processes (Art. VI).

**10.3 Rules.** Configuration is validated at startup (fail fast on invalid/missing config); configuration is versioned and governed (Schema: ConfigurationVersion); parity between staging and production is maximized; region/jurisdiction configuration honors residency (System Architecture §6.4).

**10.4 Separation from Secrets.** Non-secret configuration and secrets are handled by distinct mechanisms (Section 11). Concrete configuration tooling is a **PTD**.

---

## 11. SECRETS MANAGEMENT

**11.1 Principle.** Secrets are never in code, repositories, logs, or client-side artifacts (Constitution Art. VI; Coding Standards §7.7). Secrets are managed by a dedicated, access-controlled mechanism.

**11.2 Rules.** Secrets are: stored in a dedicated secrets manager (concrete product is a **PTD**, category TEC/SEC); access-controlled by least privilege (Roles doc §15); rotated per policy; never logged or echoed; injected at runtime, not baked into artifacts; audited on access where sensitive (Art. 6.5).

**11.3 Encryption & Keys.** Encryption keys are themselves managed and rotated through the key-management mechanism (Database Master Architecture §21); keys are never stored with the data they protect.

**11.4 Incident Posture.** Suspected secret exposure triggers immediate rotation and a governed incident response (Section 22). Rotation/retention policies are ratified decisions (PDL category SEC).

---

## 12. LOGGING STANDARDS

**12.1 Principle.** Logging enables diagnosis and operability, distinct from Audit (System Architecture §20–21). Logs answer "what happened for debugging"; Audit answers "who did what, accountably."

**12.2 Rules.** Logs are **structured** (machine-parseable), **correlated** (trace/request IDs across boundaries), **leveled** (error/warn/info/debug used consistently), and **centralized** (aggregated). Log volume and levels are configurable per environment (Section 10).

**12.3 Privacy.** No secrets, credentials, tokens, or minor-related/personal data beyond what is necessary and permitted appear in logs (Art. VI; Coding §7.7). Sensitive fields are redacted by construction.

**12.4 Consistency.** All modules use the shared logging mechanism (platform layer, §5.2); ad hoc logging is prohibited. The concrete logging stack is a **PTD** (category TEC).

**12.5 Actionability.** Errors logged carry enough context to diagnose without reproducing; correlation ties logs to requests, metrics, and audit where appropriate.

---

## 13. ERROR HANDLING STANDARDS

**13.1 Principle.** Errors are handled deliberately, safely, and consistently; the system fails closed and never leaks sensitive detail (Constitution Art. 5.9; Requirements EC-001).

**13.2 Rules.**
- **Uniform error model** across all contracts (stable codes, localized safe messages) (Section 1.5).
- **Fail closed** on authorization/ambiguity (EC-001); **fail safe** on component failure with graceful degradation (EC-002).
- **No silent failures**: errors are surfaced, logged (Section 12), and where significant, audited.
- **No sensitive leakage**: internal detail, stack traces, secrets, or minor data are never returned to clients.
- **Idempotency & recovery**: retryable operations are safe to retry; financial and cross-boundary operations reconcile/compensate on failure (EC-005; System Architecture §3.3).
- **Validation errors** are clear and localized (Requirements VR-001).

**13.3 Minor-Sensitive Defaults.** In ambiguity involving minors, resolve to the most protective outcome (Requirements BR-003; EC-007).

---

## 14. TESTING STRATEGY

**14.1 Principle (Constitutional).** Verification is first-class; untested work is incomplete (Constitution Art. XI). Claims of correctness must be substantiated.

**14.2 Test Layers.**
- **Unit tests** — domain logic in isolation (pure domain enables this; §4.1).
- **Integration tests** — module + its adapters (persistence, providers) at boundaries.
- **Contract tests** — verify API/event contracts and consumer expectations (Section 1).
- **End-to-end tests** — critical user journeys (Requirements UJ-001…UJ-006).
- **Non-functional tests** — performance (Section 16), security (Section 17), accessibility (Section 18), localization/RTL, resilience/failover (System Architecture §26).

**14.3 Rules.** Tests accompany code (same PR); critical and high-risk paths (auth, authorization, payments, minor-safety) require the strongest coverage; minor-sensitive and financial logic are tested for fail-closed behavior; tests are deterministic and run in CI (Section 15). Coverage targets and concrete test tooling are ratified decisions (PDL category TEC); the *requirement to test proportionate to risk* is binding.

**14.4 High-Stakes Verification.** For high-risk areas, independent verification (review and/or dedicated test passes) is applied (Constitution verification guidance).

---

## 15. CI/CD READINESS

**15.1 Principle.** Build, test, and deployment are automated, safe, repeatable, and free of manual error-prone steps (Constitution Art. XII; System Architecture §13).

**15.2 Pipeline Gates (required before merge to protected branches).**
- Formatting & linting pass (Section 7.5).
- All tests pass (Section 14).
- Security checks pass (Section 17): dependency/vulnerability scanning, secret scanning.
- Accessibility checks where automatable (Section 18).
- Build succeeds; artifacts are reproducible.
- Contract/versioning checks (no undocumented breaking change) (System Architecture §29).

**15.3 Deployment Rules.** Deploy/rollback are automated and safe (System Architecture §13); migrations run through the governed process (Database Master Architecture §23); environments follow Section 10; production deploys are observable (Section 22) and reversible.

**15.4 PTD.** The concrete CI/CD platform and tooling are Pending Technical Decisions (category TEC); the gates and discipline above are binding regardless of tool.

---

## 16. PERFORMANCE RULES

**16.1 Performance-First (Constitutional).** Performance is a design input with per-capability targets, measured continuously (Art. 5.10; Requirements NFR-006). Degradation is a defect.

**16.2 Rules.** Efficient contracts and payloads; appropriate caching (cache never source of truth; System Architecture §14); asynchronous processing for heavy/leveling workloads (§15); efficient data access honoring indexing/partitioning (Database Master Architecture §14–15); regional proximity for a multi-country audience (§6); no N+1 or unbounded queries; pagination on all list operations.

**16.3 Measurement.** Performance is verified against targets via monitoring (Section 22); regressions are caught in CI where feasible (Section 15). Concrete target values (SLOs) are **PBD** (Open Questions Register).

---

## 17. SECURITY CHECKLIST

*(Every capability must satisfy the applicable items; security is a design input, Art. 5.9, VI.)*

- [ ] Authentication enforced where required; identity trustworthy (System Architecture §11).
- [ ] Authorization enforced server-side on every action; explicit, least-privilege, deny-by-default; fails closed (Roles doc §15–16; EC-001).
- [ ] Input validated; output encoded/safe; injection classes prevented (Requirements VR-001).
- [ ] Secrets managed via secrets manager; none in code/logs/artifacts (Section 11).
- [ ] Data encrypted in transit and at rest; sensitive fields extra-protected (Database Master Architecture §21).
- [ ] Personal/minor/financial data classified and handled per classification; privacy by default (Art. VI; Schema).
- [ ] Minor-sensitive actions default to most-restrictive absent authoritative rule (BR-003).
- [ ] Auditing of security-relevant and significant actions; no unaudited power (Art. 6.5; Roles §13.3).
- [ ] Data residency honored where required (System Architecture §6.4) — obligations PBD/legal.
- [ ] Dependency & secret scanning in CI (Section 15); vulnerabilities triaged.
- [ ] Rate limiting/abuse protection at the edge (System Architecture §28.4).
- [ ] Separation of duties for high-risk actions (Finance, Super Admin) (Roles §16.5).
- [ ] No compliance/legal requirement assumed; obligations sourced authoritatively (Art. 6.6).

---

## 18. ACCESSIBILITY CHECKLIST

*(Every user-facing surface; Art. 5.14. Specific standard/level is PBD — build to strictest reasonable interpretation until set.)*

- [ ] Perceivable: text alternatives for non-text; sufficient color contrast; content adaptable and distinguishable.
- [ ] Operable: full keyboard operability; no keyboard traps; adequate timing; no seizure-inducing content; clear navigation.
- [ ] Understandable: readable, predictable; input assistance and clear error identification (Section 13).
- [ ] Robust: works with assistive technologies; semantic, standards-based markup.
- [ ] Internationalization: full RTL and LTR support; localized content and accessible localized components (Art. III; Section 2.2).
- [ ] Minor-appropriate: age-appropriate, safe, and clear experiences for minors (Art. VI).
- [ ] Verified: accessibility tested (automated + manual) as part of Definition of Done (Sections 14, 21).

---

## 19. SEO RULES

*(For public, discoverable surfaces where discoverability is intended; Art. 5.13.)*

- [ ] Public surfaces are architected for discoverability (System Architecture §28.3); server-render or equivalent strategy for indexable content (concrete approach a PTD).
- [ ] Semantic, standards-based markup; meaningful metadata and structured data where appropriate.
- [ ] Multi-language SEO: correct language/locale signaling; RTL/LTR handled; localized content properly represented (Art. III).
- [ ] Performance supports SEO (Section 16); accessible content supports SEO (Section 18).
- [ ] No cloaking, no deceptive practices; honest, high-quality content (Constitution integrity).
- [ ] Per-jurisdiction public-content rules honored where applicable (PBD/legal).

---

## 20. MODULE IMPLEMENTATION ORDER

**20.1 Principle.** Build in dependency order, foundations first, so each module rests on stable, verified ground (Constitution Art. VIII; Business Domain Model dependency structure). No module is built ahead of its dependencies.

**20.2 Recommended Sequence (dependency-driven; not a schedule).**

1. **Foundational platform & configuration** — configuration, localization, countries/jurisdictions/currencies, settings, logging, monitoring scaffolding, audit backbone (everything else depends on these; Art. II, III, X; §5.2 platform).
2. **Identity & authorization** — Authentication, User Management, RBAC (every capability depends on identity and authorization; Roles doc).
3. **Actor profiles** — Student, Parent, Tutor, and relationships (guardianship), then Tutor Verification (gates the marketplace).
4. **Engagement core** — Scheduling, Calendar, Booking, then Live Sessions (the marketplace transaction chain).
5. **Learning core** — Programs, Learning Plans, Assessments, Homework, plus CMS content they depend on.
6. **Commerce** — Payments, Wallet, Subscription (as commercial rules — PBD — are established).
7. **Communication** — Notifications, Messaging (with minor-safety rules — PBD).
8. **Intelligence** — AI Services integrated behind the provider-independent abstraction across the above.
9. **Insight** — Reports, Analytics (once source domains produce data).
10. **Operations & care** — Administration, Support (governing and supporting the live system); Audit is present from step 1 and enriched throughout.

**20.3 Rule on PBDs.** A module whose behavior depends on an unresolved PBD is built to the point of the gated rule and no further; the rule-specific behavior is completed only after the PBD is authoritatively decided and logged (Art. IX, XIV). Minor-sensitive gaps default to most-restrictive (BR-003).

**20.4 Governance.** The concrete delivery plan/sequence is ratified as a decision (PDL category ARC/PRD), respecting this dependency order.

---

## 21. DEFINITION OF DONE

A unit of work is **Done** only when ALL of the following hold (Constitution Art. VIII, XI):

- [ ] Meets its requirement(s) and acceptance criteria (Product Requirements), with rule-dependent behavior either implemented against an authoritatively logged decision or correctly gated as PBD.
- [ ] Complies with the Constitution and every governing document; any conflict was surfaced and resolved via the Conflict Protocol (Art. XVII), not ignored.
- [ ] Clean architecture and coding standards satisfied (Sections 4, 7); no shortcuts, hacks, debt, or duplication (Art. VIII).
- [ ] Authorization enforced, deny-by-default, fails closed (Sections 4.4, 17).
- [ ] Security checklist satisfied (Section 17); secrets handled correctly (Section 11).
- [ ] Accessibility checklist satisfied (Section 18); localization/RTL verified (Section 2.2).
- [ ] Tests written and passing at appropriate layers; high-risk/minor/financial paths verified fail-closed (Section 14).
- [ ] Performance targets met or, where targets are PBD, measured and within reasonable bounds (Section 16).
- [ ] Structured logging and audit emitted appropriately (Sections 12; Art. 6.5); no sensitive leakage.
- [ ] Contracts documented and versioned; no undocumented breaking change (Sections 1, 9; System Architecture §29).
- [ ] CI gates green (Section 15); reviewed and approved; traceable to requirement/decision IDs.
- [ ] Significant decisions recorded in the Project Decision Log (Art. 8.7).

---

## 22. PRODUCTION READINESS CHECKLIST

*(Applied before a capability/release goes to production; enterprise-grade, Art. 5.16, XII.)*

- [ ] **Functionality** — requirements met; PBD-gated paths correctly deferred; journeys verified (Section 14).
- [ ] **Security** — full security checklist passed (Section 17); penetration/vulnerability posture acceptable; secrets and encryption verified.
- [ ] **Privacy & minors** — data classification, privacy-by-default, and minor protections verified (Art. VI); residency honored where required (PBD/legal).
- [ ] **Reliability & HA** — no single point of failure; failover and graceful degradation verified (System Architecture §26; EC-002).
- [ ] **Disaster recovery** — backups and restore tested; RPO/RTO met (targets PBD) (Database Master Architecture §17–18; System Architecture §25).
- [ ] **Performance & scale** — targets met (or measured where PBD); horizontal scaling verified (Section 16; System Architecture §24).
- [ ] **Observability** — logging, metrics, tracing, health checks, and alerting in place (Section 12; System Architecture §22).
- [ ] **Auditability** — significant actions audited; no unaudited power (Art. 6.5; Roles §13.3).
- [ ] **Accessibility** — checklist passed and verified (Section 18).
- [ ] **Localization** — required languages and RTL/LTR verified; fallback behaves (Art. III; EC-006).
- [ ] **Configuration** — externalized, validated, versioned; environment parity; no hardcoding (Sections 10; Art. X).
- [ ] **CI/CD & rollback** — automated deploy and safe rollback verified; migrations governed (Sections 15; Database Master Architecture §23).
- [ ] **Operational runbooks** — incident response, on-call, and support processes defined (Support domain; Section 22 posture).
- [ ] **Governance** — decisions logged; conflicts resolved; documentation current; traceability intact.
- [ ] **Sign-off** — Definition of Done met for all included work (Section 21); production go/no-go recorded as a decision (PDL).

---

## CONSOLIDATED DEFERRALS

**Pending Technical Decisions (PTD)** — to be recorded in the Project Decision Log (category TEC): programming language(s), frameworks, and runtimes (frontend/backend); API paradigm (REST/GraphQL/hybrid); state-management and design-system tooling; linter/formatter and style guides per language; git hosting platform and branch-model variant; commit-lint/automation; configuration and secrets-management products; logging stack; test tooling and coverage targets; CI/CD platform; SEO rendering approach; observability platform. Each satisfies the required properties and rules stated above.

**Pending Business / Legal Decisions (PBD)** — carried from prior documents and referenced here (never invented): accessibility standard/level (Section 2.1, 18); performance/SLO/RPO/RTO targets (Sections 16, 22); all domain business/legal rules gating module completion (Section 20.3); per-jurisdiction obligations (security/residency/SEO). Minor-sensitive items default to most-restrictive until resolved (BR-003).

*No PTD or PBD is resolved here; each is surfaced so it can be decided deliberately and logged, per the Constitution's prohibition on assumptions and requirement to document decisions.*

---

## CLOSING PROVISION

This Implementation Blueprint is the final engineering reference before development begins: the standards for APIs, experiences, frontend and backend architecture, structure and naming, coding, source control, configuration and secrets, logging and error handling, testing, CI/CD, performance, security, accessibility, and SEO, together with the module implementation order, the Definition of Done, and the Production Readiness Checklist. It contains no application code, and it invents neither business rule nor technology choice — prescribing firmly where the Constitution binds and deferring every technology selection as a Pending Technical Decision and every business rule as a Pending Business Decision, each to be resolved by the appropriate authority and recorded in the Project Decision Log. With the governance and architecture stack complete and this Blueprint ratified, development may begin — disciplined, verifiable, and fully accountable to the Constitution.

---

IMPLEMENTATION BLUEPRINT VERSION 1.0 COMPLETED
