# PROJECT DECISION LOG (PDL)

### The Permanent Record of Governed Decisions for the Education Ecosystem Platform

---

| Field | Value |
|---|---|
| **Document Title** | Project Decision Log |
| **Document Class** | Tier 1 — Governance Instrument (subordinate to the Constitution) |
| **Version** | 1.0 |
| **Status** | Ratified — Active |
| **Owner** | Lead System Architect & Product Owner |
| **Date of Ratification** | 2 July 2026 |
| **Governing Authority** | Project Constitution v1.0 (Tier 0) |
| **Constitutional Basis** | Articles 0, XIII, XIV, XV, XVI, XVII |
| **Review Cadence** | Continuous (per Article 9 of this document) |

---

## 1. PURPOSE

**1.1** The Project Decision Log (hereafter, "the PDL" or "the Log") is the single, permanent, authoritative record of every significant decision made throughout the life of the Education Ecosystem Platform (hereafter, "the Platform").

**1.2** The PDL exists to satisfy the Constitution's requirement that every significant decision be documented with its context, options, decision, and rationale (Constitution Article 8.7 and Article XIII). It is the operational instrument through which that constitutional duty is discharged.

**1.3** The purposes of the PDL are:

- To preserve **why** every decision was made, not merely what was decided.
- To provide a durable, discoverable, and auditable history that outlives any individual conversation, contributor, or phase of the project.
- To prevent re-litigation of settled questions and to make deliberate reversal possible when circumstances genuinely change.
- To surface the relationships and dependencies between decisions.
- To serve as the reference against which the Platform's implementation is checked for compliance.

**1.4** This document is a **template and framework only.** In accordance with the task under which it is created, and consistent with Constitution Article IX (Anti-Assumption Mandate), **no project decisions are invented, recorded, or implied herein.** It defines exclusively the structure, rules, and governance that all future decision entries must follow.

---

## 2. SCOPE

**2.1 In Scope.** The PDL records every decision that is *significant* to the Platform. A decision is significant when it meets any one of the following tests:

- It establishes or changes an architectural principle, boundary, contract, or pattern.
- It establishes or changes a product capability, behavior, or scope.
- It records a business rule that has been authoritatively established by a business owner (Constitution Article XIV).
- It records a legal, regulatory, or compliance requirement that has been authoritatively established by a legal source (Constitution Article XIV).
- It selects, replaces, or removes a technology, provider, standard, or approach.
- It resolves an item in the Constitution's Open Questions Register (Constitution Article XVI).
- It has consequences that are costly, risky, or difficult to reverse.
- It creates a dependency that other decisions or work will rely upon.

**2.2 Out of Scope.** The PDL does not record trivial, purely local, or freely reversible choices that carry no cross-cutting consequence (for example, an internal naming choice with no external contract). When in doubt, the bias is to **record**, consistent with the Constitution's preference for documented decisions.

**2.3 Relationship to Other Documents.**

- The PDL is **subordinate to the Constitution** and may never contradict it. A decision that would contradict the Constitution is invalid unless the Constitution is first amended under its Article XV (see Section 10 of this document).
- The PDL is **superior to** specifications, designs, plans, code, and configuration. Those artifacts must comply with approved decisions recorded here.
- A decision recorded in the PDL may itself require **authoritative source input** (business or legal) per Constitution Article XIV; the PDL records the decision and its source, but does not originate business or legal truth.

**2.4 No Assumptions.** Consistent with Constitution Article IX, the PDL never records an assumed business rule, legal requirement, country, currency, language, school system, or payment method. Any such item that is not yet authoritatively established remains in the Constitution's Open Questions Register and is recorded in the PDL only once it has been resolved by an authoritative source.

---

## 3. DECISION CATEGORIES

Every decision entry must be classified under exactly one primary category, and may carry additional secondary categories for cross-referencing. The categories are:

| Code | Category | Covers |
|---|---|---|
| **ARC** | Architectural | System structure, boundaries, modularity, contracts, patterns, non-functional principles (scalability, security, performance, etc.). |
| **PRD** | Product | Capabilities, scope, user-facing behavior, experience principles, portal/role scope. |
| **BUS** | Business | Business rules authoritatively established by a business owner (marketplace model, fees, relationships, eligibility, etc.). |
| **TEC** | Technical | Technology, tooling, providers, standards, libraries, infrastructure, and operational approaches. |
| **SEC** | Security & Privacy | Security posture, privacy, data protection, protection of minors, auditability. |
| **LEG** | Legal & Compliance | Legal, regulatory, and compliance requirements authoritatively established by a legal source, per jurisdiction. |
| **LOC** | Localization & Regional | Languages, locales, currencies, payment methods, educational/school systems, per-jurisdiction variation. |
| **AI** | Artificial Intelligence | AI capabilities, provider-independence measures, model governance, AI safety. |
| **OPS** | Operations | Deployment, observability, reliability, incident response, operational readiness. |
| **GOV** | Governance | Roles, permissions catalog, process, ownership, and changes to governance instruments (excluding the Constitution itself, which is amended under its own Article XV). |

**3.1** The category list may be extended only through a Change History entry to this document (Section 11) approved by the Owner. Categories are never silently added.

---

## 4. DECISION STATUS (LIFECYCLE)

**4.1** Every decision has exactly one current status, drawn from the following set:

| Status | Meaning |
|---|---|
| **Proposed** | The decision has been articulated and entered into the Log for consideration, but is not yet binding. It carries no authority over implementation. |
| **Approved** | The decision has been ratified by the required authority (Section 8) and is binding. Implementation and dependent decisions may rely on it. |
| **Deprecated** | The decision was previously Approved but has been superseded or retired. It remains in the Log permanently for historical record and must reference its successor (if any). It is no longer binding. |
| **Rejected** | The decision was Proposed but not adopted. It remains in the Log permanently to preserve the reasoning against re-litigation. It is not binding and was never implemented. |

**4.2 Permitted Transitions.**

- Proposed → Approved
- Proposed → Rejected
- Approved → Deprecated
- Rejected → Proposed (only via a **new** proposal that explicitly references the earlier rejection; the original Rejected entry is never reopened in place)

**4.3 Forbidden Transitions.** No entry may move directly from Approved back to Proposed, from Deprecated back to Approved, or from Rejected to Approved. A change of direction after approval or rejection is expressed by creating a **new decision** that supersedes or reverses the old one (see Section 10), never by rewriting history.

**4.4** Every status change must be timestamped, attributed, and accompanied by a reason, recorded in the entry's Change History (Section 6, field 6.16, and Section 11).

---

## 5. DECISION NUMBERING SYSTEM

**5.1 Format.** Every decision receives a permanent, immutable identifier of the form:

```
PDL-<CATEGORY>-<NNNN>
```

- `PDL` is the fixed prefix.
- `<CATEGORY>` is the three-letter primary category code from Section 3 (e.g., ARC, BUS, LEG).
- `<NNNN>` is a zero-padded sequence number, at least four digits, assigned in ascending order **within** that category, starting at `0001`.

**5.2 Examples of the form** (illustrative of format only — these are **not** decisions and record nothing): `PDL-ARC-0001`, `PDL-LEG-0007`, `PDL-LOC-0042`.

**5.3 Immutability of Identifiers.** Once assigned, an identifier is permanent. It is never reused, never renumbered, and never deleted — even if the decision is later Rejected or Deprecated. Gaps are acceptable and expected; they are never backfilled.

**5.4 Sequence Integrity.** Numbers are assigned strictly in the order decisions enter the Log within each category. A Rejected proposal still consumes its number permanently.

**5.5 Supersession Linking.** When one decision supersedes another, the identifiers are cross-referenced in both entries (the old entry's "Superseded By" field and the new entry's "Supersedes" field), preserving a traceable chain.

**5.6 Cross-Cutting References.** A decision may reference the identifiers of related decisions, the Constitution article(s) it rests on, and the Open Questions Register item(s) it resolves.

---

## 6. REQUIRED FIELDS FOR EVERY DECISION

Every decision entry, regardless of category or status, **must** contain all of the following fields. An entry missing any required field is incomplete and cannot attain Approved status.

| # | Field | Description |
|---|---|---|
| 6.1 | **Decision ID** | The permanent identifier (Section 5). Immutable. |
| 6.2 | **Title** | A concise, specific statement of the decision. |
| 6.3 | **Primary Category** | One category code (Section 3). |
| 6.4 | **Secondary Categories** | Zero or more additional category codes for cross-referencing. |
| 6.5 | **Status** | Current lifecycle status (Section 4). |
| 6.6 | **Date Proposed** | Date the entry was first recorded. |
| 6.7 | **Date of Last Status Change** | Date the current status took effect. |
| 6.8 | **Proposer** | Who proposed the decision. |
| 6.9 | **Approver / Decider** | Who holds authority for this decision and, once decided, who approved or rejected it (Section 8). |
| 6.10 | **Authoritative Source** | For BUS and LEG decisions (and any decision resting on external truth): the authoritative business owner or legal source per Constitution Article XIV. Marked "N/A" only where genuinely inapplicable. |
| 6.11 | **Context / Problem Statement** | The situation, need, or question that prompted the decision. |
| 6.12 | **Options Considered** | The alternatives evaluated, each with its salient trade-offs. At least the chosen option and the leading rejected alternative(s) must be stated. |
| 6.13 | **Decision** | The precise decision made. |
| 6.14 | **Rationale** | Why this option was chosen over the alternatives. |
| 6.15 | **Consequences & Trade-offs** | The expected effects — positive and negative — including any risk, cost, or reversibility considerations. |
| 6.16 | **Constitutional Alignment** | The Constitution article(s) the decision rests on, and an explicit statement that the decision does not conflict with the Constitution. If a conflict exists, the Conflict Protocol (Section 10.4) applies and the entry cannot be Approved until resolved. |
| 6.17 | **Resolves Open Question(s)** | The Open Questions Register item(s) from Constitution Article XVI that this decision resolves, if any. |
| 6.18 | **Related Decisions** | Identifiers of related, dependent, or referenced decisions. |
| 6.19 | **Supersedes** | Identifier(s) of any decision this one replaces (if applicable). |
| 6.20 | **Superseded By** | Identifier of the decision that replaces this one (populated only when Deprecated). |
| 6.21 | **Change History** | The append-only record of every change to this entry (Section 11). |

**6.22** Fields may be added to this required set only via a Change History entry to this document approved by the Owner. Fields are never silently removed.

---

## 7. CHANGE HISTORY POLICY

**7.1 Append-Only.** The PDL is append-only. Historical content is never destroyed. Decisions are not deleted, and prior states are not overwritten.

**7.2 Per-Entry Change History.** Every decision entry carries its own Change History (field 6.21): a chronological, append-only list in which each line records the date, the actor, the nature of the change (e.g., created, status change, correction, supersession link added), and the reason.

**7.3 Document-Level Change History.** This PDL document itself carries a Change History (Section 11) recording every change to the framework — new categories, new required fields, process changes, and version increments.

**7.4 Corrections vs. Reversals.** A **correction** (fixing a typo, clarifying wording without changing meaning) is recorded as a Change History line on the existing entry. A **reversal or change of substance** is never a correction — it is expressed by a new decision that supersedes or rejects, per Section 10.

**7.5 Immutability of the Record.** No approved decision's substantive content (its Decision, Rationale, or Consequences as decided) is ever edited after approval. The record of what was decided, and why, at that time, is permanent.

---

## 8. OWNERSHIP

**8.1 Document Owner.** The Lead System Architect & Product Owner owns the PDL as a governance instrument: its structure, integrity, and enforcement. This ownership is permanent and standing, consistent with the Constitution's Preamble.

**8.2 Decision Authority.** Ownership of an *individual decision* — the authority to approve or reject it — depends on its category:

- **BUS** decisions require an authoritative business owner (Constitution Article XIV).
- **LEG** decisions require an authoritative legal source (Constitution Article XIV).
- **ARC, TEC, SEC, OPS, AI, GOV, PRD, LOC** decisions are owned by the Lead System Architect & Product Owner, who may require input from the relevant authority where the decision rests on business or legal truth.

**8.3 Unestablished Authority.** Where the authoritative business owner or legal source for a required decision has not yet been identified, that fact is itself an open item (already recorded in the Constitution's Open Questions Register) and the dependent decision cannot progress beyond Proposed until the authority is established. Authority is never assumed or self-appointed (Constitution Article XIV).

**8.4 Custodial Duty.** The Owner is responsible for ensuring every entry is complete, correctly numbered, correctly classified, constitutionally aligned, and properly linked before it attains Approved status.

---

## 9. REVIEW PROCESS

**9.1 Entry Review.** Before a Proposed decision may become Approved, it is reviewed for:

- Completeness of all required fields (Section 6).
- Correct category and identifier (Sections 3 and 5).
- Constitutional alignment, including the Conflict Protocol check (Section 6.16, Section 10.4).
- Presence of an authoritative source where required (Section 6.10, Section 8.2).
- Sound rationale and honest treatment of consequences and trade-offs.
- Correct linking to related, superseded, and Open-Question items.

**9.2 Approval.** A decision attains Approved status only when it passes review and is ratified by the required authority (Section 8.2). Approval is recorded as a status change with date, actor, and reason.

**9.3 Rejection.** A Proposed decision that is not adopted is set to Rejected, with the reason recorded. It remains permanently in the Log.

**9.4 Periodic Integrity Review.** The Owner periodically reviews the Log as a whole for internal consistency, unresolved dependencies, decisions rendered obsolete by change, and Open Questions newly resolvable. This review may generate new proposals (e.g., to deprecate and supersede) but never edits history.

**9.5 Verification Discipline.** Consistent with Constitution Article XI, review is a first-class step. A decision is not considered settled until it has passed review; an unreviewed proposal carries no authority.

---

## 10. RULES FOR MODIFYING PREVIOUS DECISIONS

**10.1 History Is Immutable.** A previously recorded decision is never rewritten, deleted, or silently altered. The Log preserves what was decided and why, permanently.

**10.2 Changing a Decision Means Superseding It.** To change the substance of an Approved decision, a **new** decision is created that:

- Receives its own new, permanent identifier (Section 5).
- States in its "Supersedes" field the identifier(s) it replaces.
- Explains in its Context and Rationale why the change is warranted.

The superseded decision is then set to **Deprecated**, with its "Superseded By" field pointing to the new decision, and a Change History line recording the supersession. The Deprecated entry remains in the Log forever.

**10.3 Reversing a Rejection.** A previously Rejected proposal is never reopened in place. If circumstances change, a new proposal is created that references the earlier Rejected identifier and argues afresh.

**10.4 Constitutional Conflicts (Conflict Protocol).** Consistent with Constitution Article XVII, if any proposed or existing decision is found to conflict with the Constitution, the conflict must be **stated explicitly**, identifying the specific Constitution article(s) in tension, **before** any dependent work proceeds. The conflict is then resolved by exactly one of two paths: (a) the decision is revised to comply, or (b) the Constitution is deliberately amended under its Article XV. A decision may never be Approved while in unresolved conflict with the Constitution, and quiet non-compliance is prohibited.

**10.5 No Silent Drift.** No specification, design, plan, code, or configuration may effectively change a decision by contradicting it in practice. Such a contradiction is a defect and must be resolved by bringing the artifact into compliance or by superseding the decision through this process.

**10.6 Corrections.** Purely non-substantive corrections (typographical or clarifying wording that does not change meaning) may be applied to an entry and recorded as a Change History line. If there is any doubt whether a change is substantive, it is treated as substantive and handled by supersession under 10.2.

---

## 11. DOCUMENT CHANGE HISTORY

This section is the append-only record of changes to the PDL framework itself. It does not record project decisions.

| Version | Date | Change | Reason | Actor |
|---|---|---|---|---|
| 1.0 | 2 July 2026 | Initial ratification of the Project Decision Log framework and template. No decisions recorded. | Establish the permanent decision-recording instrument required by Constitution Articles 8.7 and XIII. | Lead System Architect & Product Owner |

**11.1** Changes to categories (Section 3), required fields (Section 6), status set (Section 4), numbering (Section 5), or any rule herein are recorded in this table with a version increment, following the same discipline the Constitution applies to its own amendments (Constitution Article XV): a major increment for changes that alter binding rules, a minor increment for clarifications and additions that do not weaken existing rules.

---

## 12. DECISION ENTRY TEMPLATE

The following is the canonical template that every future decision entry must instantiate. It is presented here **empty**, as a form. It records no decision and asserts no fact. Placeholders in angle brackets are filled at the time a real decision is proposed.

```
Decision ID:              PDL-<CAT>-<NNNN>
Title:                    <concise, specific decision statement>
Primary Category:         <one of: ARC PRD BUS TEC SEC LEG LOC AI OPS GOV>
Secondary Categories:     <zero or more category codes, or "None">
Status:                   <Proposed | Approved | Deprecated | Rejected>
Date Proposed:            <YYYY-MM-DD>
Date of Last Status Change: <YYYY-MM-DD>
Proposer:                 <name / role>
Approver / Decider:       <name / role, per Section 8; or "Pending">
Authoritative Source:     <business owner / legal source per Constitution Art. XIV; or "N/A">

Context / Problem Statement:
    <why this decision is needed>

Options Considered:
    1. <option> — <trade-offs>
    2. <option> — <trade-offs>
    ...

Decision:
    <the precise decision>

Rationale:
    <why this option, over the alternatives>

Consequences & Trade-offs:
    <expected effects, risks, cost, reversibility>

Constitutional Alignment:
    <Constitution article(s) relied upon; explicit statement of no conflict,
     or invocation of the Conflict Protocol per Section 10.4>

Resolves Open Question(s):
    <Constitution Art. XVI item(s) resolved, or "None">

Related Decisions:        <IDs, or "None">
Supersedes:               <IDs, or "None">
Superseded By:            <ID, or "None">

Change History:
    <YYYY-MM-DD> — <actor> — <change> — <reason>
```

---

## CLOSING PROVISION

This Project Decision Log establishes the permanent framework under which every architectural, product, business, and technical decision for the Platform will be recorded, reviewed, and governed. It is subordinate to the Constitution and superior to all implementation artifacts. It contains, by design and by constitutional mandate, **no invented decision and no assumed business or legal truth** — only the structure that all future decisions must follow.

The first real decision entry will appear only when a decision is authoritatively proposed. Until then, this framework stands ready and empty.

---

PROJECT DECISION LOG TEMPLATE COMPLETED
