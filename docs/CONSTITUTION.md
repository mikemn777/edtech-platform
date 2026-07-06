# PROJECT CONSTITUTION

### The Supreme Governing Document of the Education Ecosystem Platform

---

| Field | Value |
|---|---|
| **Document Title** | Project Constitution |
| **Document Class** | Supreme Governance Authority (Tier 0) |
| **Version** | 1.0 |
| **Status** | Ratified — Active |
| **Owner** | Lead System Architect & Product Owner |
| **Date of Ratification** | 2 July 2026 |
| **Review Cadence** | On amendment only (see Article XV) |
| **Supersedes** | None (foundational document) |

---

## PREAMBLE

This document is the Constitution of the Education Ecosystem Platform (hereafter, "the Platform"). It is the single highest source of authority governing every decision — architectural, product, technical, operational, and organizational — made in the service of building and operating the Platform.

The Constitution does not describe an implementation. It defines the **principles, constraints, and governance** under which every implementation must be conceived, designed, reviewed, and accepted. No code, schema, interface, configuration, policy, or business rule may come into existence that contradicts this document.

The role of Lead System Architect and Product Owner is hereby accepted as a **permanent, standing responsibility** for the duration of the project. In this role, the standing duty is to protect the integrity of the Platform against scope drift, hidden assumptions, technical debt, and short-term expediency — in every future conversation, without exception.

Where a future instruction, request, or proposal conflicts with this Constitution, that conflict **must be named explicitly and surfaced before any work proceeds.** Compliance with the Constitution is not optional and is not overridden by convenience, deadline pressure, or informal agreement.

---

## ARTICLE 0 — NATURE AND SUPREMACY OF THIS DOCUMENT

**0.1** This Constitution is the supreme authority. In any hierarchy of documents, decisions, or instructions, it ranks above all else.

**0.2** The order of authority is:

1. This Constitution (Tier 0).
2. Ratified Amendments to this Constitution (Tier 0, same force).
3. Domain Charters and Architecture Decision Records that are consistent with this Constitution (Tier 1).
4. Specifications, designs, and implementation plans (Tier 2).
5. Code, configuration, and operational artifacts (Tier 3).

**0.3** A lower-tier artifact that contradicts a higher tier is void to the extent of the contradiction. The contradiction must be reported, not silently resolved.

**0.4** This document contains no business rules, no legal determinations, no country-specific policy, and no invented facts. It defines *how such things must be established and governed* — never what they are. Any place where such information is required but not yet known is recorded in the **Open Questions Register (Article XVI)** rather than assumed.

---

## ARTICLE I — IDENTITY AND MISSION

**1.1 What the Platform Is.** The Platform is a production-grade, enterprise Education Ecosystem. It is not a minimum viable product, not a prototype, and not a tutoring website. It is a long-lived, multi-country system intended to operate at scale from its first day in production.

**1.2 Composition.** The Platform unifies, as a single coherent ecosystem, the following capability domains:

- A private tutoring marketplace.
- A Learning Management System (LMS).
- An AI learning assistant.
- A parent portal.
- A tutor portal.
- A student portal.
- An enterprise administration dashboard.

**1.3 Mission.** To build the best tutoring and learning platform in the Middle East — measured by educational outcomes, trust, reliability, and reach — as an original system, not a derivative of any existing product.

**1.4 Posture Toward Competitors.** Competitors may be studied for understanding. They are never copied. No design, flow, data model, or business rule enters the Platform because "a competitor does it." Every decision must be justified on its own merits under this Constitution.

**1.5 Longevity.** Every decision is made as if the Platform will operate for decades and expand indefinitely. Decisions optimized only for the present, at the expense of the future, are prohibited.

---

## ARTICLE II — GEOGRAPHIC AND MARKET SCOPE

**2.1 Launch Markets.** The initial launch countries are **Türkiye** and **Lebanon**.

**2.2 Planned Expansion.** Anticipated expansion markets include **Saudi Arabia, Libya, Syria, the GCC region, and the wider MENA region.**

**2.3 Unbounded Expansion.** The Platform must support an **unlimited and unknown** number of future countries and jurisdictions. No country is privileged in the architecture. Adding a new country must be a **configuration and onboarding activity**, never a re-engineering activity.

**2.4 No Hardcoded Geography.** Countries, regions, jurisdictions, and their associated attributes (legal, fiscal, linguistic, educational, cultural) must never be hardcoded into logic. They are data and configuration.

**2.5 Per-Jurisdiction Variation.** The architecture must assume that any rule may differ by jurisdiction — including but not limited to legal requirements, taxation, currency, payment methods, educational structures, data-residency obligations, age thresholds, and consent models. The mechanism for expressing such variation must exist; the *content* of each variation is established through governance (Article XVI), never assumed.

---

## ARTICLE III — LANGUAGE AND LOCALIZATION

**3.1 Initial Languages.** The Platform must support **Arabic, English, and Turkish** at launch.

**3.2 Unlimited Languages.** The Platform must support an unlimited number of future languages without structural change. Languages are data, never hardcoded.

**3.3 Bidirectionality.** The system must treat both right-to-left (RTL) and left-to-right (LTR) presentation as first-class. RTL is not an afterthought or a retrofit; it is a foundational requirement given Arabic is a launch language.

**3.4 Separation of Content and Presentation.** All user-facing text must be externalized from logic and presentation such that translation, adaptation, and locale formatting (dates, numbers, currencies, names, addresses) are configuration-driven.

**3.5 Locale ≠ Language ≠ Country.** The architecture must distinguish between language, locale, country, and jurisdiction as independent concepts that combine, rather than conflating them.

---

## ARTICLE IV — THE ROLE-BASED PRINCIPLE

**4.1** The Platform is inherently multi-actor. Access, capability, visibility, and experience are governed by role.

**4.2** Known primary actor domains include: students, parents/guardians, tutors, and enterprise administrators. This enumeration is descriptive, not exhaustive; the role model must accommodate additional roles, sub-roles, and delegated permissions without redesign.

**4.3** Authorization must be explicit, centrally reasoned about, and auditable. No capability may be granted implicitly or by omission.

**4.4** The relationships between actors (for example, guardianship, enrollment, or engagement between a parent, a student, and a tutor) are core domain concepts and must be modeled deliberately — but the *rules* governing those relationships are business rules subject to Article XIV and are not assumed here.

---

## ARTICLE V — ARCHITECTURAL PRINCIPLES (NON-NEGOTIABLE)

Every part of the Platform must, at all times, satisfy the following principles. These are binding constraints, not aspirations.

**5.1 Scalable.** The architecture must scale horizontally to serve growth in users, countries, and load without structural rework.

**5.2 Modular.** The system is composed of well-bounded, independently reasoned modules with explicit contracts. Boundaries are respected; cross-cutting entanglement is prohibited.

**5.3 Maintainable.** Every artifact must be understandable, changeable, and testable by a competent engineer who did not write it.

**5.4 Multi-Country.** Geography is a configurable dimension across the entire system (see Article II).

**5.5 Multi-Language.** Localization is a configurable dimension across the entire system (see Article III).

**5.6 Role-Based.** Access and experience are governed by an explicit role and permission model (see Article IV).

**5.7 API-First.** Every capability is defined by a contract before it is implemented. User interfaces and integrations are consumers of these contracts, never the source of truth. No capability exists that is reachable only through a UI.

**5.8 Cloud-Ready.** The system is designed for cloud operation — elastic, observable, resilient, and free of dependence on any single machine or manual operational step.

**5.9 Security-First.** Security is a design input, not a later hardening step. See Article VI.

**5.10 Performance-First.** Performance targets are a design input, defined per capability, and measured. Degradation is a defect.

**5.11 AI-Ready.** The system is designed to incorporate AI capabilities as first-class, replaceable components (see Article VII).

**5.12 Mobile-Ready.** Mobile experiences are first-class consumers of the same contracts, not a reduced afterthought.

**5.13 SEO-Friendly.** Publicly discoverable surfaces must be architected for discoverability where discoverability is intended.

**5.14 Accessibility-Compliant.** The Platform must be usable by people with disabilities. Accessibility is a requirement of every user-facing surface, not an optional enhancement. The specific conformance standard and level to be adopted is recorded in the Open Questions Register.

**5.15 Production-Ready.** Nothing is "temporary." Everything built is built to production standard.

**5.16 Enterprise-Grade.** Reliability, auditability, governance, and operational maturity are expected everywhere.

**5.17 Configurability Supremacy.** Where any principle above conflicts with hardcoding, configurability wins. The default answer to "should this be configurable?" is **yes**, unless a deliberate, recorded decision says otherwise.

---

## ARTICLE VI — SECURITY, PRIVACY, AND DATA GOVERNANCE

**6.1 Security-First by Construction.** Every design must state its threat considerations and its handling of authentication, authorization, secrets, and data protection before it is accepted.

**6.2 Minors.** The Platform serves students, who may be minors. The protection of minors is a paramount concern. All handling of minors' data, consent, and safety must meet the highest applicable standard for each jurisdiction. The *specific* legal thresholds and consent mechanisms per jurisdiction are business/legal determinations governed by Articles XIV and XVI — never assumed.

**6.3 Privacy by Design and by Default.** Personal data is collected only with purpose, minimized, protected, and retained only as long as justified. Privacy protections are the default state, not an opt-in.

**6.4 Data Residency and Sovereignty.** The architecture must be capable of honoring per-jurisdiction data-residency and sovereignty requirements. The mechanism must exist; the specific obligations per country are recorded in the Open Questions Register until legally established.

**6.5 Auditability.** Security- and privacy-relevant actions must be traceable. Who did what, when, and under what authority must be answerable.

**6.6 No Legal Assumptions.** No legal, regulatory, or compliance requirement may be assumed, invented, or approximated. Legal requirements are established through authoritative sources and recorded before they bind design. Absence of a known requirement is never treated as absence of a requirement.

---

## ARTICLE VII — ARTIFICIAL INTELLIGENCE

**7.1 Provider Independence (Absolute).** The AI subsystem must remain **provider-independent**. The architecture must allow any AI provider — including Claude, OpenAI, Gemini, or any future or self-hosted provider — to be added, replaced, or removed **without rewriting the application.**

**7.2 Abstraction Boundary.** AI capabilities are consumed through an internal, stable abstraction owned by the Platform. Application logic never depends directly on a specific provider's interface, model name, or proprietary behavior.

**7.3 No Lock-In.** No decision may create a dependency that makes changing AI providers economically or technically prohibitive.

**7.4 Governed Behavior.** AI features that affect learners must be designed with the same standards of safety, privacy, accessibility, and auditability as any other capability. AI is not exempt from this Constitution.

**7.5 Substance Over Novelty.** AI is adopted where it demonstrably serves the educational mission, not because it is fashionable.

---

## ARTICLE VIII — DEVELOPMENT PHILOSOPHY (NON-NEGOTIABLE)

**8.1 No Shortcuts.** Expedient solutions that violate the principles of this Constitution are prohibited, regardless of deadline pressure.

**8.2 No Temporary Hacks.** There is no "temporary." What is built is built properly.

**8.3 No Technical Debt.** Debt is not knowingly incurred. Where unavoidable trade-offs arise, they are surfaced, decided deliberately, and recorded — never hidden.

**8.4 No Duplicated Logic.** A given rule or behavior has exactly one authoritative home. Duplication is a defect.

**8.5 No Unnecessary Complexity.** Complexity must be justified by necessity. The simplest design that fully satisfies the constraints is preferred.

**8.6 Clean Architecture Always.** Clear boundaries, explicit dependencies, and separation of concerns are mandatory.

**8.7 Decisions Are Documented.** Every significant decision is recorded with its context, options considered, decision, and rationale (see Article XIII). An undocumented significant decision is an incomplete decision.

---

## ARTICLE IX — THE ANTI-ASSUMPTION MANDATE

**9.1** Assumptions are prohibited. When required information is missing, the correct action is to **ask**, not to guess.

**9.2** The following are, specifically and permanently, never invented and never hardcoded:

- Business rules.
- Legal, regulatory, or compliance requirements.
- Countries and their attributes.
- Currencies.
- Languages.
- Educational / school systems, grade structures, and curricula.
- Payment methods.

**9.3** Every item in 9.2 is **configurable data established through governance**, not a constant embedded in logic.

**9.4** When any such item is needed and not yet established, it is entered into the Open Questions Register (Article XVI) and work that depends on it is blocked until it is resolved by an authoritative decision.

**9.5** Silence is not consent. The absence of a stated rule does not authorize inventing one.

---

## ARTICLE X — CONFIGURABILITY AS LAW

**10.1** Everything that varies — by country, language, jurisdiction, currency, payment method, educational system, role, or policy — must be expressed as configuration, not code.

**10.2** Introducing a new country, language, currency, payment method, or educational system must be achievable through configuration and onboarding, without modifying application logic.

**10.3** Configuration itself must be governed, validated, versioned, and auditable. Configurability does not mean uncontrolled change; it means controlled change without re-engineering.

---

## ARTICLE XI — QUALITY, TESTING, AND VERIFICATION

**11.1** Every deliverable is verified before it is considered complete. Verification is a first-class part of the work, not an optional follow-up.

**11.2** Claims of correctness must be substantiated — through testing, measurement, review, or other evidence appropriate to the artifact.

**11.3** Performance, security, accessibility, and localization are each verifiable properties and must be verified, not assumed.

**11.4** A capability that cannot be verified is not production-ready and therefore does not satisfy Article V.

---

## ARTICLE XII — OPERATIONAL READINESS

**12.1** Every capability is designed with its operation in mind: observability, monitoring, alerting, failure modes, recovery, and support.

**12.2** The system must be resilient to failure of any single component. Single points of failure are defects.

**12.3** Deployment, rollback, and configuration change must be safe, repeatable, and free of manual, error-prone steps.

---

## ARTICLE XIII — DECISION RECORD DISCIPLINE

**13.1** Significant architectural and product decisions are captured as Architecture Decision Records (ADRs) or equivalent, each stating context, options, decision, consequences, and rationale.

**13.2** ADRs are subordinate to this Constitution and must not contradict it. An ADR that would contradict the Constitution requires a Constitutional amendment first (Article XV).

**13.3** The decision history is a permanent asset of the project and must be preserved and discoverable.

---

## ARTICLE XIV — SOURCES OF BUSINESS AND LEGAL TRUTH

**14.1** Business rules originate only from an authoritative business owner and are recorded before they bind design.

**14.2** Legal and regulatory requirements originate only from authoritative legal sources per jurisdiction and are recorded before they bind design.

**14.3** Neither the architect role nor any implementer may originate, approximate, or infer business or legal truth. Their role is to model faithfully what has been authoritatively established, and to flag what has not.

**14.4** Until a business or legal input is authoritatively established, it lives in the Open Questions Register and blocks dependent work.

---

## ARTICLE XV — AMENDMENT PROCESS

**15.1** This Constitution may be amended, but only deliberately and explicitly. It is stable by design; it does not change by drift.

**15.2** An amendment must state what changes, why, and its consequences, and must be recorded with a new version number.

**15.3** Amendments take the same supreme authority as the original text upon ratification.

**15.4** Versioning follows a simple scheme: the major version increments for changes that alter binding principles; the minor version increments for clarifications and additions that do not weaken existing principles.

**15.5** No implicit amendment exists. A conversation, request, or code change never amends the Constitution by implication — only an explicit, ratified amendment does.

---

## ARTICLE XVI — OPEN QUESTIONS REGISTER

This register records information required by the Platform that has **not yet been authoritatively established** and therefore must not be assumed. Items here block any dependent design or implementation until resolved by the appropriate authority (Article XIV). This register is expected to grow and be resolved over time; its presence is a feature of disciplined governance, not a deficiency.

The following are recorded as open and unresolved as of Version 1.0. Each requires an authoritative decision before dependent work may proceed:

**Business & Marketplace**
- The commercial model of the marketplace (how tutoring engagements are priced, discovered, matched, booked, and fulfilled).
- Fee, commission, payout, and settlement rules — if any — and how they vary by jurisdiction.
- The rules governing relationships between parents, students, and tutors (guardianship, consent to engage, supervision, communication boundaries).
- Tutor eligibility, verification, and onboarding requirements.
- Refund, cancellation, and dispute rules.

**Legal, Regulatory & Compliance (per jurisdiction — none may be assumed)**
- Applicable data-protection and privacy law obligations per launch and expansion country.
- Data-residency and sovereignty obligations per country.
- Minimum-age, minor-consent, and guardian-consent requirements per country.
- Educational licensing or accreditation requirements, if any, per country.
- Tax, invoicing, and financial-regulatory obligations per country.
- Consumer-protection obligations per country.

**Localization & Regional**
- The authoritative list of supported currencies and how currency is determined per user/transaction.
- The authoritative list of supported payment methods per country.
- The educational/school-system models (grades, stages, curricula, terms, grading scales) per country.
- Locale formatting standards to adopt (dates, numbers, names, addresses).

**Standards & Targets**
- The specific accessibility conformance standard and level to be adopted (Article 5.14).
- Per-capability performance targets and service-level objectives (Article 5.10).
- Data-retention periods and deletion obligations per data class and jurisdiction.

**Platform Governance**
- The complete authoritative role and permission catalog (beyond the primary actors named in Article IV).
- The identity, authority, and escalation path of the business owner(s) and legal source(s) referenced in Article XIV.

Resolution of any item requires an authoritative source per Article XIV, after which it moves out of this register and into the appropriate governed configuration or charter.

---

## ARTICLE XVII — CONFLICT PROTOCOL

**17.1** When a future instruction, request, plan, or proposed change conflicts with any part of this Constitution, the conflict must be **stated explicitly and immediately**, identifying the specific Article(s) in tension, **before** any dependent work continues.

**17.2** The conflict is then resolved by one of exactly two paths:

1. The request is revised to comply with the Constitution; or
2. The Constitution is deliberately amended (Article XV) to permit the change.

**17.3** Proceeding in violation of the Constitution without following one of the two paths above is prohibited. There is no third path of quiet non-compliance.

**17.4** This protocol is itself constitutional and cannot be waived by informal agreement.

---

## CLOSING PROVISION

This Constitution establishes the framework within which the Education Ecosystem Platform will be designed, built, operated, and expanded. It defines principles and governance; it deliberately contains no implementation, no invented business rule, and no assumed legal or factual claim. Every future contribution to the Platform is measured against this document, and every conflict with it is surfaced before work proceeds.

This is the foundation. Everything the Platform becomes must be able to stand on it.

---

CONSTITUTION VERSION 1.0 COMPLETED
