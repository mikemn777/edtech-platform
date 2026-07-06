# DATABASE MASTER ARCHITECTURE

### The Authoritative Data Architecture Blueprint for the Education Ecosystem Platform

---

| Field | Value |
|---|---|
| **Document Title** | Database Master Architecture |
| **Document Class** | Tier 1 — Governance Instrument (subordinate to the Constitution) |
| **Version** | 1.0 |
| **Status** | Ratified — Active |
| **Owner** | Lead System Architect & Product Owner |
| **Date of Ratification** | 2 July 2026 |
| **Governing Authority** | Project Constitution v1.0 (Tier 0) |
| **Companion Instruments** | Decision Log, Product Vision, Business Domain Model, Roles & Permissions, Product Requirements, System Architecture Master Document (Tier 1) |
| **Constitutional Basis** | Articles II, III, V, VI, VIII, IX, X, XI, XII, XIV |

---

## READER'S NOTE ON SCOPE, SOURCING, AND DEFERRALS

This document defines the Platform's **data architecture** — the philosophy, standards, and strategies governing how data is structured, protected, and evolved. It is the data-layer counterpart to the System Architecture Master Document.

Per the task and Constitution Article VIII, this document contains **no tables, no schema definitions, and no SQL.** It defines *standards and strategies* — the rules every future data model must obey — not the models themselves. Concrete entities and schemas are downstream design artifacts, out of scope here.

It uses the two deferral markers established in the System Architecture Master Document:

- **Pending Business Decision (PBD)** — a business/legal rule (retention periods, residency obligations, financial rules) that only an authoritative owner may set (Constitution Art. IX, XIV). Data architecture ensures the structure *can accommodate* these; it never invents them.
- **Pending Technical Decision (PTD)** — a concrete technology selection (specific database engine(s), storage/replication technology, regional infrastructure). Selecting a data technology is a governed decision recorded in the Project Decision Log (category TEC). This document specifies the **required properties** a technology must satisfy and defers the product choice.

Consistent with the System Architecture Master Document (§4.2, Clean Architecture), the database is **infrastructure behind ports**: the domain does not depend on it. These standards therefore constrain persistence adapters and data design without leaking database concerns into business logic.

---

### 1. DATABASE PHILOSOPHY

**1.1 Data Serves the Domain.** The data architecture exists to faithfully persist the business domains (Business Domain Model), not to shape them. The domain model is authoritative; the data model reflects it. Persistence is infrastructure behind ports (System Architecture §4.2), never a dependency of business logic (Constitution Art. 8.6).

**1.2 Correctness and Integrity First.** Data is a long-lived asset of an enterprise-grade platform (Art. 5.16). Integrity, consistency, and durability take precedence over convenience (Art. VIII). Data is never knowingly left in an inconsistent state.

**1.3 Configurable, Never Hardcoded.** No country, currency, language, school system, or payment method is embedded as a fixed value in the data architecture; all are represented as configurable, referenceable data (Constitution Art. IX, X).

**1.4 Security and Privacy by Default.** Data is protected by default, minimized, and given the highest applicable protection where it concerns minors (Art. VI). Privacy is a property of the data architecture, not an add-on.

**1.5 Evolvable Without Rework.** The data architecture is designed to evolve — new domains, countries, and languages — through additive, governed change, never destructive rewrites (Art. VIII; §22–23).

**1.6 Technology-Neutral by Design.** The philosophy is expressed independently of any specific engine. Whether relational, document, or a polyglot mix is used per boundary is a **PTD** (§25); these standards apply whatever the choice, adapted appropriately per store type.

---

### 2. DOMAIN SEPARATION

**2.1 Data Follows Service Boundaries.** Each service boundary (System Architecture §3) owns its data. No boundary reads or writes another boundary's data directly; data is shared only through contracts or events (Art. 5.2, 5.7). This is the data-layer expression of modularity.

**2.2 One Authoritative Home.** Every datum has exactly one authoritative owner (the domain that governs it). Other domains hold references or projections, never duplicate masters (Art. 8.4 — no duplicated logic/data mastership).

**2.3 No Shared Mutable Store Across Boundaries.** Boundaries do not couple through a shared mutable database. Cross-boundary consistency is achieved via events and eventual consistency (System Architecture §3.3), with explicit compensation.

**2.4 Projections and Read Models.** Where a domain needs another's data for reads, it maintains a governed projection fed by events, clearly marked as a non-authoritative copy.

**2.5 Rationale.** Domain-owned data prevents entanglement, enables independent scaling and evolution, and keeps boundaries honest (Art. 5.1, 5.2).

---

### 3. NAMING STANDARDS

*(Conventions only; no concrete tables are defined.)*

**3.1 Principles.** Names are consistent, explicit, unambiguous, and business-meaningful (Constitution Art. 5.3 maintainability). A competent engineer who did not author a data element should understand it from its name.

**3.2 Consistency Rules.** A single, uniform naming convention applies across all domains: consistent casing, consistent singular/plural policy for entities and collections, consistent terminology drawn from the Business Domain Model's vocabulary, and consistent naming for common concepts (identifiers, timestamps, status, references).

**3.3 Business Vocabulary.** Names use the domain's ubiquitous language (e.g., the concepts named in the Domain Model), not technical jargon or abbreviations that obscure meaning.

**3.4 Reserved Conventions.** Standard suffixes/prefixes are reserved for recurring concepts (e.g., identifier, created/updated timestamps, soft-delete marker, audit fields), applied uniformly so they are instantly recognizable.

**3.5 Localization of Names vs Data.** Structural names are in a single canonical language (for engineering clarity); user-facing *values* are localized through the Localization strategy (§11), never by translating structural names.

**3.6 Governance.** The concrete naming standard is ratified as a decision (PDL category TEC/ARC) and applied without exception; deviations are defects.

---

### 4. ENTITY STANDARDS

**4.1 Entities Reflect Business Concepts.** Each persisted entity corresponds to a business concept from the Domain Model ("Main Objects", e.g., Booking, Learning Plan, Ledger Entry). Entities are not invented for technical convenience without justification.

**4.2 Common Entity Attributes.** Every entity carries, by standard: a stable unique identifier (§6–7); creation and last-modified timestamps in an unambiguous time reference (§13); a soft-delete marker where applicable (§8); and audit linkage (§9). These are uniform across all domains.

**4.3 Cohesion.** An entity holds attributes that genuinely belong together (single responsibility at the data level). Unrelated concerns are separate entities.

**4.4 Configurable References.** Attributes representing country, language, currency, school system, or payment method are references to configurable reference data, never hardcoded literals (Art. IX, X).

**4.5 Sensitive Data Classification.** Every entity's attributes are classified by sensitivity (e.g., personal, financial, minor-related), driving encryption (§21), access control (§20), retention (§16), and residency (§10). Classification is mandatory, not optional.

**4.6 Governance.** Concrete entity definitions are downstream design artifacts; they must conform to these standards and, where they encode business rules, await the relevant PBD.

---

### 5. RELATIONSHIP STANDARDS

**5.1 Explicit, Meaningful Relationships.** Relationships between entities express real business relationships (e.g., guardianship linkage between Parent and Student — structure only; the *rules* are PBD/legal per Roles doc §8).

**5.2 Referential Integrity.** Relationships preserve referential integrity within a boundary. Across boundaries (where direct references are not permitted, §2.3), integrity is maintained by reference-plus-event patterns, not cross-store constraints.

**5.3 Cardinality and Optionality.** Cardinality (one-to-one, one-to-many, many-to-many) and optionality are modeled deliberately and documented; ambiguous relationships are not permitted.

**5.4 No Orphans.** The architecture prevents orphaned or dangling references through integrity rules (§24) and, across boundaries, through compensation on failure.

**5.5 Relationship Ownership.** Each relationship has a clear owning side within a boundary; cross-boundary relationships are represented as references to the authoritative owner (§2.2).

**5.6 Rationale.** Well-defined relationships are essential to correctness and to modeling the ecosystem's inherently relational actors (Domain Model §4).

---

### 6. PRIMARY KEY STRATEGY

**6.1 Stable, Unique, Immutable.** Every entity has a primary identifier that is unique, stable, and never reused or mutated over the entity's life (mirrors the Decision Log's immutable-ID discipline).

**6.2 Non-Semantic.** Primary identifiers carry no business meaning and encode no jurisdictional or sequential business information; business keys (if any) are separate attributes.

**6.3 Globally Safe.** Because the Platform is multi-country and distributed (Art. II; System Architecture §24), identifiers must be safe to generate across regions and services without collision — motivating the UUID strategy (§7).

**6.4 Consistency.** The primary-key approach is uniform across all domains for predictability and maintainability (Art. 5.3).

**6.5 Governance.** The concrete identifier format is ratified as a decision (PDL category TEC), consistent with §7.

---

### 7. UUID STRATEGY

**7.1 Globally Unique Identifiers by Default.** Entity identifiers are globally unique (UUID-style) so they can be generated independently across distributed services and regions without coordination or collision — essential for horizontal scale and multi-region operation (System Architecture §24, §6.4).

**7.2 Non-Guessable & Non-Enumerable.** Identifiers do not expose counts, order, or business information and are not trivially enumerable, supporting security and privacy (Art. VI; avoids leaking volume/enumeration).

**7.3 Uniform Application.** The identifier strategy is applied consistently to all entities (§6.4).

**7.4 Exposure Discipline.** Identifiers exposed through contracts (System Architecture §28) are the non-semantic identifiers; internal implementation details are never leaked.

**7.5 Concrete Format.** The specific UUID version/variant (and any performance-oriented ordering considerations) is a **PTD** (category TEC), chosen to balance uniqueness, index behavior, and non-enumerability.

---

### 8. SOFT DELETE STRATEGY

**8.1 Deletion Is Rarely Physical.** By default, records are **soft-deleted** (marked inactive/removed) rather than physically destroyed, preserving history, referential safety, and auditability (Art. 5.16, 6.5).

**8.2 Soft-Delete Marker.** A standard, uniform marker (with timestamp and actor attribution) indicates soft deletion; queries exclude soft-deleted records by default.

**8.3 Interaction with Privacy & Legal Erasure.** Soft delete does **not** override legal data-erasure obligations (e.g., a lawful deletion request). Where erasure is legally required, a governed hard-deletion/anonymization process applies. Which obligations require true erasure, and their timelines, are **PBD/legal** (Art. VI, XIV; Open Questions Register on retention). The architecture provides both soft-delete and governed hard-erasure/anonymization mechanisms.

**8.4 Minors.** Data concerning minors follows the strictest applicable retention/erasure rule; absent an authoritative rule, the most protective interpretation applies (Roles doc §16.2; Requirements BR-003).

**8.5 Archiving Relationship.** Soft delete is distinct from archiving (§16); soft-deleted data may later be archived or lawfully erased per policy.

---

### 9. AUDIT STRATEGY (DATA LEVEL)

**9.1 Change Traceability.** Significant data changes are traceable — who changed what, when, under what authority — feeding the Audit domain (Business Domain Model §28; System Architecture §20; Constitution Art. 6.5).

**9.2 Append-Only Audit Record.** Audit data is append-only and tamper-evident; it is never edited or deleted (mirrors the Decision Log and Audit domain disciplines). Audit storage is separate from operational data.

**9.3 Standard Audit Attributes.** Entities carry standard creation/modification attribution; sensitive and governance-relevant changes produce dedicated audit entries.

**9.4 Separation from Logging.** Data-level audit (accountability) is distinct from operational logging (§ System Architecture 21). Audit answers "who did what to this data".

**9.5 Deferred Specifics.** The catalog of audited data changes and audit retention periods per jurisdiction are **PBD/legal**; the concrete audit store is a **PTD**.

---

### 10. MULTI-COUNTRY DATA STRATEGY

**10.1 Jurisdiction-Aware Data.** Data is associated with jurisdiction context where relevant (System Architecture §6). Country is configurable reference data, never hardcoded (Art. IX, X).

**10.2 Data Residency & Sovereignty.** The architecture is capable of partitioning or locating data per jurisdiction to honor residency/sovereignty obligations (Art. 6.4). The **mechanism** (regional partitioning/segregation) is architectural; the **obligations per country** are PBD/legal; the **regional infrastructure** is a PTD.

**10.3 No Privileged Country.** No country is structurally privileged; onboarding a new country's data is a configuration activity, not a schema redesign (Art. 2.3).

**10.4 Cross-Border Handling.** Where data legitimately crosses borders (e.g., a cross-border tutoring engagement), handling respects the applicable residency and privacy rules (PBD/legal) and is auditable.

**10.5 Rationale.** Unbounded, compliant multi-country operation is constitutional (Art. II).

---

### 11. LOCALIZATION STRATEGY (DATA LEVEL)

**11.1 Separation of Structure and Language.** Structural data is language-neutral; localizable **values** (labels, content, descriptions) are stored so that unlimited languages can be represented without structural change (Art. 3.2; Localization domain §24).

**11.2 Translation Representation.** User-facing text supports multiple language representations per concept, with a defined fallback for missing translations (fallback policy PBD; graceful degradation required, Requirements EC-006).

**11.3 Locale vs Language vs Jurisdiction.** These are stored as distinct, combinable concepts (Art. 3.5); formatting is derived at presentation time, not baked into stored values.

**11.4 RTL/LTR Neutrality.** Stored content is direction-neutral; directionality is a locale property resolved on presentation (Art. 3.3).

**11.5 Content Localization.** CMS content (§23 domain) and interface text both localize through this strategy.

---

### 12. CURRENCY STRATEGY (DATA LEVEL)

**12.1 Currency-Explicit Money.** Monetary values are always stored with an explicit currency reference; currency is configurable reference data, never hardcoded (Art. IX, X; Payments domain §18).

**12.2 Precision & Correctness.** Monetary amounts are stored with a precision and representation that preserves financial correctness and avoids rounding errors (exact representation appropriate to money). The specific representation is a **PTD** guided by financial-correctness requirements.

**12.3 Separation of Concerns.** Storage separates: the amount, its currency, and (elsewhere) the rules for conversion/pricing/rounding. Conversion, pricing, fee, and rounding **rules** are PBD; the architecture ensures they have one authoritative application point (Payments), never scattered in data logic.

**12.4 Multi-Currency & History.** The architecture supports multi-currency data and preserves historical currency context (an amount's currency at the time it was recorded is immutable). Whether multi-currency balances are offered is PBD.

---

### 13. TIMEZONE STRATEGY (DATA LEVEL)

**13.1 Absolute Time Storage.** All timestamps are stored in an unambiguous, absolute time reference (e.g., a single canonical timezone/UTC-equivalent), never in an implicit local time (System Architecture §9).

**13.2 Context-Resolved Presentation.** Local time is derived at presentation from the actor's resolved time zone; the data layer does not assume any single country's zone.

**13.3 Temporal Correctness.** The architecture accounts for daylight-saving and locale calendar differences at presentation, keeping stored time canonical and correct.

**13.4 Consistency.** All time-bearing attributes follow this standard uniformly, enabling correct cross-zone scheduling and reporting (Scheduling §8, Calendar §9).

---

### 14. INDEXING STRATEGY

**14.1 Purpose.** Indexing supports performance-first operation (Art. 5.10) without compromising correctness or integrity.

**14.2 Principles.** Indexes are designed to serve known, high-value access patterns; they are justified by need, not added speculatively (avoiding unnecessary complexity, Art. 8.5). Index design balances read performance against write cost and storage.

**14.3 Identifier & Reference Indexing.** Primary identifiers and frequently-referenced relationships are indexed by standard; sensitive attributes are indexed only within privacy constraints.

**14.4 Measurement-Driven.** Indexing decisions are informed by measured access patterns (Art. XI) and evolve; performance targets are PBD, measured via Monitoring (System Architecture §22).

**14.5 Governance.** Significant indexing strategies are recorded as decisions (PDL category TEC). Concrete index definitions are downstream design, engine-dependent (PTD).

---

### 15. PARTITION STRATEGY

**15.1 Purpose.** Partitioning supports scalability (Art. 5.1), performance (Art. 5.10), and data residency (§10.2).

**15.2 Partition Dimensions.** Candidate partitioning dimensions include tenant/jurisdiction (aligning with residency and multi-country, §10) and time (for high-volume, time-series-like data such as audit/analytics). The chosen dimensions per data set are design decisions guided by access patterns and residency needs.

**15.3 Boundary Alignment.** Partitioning respects service-boundary data ownership (§2) and never couples boundaries.

**15.4 Deferred Specifics.** Concrete partitioning schemes and the engine's partitioning mechanism are **PTDs**; residency-driven partitioning obligations are PBD/legal.

---

### 16. ARCHIVING STRATEGY

**16.1 Purpose.** Move aged, low-access data to cost-appropriate storage while preserving it for compliance, audit, and analytics (Art. 5.16).

**16.2 Principles.** Archiving is governed by data classification (§4.5) and retention policy; archived data remains secure, encrypted, and residency-compliant; archival does not break auditability.

**16.3 Distinct from Deletion.** Archiving preserves data (relocated), soft delete marks it inactive (§8), and lawful erasure removes it (§8.3). The three are separate, governed processes.

**16.4 Deferred Specifics.** Retention/archival periods per data class and jurisdiction are **PBD/legal** (Open Questions Register); the archival storage technology is a **PTD**.

---

### 17. BACKUP STRATEGY

**17.1 Purpose.** Guarantee recoverability of data as an enterprise asset (Art. 5.16, XII; System Architecture §25).

**17.2 Principles.** Regular, automated backups; backups are encrypted (§21), access-controlled (§20), and residency-compliant (§10.2); backup integrity is verified (a backup that cannot be restored is not a backup); backups cover all authoritative data stores.

**17.3 Recovery Objectives.** Backups are designed to meet recovery-point objectives (RPO); concrete **RPO targets are PBD** (business risk tolerance); backup technology and regions are **PTDs**.

**17.4 Verification.** Backups are tested by restore rehearsals (§18), not assumed (Art. XI).

---

### 18. RESTORE STRATEGY

**18.1 Purpose.** Ensure data can be restored correctly and within objective timeframes after loss or disaster (System Architecture §25).

**18.2 Principles.** Documented, rehearsed restore procedures; restores preserve integrity and consistency; partial and full restore scenarios are considered; restores respect residency and security.

**18.3 Recovery Objectives.** Restore is designed to meet recovery-time objectives (RTO); concrete **RTO targets are PBD**.

**18.4 Verification.** Restore capability is regularly tested; an untested restore plan is treated as no plan (Art. XI). Restore drills feed the Disaster Recovery strategy (System Architecture §25).

---

### 19. PERFORMANCE STRATEGY (DATA LEVEL)

**19.1 Performance-First Data Access.** Data access is designed to meet per-capability performance targets (Art. 5.10; Requirements NFR-006). Degradation is a defect.

**19.2 Techniques.** Sound indexing (§14), partitioning (§15), appropriate caching at the application layer (System Architecture §14 — cache is never the source of truth), efficient access patterns, and separation of read models/projections (§2.4) where beneficial.

**19.3 Read/Write Considerations.** High-read and high-write concerns may be addressed with projections, read models, and partitioning; the specific approach per data set is a design decision informed by measurement.

**19.4 Measured, Not Assumed.** Performance is verified continuously (Art. XI) via Monitoring; targets are PBD.

---

### 20. SECURITY STRATEGY (DATA LEVEL)

**20.1 Security-First Data.** Data security is a design input (Art. 5.9, VI). Access to data is governed by the authorization model (Roles doc; System Architecture §12) — least privilege, deny-by-default.

**20.2 Access Control.** Data access is permissioned and, for sensitive/minor data, further restricted; direct data access outside governed paths is prohibited. Administrative/database-level access is minimized, controlled, and audited (no unaudited power, Roles doc §13.3).

**20.3 Classification-Driven Protection.** Protection is driven by data classification (§4.5): personal, financial, and minor-related data receive the strongest controls (Art. VI).

**20.4 Privacy by Default.** Data minimization is enforced at the data layer; only necessary data is stored, exposed, or copied (Art. 6.3).

**20.5 Auditability.** Sensitive data access and change are auditable (§9). Compliance obligations are PBD/legal — never assumed (Art. 6.6).

---

### 21. ENCRYPTION STRATEGY

**21.1 Encryption In Transit and At Rest.** Data is encrypted in transit and at rest by default (Art. 5.9, VI). This applies to primary stores, backups (§17), archives (§16), and caches holding sensitive data.

**21.2 Sensitive-Data Emphasis.** Personal, financial, and minor-related data receive strong encryption; the most sensitive attributes may receive additional field-level protection, driven by classification (§4.5).

**21.3 Key Management.** Encryption keys are managed through a dedicated, access-controlled mechanism, rotated per policy, and never embedded with the data they protect. The concrete key-management technology is a **PTD**; rotation/retention policies are governed decisions (PDL category SEC).

**21.4 Residency & Compliance.** Encryption supports, but does not replace, residency and compliance obligations (PBD/legal).

**21.5 Rationale.** Encryption is foundational to the Constitution's security-first, protect-minors posture (Art. VI).

---

### 22. DATABASE VERSIONING

**22.1 Versioned, Governed Evolution.** The data architecture evolves through **versioned, forward-only, governed changes**, mirroring the disciplined change philosophy of the Constitution (Art. VIII) and the append-only/supersession discipline of the Decision Log.

**22.2 Backward Compatibility.** Changes preserve compatibility wherever feasible; breaking changes are deliberate, versioned, and coordinated with contract/event versioning (System Architecture §29) so consumers are never broken silently.

**22.3 Traceability.** Every schema/version change is traceable to a recorded decision (PDL category TEC/ARC) and to its migration (§23).

**22.4 No Ad Hoc Changes.** Structural changes are never made ad hoc or manually outside the governed process; drift is a defect.

---

### 23. MIGRATION STRATEGY

**23.1 Controlled, Repeatable Migrations.** All structural and data migrations are controlled, versioned, repeatable, and reversible-where-feasible, executed through a governed process (never manual, error-prone steps — Art. XII; System Architecture §13 cloud-ready).

**23.2 Safety.** Migrations preserve integrity (§24) and data (no unintended loss); they are tested before application; large migrations are designed to avoid downtime where availability requires it (System Architecture §26).

**23.3 Forward Discipline & Rollback.** Migrations are forward-oriented; rollback/compensation is planned for failure scenarios. Destructive migrations require heightened governance and, for regulated/minor data, legal review (PBD/legal).

**23.4 Coordination.** Data migrations coordinate with contract/event versioning (§22.2) and are recorded as decisions (PDL). Migrations are verified (Art. XI).

---

### 24. DATA INTEGRITY RULES

**24.1 Integrity Is Non-Negotiable.** The data architecture enforces integrity as a first-class property (Art. VIII). Invalid or inconsistent data is prevented at the point of change (Requirements VR-001, VR-003).

**24.2 Within-Boundary Integrity.** Within a boundary, referential and constraint integrity are enforced by the store. Uniqueness, required attributes, valid references, and valid state transitions are guaranteed.

**24.3 Cross-Boundary Integrity.** Across boundaries (no shared store, §2.3), integrity is maintained through references-plus-events and explicit compensation/reconciliation, with eventual consistency bounded and observable (System Architecture §3.3, §15).

**24.4 Validation Alignment.** Data integrity rules align with the Validation Rules of the Requirements document (VR-001–VR-006), including minor-sensitive validation defaulting to the most restrictive outcome (BR-003).

**24.5 No Orphans, No Duplication.** Orphaned references are prevented (§5.4); each datum has one authoritative master (§2.2); duplication of mastership is prohibited (Art. 8.4).

**24.6 Consistency Under Failure.** On failure, data is never left inconsistent; operations are atomic within a boundary and compensated across boundaries (Requirements EC-002, EC-005).

---

### 25. FUTURE SCALING STRATEGY

**25.1 Scale by Design.** The data architecture scales with users, countries, and load without structural rework (Art. 5.1, 2.3; System Architecture §24). Scaling is horizontal-first, enabled by globally-unique identifiers (§7), partitioning (§15), projections/read models (§2.4), and boundary-owned data (§2).

**25.2 Polyglot Persistence (Optional, Governed).** Different boundaries may use different store types (relational, document, or other) where justified by their access patterns — a governed **PTD** per boundary, always behind ports (System Architecture §4.2) and always honoring these standards.

**25.3 Regional Scaling & Residency.** Scaling accommodates multi-region operation and residency (§10.2); regional infrastructure is a PTD.

**25.4 Additive Growth.** New domains, countries, and languages are added additively through configuration and governed versioning (§22), never destructive rewrites (Art. VIII).

**25.5 Governed Evolution.** Every significant scaling choice (technology, topology, partitioning) is recorded as a decision (PDL category TEC/ARC); scaling is deliberate and documented, never improvised.

---

## CONSOLIDATED DEFERRALS

**Pending Business / Legal Decisions (PBD)** — retention/archival/erasure periods per data class and jurisdiction (§8.3, §9.5, §16.4); data-residency and compliance obligations per country (§10.2, §20.5, §21.4); currency conversion/pricing/rounding rules (§12.3); localization fallback policy (§11.2); RPO/RTO and performance targets (§17.3, §18.3, §19.4); minor-data rules (§8.4, throughout — default most-restrictive until set). All to be authoritatively established (Art. XIV) and recorded in the PDL.

**Pending Technical Decisions (PTD)** — database engine(s) and polyglot choices per boundary (§1.6, §25.2); identifier/UUID concrete format (§6.5, §7.5); monetary representation (§12.2); index and partition concrete schemes/mechanisms (§14.5, §15.4); archival storage technology (§16.4); backup/restore technology and regions (§17.3, §18); key-management technology (§21.3); regional infrastructure for residency (§10.2, §25.3). All to be recorded in the PDL (category TEC).

*No PBD or PTD is resolved here; each is surfaced so it can be decided deliberately and logged, per the Constitution's prohibition on assumptions and its requirement to document decisions.*

---

## CLOSING PROVISION

This Database Master Architecture defines the data-layer philosophy, standards, and strategies of the Education Ecosystem Platform: data that serves the domain, is owned by its boundary, is correct and secure by default, is globalized across country, language, currency, and time, and evolves only through governed, versioned, integrity-preserving change. It contains no tables, no schema, and no SQL, and it invents neither business rule nor technology choice — fixing the standards every future data model must obey while deferring each business rule as a Pending Business Decision and each technology selection as a Pending Technical Decision, to be resolved by the appropriate authority and recorded in the Project Decision Log. The data architecture is durable, principled, and built to scale and expand without rework, exactly as the Constitution requires.

---

DATABASE MASTER ARCHITECTURE VERSION 1.0 COMPLETED
