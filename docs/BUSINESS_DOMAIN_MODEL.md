# BUSINESS DOMAIN MODEL

### The Authoritative Map of Business Domains for the Education Ecosystem Platform

---

| Field | Value |
|---|---|
| **Document Title** | Business Domain Model |
| **Document Class** | Tier 1 — Governance Instrument (subordinate to the Constitution) |
| **Version** | 1.0 |
| **Status** | Ratified — Active |
| **Owner** | Lead System Architect & Product Owner |
| **Date of Ratification** | 2 July 2026 |
| **Governing Authority** | Project Constitution v1.0 (Tier 0) |
| **Companion Instruments** | Project Decision Log v1.0, Product Vision v1.0 (Tier 1) |
| **Constitutional Basis** | Articles I, II, III, IV, V, VII, IX, X, XIV, XVI |

---

## READER'S NOTE ON SCOPE AND SOURCING

This document defines the **business domains** of the Platform — the conceptual building blocks of the business, their responsibilities, and how they relate. It is a *business architecture* artifact.

Consistent with Constitution Article VIII and the task under which it is created, this document contains **no implementation, no technology, no database tables or schema, and no user-interface description.** "Main Objects" below name *business concepts* (the things the business reasons about), never data structures, tables, or fields.

Consistent with Constitution Article IX (Anti-Assumption Mandate), this document **invents no business rule and no legal requirement.** Where a domain's behavior depends on a rule that has not been authoritatively established by a business owner or legal source (Constitution Article XIV), that rule is explicitly marked **"Pending Business Decision"** and, where relevant, cross-referenced to the Constitution's Open Questions Register (Article XVI). Domain *existence, purpose, and boundaries* are architectural and are defined here; domain *rules* are deferred to authoritative decision.

Per Constitution Article X, everything that varies by country, language, currency, payment method, or educational system is treated as configurable. Domains are described so that such variation is a matter of configuration, never of redesign.

---

## DOMAIN MODEL OVERVIEW

The Platform's business is organized into twenty-nine domains, grouped into coherent areas. The grouping aids comprehension only; each domain is independently bounded (Constitution Article 5.2).

**Identity & People:** Authentication · User Management · Student · Parent · Tutor · Tutor Verification

**Engagement & Delivery:** Booking · Scheduling · Calendar · Live Sessions

**Learning:** Programs · Learning Plans · Assessments · Homework

**Intelligence:** AI Services

**Communication:** Notifications · Messaging

**Commerce:** Payments · Wallet · Subscription

**Insight:** Reports · Analytics

**Content & Configuration:** CMS · Localization · Countries · Settings

**Operations & Governance:** Administration · Audit Logs · Support

### Cross-Cutting Principles Applying to Every Domain

Every domain, without exception, operates under these constitutional constraints: it is role-aware (Article IV); multi-country and multi-language by construction (Articles II, III); security- and privacy-first, with heightened protection where minors are involved (Article VI); accessible and mobile-ready at every user-facing surface (Article V); API-first, exposing its capability through explicit contracts (Article 5.7); and configurable rather than hardcoded (Articles IX, X). These are not repeated in each domain; they are assumed throughout.

### Modeling Conventions

- **Purpose** — why the domain exists in the business.
- **Responsibilities** — what the domain is accountable for.
- **Main Actors** — the roles that interact with or act upon the domain (drawn from Constitution Article IV; the full role catalog is Pending Business Decision per Article XVI).
- **Main Objects** — the core *business concepts* the domain reasons about (conceptual, not data).
- **Relationships with Other Domains** — how the domain depends on or serves others.
- **Business Boundaries** — what is explicitly inside and outside the domain, to prevent overlap.
- **Future Expansion Notes** — how the domain is expected to grow, per the Product Vision and Constitution Article II/III.

---

## AREA 1 — IDENTITY & PEOPLE

### 1. Authentication Domain

**Purpose.** To establish and verify *who* is interacting with the Platform, and to govern the act of proving identity, so that every other domain can rely on a trustworthy assertion of identity.

**Responsibilities.** Owning the concept of an identity credential and the act of authenticating it; governing sign-in, sign-out, and session establishment as business events; supporting multiple authentication methods as configurable options; enforcing authentication-related safety expectations. It is accountable for *authentication* (proving identity), not *authorization* (what an identity may do), which belongs to User Management.

**Main Actors.** All human actors (students, parents, tutors, administrators, support agents) and any authorized external system identities.

**Main Objects.** Identity, Credential, Authentication Event, Session (as a business concept of an active authenticated presence), Authentication Method.

**Relationships with Other Domains.** Provides a verified identity to User Management, which attaches roles and permissions. Every domain that requires "who is this" depends transitively on Authentication. Emits events consumed by Audit Logs. Interacts with Notifications for authentication-related communications.

**Business Boundaries.** Inside: verifying identity and managing authenticated presence. Outside: defining roles/permissions (User Management), profile data (User Management and the person domains), and consent rules (see Pending Business Decision below). The specific authentication methods offered, credential-strength rules, and session-lifetime and step-up rules are **Pending Business Decision** (Constitution Articles XIV, XVI; note minor-related consent obligations under Article VI are legal items in the Open Questions Register).

**Future Expansion Notes.** New authentication methods are added as configuration. Per-jurisdiction identity and consent requirements are accommodated as configurable variation (Constitution Article II) once authoritatively established.

---

### 2. User Management Domain

**Purpose.** To own the concept of an *account* and the assignment of *roles and permissions*, so that every actor has a governed identity within the Platform and every capability is granted explicitly (Constitution Article IV).

**Responsibilities.** Managing the lifecycle of accounts; assigning and revoking roles and permissions; modeling the relationships between accounts (for example, the guardianship link between a parent and a student, as a structural relationship — the *rules* of which are deferred); serving as the authoritative source of "what may this actor do." It is accountable for authorization and account lifecycle.

**Main Actors.** Administrators (who govern accounts and roles), and every user as the subject of an account. Support agents act upon accounts within permitted bounds.

**Main Objects.** Account, Role, Permission, Account Relationship (e.g., guardianship, enrollment linkage — structural only), Account Status.

**Relationships with Other Domains.** Consumes verified identity from Authentication. Provides authorization context to *every* other domain. Underpins the Student, Parent, and Tutor domains, which specialize the person behind an account. Feeds Audit Logs and Administration.

**Business Boundaries.** Inside: accounts, roles, permissions, and structural relationships between accounts. Outside: proving identity (Authentication); role-specific attributes and behavior (Student/Parent/Tutor domains). The complete role and permission catalog, and the rules governing account relationships (e.g., how a guardianship is established or what consent it requires), are **Pending Business Decision** (Constitution Articles IV, XIV, XVI).

**Future Expansion Notes.** New roles and sub-roles are added without redesign (Constitution Article 4.2). Delegated and institutional administration models are anticipated and accommodated structurally.

---

### 3. Student Domain

**Purpose.** To represent the learner as a first-class business concept — the person whose educational outcomes the Platform exists to improve (Constitution Article I; Product Vision §6.1).

**Responsibilities.** Owning the student's learning-relevant profile and context (as business concepts); representing the student's relationship to learning activities, tutors, programs, and plans; upholding the heightened protections owed where the student is a minor (Constitution Article VI).

**Main Actors.** The student; the parent/guardian in relation to the student; tutors engaging the student; administrators and support within permitted bounds.

**Main Objects.** Student Profile, Learning Context, Enrollment (the student's participation in learning), Guardianship Link (from the student's side).

**Relationships with Other Domains.** Specializes an account from User Management. Central to Booking, Programs, Learning Plans, Assessments, Homework, and AI Services, all of which serve the student. Connected to Parent via guardianship. Subject to elevated Security/Privacy treatment.

**Business Boundaries.** Inside: the learner as a person and their learning context. Outside: account/role mechanics (User Management), the content of learning (Programs/Learning Plans), and the guardianship *rules* (Pending Business Decision). Age thresholds distinguishing minors, and the consequent consent and safeguarding rules, are **Pending Business Decision / legal** (Constitution Articles VI, XIV, XVI).

**Future Expansion Notes.** Additional learner types (e.g., adult learners, institutional cohorts) are accommodated as the model grows, per Product Vision expansion directions.

---

### 4. Parent Domain

**Purpose.** To represent the parent or guardian as a first-class actor who stays informed of and involved in a student's learning (Constitution Article 1.2; Product Vision §6.2).

**Responsibilities.** Owning the parent's profile and their relationship to one or more students; representing the parent's legitimate visibility into and involvement with the student's learning; serving as the point of parental consent and oversight where required.

**Main Actors.** The parent/guardian; the student(s) they are linked to; tutors and administrators in permitted interactions.

**Main Objects.** Parent Profile, Guardianship Link (from the parent's side), Oversight Context (the scope of what a parent may see and do regarding a student).

**Relationships with Other Domains.** Specializes an account from User Management. Linked to Student via guardianship. Consumes from Reports, Analytics, Notifications, and Messaging to stay informed. May interact with Payments/Subscription where the parent is the paying party (Pending Business Decision as to who pays).

**Business Boundaries.** Inside: the parent as a person and their oversight relationship. Outside: the student's own domain, and the *rules* of what oversight a parent has (which involve minor-protection and consent law). The scope and rules of parental oversight, consent authority, and who bears payment responsibility are **Pending Business Decision / legal** (Constitution Articles VI, XIV, XVI).

**Future Expansion Notes.** Multiple guardians per student, and institutional "guardian" analogues, are anticipated structurally.

---

### 5. Tutor Domain

**Purpose.** To represent the educator who offers and delivers teaching through the Platform (Constitution Article 1.2; Product Vision §6.3).

**Responsibilities.** Owning the tutor's professional profile, offerings, and availability-relevant attributes (as business concepts); representing the tutor's relationship to students, bookings, programs, and delivery; supporting the tutor's standing and reputation within the marketplace.

**Main Actors.** The tutor; students and parents engaging the tutor; administrators and support; the Tutor Verification domain acting upon tutor standing.

**Main Objects.** Tutor Profile, Offering (what the tutor teaches, conceptually), Availability Intent (the tutor's willingness to teach, distinct from the Calendar), Reputation/Standing (conceptual).

**Relationships with Other Domains.** Specializes an account from User Management. Depends on Tutor Verification for eligibility to offer services. Central to Booking, Scheduling, Live Sessions, Programs. Interacts with Payments/Wallet for earnings (rules Pending Business Decision).

**Business Boundaries.** Inside: the tutor as a professional actor and their offerings. Outside: the *verification* of the tutor (Tutor Verification), the mechanics of booking (Booking), and earnings rules (Payments/Wallet). Tutor eligibility criteria, offering constraints, and reputation rules are **Pending Business Decision** (Constitution Article XIV; Open Questions Register).

**Future Expansion Notes.** Tutor organizations/agencies, and per-market tutor requirements, are accommodated as configurable expansion.

---

### 6. Tutor Verification Domain

**Purpose.** To establish and maintain trust in tutors by governing the process by which a tutor becomes, and remains, eligible to offer teaching (Constitution Article VI trust posture; Product Vision §4.5).

**Responsibilities.** Owning the concept of tutor verification status and the process that produces it; representing verification checks and their outcomes (conceptually); maintaining ongoing eligibility and its revocation. Accountable for the *trust gate*, not for the tutor's teaching itself.

**Main Actors.** The tutor (as subject); administrators and designated reviewers; potentially authorized external verification providers (as actors, not implementations).

**Main Objects.** Verification Case, Verification Check (conceptual), Verification Status, Eligibility Determination.

**Relationships with Other Domains.** Gates the Tutor domain's ability to offer services and be booked (Booking). Feeds Audit Logs and Administration. May depend on Countries/Localization for per-jurisdiction requirements.

**Business Boundaries.** Inside: the process and status of verifying a tutor. Outside: the tutor's profile and offerings (Tutor), and the booking flow (Booking). The specific verification requirements, checks, standards, and their per-jurisdiction variation are **Pending Business Decision / legal** (Constitution Articles VI, XIV; Open Questions Register).

**Future Expansion Notes.** Per-country verification requirements and additional trust signals are added as configuration as markets are entered.

---

## AREA 2 — ENGAGEMENT & DELIVERY

### 7. Booking Domain

**Purpose.** To govern the act by which a student (or parent on their behalf) engages a tutor for teaching — the core marketplace transaction of matching demand to supply (Constitution Article 1.2; Product Vision §7).

**Responsibilities.** Owning the concept of a booking and its lifecycle (request, confirmation, change, cancellation) as business events; representing the agreement between a learner and a tutor to hold a session or engagement; coordinating with Scheduling, Payments, and Live Sessions.

**Main Actors.** Students and parents (as bookers), tutors (as booked parties), administrators and support.

**Main Objects.** Booking, Booking Request, Booking Status, Cancellation/Change (as events).

**Relationships with Other Domains.** Depends on Tutor and Tutor Verification (only eligible tutors are bookable), Scheduling and Calendar (for time), and Payments/Wallet/Subscription (for the commercial side). Triggers Live Sessions. Emits Notifications and Audit events.

**Business Boundaries.** Inside: the agreement to engage and its lifecycle. Outside: the calendar mechanics (Scheduling/Calendar), the money (Payments), and the session delivery (Live Sessions). Booking rules — pricing at booking, cancellation and refund policy, matching rules, who may book — are **Pending Business Decision** (Constitution Article XIV; Open Questions Register commercial items).

**Future Expansion Notes.** New booking types (one-to-one, group, program-based, institutional) are accommodated as the marketplace model matures. The marketplace commercial model is Pending Business Decision.

---

### 8. Scheduling Domain

**Purpose.** To determine *when* engagements can and do occur, reconciling tutor availability, learner needs, and constraints into agreed times.

**Responsibilities.** Owning the logic of matching availability to demand in time; representing proposed, confirmed, and rescheduled times as business concepts; enforcing scheduling constraints (as configurable rules). Distinct from Calendar, which *records and presents* time; Scheduling *decides* it.

**Main Actors.** Tutors (offering availability), students/parents (requesting times), administrators.

**Main Objects.** Availability, Time Slot (conceptual), Schedule Proposal, Rescheduling Event.

**Relationships with Other Domains.** Serves Booking (a booking needs a scheduled time). Reads tutor Availability Intent from Tutor. Writes agreed times into Calendar. Sensitive to Localization (time zones, locale) and Countries.

**Business Boundaries.** Inside: deciding and reconciling times. Outside: recording/displaying time (Calendar), and the commercial agreement (Booking). Scheduling constraint rules (notice periods, session lengths, buffers, limits) are **Pending Business Decision** (Constitution Article XIV).

**Future Expansion Notes.** Time-zone-aware scheduling across countries is foundational (Constitution Article II). Group and recurring scheduling patterns are anticipated.

---

### 9. Calendar Domain

**Purpose.** To provide the authoritative record and presentation of time-based commitments for each actor — the shared temporal view of the Platform.

**Responsibilities.** Owning the concept of calendared entries for students, parents, and tutors; representing sessions, deadlines, and events on a timeline; reconciling entries across actors. It *records and presents*; it does not *decide* (Scheduling) or *deliver* (Live Sessions).

**Main Actors.** All human actors who have time-based commitments; administrators.

**Main Objects.** Calendar, Calendar Entry, Reminder (as a business trigger, delivered via Notifications).

**Relationships with Other Domains.** Populated by Scheduling and Booking (sessions), Homework and Assessments (deadlines), Programs and Learning Plans (milestones). Triggers Notifications. Localization governs time presentation.

**Business Boundaries.** Inside: recording and presenting time commitments. Outside: deciding times (Scheduling), and the events themselves (their owning domains). External calendar integration policy is **Pending Business Decision**.

**Future Expansion Notes.** Integration with external calendar systems and institutional calendars is anticipated as configurable capability.

---

### 10. Live Sessions Domain

**Purpose.** To govern the actual delivery of a live teaching engagement — the moment of teaching and learning between tutor and student(s).

**Responsibilities.** Owning the concept of a live session's lifecycle (start, conduct, completion); representing attendance and session state as business concepts; connecting a booked, scheduled engagement to its delivery and to post-session outcomes. It governs the *business* of the session, not the media technology.

**Main Actors.** Tutors (delivering), students (attending), parents (with permitted visibility), administrators/support.

**Main Objects.** Live Session, Attendance, Session State, Session Outcome (conceptual link to assessments/homework/reports).

**Relationships with Other Domains.** Triggered by Booking/Scheduling. Feeds Reports and Analytics (what happened), and may generate Homework/Assessment follow-ups. Emits Notifications and Audit events. May consume AI Services during or after a session.

**Business Boundaries.** Inside: the business lifecycle and outcomes of a live session. Outside: the underlying real-time media technology (implementation, out of scope here), booking/scheduling, and content. Session conduct rules, recording policy (with minor-protection implications), and attendance rules are **Pending Business Decision / legal** (Constitution Articles VI, XIV).

**Future Expansion Notes.** Group sessions, recorded sessions, and hybrid formats are anticipated, subject to per-jurisdiction rules.

---

## AREA 3 — LEARNING

### 11. Programs Domain

**Purpose.** To represent structured educational offerings — coherent bodies of learning (courses, curricula, structured tutoring programs) that organize teaching beyond a single session.

**Responsibilities.** Owning the concept of a program and its structure (as business concepts); representing enrollment in and progression through a program; relating programs to tutors, students, and learning content.

**Main Actors.** Tutors and administrators (as authors/owners of programs), students (as participants), parents (with visibility).

**Main Objects.** Program, Program Structure (modules/units, conceptual), Enrollment, Progression.

**Relationships with Other Domains.** Serves the Student domain. Composed with Learning Plans (a plan may sequence programs), Assessments and Homework (which measure/reinforce program learning), and CMS (which supplies content). Feeds Reports/Analytics.

**Business Boundaries.** Inside: structured learning offerings and participation in them. Outside: individualized planning (Learning Plans), evaluation (Assessments), and raw content authoring (CMS). Program structure rules, accreditation, and per-market educational-system alignment are **Pending Business Decision / legal** (Constitution Articles IX, XIV; Open Questions Register on school systems).

**Future Expansion Notes.** Alignment to each country's educational system is configurable, never hardcoded (Constitution Article 2.4). New program types are added as the catalog grows.

---

### 12. Learning Plans Domain

**Purpose.** To represent the individualized path of a learner — the personalized sequencing of learning activities toward a student's goals.

**Responsibilities.** Owning the concept of a learning plan tailored to a student; representing goals, milestones, and the arrangement of activities over time; adapting as the learner progresses.

**Main Actors.** Students (as subjects), tutors (as planners/advisors), parents (with visibility), AI Services (as an assistive planner where configured).

**Main Objects.** Learning Plan, Goal, Milestone, Planned Activity.

**Relationships with Other Domains.** Serves the Student domain. Sequences Programs, Assessments, and Homework. Reflected in Calendar (milestones) and Reports/Analytics (progress). May be assisted by AI Services (provider-independent, Constitution Article VII).

**Business Boundaries.** Inside: the individualized plan and its adaptation. Outside: the structured offerings themselves (Programs), evaluation (Assessments), and delivery (Live Sessions). Planning rules, goal frameworks, and adaptation logic are **Pending Business Decision**.

**Future Expansion Notes.** AI-assisted personalization deepens over time within the provider-independent AI boundary. Institution-defined plan frameworks are anticipated.

---

### 13. Assessments Domain

**Purpose.** To govern the evaluation of learning — measuring what a student knows or can do, to inform teaching, planning, and outcomes (Product Vision §10 outcome dimension).

**Responsibilities.** Owning the concept of an assessment and its lifecycle (assignment, submission, evaluation, result); representing results and their meaning as business concepts; feeding evidence of learning into plans and reports.

**Main Actors.** Tutors (as assessors/authors), students (as assessed), parents (with visibility), AI Services (as an assistive evaluator where configured), administrators.

**Main Objects.** Assessment, Submission, Result, Grading Scheme (conceptual).

**Relationships with Other Domains.** Serves Student and Learning Plans (results drive adaptation). Related to Programs and Homework. Feeds Reports and Analytics. May use AI Services for assistance.

**Business Boundaries.** Inside: evaluation of learning and its results. Outside: practice/reinforcement work (Homework — though the two are closely related), content (CMS), and structured offerings (Programs). Grading schemes, assessment standards, integrity rules, and per-market/qualification alignment are **Pending Business Decision / legal** (Constitution Articles IX, XIV; school-system Open Question).

**Future Expansion Notes.** Multiple assessment types and per-country grading conventions are configurable. AI-assisted evaluation grows within the AI boundary.

---

### 14. Homework Domain

**Purpose.** To govern assigned practice and reinforcement work performed by students outside live sessions — the between-session learning activity.

**Responsibilities.** Owning the concept of a homework assignment and its lifecycle (assignment, completion, submission, feedback); representing the practice work that reinforces learning; linking assigned work to plans, programs, and sessions.

**Main Actors.** Tutors (assigning and reviewing), students (completing), parents (with visibility), AI Services (assistive feedback where configured).

**Main Objects.** Homework Assignment, Submission, Feedback, Completion Status.

**Relationships with Other Domains.** Serves Student and Learning Plans. Related to Programs, Assessments, and Live Sessions. Deadlines appear in Calendar; reminders via Notifications. Feeds Reports/Analytics. May use AI Services.

**Business Boundaries.** Inside: assigned practice work and its lifecycle. Outside: formal evaluation (Assessments), content authoring (CMS), and session delivery (Live Sessions). Homework rules (deadlines, resubmission, feedback expectations) are **Pending Business Decision**.

**Future Expansion Notes.** AI-assisted feedback and adaptive practice deepen within the provider-independent AI boundary.

---

## AREA 4 — INTELLIGENCE

### 15. AI Services Domain

**Purpose.** To provide artificial-intelligence capabilities across the Platform — the AI learning assistant and AI assistance to other domains — through a single, provider-independent abstraction (Constitution Article VII; Product Vision §4.7).

**Responsibilities.** Owning the Platform's AI capability as a bounded service that other domains consume; guaranteeing provider independence so any AI provider can be added, replaced, or removed without rewriting the application (Constitution Article 7.1–7.3); governing AI behavior to the same standards of safety, privacy, accessibility, and auditability as any other capability (Constitution Article 7.4).

**Main Actors.** Students (primary beneficiaries of the AI assistant), tutors and other domains (as consumers of AI assistance), administrators (governing AI configuration).

**Main Objects.** AI Capability (conceptual), AI Request/Interaction, AI Provider Abstraction (the internal, stable boundary — conceptual, not implementation), AI Governance Policy.

**Relationships with Other Domains.** Serves Learning Plans, Assessments, Homework, Messaging, and the Student assistant experience. Depends on Settings for configuration and Audit Logs for traceability. Bound by Security/Privacy, especially for minors.

**Business Boundaries.** Inside: providing and governing AI capability behind a provider-independent boundary. Outside: the specific provider implementations (implementation, out of scope), and the domains that consume AI. AI usage policies, safety rules, model-selection governance, and data-handling for AI (with minor-protection implications) are **Pending Business Decision / legal** (Constitution Articles VI, VII, XIV).

**Future Expansion Notes.** New AI providers and capabilities are added behind the same abstraction without application rewrite — this is a constitutional guarantee, not merely an aspiration (Constitution Article 7.1).

---

## AREA 5 — COMMUNICATION

### 16. Notifications Domain

**Purpose.** To deliver timely, system-originated information to actors across all channels — the Platform's outbound awareness mechanism.

**Responsibilities.** Owning the concept of a notification and its delivery lifecycle; representing notification triggers, preferences, and channels (as configurable concepts); ensuring the right actor is informed of the right event. Distinct from Messaging (person-to-person).

**Main Actors.** All actors as recipients; every domain as a potential trigger source; administrators governing notification policy.

**Main Objects.** Notification, Notification Trigger, Delivery Channel (conceptual), Notification Preference.

**Relationships with Other Domains.** Triggered by virtually every domain (Booking, Calendar, Homework, Payments, etc.). Respects Localization (language/locale of the message) and Settings (preferences). Feeds Audit Logs.

**Business Boundaries.** Inside: system-originated outbound notifications. Outside: person-to-person conversation (Messaging), and the events that trigger notifications (their owning domains). Channel availability, notification policy, and consent-to-contact rules are **Pending Business Decision / legal** (Constitution Articles VI, XIV).

**Future Expansion Notes.** New channels are added as configuration. Per-jurisdiction contact rules are honored once established.

---

### 17. Messaging Domain

**Purpose.** To enable governed person-to-person communication between actors — the conversational fabric connecting students, parents, tutors, and support.

**Responsibilities.** Owning the concept of a conversation and message between actors; representing message threads and their participants; enforcing communication boundaries and safety, especially where minors are involved. Distinct from Notifications (system-originated).

**Main Actors.** Students, parents, tutors, support agents, administrators — within permitted communication boundaries.

**Main Objects.** Conversation, Message, Participant, Communication Boundary (conceptual).

**Relationships with Other Domains.** Governed by User Management (who may talk to whom) and Security/Privacy (safety). Related to Booking and Live Sessions (context of conversations), Support (support conversations), and AI Services (assistive messaging where configured). Feeds Audit Logs.

**Business Boundaries.** Inside: person-to-person conversation. Outside: system notifications (Notifications), and support case management (Support). Communication-permission rules (notably who may message a minor and under what supervision) and moderation rules are **Pending Business Decision / legal** (Constitution Articles VI, XIV; a related Open Question concerns parent–student–tutor relationship rules).

**Future Expansion Notes.** Group messaging, moderation tooling, and per-jurisdiction safety rules are anticipated as configurable expansion.

---

## AREA 6 — COMMERCE

### 18. Payments Domain

**Purpose.** To govern the movement of money into and through the Platform in exchange for educational services — the commercial settlement of the marketplace.

**Responsibilities.** Owning the concept of a payment and its lifecycle (initiation, authorization, settlement, refund) as business events; representing amounts, currencies, and payment methods as configurable concepts; coordinating with Wallet, Subscription, and Booking. It governs the *business* of payment, not any payment-processor technology.

**Main Actors.** Payers (students or parents — who pays is Pending Business Decision), payees (tutors and the Platform), administrators, and authorized external payment providers (as actors).

**Main Objects.** Payment, Transaction, Currency (configurable), Payment Method (configurable), Refund.

**Relationships with Other Domains.** Triggered by Booking and Subscription. Interacts with Wallet (balances) and, for tutors, earnings/payouts. Sensitive to Countries and Localization (currency, method, tax). Feeds Reports, Analytics, and Audit Logs.

**Business Boundaries.** Inside: the business of money movement. Outside: payment-processor implementation (out of scope), the commercial *policy* of what is charged, and account balances (Wallet). Currencies, payment methods, pricing, commission/fee/payout rules, tax handling, and per-jurisdiction financial-regulatory obligations are **Pending Business Decision / legal** (Constitution Articles IX, X, XIV; multiple Open Questions Register items). Nothing here is hardcoded.

**Future Expansion Notes.** New currencies and payment methods per country are added purely as configuration (Constitution Article 2.4). Financial-regulatory variation is honored once legally established.

---

### 19. Wallet Domain

**Purpose.** To represent stored value and balances held within the Platform for actors — the ledger of what is owed to and held for each party.

**Responsibilities.** Owning the concept of an actor's balance and its movements (credits, debits, holds) as business concepts; representing tutor earnings balances and any learner/parent stored value; providing a consistent view of financial standing. It is the *balance* concept; Payments is the *movement* concept.

**Main Actors.** Tutors (earnings), students/parents (any stored value), administrators, support.

**Main Objects.** Wallet, Balance, Ledger Entry (conceptual), Hold.

**Relationships with Other Domains.** Fed by Payments (movements change balances). Serves Booking (spending) and tutor payouts. Feeds Reports, Analytics, and Audit Logs. Sensitive to Countries/Localization (currency).

**Business Boundaries.** Inside: balances and their movements as business concepts. Outside: external money movement (Payments), and financial reporting (Reports). Whether wallets/stored value are offered at all, payout timing and thresholds, and negative-balance rules are **Pending Business Decision / legal** (Constitution Article XIV).

**Future Expansion Notes.** Multi-currency balances and per-market financial rules are accommodated as configuration once established.

---

### 20. Subscription Domain

**Purpose.** To govern recurring commercial relationships — ongoing access or entitlements provided in exchange for recurring payment.

**Responsibilities.** Owning the concept of a subscription and its lifecycle (activation, renewal, change, cancellation, lapse) as business events; representing entitlements conferred by a subscription; coordinating with Payments and access governance.

**Main Actors.** Subscribers (students, parents, or institutions — Pending Business Decision), administrators.

**Main Objects.** Subscription, Plan (conceptual, configurable), Entitlement, Renewal Event.

**Relationships with Other Domains.** Drives Payments (recurring charges) and grants entitlements that User Management/access respects. May gate Programs or features. Feeds Reports, Analytics, Audit Logs. Sensitive to Countries/Localization (pricing, currency).

**Business Boundaries.** Inside: recurring entitlement relationships. Outside: one-time payment (Payments/Booking), and the entitled capabilities themselves. Whether subscriptions are offered, plan definitions, pricing, entitlements, and renewal/cancellation rules are **Pending Business Decision** (Constitution Article XIV; commercial Open Questions).

**Future Expansion Notes.** Multiple plan types, institutional subscriptions, and per-market pricing are accommodated as configuration.

---

## AREA 7 — INSIGHT

### 21. Reports Domain

**Purpose.** To present structured, purpose-built views of Platform information to actors — the answer to "show me the state of things" for a specific audience.

**Responsibilities.** Owning the concept of a report as a defined, audience-appropriate view; representing report definitions and their generation (as business concepts); serving each actor the information they are permitted and need to see. Reports are *curated views*; Analytics is *investigative insight*.

**Main Actors.** Parents (student progress), tutors (their activity), administrators (operations), students (their own progress).

**Main Objects.** Report, Report Definition, Report Output (conceptual).

**Relationships with Other Domains.** Draws on virtually every domain (Learning, Commerce, Engagement) subject to permissions from User Management and privacy from Security. Related to Analytics. Localized via Localization.

**Business Boundaries.** Inside: defined, permissioned views of information. Outside: raw event capture, exploratory analysis (Analytics), and the source domains themselves. Which reports exist, their contents, and their audience-permission rules are **Pending Business Decision** (Constitution Articles IV, XIV).

**Future Expansion Notes.** New report types and per-role report catalogs grow over time. Institutional reporting is anticipated.

---

### 22. Analytics Domain

**Purpose.** To produce insight from Platform activity — understanding patterns, outcomes, and performance to inform decisions (Product Vision §10).

**Responsibilities.** Owning the concept of analytical insight over Platform activity; representing measures, dimensions, and analyses (as business concepts); supporting the Platform's commitment to measure success rather than assume it (Constitution Article XI). Distinct from Reports (curated views) by being exploratory and aggregate.

**Main Actors.** Administrators and the business (primary), with permitted, privacy-respecting insight surfaced to other roles.

**Main Objects.** Metric, Dimension, Analysis, Insight (conceptual).

**Relationships with Other Domains.** Draws on all domains' events, subject to Security/Privacy (especially minor data) and User Management permissions. Feeds the KPI framework (Product Vision §10) and Administration. Related to Reports.

**Business Boundaries.** Inside: aggregate, investigative insight. Outside: curated individual views (Reports), and operational decision-making itself (Administration/business). The KPI definitions, targets, and privacy-preserving analytics rules are **Pending Business Decision** (Product Vision §10.3; Constitution Articles VI, XIV).

**Future Expansion Notes.** Deeper outcome analytics and, within the provider-independent AI boundary, AI-assisted insight are anticipated, always subject to privacy constraints.

---

## AREA 8 — CONTENT & CONFIGURATION

### 23. CMS (Content Management) Domain

**Purpose.** To govern the creation, organization, and lifecycle of the Platform's educational and informational *content* — the material that programs, plans, assessments, and public surfaces draw upon.

**Responsibilities.** Owning the concept of content and its lifecycle (authoring, review, publication, retirement) as business concepts; organizing content for reuse across domains; supporting multi-language content (Constitution Article III) and SEO-relevant public content (Constitution Article 5.13).

**Main Actors.** Content authors and editors (tutors, administrators, designated content roles), and consuming actors as readers.

**Main Objects.** Content Item, Content Structure, Content Lifecycle State, Content Translation (conceptual).

**Relationships with Other Domains.** Supplies content to Programs, Learning Plans, Assessments, Homework, and public/marketing surfaces. Depends on Localization for translation and CMS content feeds SEO. Governed by User Management (authoring permissions) and Audit Logs.

**Business Boundaries.** Inside: content and its lifecycle. Outside: the learning structures that use content (Programs etc.), and translation mechanics (Localization). Content governance rules, review/approval workflows, and content-ownership/IP rules are **Pending Business Decision / legal** (Constitution Article XIV).

**Future Expansion Notes.** Unlimited content languages and per-market content variants are accommodated as configuration (Constitution Article III).

---

### 24. Localization Domain

**Purpose.** To make the entire Platform adaptable to language, locale, and regional convention — the mechanism that delivers Constitution Article III (multi-language, RTL, unlimited languages).

**Responsibilities.** Owning the concepts of language, locale, translation, and locale-specific formatting (dates, numbers, currency display, names, addresses); ensuring content and interface text are externalized and translatable; guaranteeing both RTL and LTR are first-class (Constitution Article 3.3). It keeps language, locale, country, and jurisdiction as distinct, combinable concepts (Constitution Article 3.5).

**Main Actors.** Translators and localization administrators; every actor as a beneficiary; every domain as a consumer.

**Main Objects.** Language (configurable), Locale (configurable), Translation, Localization Rule (conceptual).

**Relationships with Other Domains.** Serves *every* user-facing domain. Closely related to CMS (content translation), Countries (regional convention), and Settings (preference). Foundational, not peripheral.

**Business Boundaries.** Inside: language, locale, translation, and regional formatting. Outside: country-level attributes beyond language/locale (Countries), and content itself (CMS). The specific languages and locales to support beyond the launch three, and the locale-formatting standards to adopt, are **Pending Business Decision** (Product Vision §5; Constitution Article XVI Open Questions).

**Future Expansion Notes.** Unlimited future languages are added purely as configuration — a constitutional requirement (Constitution Article 3.2). No language is hardcoded.

---

### 25. Countries Domain

**Purpose.** To represent countries and jurisdictions as first-class, configurable concepts, and to carry the per-jurisdiction variation on which the entire multi-country Platform depends (Constitution Article II).

**Responsibilities.** Owning the concept of a country/jurisdiction and its configurable attributes (legal, fiscal, linguistic, educational, data-residency, and other regional dimensions — as *slots for* configuration, not as invented content); ensuring no country is privileged and none is hardcoded (Constitution Articles 2.3, 2.4); making country onboarding a configuration activity (Constitution Article 2.3).

**Main Actors.** Administrators (configuring countries); every domain as a consumer of country context.

**Main Objects.** Country/Jurisdiction (configurable), Jurisdictional Attribute (conceptual slot), Country Onboarding State.

**Relationships with Other Domains.** Provides jurisdictional context to Payments (currency, tax, method, regulation), Localization (language/locale defaults), Tutor Verification (per-country requirements), Programs/Assessments (educational systems), Security/Privacy (data residency), and more. One of the most widely consumed domains.

**Business Boundaries.** Inside: countries/jurisdictions and their configurable attribute *structure*. Outside: the *content* of each attribute (legal rules, currencies, school systems), which are per-domain and per-jurisdiction business/legal facts. The identity of launch/expansion countries is established (Constitution Article II); every per-country attribute value is **Pending Business Decision / legal** (Constitution Articles IX, XIV; Open Questions Register).

**Future Expansion Notes.** Unlimited future countries are onboarded via configuration — a constitutional requirement (Constitution Article 2.3). Adding a country never requires re-engineering.

---

### 26. Settings Domain

**Purpose.** To govern configuration and preferences across the Platform — the domain that operationalizes Constitution Article X ("Configurability as Law").

**Responsibilities.** Owning the concept of configurable settings at every relevant scope (platform, country, role, account, and other scopes); representing preferences and configuration as governed, validated, versioned concepts (Constitution Article 10.3); ensuring that variation is expressed as configuration rather than code.

**Main Actors.** Administrators (platform/country/role configuration), individual actors (personal preferences), every domain as a consumer of settings.

**Main Objects.** Setting, Configuration Scope (conceptual), Preference, Configuration Version.

**Relationships with Other Domains.** Serves *every* domain. Closely related to Countries (country-scoped config), Localization (language/locale preference), Notifications (preferences), and Administration (governed change). Underpins configurability everywhere.

**Business Boundaries.** Inside: the concept and governance of configurable settings and preferences. Outside: the domain-specific *meaning* of each setting (owned by that domain), and the authoritative *values* (business decisions). The catalog of settings, their scopes, defaults, and governance rules are **Pending Business Decision** as each domain's rules are established (Constitution Articles X, XIV).

**Future Expansion Notes.** New configurable dimensions are added as the Platform grows; configurability is the default answer (Constitution Article 5.17).

---

## AREA 9 — OPERATIONS & GOVERNANCE

### 27. Administration Domain

**Purpose.** To provide governed operational control over the Platform — the enterprise administration capability through which the business operates and oversees the ecosystem (Constitution Article 1.2; Product Vision §6.4).

**Responsibilities.** Owning the concept of administrative oversight and control across domains; representing administrative actions, their authority, and their governance; serving as the operational seat for configuration, moderation, and enterprise management — always within explicit, auditable permissions (Constitution Article IV).

**Main Actors.** Enterprise administrators and their sub-roles; institutional administrators (anticipated); the business.

**Main Objects.** Administrative Action, Administrative Scope, Oversight View (conceptual).

**Relationships with Other Domains.** Acts upon virtually every domain within permitted bounds. Depends on User Management (authority), Settings (configuration), Audit Logs (accountability), Reports/Analytics (insight). The governance hub of operations.

**Business Boundaries.** Inside: governed operational control and oversight. Outside: the domains being administered (they own their own rules), and their authorization mechanics (User Management). The administrative role catalog, permitted actions, and delegated/institutional administration models are **Pending Business Decision** (Constitution Articles IV, XIV; role-catalog Open Question).

**Future Expansion Notes.** Multi-tenant/institutional administration and per-market administrative structures are anticipated as configurable expansion.

---

### 28. Audit Logs Domain

**Purpose.** To provide a trustworthy, permanent record of significant actions across the Platform — the accountability backbone required by the Constitution (Articles 6.5, 5.16).

**Responsibilities.** Owning the concept of an audit record — who did what, when, and under what authority; representing an append-only, tamper-evident history of security-, privacy-, and governance-relevant events; supporting accountability, investigation, and compliance.

**Main Actors.** Every domain and actor as a source of auditable events; administrators, security, and compliance roles as consumers.

**Main Objects.** Audit Record, Audited Event, Actor Attribution, Authority Context (conceptual).

**Relationships with Other Domains.** Receives events from *every* domain (Authentication, Payments, Messaging, Administration, AI Services, and all others). Serves Administration, Security, and compliance needs. Conceptually mirrors the append-only discipline the Project Decision Log applies to decisions.

**Business Boundaries.** Inside: the trustworthy record of significant actions. Outside: the actions themselves (their owning domains), and business analytics (Analytics). Which events are auditable, retention periods, and access rules are **Pending Business Decision / legal** (Constitution Articles VI, XIV; retention Open Question).

**Future Expansion Notes.** Per-jurisdiction audit and retention requirements are honored as configuration once legally established. Audit scope deepens with the Platform.

---

### 29. Support Domain

**Purpose.** To help actors resolve problems and get assistance — the Platform's care function that sustains trust and usability (Product Vision §4.5).

**Responsibilities.** Owning the concept of a support request and its lifecycle (raising, triage, handling, resolution) as business concepts; representing support interactions and their outcomes; connecting users in difficulty to appropriate help, including safeguarding escalation where minors are involved.

**Main Actors.** All actors as requesters; support agents as handlers; administrators; AI Services as assistive support where configured.

**Main Objects.** Support Case, Support Interaction, Resolution, Escalation (conceptual).

**Relationships with Other Domains.** Interacts with Messaging (support conversations), User Management (context), Payments/Wallet/Booking (transaction issues), and Audit Logs. May use AI Services within the provider-independent boundary. Feeds Analytics (support insight).

**Business Boundaries.** Inside: helping actors resolve problems. Outside: general person-to-person messaging (Messaging), and the domains whose issues are being supported. Support policies, service levels, escalation rules, and safeguarding-escalation procedures for minors are **Pending Business Decision / legal** (Constitution Articles VI, XIV).

**Future Expansion Notes.** Per-market support (language, hours, channels) is configurable (Constitution Articles II, III). AI-assisted support deepens within the AI boundary.

---

## CROSS-DOMAIN RELATIONSHIP SUMMARY

The domains form one ecosystem, not a set of silos (Constitution Article 1.1). A small number of domains are *foundational* and consumed almost everywhere — Authentication and User Management (identity and authority), Localization and Countries and Settings (configurable variation), Audit Logs (accountability), and AI Services (provider-independent intelligence). A second group carries the *core marketplace and learning flow* — Tutor and Tutor Verification and Student and Parent feed Booking, Scheduling, Calendar, and Live Sessions, which produce learning governed by Programs, Learning Plans, Assessments, and Homework. A third group provides *commerce* (Payments, Wallet, Subscription), *communication* (Notifications, Messaging), *insight* (Reports, Analytics), and *care and control* (Support, Administration). Every arrow between domains respects role-based authorization (Article IV), privacy (Article VI), and configurability (Article X). No domain hardcodes a country, currency, language, school system, or payment method (Article IX).

---

## CONSOLIDATED PENDING BUSINESS DECISIONS (BY THEME)

The following themes recur across domains and each requires authoritative business or legal ownership (Constitution Article XIV) before the corresponding domain rules are set. Several map directly to the Constitution's Open Questions Register (Article XVI). None is assumed anywhere in this document.

Marketplace commercial model — pricing, matching, cancellation/refund, who may book (Booking, Scheduling). Payment specifics — currencies, methods, commission/fee/payout, tax, financial regulation per jurisdiction (Payments, Wallet, Subscription). Identity & consent — authentication methods, session rules, and minor-consent obligations (Authentication, User Management). Relationship rules — guardianship, parental oversight scope, and who-may-contact-whom, especially regarding minors (Parent, Student, Messaging). Tutor trust — eligibility and verification requirements per jurisdiction (Tutor, Tutor Verification). Educational alignment — school systems, grading, accreditation per country (Programs, Assessments, Learning Plans). AI governance — usage, safety, and data-handling policies (AI Services). Localization scope — languages/locales beyond the launch three and formatting standards (Localization, Countries). Insight targets — KPI definitions and privacy-preserving analytics rules (Reports, Analytics). Governance catalogs — the full role/permission catalog and administrative action set (User Management, Administration). Accountability — auditable-event scope and retention periods per jurisdiction (Audit Logs). Care — support policies, service levels, and safeguarding escalation (Support). Session conduct — recording and attendance policy with minor-protection implications (Live Sessions).

---

## CLOSING PROVISION

This Business Domain Model defines the twenty-nine business domains of the Education Ecosystem Platform from a pure business-architecture perspective — their purposes, responsibilities, actors, business objects, relationships, boundaries, and expansion directions. It contains no implementation, no schema, and no user interface, and it invents no business rule or legal requirement, marking every unestablished rule as a Pending Business Decision in keeping with the Constitution. The domains are stable, bounded, and configurable by construction; the authoritative rules that will animate them are to be established by the appropriate owners and recorded in the Project Decision Log.

---

BUSINESS DOMAIN MODEL VERSION 1.0 COMPLETED
