# USER ROLES & PERMISSIONS

### The Authorization Model for the Education Ecosystem Platform

---

| Field | Value |
|---|---|
| **Document Title** | User Roles & Permissions |
| **Document Class** | Tier 1 — Governance Instrument (subordinate to the Constitution) |
| **Version** | 1.0 |
| **Status** | Ratified — Active |
| **Owner** | Lead System Architect & Product Owner |
| **Date of Ratification** | 2 July 2026 |
| **Governing Authority** | Project Constitution v1.0 (Tier 0) |
| **Companion Instruments** | Project Decision Log v1.0, Product Vision v1.0, Business Domain Model v1.0 (Tier 1) |
| **Constitutional Basis** | Articles IV, V, VI, IX, X, XIV, XVI |

---

## READER'S NOTE ON SCOPE AND SOURCING

This document defines the Platform's **business authorization model** — who the actors are, what they are responsible for, and the *boundaries* of what each is permitted to do. It is expressed entirely in business terms.

Consistent with Constitution Article VIII and the task under which it is created, this document contains **no implementation, no API description, and no database structure.** Permissions are stated as *business capabilities* ("may view a linked student's progress"), never as technical mechanisms.

Consistent with Constitution Article IX (Anti-Assumption Mandate), this document **invents no business rule and no legal requirement.** It establishes the *roles and the shape of their authority*; wherever a specific permission depends on a business or legal rule that has not been authoritatively established (Constitution Article XIV) — most often rules concerning minors, guardianship, money, and per-jurisdiction obligations — that specific grant is marked **"Pending Business Decision"** and, where relevant, cross-referenced to the Constitution's Open Questions Register (Article XVI).

**A note on authority for this document:** The Constitution recorded the *complete authoritative role and permission catalog* as an open item (Article XVI). This document, ratified under the Product Owner's authority, establishes the **foundational role set and the authorization framework**. It therefore partially resolves that open item at the framework level. It does **not** close it entirely: the detailed permission grants that depend on unestablished business/legal rules remain open and are flagged throughout. Each such resolution will be recorded as a decision in the Project Decision Log (category GOV or SEC) when authoritatively made.

---

## 1. ALL SYSTEM ROLES

**1.1** The Platform recognizes two families of roles: **actor roles** (the people the Platform serves) and **operational roles** (those who run and govern the Platform). All roles derive from, and specialize, the account concept owned by the User Management domain (Business Domain Model §2), and all rest on the role-based principle of Constitution Article IV.

**1.2 The Foundational Role Set (established by this document):**

| Role | Family | Corresponding Domain(s) |
|---|---|---|
| **Super Admin** | Operational | Administration |
| **Admin (Administrator)** | Operational | Administration |
| **Moderator** | Operational | Messaging, Support, CMS (oversight) |
| **Finance** | Operational | Payments, Wallet, Subscription |
| **Support (Agent)** | Operational | Support |
| **Tutor** | Actor | Tutor, Tutor Verification |
| **Parent / Guardian** | Actor | Parent |
| **Student** | Actor | Student |

**1.3** This set is **foundational, not final.** The role model is explicitly designed to accommodate additional roles and sub-roles without redesign (Constitution Article 4.2; Business Domain Model §2 and §27). The strategy for defining further roles is Section 14. The authoritative *full* catalog remains partly open (see Reader's Note).

**1.4 Guiding Constraint.** No role exists implicitly, and no capability is granted by omission. Every role and every permission is explicit, deliberate, and auditable (Constitution Article 4.3).

---

## 2. RESPONSIBILITIES OF EACH ROLE

Responsibilities describe *what a role is accountable for*. They are distinct from permissions (Section 3+), which describe *what a role is allowed to do*.

- **Super Admin** — Ultimate stewardship of the Platform's integrity, security, and governance. Accountable for the correct configuration of the authorization model itself and for the highest-sensitivity operations.
- **Admin** — Day-to-day operational governance of the Platform within a defined scope: configuration, oversight, and management of domains and accounts, excluding the most sensitive Super Admin reserved actions.
- **Moderator** — Safeguarding the health and safety of interactions and content: moderation of messaging, content, and conduct, with particular attention to the protection of minors.
- **Finance** — Stewardship of the Platform's commercial and monetary operations: oversight of payments, balances, subscriptions, and financial correctness, within strict boundaries.
- **Support** — Helping actors resolve problems: handling support cases and assisting users, within permitted and privacy-respecting bounds.
- **Tutor** — Delivering teaching: offering services, teaching students, and managing their own professional presence and obligations on the Platform.
- **Parent / Guardian** — Overseeing and supporting a linked student's learning: staying informed and involved within the bounds of their guardianship relationship.
- **Student** — Learning: participating in tutoring, programs, plans, assessments, and homework, and managing their own learning experience.

---

## 3. PERMISSION BOUNDARIES

**3.1 Principle of the Boundary.** Every role operates within an explicit permission boundary. A boundary defines both what is *granted* and, by exclusion, what is *denied*. The default state of any capability not explicitly granted is **denied** (deny-by-default; Section 15.4).

**3.2 Dimensions of a Boundary.** A permission boundary is scoped along these business dimensions:

- **Capability** — the action itself (view, create, modify, approve, etc., expressed as business capabilities).
- **Subject** — whose information or resource the action touches (one's own, a linked party's, or others').
- **Scope** — the breadth of application (self, a relationship, a country/jurisdiction, or platform-wide).
- **Conditions** — any rule-based conditions on the grant (many of which are Pending Business Decision).

**3.3 The Self / Relationship / Global Gradient.** Most actor-role permissions are bounded to **self** (a student's own learning) or to a **relationship** (a parent's linked student; a tutor's engaged students). Operational-role permissions extend to broader **scope** but are constrained by purpose and least privilege (Section 15). No role receives global reach except where explicitly and deliberately granted (Super Admin, and Admin within its configured scope).

**3.4 Minor-Sensitive Boundaries.** Any permission that touches a student who is a minor is subject to the heightened protections of Constitution Article VI. The *specific* conditions on such permissions — consent, guardian authority, supervision, contactability — are **Pending Business Decision / legal** (Constitution Articles VI, XIV; Open Questions Register).

---

## 4. ROLE HIERARCHY

**4.1** Roles are organized into a hierarchy of *operational authority*. Higher operational roles have broader governance reach; actor roles sit outside the operational chain and are peers to one another, each bounded to their own sphere.

```
Operational authority (descending):

  Super Admin
      │
     Admin
      │
   ┌──┴───────────────┬──────────────┐
Moderator          Finance         Support
(conduct/          (commerce)      (care)
 content/safety)

Actor roles (peers, each bounded to own sphere):

  Tutor      Parent/Guardian      Student
```

**4.2 Interpretation.** The hierarchy expresses *authority and oversight*, not superiority of person. A higher operational role may govern the *scope* of a lower one; it does not automatically absorb every specialized capability of the lower one (see inheritance rules, Section 5).

**4.3 Actor Roles Are Not Subordinate.** Students, parents, and tutors are not "below" support or finance in a permission sense; they are in a different plane. Operational roles may *act upon* actor accounts only within explicit, purpose-bound, auditable permissions (Constitution Articles IV, VI).

**4.4 Relationship-Derived Authority.** Some authority flows from *relationships* rather than the operational hierarchy — most importantly a Parent/Guardian's oversight of a linked Student. The existence of this authority is established; its exact rules are Pending Business Decision (Section 8).

---

## 5. ROLE INHERITANCE RULES

**5.1 Additive, Bounded Inheritance.** Where inheritance applies, it is **additive** (a role may include the permissions of a role it encompasses) and **bounded** (inheritance never crosses a family boundary or a sensitivity gate implicitly).

**5.2 Operational Inheritance.**

- **Super Admin** encompasses the governance reach of **Admin**, plus reserved high-sensitivity capabilities that Admin does not hold.
- **Admin** may exercise oversight over the scopes of **Moderator, Finance, and Support**, but does **not** automatically inherit their *specialist* capabilities. Specialist capabilities (e.g., executing a financial payout, or a moderation action) are granted deliberately, not absorbed by default. This preserves separation of duties (Section 16.5).
- **Moderator, Finance, Support** do **not** inherit from one another. They are siblings with distinct, non-overlapping specialist boundaries.

**5.3 Actor Roles Do Not Inherit Operational Permissions.** No actor role (Student, Parent, Tutor) inherits any operational permission. Ever.

**5.4 No Implicit Escalation.** Inheritance never results in a role silently gaining a capability. Any inherited capability must be traceable to an explicit rule in this document or a logged decision. Combined roles (a person holding two roles) hold the *union* of their explicit permissions, never an emergent third set.

**5.5 Separation-of-Duties Override.** Where separation of duties requires it, inheritance is explicitly broken: a role may be denied a capability even though a role it otherwise encompasses holds it (for example, high-sensitivity financial and security actions may be reserved and require distinct roles). Specific separation-of-duties rules are **Pending Business Decision** (Section 16.5).

---

## 6. ADMINISTRATIVE PERMISSIONS

*(Admin role; see Super Admin in Section 13 for reserved capabilities.)*

**6.1 Granted (Boundary).** Within a configured administrative scope (which may be platform-wide or limited, e.g., by country per Constitution Article II), the Admin role may:

- Oversee and manage accounts and their roles, within permitted bounds and subject to separation-of-duties limits (User Management domain).
- Govern configuration and settings for its scope (Settings, Countries, Localization domains) — operationalizing Constitution Article X.
- Oversee operational domains within scope (Booking, Programs, Content, etc.) at a governance level.
- View operational reports and analytics appropriate to its scope (Reports, Analytics), subject to privacy constraints.
- Initiate and oversee moderation, support, and finance *governance* — while specialist execution remains with the respective roles (Section 5.2).

**6.2 Denied (Boundary).** The Admin role does **not** by default:

- Hold Super Admin reserved capabilities (Section 13).
- Execute specialist financial actions, moderation actions, or support resolutions reserved to Finance, Moderator, or Support unless explicitly also granted those roles.
- Access minor-sensitive information beyond what purpose and law permit (Pending Business Decision / legal).

**6.3 Pending Business Decision.** The precise administrative scope model (notably per-country and institutional/delegated administration), the exact list of administrative actions, and the boundary between Admin and Super Admin reserved actions are **Pending Business Decision** (Constitution Articles IV, XIV; role-catalog Open Question).

---

## 7. STUDENT PERMISSIONS

**7.1 Granted (Boundary — Self-Scoped).** The Student role may, for **their own** learning:

- Access and manage their own profile and learning context (Student domain).
- Participate in bookings, sessions, programs, learning plans, assessments, and homework in which they are enrolled (Engagement and Learning domains).
- Use the AI learning assistant within governed bounds (AI Services domain).
- Communicate within permitted, safety-bounded channels (Messaging domain).
- View their own reports and progress (Reports domain).
- Manage their own preferences (Settings, Localization, Notifications domains).

**7.2 Denied (Boundary).** The Student role may **not**:

- Access another person's information or learning, except where a legitimate shared context exists (e.g., a group session), and then only as permitted.
- Perform any operational or administrative action.
- Access financial operations beyond what their own participation legitimately requires (Pending Business Decision as to who transacts).

**7.3 Minor Condition.** Where the student is a minor, self-scoped permissions are subject to guardian oversight and safeguarding rules that are **Pending Business Decision / legal** (Constitution Article VI; Open Questions Register). For example, the extent of a minor's independent messaging or independent transacting is not assumed here.

---

## 8. PARENT PERMISSIONS

**8.1 Granted (Boundary — Relationship-Scoped).** The Parent/Guardian role may, **for a linked student and within the bounds of the guardianship relationship**:

- Access and manage their own parent profile (Parent domain).
- View the linked student's progress, reports, schedule, and learning activity, to the extent the oversight relationship permits (Reports, Calendar, Learning domains).
- Stay informed via notifications and permitted communication regarding the linked student (Notifications, Messaging domains).
- Participate in commercial responsibility where the parent is the paying party (Payments, Subscription domains) — subject to Pending Business Decision on who pays.
- Exercise consent and oversight functions on behalf of a minor, where required.

**8.2 Denied (Boundary).** The Parent role may **not**:

- Access students to whom they are not linked.
- Access another parent's information.
- Perform operational or administrative actions.
- Exceed the defined scope of oversight (which is itself Pending Business Decision).

**8.3 Pending Business Decision / Legal.** The **scope and rules of parental oversight** — what a guardian may see and do regarding a minor versus an older student, how guardianship is established, consent authority, multiple-guardian arrangements, and payment responsibility — are **Pending Business Decision / legal** (Constitution Article VI; Business Domain Model §4; Open Questions Register on parent–student–tutor relationship rules). This document establishes that the relationship *confers bounded oversight authority*; it does not assume the boundary's exact contents.

---

## 9. TUTOR PERMISSIONS

**9.1 Granted (Boundary — Self and Engagement-Scoped).** Subject to holding valid verification/eligibility (Tutor Verification domain), the Tutor role may:

- Manage their own professional profile, offerings, and availability intent (Tutor domain).
- Participate in bookings and scheduling for their own services (Booking, Scheduling, Calendar domains).
- Deliver live sessions to engaged students (Live Sessions domain).
- Author and manage teaching within their engagements — programs, plans, assessments, and homework for their students (Learning domains), to the extent granted.
- Communicate with engaged students and their guardians within safety-bounded channels (Messaging domain).
- View reports and analytics about their own activity and their engaged students, subject to privacy (Reports, Analytics domains).
- Access their own earnings/balance information (Wallet domain).

**9.2 Denied (Boundary).** The Tutor role may **not**:

- Offer or deliver services without valid verification/eligibility (gated by Tutor Verification).
- Access students, parents, or tutors with whom they have no engagement relationship.
- Perform operational or administrative actions.
- Access another tutor's earnings or private information.

**9.3 Minor & Contact Conditions.** A tutor's ability to communicate with, and the supervision required around, minor students is subject to safeguarding rules that are **Pending Business Decision / legal** (Constitution Article VI; Messaging domain). Eligibility, offering, earnings, and payout rules are **Pending Business Decision** (Constitution Article XIV; commercial Open Questions).

---

## 10. SUPPORT PERMISSIONS

**10.1 Granted (Boundary — Purpose-Bound).** The Support (Agent) role may, **strictly for the purpose of helping an actor resolve a problem**:

- Raise, triage, handle, and resolve support cases (Support domain).
- Access the context necessary to assist an actor — bounded to what the specific case legitimately requires (least privilege, Section 15.3).
- Communicate with the actor being helped within permitted channels (Messaging domain).
- Perform limited, permitted assistive actions on an actor's behalf where authorized, with the actor's account clearly attributed and the action audited.

**10.2 Denied (Boundary).** The Support role may **not**:

- Access actor information beyond what the case at hand requires ("just-enough" access; broad browsing is denied).
- Execute financial actions reserved to Finance, or moderation actions reserved to Moderator, unless separately granted.
- Perform administrative governance reserved to Admin/Super Admin.
- Access minor-sensitive information beyond purpose and law (Pending Business Decision / legal).

**10.3 Pending Business Decision.** The exact scope of "case-necessary" access, permitted assistive actions, escalation authority (including safeguarding escalation for minors), and service-level obligations are **Pending Business Decision / legal** (Constitution Articles VI, XIV; Support domain).

---

## 11. FINANCE PERMISSIONS

**11.1 Granted (Boundary — Commerce-Bound).** The Finance role may, within the commercial domains and subject to strict separation of duties:

- Oversee payments, transactions, balances, and subscriptions (Payments, Wallet, Subscription domains).
- Access financial reports and analytics (Reports, Analytics domains), subject to privacy.
- Perform permitted financial operations (e.g., overseeing settlements, refunds, payouts) within defined limits and controls.
- Support financial correctness, reconciliation, and compliance activities.

**11.2 Denied (Boundary).** The Finance role may **not**:

- Access learning content, teaching, or personal learning information beyond what a financial purpose legitimately requires.
- Perform moderation, support-case, or administrative-governance actions reserved to other roles.
- Execute the highest-sensitivity financial actions without the controls and separation of duties defined for them (Pending Business Decision).

**11.3 Pending Business Decision / Legal.** All *specific* financial rules — what financial actions exist, their approval thresholds and dual-control requirements, refund/payout/commission authority, and per-jurisdiction financial-regulatory constraints — are **Pending Business Decision / legal** (Constitution Articles IX, X, XIV; commercial and legal Open Questions). This role's *existence and boundary shape* are established; its detailed powers are not assumed.

---

## 12. MODERATOR PERMISSIONS

**12.1 Granted (Boundary — Safety-Bound).** The Moderator role may, for the purpose of protecting the health and safety of interactions and content:

- Moderate messaging and person-to-person interactions within policy (Messaging domain).
- Moderate content within policy (CMS domain).
- Review and act on reported conduct, with particular attention to the protection of minors (Constitution Article VI).
- Escalate safeguarding concerns through defined channels.

**12.2 Denied (Boundary).** The Moderator role may **not**:

- Access financial operations (Finance), administrative governance (Admin/Super Admin), or support-case resolution (Support) unless separately granted.
- Access personal information beyond what a moderation purpose legitimately requires (least privilege).

**12.3 Pending Business Decision / Legal.** Moderation policies, permitted moderation actions, content and conduct standards, and safeguarding-escalation procedures for minors are **Pending Business Decision / legal** (Constitution Article VI; Messaging, CMS, Support domains). The role and its safety purpose are established; the policy content is not assumed.

---

## 13. SUPER ADMIN PERMISSIONS

**13.1 Nature.** Super Admin is the role of **ultimate stewardship**. It exists to govern the Platform's integrity, security, and the authorization model itself. It is the most powerful and therefore the most tightly controlled role.

**13.2 Granted (Boundary — Reserved & Highest-Sensitivity).** The Super Admin role may:

- Exercise all Admin governance reach (Section 6), plus reserved capabilities Admin lacks.
- Govern the authorization model — the definition and assignment of roles and permissions themselves — subject to audit (User Management, Administration, Settings domains).
- Perform the highest-sensitivity operational and security actions, under the strongest controls.
- Configure platform-wide and cross-country governance where appropriate.

**13.3 Constraints (Even on Super Admin).** Constitutionally, no role is above accountability. Super Admin is:

- **Always audited** — every Super Admin action is recorded in Audit Logs (Constitution Articles 6.5; Business Domain Model §28). There is no unaudited power.
- **Bound by law** — Super Admin does not confer the right to violate legal obligations, including those protecting minors and personal data (Constitution Article VI).
- **Subject to separation of duties** — the most sensitive actions may require additional controls even for Super Admin (Pending Business Decision, Section 16.5).
- **Minimized in number** — the population of Super Admins is kept as small as possible (least privilege at the role level).

**13.4 Pending Business Decision.** The exact set of reserved Super Admin capabilities, the controls around them, and the minimum-control requirements (e.g., dual authorization for the most sensitive actions) are **Pending Business Decision** (Constitution Articles IV, VI, XIV).

---

## 14. FUTURE CUSTOM ROLES STRATEGY

**14.1 Extensibility by Design.** The role model is built to grow. New roles and sub-roles may be introduced without redesign (Constitution Article 4.2; Business Domain Model §2, §27). The foundational set (Section 1) is a starting point, not a ceiling.

**14.2 How a New Role Comes into Being.** A future role is defined by composing existing, explicit permissions within the established framework — never by inventing implicit power. Each new role must specify: its purpose and responsibilities; its explicit permission boundary (capability, subject, scope, conditions); its place in the hierarchy and any inheritance; and its separation-of-duties constraints.

**14.3 Governance of New Roles.** Introducing or materially changing a role is a governance decision recorded in the Project Decision Log (category GOV or SEC), resting on authoritative ownership (Constitution Article XIV; PDL Sections 3, 8). Roles are never created ad hoc or silently.

**14.4 Anticipated Directions (not yet defined).** Institutional/tenant-scoped roles (for enterprise customers), delegated administration roles, country-scoped operational roles, and finer specialist sub-roles are anticipated as the Platform expands (Constitution Article II). Their definitions are **Pending Business Decision**.

**14.5 Configurability.** Consistent with Constitution Article X, the *capacity* to define roles and assign permissions is a governed, configurable capability of the Platform — while the *authoritative role definitions* remain governed decisions, not free-form runtime invention.

---

## 15. RBAC PRINCIPLES

The Platform's authorization is **Role-Based Access Control**, governed by the following principles (Constitution Articles IV, V, VI):

**15.1 Roles Mediate Access.** Actors are granted permissions through roles, not individually and arbitrarily. This keeps authorization comprehensible, consistent, and auditable.

**15.2 Explicit Grants Only.** Every permission is explicitly defined. Nothing is granted by implication or omission (Constitution Article 4.3).

**15.3 Least Privilege.** Each role holds the minimum permissions necessary for its responsibilities, and no more. Access is "just enough" for the purpose at hand (notably for Support, Moderator, Finance).

**15.4 Deny by Default.** Any capability not explicitly granted is denied. The safe default is always "no."

**15.5 Separation of Duties.** Sensitive capabilities are distributed across roles so that no single role can both perform and unaccountably conceal a high-risk action. Specific separation rules are Pending Business Decision (Section 16.5).

**15.6 Scope-Bounded Authority.** Permissions are bounded by scope — self, relationship, country/jurisdiction, or platform — reflecting the multi-country nature of the Platform (Constitution Article II).

**15.7 Auditability.** Every authorization-relevant action and every role/permission change is auditable (Constitution Article 6.5; Business Domain Model §28).

**15.8 Central Reasoning.** Authorization is reasoned about centrally and consistently across all domains; it is not re-invented per feature (Constitution Article 4.3).

**15.9 Configurable, Governed Variation.** Role and permission variation (including per-country) is configuration, but governed configuration — validated, versioned, and decision-backed (Constitution Article X; PDL).

---

## 16. SECURITY PRINCIPLES FOR AUTHORIZATION

Authorization is a security function and is held to the Constitution's security-first standard (Article 5.9, Article VI):

**16.1 Security-First Authorization.** Authorization boundaries are a design input, not an afterthought. Every capability is designed with "who may do this, and how is that enforced and recorded" answered.

**16.2 Protection of Minors Is Paramount.** Any permission touching a minor is subject to the highest applicable protection. Where the governing rule is not yet established, the safe default (deny / require guardian authority) is assumed until an authoritative rule says otherwise (Constitution Article VI; deny-by-default, 15.4). This is the one place where the absence of a rule resolves toward *more* restriction, never less.

**16.3 Privacy by Default.** Authorization enforces data minimization: a role sees only what its purpose requires (Constitution Article 6.3; least privilege, 15.3).

**16.4 No Privilege Escalation.** The model must make silent privilege escalation impossible: inheritance is bounded (Section 5), grants are explicit (15.2), and combined roles yield only the union of explicit permissions (5.4).

**16.5 Separation of Duties for High-Risk Actions.** High-risk actions (notably in Finance and Super Admin) are subject to separation of duties and, where warranted, dual control. The specific catalog of high-risk actions and their controls is **Pending Business Decision / security** (Constitution Articles VI, XIV).

**16.6 Full Accountability.** No role, including Super Admin, has unaudited power. Every sensitive action is attributable and recorded (Constitution Article 6.5).

**16.7 Consistency Across Jurisdictions.** The authorization model applies consistently across all countries, while honoring per-jurisdiction legal constraints as configurable variation once authoritatively established (Constitution Articles II, VI, XIV).

**16.8 Fail Safe.** In any ambiguity or failure, authorization fails closed (access denied), never open. Safety takes precedence over convenience (Constitution Articles 5.9, 8.1).

---

## CONSOLIDATED PENDING BUSINESS DECISIONS

Each item requires authoritative business or legal ownership (Constitution Article XIV) before the corresponding permission specifics are finalized; several map to the Constitution's Open Questions Register (Article XVI). Until resolved, minor-sensitive matters default to the most restrictive safe interpretation (Section 16.2).

Guardianship & minor rules — scope of parental oversight, consent authority, minor independence limits, safeguarding escalation (§7.3, §8.3, §10.3, §12.3). Contact rules — who may communicate with a minor and under what supervision (§9.3). Financial authority — specific financial actions, thresholds, dual-control, refund/payout/commission authority, per-jurisdiction constraints (§11.3). Moderation policy — permitted moderation actions and content/conduct standards (§12.3). Administrative model — per-country and institutional/delegated administration, the exact Admin action set, and the Admin↔Super Admin reserved boundary (§6.3, §13.4). Separation of duties — the catalog of high-risk actions and their controls (§5.5, §16.5). Custom roles — institutional, delegated, and country-scoped role definitions (§14.4). Payment responsibility — who transacts on behalf of a student (§7.2, §8.1). Full role/permission catalog — remaining detail beyond this framework (Reader's Note; Constitution Art. XVI).

---

## CLOSING PROVISION

This User Roles & Permissions document establishes the Platform's business authorization model: its foundational roles, their responsibilities, the shape and boundaries of their authority, the hierarchy and inheritance among them, and the RBAC and security principles that govern them all. It contains no implementation, no API, and no database structure, and it invents no business or legal rule — establishing the *framework and role set* while marking every rule-dependent permission as a Pending Business Decision, with minor-sensitive matters defaulting to the safest interpretation. The framework is stable and extensible; the detailed grants that depend on authoritative business and legal decisions will be recorded in the Project Decision Log as they are made.

---

USER ROLES & PERMISSIONS VERSION 1.0 COMPLETED
