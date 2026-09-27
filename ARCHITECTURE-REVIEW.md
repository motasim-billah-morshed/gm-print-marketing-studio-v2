# GM Print Solution — V1 → V2 Architecture Review

Status: **PROPOSED / REVIEW REQUIRED — NOT LOCKED, NOT IMPLEMENTED**  
Audit date: 2026-09-27  
Scope: architecture and repository audit only. No application source, live deployment, original Google Doc, permissions or connector configuration changed.

## Review guide and evidence

This pack covers the 20 requested pre-development deliverables as drafts. Sections 1–4 explain findings; sections 5–18 propose architecture and interfaces; sections 19–22 define tests, releases, decisions and conflicts. A design being written here does not mean it is approved or implemented. No feature is marked production Done.

Audited source: [Functional Requirements v1.0](https://docs.google.com/document/d/1UEPEpTvgjsyPa7NRd26ytxV5W9qTKJAOgION0_cXqUQ/edit), all 11 sections, one tab t.0. [Complete source snapshot](V1-SOURCE.md) preserves the wording, 64 submodules, 192 workflow phases and AT-01–AT-13. No module is proposed for removal or merging. Existing IDs remain stable; extensions receive child requirement IDs, not silent renumbering.

Audited code: [GitHub repository](https://github.com/motasim-billah-morshed/gm-print-marketing-studio), local gm-print-studio/dist and supporting files. Local app.js and GitHub app.js had the same Git blob SHA: `6b1f316dfee3e36ec569b9ca8a0048606974413b`. Existing requirements.json contains every one of the source's 192 phase descriptions. This proves source mapping, not functional implementation.

Re-ran `node qc.mjs`: 1,051 assertions across 210 rendered routes passed. These are Node VM render/state tests with mocked DOM/storage and no network; they are not database, authenticated API, real provider or ERP integration acceptance tests. Existing QC.md additionally records earlier browser checks. This audit does not claim a penetration test or live connector verification.

## 1. Business objective

একটি company-first B2B intelligence platform: কোন প্রতিষ্ঠানের কোন decision role-এর কী প্রয়োজন হতে পারে, GM-এর কোন অনুমোদিত product তার সঙ্গে প্রাসঙ্গিক, কোন message/channel ব্যবহার করা যায়, কী response পাওয়া গেল, এবং evidenceসহ qualified opportunity ERP গ্রহণ করেছে কি না—এই সম্পূর্ণ সম্পর্ক দৃশ্যমান ও auditable করা।

Business/Product Knowledge → Import/Discovery → Enrichment → Verification → Company 360° → Role Mapping → Segmentation → Need/Product Matching → Content → Approval → Campaign → Response → Qualification/Nurture → Qualified Lead → ERP Acknowledgement → Marketing Feedback.

AI suggests; evidence, policy and human authority decide. Marketing does not own sales assignment, quotation, negotiation, order, delivery, payment or sales KPI. A Product Opportunity here is a marketing hypothesis, not an ERP sales opportunity or forecast.

## 2. V1 architecture summary and repository reality

The v1 document is already a strong functional blueprint. It explicitly includes company groups/branches, many-to-many contact relationships, consent, provenance, merge/unmerge, audience snapshots, human approval, provider abstraction, untrusted-content boundaries, duplicate-safe handoff and R1–R4. Most v2 safety principles strengthen existing requirements rather than introduce wholly missing concepts.

The document is not an executable technical specification: no physical schema, transaction boundaries, versioned API schemas, enforceable permission matrix, capacity envelope, provider contracts or approved ERP contract exists.

| Area | Current evidence | Production implication |
|---|---|---|
| Framework | Plain JavaScript ES modules, HTML/CSS; build.mjs creates one classic bundle | Keep useful UI; split domain and presentation before wiring real operations |
| Server | server.mjs serves static files on localhost; GitHub Pages hosts static demo | No business API or authenticated service |
| Database | app.js:11–14, browser sessionStorage | No shared durable storage, transactions, migrations, recovery or concurrency control |
| Identity | demo.js seedCompanies embeds one contact/email/role in each company | No group/branch/contact relationship tables or role history |
| Import | app.js:60, CSV company + email mandatory; email deduplication | Violates company-first discovery without known contacts; same shared email can collapse distinct entities |
| Workflow engine | app.js:42–46, four fields and fixture result per submodule | Preserves UX coverage; does not perform the 192 business operations |
| Authentication / RBAC | No login/auth middleware; admin label is static | All production actions require server-side authorization |
| Consent | One fixture consent string; campaign action checks creative + pause | No endpoint-purpose permission or recipient send-time enforcement |
| AI | app.js:64 template copy; other outputs in demo.js | No model invocation, grounding, provider fallback, evaluation or cost ledger |
| Content | Boolean creative approvals / one copy draft | No immutable versions, claims dependency invalidation or real publishing gate |
| Qualification | Fixture message status/fit determines qualification | No persisted evidence, independent intent score or override history |
| ERP | app.js:91 creates ERP-DEMO reference and Accepted locally | Does not establish exactly-once external effects or real acknowledgement |
| Audit | app.js:14 retains last 30 local action/time strings | Mutable/truncated; no actor identity, event ID, entity version or full date |
| Security | HTML escaping is present; mask switch is an illustrative toggle | No actual secret management, upload malware isolation, PII masking pipeline or authorization boundary |
| Tests | qc.mjs render and in-memory state assertions | Keep as prototype regression; add service, DB, contract, concurrency, security and E2E suites |
| Technical debt | Large one-file view/actions, indexed fixture relationships, generated bundle | Incremental separation required; never migrate fictional records into production |

### Keep / Refactor / Replace / Add

| Decision | Assets / components | Reason |
|---|---|---|
| Keep | 16/64/192 IDs, Bengali requirements, navigation, visual tokens, responsive layout, demo fixtures and useful regression tests | Existing reviewable work remains useful |
| Refactor | app.js views/routes/actions, form validation, accessible states, dashboards, source links | Bind views to typed API responses; loading/empty/error/permission states must reflect real state |
| Replace for production | sessionStorage business truth, email-as-company identity, approval booleans, canned qualification, simulated transfers, local audit | Cannot enforce v2 invariants across users or workers |
| Add | Durable relational model, API/auth, jobs, object store, audit/provenance, consent policy, provider/channel adapters, contract tests | Missing production foundation |
| Retain separately | Public GitHub Pages demo | Only fictional fixtures; production business data belongs behind authentication |

## 3. Critical gaps

1. **Implementation gap, not merely screen gap:** no production backend or persistent controls.
2. **Company identity:** email must not be company PK, mandatory discovery field or sole deduplication key. Shared domain/mailbox/phone alone cannot prove identical legal entities.
3. **Business knowledge:** v1 M01.S1 offers a brief; v2 needs versioned configurable Product Master, approved claims, materials, industries, roles, need mappings and recommendation evidence.
4. **History and facts:** independent contact identity with temporal company-role relationships; field-level observations and verification; inference review does not convert a guess into a verified fact.
5. **Policy enforcement:** consent, suppression, frequency, approvals and access controls must execute on the server and at dispatch, not only in UI or audience creation.
6. **ERP uncertainty:** vendor, sandbox, required fields, IDs and acknowledgement semantics remain unknown. No production connector can be responsibly finalized yet.
7. **Operational reliability:** durable jobs, event deduplication, outbox, retry classification, reconciliation, recovery and capacity targets are absent.
8. **Acceptance evidence:** current 1,051 checks cannot prove AT-01–AT-30 against real persistence, credentials, concurrent jobs or providers.

## 4. V1 → V2 Gap Matrix

“Sufficient” below means functional intent is already expressed in v1; it does not mean production implementation is sufficient. All modules have only prototype implementation. Every row is assessed against all requested axes across the two joined tables.

### 4A — Sufficient intent, clarification, missing specification and acceptance gaps

| Module | Already sufficient in v1 | Needs clarification | Missing requirement/detail for v2 | Missing production acceptance evidence |
|---|---|---|---|---|
| M01 | Product/offer, brand, ICP, objective; S1–S4/F1–F3 preserved | Catalogue owner, approved capabilities, MOQ, lead time, pricing authority | Configurable ProductVersion, Claim, Industry/Role/Need mappings and approval lineage | Product CRUD/version/claim invalidation; AT-17 grounding |
| M02 | CSV/Excel, OCR, manual, ERP import; rollback stated | Templates, file limits, source priority, ID ownership | Row ledger, resumable staging, malware scan, mapped updates, rollback conflict handling | AT-01/02 real Excel/OCR; rollback after later edits |
| M03 | Website/maps/directory/social discovery and refresh | Authorized source/provider accounts and storage rights | Per-source permitted fields/TTL/license policy, evidence spans, bounded fetch jobs | Source policy expiry, AT-18/26/28, provider rate limits |
| M04 | Exact/fuzzy review, branch distinction, provenance, unmerge | Match thresholds, reviewer authority, stale thresholds | Explainable match features, reversible merge transaction and post-merge conflict handling | AT-03/14/28; concurrent merge/undo and shared-domain negative cases |
| M05 | Group/company/branch; contacts, role history, consent and activity | Brands versus legal entities, concurrent roles, endpoint ownership | Temporal joins, role taxonomy, shared endpoints, evidence-backed facts and Company 360° projections | AT-14/15/19/28; company without contact is valid |
| M06 | Dynamic rules, inferred tags, eligible audiences, snapshots, company cap | Rule operators, inference approval, cap scopes/windows | Need/Product/Role recommendation models, explainable eligibility and atomic cap reservation | AT-16/17/20/22; audience changed after snapshot |
| M07 | Research, ideas, calendar, prompt versioning | Approved source set, review owner, freshness | Knowledge-retrieval contract, brief/fact version snapshot and AI run lineage | Grounding, source deletion and malicious brief tests |
| M08 | Copy, SEO, localization, variants with review | Bengali glossary, valid claims, QA rubric | Claim validation, language-equivalence tests, versioned output and failure handling | AT-18/21/26/27 and rejected claim tests |
| M09 | Image/mockup, bulk creative, accessibility, rights | Which providers, asset ownership, fidelity criteria | Provider jobs, asset derivatives/rights expiry and product-fidelity review | Mockup labelling, image rights/fidelity/overflow checks |
| M10 | Script, video, authorized voice, interactive assets | Render limits, voice/likeness rights, calculations | Asynchronous render manifests, subtitles, cancellation and interactive validation | AT-05/27 plus authorized voice, sync and failed render recovery |
| M11 | Library, revisions, claims/rights, publish package | Self-approval exception, revocation and publication recall | Explicit Revision state; immutable approved version, downstream invalidation and lock races | AT-06/21 with edit/schedule concurrency and expired rights |
| M12 | Capability registry, organic/paid/direct, caps and stop | Pilot channels, accounts, spend approver, cap policy | Capability per operation, durable dispatch ledger, atomic eligibility/budget checks | AT-04/07/19/20/22; opt-out versus dispatch race |
| M13 | Form/chat/ad/email/event/call/referral intake and triage | Identity thresholds, response SLA, reply authorization | Verified webhook intake, idempotent event IDs, uncertain-match queue and inquiry boundaries | AT-08/23/24/26; replay/out-of-order/signature tests |
| M14 | Extraction, separate fit/intent, nurture, lead readiness | Qualification rules, required evidence and override authority | Versioned policy scores, assessment history, inference separation and per-project leads | AT-09/16/18/24; override audit and unknown fields |
| M15 | Versioned contract, retry/ack, reconciliation, ERP ownership | Every ERP contract item remains open | Formal schema, inbox/outbox, stable transfer key, payload hash, ack verification, feedback dimensions | AT-10/13/25/29/30 against ERP sandbox |
| M16 | RBAC, consent/retention, AI controls, reliability | Identity provider, deployment, retention, jurisdiction, RPO/RTO | Action permission matrix, tenant/scope isolation, protected audit, secret vault, NFRs/runbooks | AT-11/12/26/27; restore, denial, revoke and failure tests |

### 4B — Dependencies and risks

| Module | Technical dependency | Business dependency | Security/privacy risk | Platform/API dependency | ERP dependency | AI dependency | Scalability concern |
|---|---|---|---|---|---|---|---|
| M01 | Versioned catalogue/claim store | Product owner and claim evidence | Confidential capacity/pricing | Optional catalogue imports | Pricing/reference ownership | Mapping suggestions only | Version and cross-product indexing |
| M02 | Object store, scanner, staging, queue | File templates and source priority | Malicious files/formula injection; excessive personal data | OCR/storage providers | Customer export/API contract | OCR/extraction validation | Chunking, backpressure, resumable batches |
| M03 | Fetch isolation, scheduler, source registry | Approved discovery scope | SSRF, injection, storage restriction | Authorized search/maps/directories | Existing-customer dedup context | Research/extraction | Quotas, cache expiry, bounded crawling |
| M04 | Match index, transaction locks | Merge/staleness policy | Cross-company data contamination | Optional verification services | External-ID semantics | Optional match explanation | Candidate blocking avoids all-pairs comparison |
| M05 | Relational integrity, temporal joins | Group/legal/branch definitions | Shared endpoint and role exposure | Source refresh adapters | Company/contact ID reconciliation | Suggested role relevance only | Indexed relationship/timeline paging |
| M06 | Rules engine, snapshots, policy service | Product fit and cap limits | Unconsented audience/export | Per-channel eligibility inputs | Customer exclusion/feedback | Need recommendation | Incremental segment refresh; snapshot size |
| M07 | Retrieval, versioned briefs | Brand/strategy approval | Source injection/confidential briefs | Research/text providers | Optional allowed feedback | Research/planning | Context budgets, batching/cost |
| M08 | Structured outputs, fact validator | Glossary/claim approvals | Invented claims or personal facts | Text/translation/CMS | No quotation write | Text/translation | Token budget, rate limit, variants |
| M09 | Asset store and image workers | Brand/fidelity/rights approval | Likeness/copyright/metadata | Image/design provider | None direct | Image generation | Storage/derivatives, GPU provider cost |
| M10 | Render jobs, media validation | Voice/footage rights | Unauthorized voice/face use | Video/audio provider | None direct | Video/audio/transcription | Long jobs, large assets, retries/cost |
| M11 | Immutable versions/reviews | Reviewer segregation | Self-approval, expired rights | Publish-format validation | None direct | Assistive QA only | Version growth and preview jobs |
| M12 | Dispatch queue, cap/budget ledger | Pilot/account/spend approval | Unwanted sends, duplicate charges | Every operation permission/quota | Agreed suppression feedback | Draft variants only | Atomic caps, send throughput, partial failures |
| M13 | Webhook inbox, matching | Response ownership/SLA | Spoofed event, attachment, impersonation | Receive/reply scopes | Match against mapped IDs | Triage/extraction | Bursts/replay/order and backlog |
| M14 | Rules, assessments, review queue | Fit/intent readiness rules | False qualified lead, scope leakage | Conversation delivery channels | Required handoff fields | Classification, not authority | Re-assessment volume and queue delay |
| M15 | Contract adapter/outbox/reconciliation | ERP team sign-off | Unapproved export/ERP field overwrite | ERP API/import capability | Critical contract blocker | Evidence summary only | Backlog, retries, recovery without duplicate |
| M16 | Auth, secrets, audit, monitoring | Security/retention/ops owners | Privilege escalation, secrets, audit tampering | Identity/hosting/provider health | Service-account boundary | Routing/evaluation/cost | User load, event retention, isolation |

## 5. Proposed final architecture — approval pending

Recommend a **modular monolith plus independent workers** initially. The 16 modules remain business boundaries; they do not require 16 independently deployed microservices. Extract services only when measured load or isolation warrants it.

```text
Authenticated UI (existing visual design and stable module IDs)
  → Versioned API + authentication + action/resource policy checks
    → M01–M06 Company Intelligence / Business Knowledge domains
    → M07–M11 Content / Review domains
    → M12–M14 Campaign / Response / Qualification domains
    → M15 ERP boundary and Marketing Feedback
    → M16 shared security, consent, AI routing and operations
      → Relational database: authoritative entities, versions, outbox/inbox
      → Private object storage: source documents, assets, evidence
      → Durable jobs/workers: imports, OCR, enrichment, generation, dispatch, sync
      → Adapter interfaces: identity, AI, authorized sources, channels, ERP
      → Audit / metrics / alerts / reconciliation / restore
```

Proposed stack, not approved: TypeScript for API/domain boundaries; PostgreSQL for relational data and transactional outbox; private S3-compatible object storage; OIDC-compatible authentication; a durable job engine behind an interface. Begin with a database-backed queue if approved workload fits; Redis/broker is not silently required. Exact framework, hosting, versions, queue product, identity vendor and region stay in DR-02/03/04. Existing UI can be incrementally connected; no React/Next.js migration is assumed necessary.

Server policy is default-deny and checked for each action/resource. PostgreSQL row security may add workspace isolation, but it is not a substitute for application permission checks; service roles must not casually bypass it. These safeguards align with [OWASP authorization guidance](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) and [PostgreSQL row-security documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html).

Production is authenticated and separately hosted; GitHub Pages continues only as a public demo. The browser never holds provider/ERP secrets. No business operation depends on browser session state for truth.

## 6. Module dependency map

| Producer | Contract / prerequisite | Consumers |
|---|---|---|
| M16 | Identity, authorization, audit, source/retention and AI policy | Every module from R1 |
| M01 | Approved product/claim, role taxonomy, ICP and campaign intent | M03, M06–M12, M14 |
| M02 / M03 | Staged observations with source and collection policy | M04 |
| M04 | Reviewed identity, fact verification, merge decisions | M05; never silently turns a hypothesis into fact |
| M05 | Canonical company/relationship/endpoint records | M06, M13, M14, M15 |
| M06 | Need/product relevance, segment version, audience snapshot | M07, M12; dispatch rechecks eligibility |
| M07 | Versioned brief and approved fact context | M08–M10 |
| M08–M10 | Generated version, lineage and rights | M11 |
| M11 | Approved asset version/package | M12; edits/revocations invalidate eligibility |
| M12 | Campaign/message/creative IDs and delivery events | M13, M15 feedback |
| M13 | Normalized inquiry and evidence | M14 |
| M14 | Qualified lead version with rationale | M15 |
| M15 | Validated acknowledgement and permitted status feedback | M05, M06, M14; recommendation evaluation |

R1 includes M15 contract design and M16 controls before dependencies are consumed. Business knowledge extensions live in M01/M05/M06; learning lives in M15.S4 with M06/M07 consumers. No M17 or merged module is proposed.

## 7. Proposed logical data model / relationship definitions

This is the complete proposed domain inventory for this review, not approved SQL DDL. Physical columns, constraints, indexes, migration plans and final API schemas are locked only after the decisions below. Every owned record carries stable ID, workspace scope, creation metadata and version; timestamps use UTC and display Asia/Dhaka where appropriate. Currency, units, language and external IDs are explicit. Unknown typed values use null + knowledge_status=UNKNOWN, not invented strings/numbers in numeric columns.

| Domain | Entities | Relationships and invariant |
|---|---|---|
| Organization | CompanyGroup, Company, GroupMembership, Branch, BranchOwnership, CompanyAlias, CompanyIdentifier, CompanyRelation | Group ↔ Company membership with validity; Company 1:N Branch current ownership with history; legal entity/brand/trade alias/factory types explicit; cannot merge across entity classes |
| People | Contact, ContactCompanyRole, RoleType, Department, RoleInfluence | Contact M:N Company through temporal role row; optional branch belongs to same company; original title and normalized role separate; no global single current role |
| Channels | ChannelEndpoint, EndpointAssociation, EndpointVerification | Endpoint can be shared business mailbox/phone; ownership links have validity/evidence. Phone availability and WhatsApp registration/eligibility are distinct |
| Policy | ConsentRecord, ConsentEvent, SuppressionRule, EligibilityDecision, FrequencyPolicy, FrequencyReservation | Endpoint/contact + channel + purpose + scope; opt-out wins; no grant implied by discovery or role transfer |
| Evidence | Source, SourcePolicyVersion, EvidenceItem, FieldObservation, VerificationDecision, FactProjection, ChangeRecord | One selected current fact points to observation and verification; alternatives retained; URL/file/page/row/span, raw/normalized values and lifecycle retained only as permitted |
| Import | ImportBatch, ImportFile, ColumnMappingVersion, ImportRow, ImportEffect, RollbackOperation | Staging independent of canonical records; row identity/retry ledger; undo only effects still attributable to batch |
| Discovery | DiscoveryQuery, DiscoveryRun, SourceCandidate, EnrichmentTask, ChangeProposal | Provider output is staged evidence, never direct overwrite of trusted field |
| Identity | MatchCandidate, MatchFeature, IdentityDecision, MergeOperation, MergeEffect | Reject/review/merge/undo with actor, reason, source IDs and version checks; same domain/email is not proof |
| Business knowledge | Product, ProductVersion, ProductCategory, Material, Industry, CompanyType, NeedType, UseCase, ProductClaim, ProductClaimEvidence, ProductRelation, TargetProfileVersion, BrandProfileVersion | Configurable taxonomies; approved product facts/version; cross-sell and related product edges, no hard-coded catalogue |
| Mapping | IndustryNeedRule, NeedProductRule, RoleProductRule, CompanyNeed, Recommendation, RecommendationEvidence, RecommendationReview | Facts, inferred needs, reported needs and reviewed recommendations have different types/states |
| Segmentation | Segment, SegmentRuleVersion, SegmentMembership, AudienceSnapshot, AudienceMember, ExclusionReason | Immutable campaign-time snapshot includes company, contact-role and endpoint context; fresh policy check at send time |
| AI | Provider, ProviderCapability, ModelVersion, RoutingPolicyVersion, PromptVersion, AIRun, AIRunInput, AIRunOutput, UsageLedger, EvaluationRun | Task/provider/model lineage, permitted data, cost, quotas, fallback and controlled failure |
| Content | ContentBriefVersion, ContentPlan, CalendarItem, ContentAsset, ContentVersion, FactUsage, AssetDerivative, RightsGrant, ReviewTask, ApprovalDecision, PublishPackage | Approved version immutable; usage rights and approved facts linked; new edit means new Draft |
| Campaign | ChannelConnection, ChannelCapability, Campaign, CampaignVersion, CampaignProduct, CampaignAudience, BudgetApproval, MessageVariant, Schedule, Dispatch, DeliveryAttempt, TrackingLink | Campaign can involve multiple products; channel/account action capabilities checked separately; financial limits and frequency reserved atomically |
| Response | IncomingEvent, IdentityMatchReview, Conversation, Participant, Interaction, Attachment, Inquiry, InquiryItem, InquiryEvidence | Event IDs deduplicate intake; one conversation may have multiple separate product/project needs; uncertain match remains unresolved |
| Qualification | QualificationPolicyVersion, QualificationAssessment, QualificationOverride, Lead, LeadInquiry, LeadProduct, NurtureEnrollment, NurtureStep | Fit/intent/confidence separate; lead uniqueness based on inquiry/project context, not merely company |
| ERP | ERPConnection, ERPContractVersion, ExternalReference, Transfer, TransferAttempt, TransferAcknowledgement, ReconciliationRun, ReconciliationItem, ERPStatusEvent | Stable transfer key, versioned payload/hash, mapped IDs, verified ack; read-only agreed ERP sales references |
| Learning | AttributionTouch, AttributionLink, MarketingOutcome, Experiment, RecommendationEvaluation | Company type/role/product/message/channel → response → qualified lead; confidence and model attribution uncertainty shown |
| Operations | User, Team, Role, Permission, RoleBinding, Job, JobAttempt, OutboxEvent, ConsumerReceipt, AuditEvent, RetentionAction, Alert, ConnectorHealth | Durable jobs, workspace authorization, trace IDs, restricted append-only audit; no secrets in events or plain DB fields |

Core cardinalities:

```text
CompanyGroup 1—N GroupMembership N—1 Company
Company 1—N BranchOwnership N—1 Branch
Contact 1—N ContactCompanyRole N—1 Company
ContactCompanyRole N—0..1 Branch
Company/Branch/Contact 1—N EndpointAssociation N—1 ChannelEndpoint
ChannelEndpoint 1—N ConsentRecord (contact/channel/purpose/scope/evidence)
Company 1—N CompanyNeed 1—N Recommendation N—1 ProductVersion
ContactCompanyRole 1—N Recommendation (role relevance, optional)
Campaign 1—N CampaignProduct N—1 ProductVersion
Campaign 1—N Dispatch N—1 AudienceMember
Conversation 1—N Interaction; Conversation 1—N Inquiry 1—N InquiryItem
Inquiry M—N Lead through LeadInquiry; Lead M—N Product through LeadProduct
Lead 1—N Transfer 1—N TransferAttempt; Transfer 0..1 verified Acknowledgement
Source 1—N EvidenceItem 1—N FieldObservation 1—N VerificationDecision
Every domain mutation → AuditEvent + optional OutboxEvent in one DB transaction
```

Typed association tables must enforce actual foreign keys and workspace scope, not arbitrary polymorphic text IDs. Company ownership history and contact role validity keep both business-effective time and recorded time. Concurrent roles are allowed; impossible dates and unintended overlapping duplicate role assignments are rejected. Group membership cardinality (one or multiple simultaneous groups) needs DR-05 approval.

### Product Master detail

Product ID, category, description, technical capability, supported materials, use cases, suitable industries/company types, buyer roles, MOQ + unit where applicable, approved lead time, approved/restricted claims, reference images/rights, sample availability, pricing reference/rule, approved capacity, keywords, related/cross-sell products. Every business assertion has source, owner, approval status and effective version. Price rules are marketing-approved references; quoting stays ERP-owned.

Initial configurable catalogue proposed from the user's list: Digital Sublimation Printing; DTF Printing; TPU Heat Transfer; UV Printing; Hotfix Sequin; Silicone Printing; High Density Logo; Emboss; Multi-Material Combined Solution; Vinyl & Laser Cutting; Auto Heat Transfer Screen Printing; FC Jersey Accessories; Garments Labels & Accessories; Offset Printing; Corporate Printing; Customized Branding. Labels are supplied requirements; capabilities, prices, MOQ and production claims are still UNKNOWN until the product owner verifies them. New products are data entries, not code releases.

### Role and recommendation detail

Configurable RoleType starts with Owner, Managing Director, Director, CEO, General Manager, Merchandising Manager, Senior Merchandiser, Merchandiser, Procurement/Purchase, Commercial, Marketing, Brand, Production and Sourcing; additional roles allowed. Relationship rows retain original designation, department, influence, relevance, source, last verification and confidence. AI role classification is a suggestion until reviewed.

CompanyNeed stores origin=inferred/customer_reported/verified, inference_type, reason, evidence/context links, confidence, AI run/model/version, review status/reviewer/time. Recommendation links a need to a specific product version and optional role relationship. Human approval of a recommendation does not erase its inferred origin. A confirmed purchase need requires independent supporting evidence.

## 8. State machines and transition guards

| Aggregate | States and transitions | Required guards |
|---|---|---|
| Data observation | Collected → PendingValidation → NeedsReview / Verified / Rejected; Verified → Stale / Superseded | Source policy permits retention, valid source and reviewer authority before verified |
| Import | Uploaded → Scanning → Mapping → Validating → Ready → Committing → Completed / PartiallyCompleted / Failed; rollback tracked separately | Permissions, row ledger, schema/map version and idempotent effects |
| Match | Proposed → Review → Merged / Rejected; Merged → UndoRequested → Undone / ConflictReview | Entity type, evidence, versions and downstream references; no uncertain auto-merge |
| Inference | Suggested → UnderReview → ReviewedAccepted / ReviewedRejected / Superseded | Source/context and model/rule version; accepted remains inference |
| Content | Draft → Review → Revision → Review → Approved | No unsupported claims; appropriate reviewer; approval tied to exact version |
| Publication | Approved version → Scheduled → Publishing → Published / Failed / Cancelled | At execution: unchanged approval, rights, capability, budget, eligibility where applicable |
| Content edit | Approved version is retained; edited successor starts Draft | Scheduled old version blocked/cancelled pending explicit version choice; published past version kept as history |
| Campaign | Draft → Review → Approved → Scheduled → Running → Paused / Completed / Failed / Cancelled | Budget and final publish authority; paused never implies auto-resume |
| Inbox | Received → Validated → Matched / MatchReview → Classified → QualificationReview | Valid event/signature and identity evidence; ambiguous identity cannot become canonical automatically |
| Qualification | Assessed → Qualified / NeedsReview / Nurture / Irrelevant | Fit and intent separate; reason/evidence/unknowns visible; override append-only |
| Nurture | Planned → Scheduled → Active → Paused / Stopped / Completed | Reply pauses relevant outreach; opt-out suppresses relevant queued work; resume explicitly re-evaluated |
| ERP transfer | Ready → Sending → Acknowledged / Failed / Rejected | Only qualified approved payload; only validated ERP receipt moves to Acknowledged |
| Transfer uncertainty | Sending remains unconfirmed with delivery_outcome=UNKNOWN; reconciliation before unsafe resend | Timeout is not evidence ERP rejected or did not create lead |
| AI job | Queued → Running → Succeeded / RetryWaiting / Failed / Cancelled | Budget, permitted provider/data policy, output validation and bounded attempts |

F1/F2/F3 are preserved business workflow descriptors. They are not a rule that every implementation has exactly three screens or three database statuses.

## 9. Proposed user roles and permission matrix

Scopes: D=data; K=product/knowledge; C=content; Q=qualification; M=campaign. A grant is subject to workspace/resource scope, policy and version checks. “—” is denied by default. All roles may only read their authorized scope; no implied superuser bypass.

| Role | Read | Create | Edit | Delete | Import | Export | Approve | Publish | Launch | Budget approval | ERP transfer | Admin |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Owner/business approver | Scoped | K/M | K/M | Request | — | Separate grant | K/C/M | Separate grant | Separate grant | Yes | Separate grant | Assign governance roles |
| System admin | Operational | Config | Config | Controlled request | — | Audit only if granted | — | — | — | — | — | Yes |
| Data operator | D | D | D | Request | D | Separate grant | — | — | — | — | — | — |
| Researcher | D/K public scope | Candidates | Own proposals | Request | Source-limited | — | — | — | — | — | — | — |
| Data reviewer | D | Decisions | Verified selections | Request | — | Separate grant | D/merge | — | — | — | — | — |
| Planner | D/K/M | Segment/brief/M | Same | Draft archive | — | Eligible audience if granted | — | — | — | — | — | — |
| Creator/editor | K/C | C | C drafts | Draft archive | Assets | Asset only | — | — | — | — | — | — |
| Content approver | K/C | Review | Review comments | — | — | Asset only | C | Separate grant | — | — | — | — |
| Publisher/campaign operator | C/M | Schedules | Schedules | Cancel pending | — | Report scope | — | Yes | Yes | — | — | — |
| Response/lead reviewer | D/Q | Inquiry/Q | Q | Request | Manual inquiry | Separate grant | Q | — | — | — | Separate grant | — |
| Integration operator | Minimal handoff | Transfer/reconcile | Mapping proposal | — | Contract scoped | Contract package | — | — | — | — | Yes | Connector only |
| Auditor | Audit/sanitized evidence | — | — | — | — | Audit if granted | — | — | — | — | — | — |

Small teams may combine roles by explicit binding; self-approval and spend approval exceptions require DR-08. UI hiding does not enforce access. Denied direct API calls, revoked sessions, alternate workspace IDs and worker service accounts are tested. Delete is a governed retention workflow, not unrestricted destruction of evidence.

## 10. API / integration architecture

Proposed `/api/v1` transport version is separate from requirements v2.0 and ERP schema version. OpenAPI/JSON Schema contracts will be approved before implementation. Mutations use idempotency keys where retriable and entity version/If-Match for edits; validation errors return field codes. Collections use bounded cursor pagination. Long operations return 202 + job ID, never keep one HTTP request open for the whole batch.

Representative interfaces: companies/groups/branches; contact-role relationships; endpoint consent; products/versions/claims; imports/mappings/rows/rollback; discovery jobs/candidates; field observations/verification; match candidates/merge/undo; needs/recommendations; segments/previews/snapshots; content versions/reviews; campaign schedules; inbox events/inquiries; qualification assessments; ERP transfers/reconciliation; audit/jobs/health.

Adapters implement declared capabilities and structured errors. All webhook inputs require the provider's supported signature/auth scheme, replay controls, payload limits, durable event storage and schema validation before processing. Secrets remain in a secret manager. Export is a separately authorized and audited operation, including audience downloads and CSV ERP fallback.

## 11. ERP data contract draft — blocked pending ERP team

Outbound envelope: schema_version, workspace/integration reference, transfer_key, payload_hash, lead_id + lead_version, internal company/contact/relationship IDs, known ERP IDs, product/need items with units, requested timing/location, qualification fit/intent/reason, evidence summaries/references, endpoint verification and purpose eligibility, campaign/creative/source attribution, scoped attachment references, timestamps and correlation ID.

Missing optional fields explicitly UNKNOWN/null. Required fields cannot be invented; they block handoff with a validation reason. No sales assignment/order/payment/KPI mutation fields in this contract. Reference mappings do not overwrite ERP authoritative values.

Expected response contract: transfer_key, accepted/rejected decision, ERP lead ID when accepted, schema/version, accepted_at, error codes, correlation and authoritative receipt identifier. HTTP 200 alone or a created export file is not acceptance. Transport queued/received status must remain distinct from business acknowledgement.

Idempotency: unique integration + transfer_key, stable across retries; payload hash must match on reuse. New lead correction uses an explicitly contracted revision/update operation, not an unreviewed new key that creates a duplicate. Receiver idempotency or lookup/reconciliation by external key must be supported; without either, uncertain-delivery retries require manual resolution. Do not promise exactly-once remote effects from an outbound queue alone.

CSV fallback: versioned mapping, export batch/row IDs, checksum and protected download; human import receipt and row reconciliation establish acceptance. Sensitive attachments use authorized expiry-limited access, not public links.

All DR-01 contract items are blockers; the field list above is a proposed package, not a vendor specification.

## 12. AI provider abstraction

Capability classes: Text, Research, OCR, Image, Video, Audio, Translation, Classification. No provider selected by default.

AIRun request: capability, task/version, input evidence and approved fact IDs/versions, schema, language, data classification, workspace budget, timeout and idempotency context. Response: typed output, citations/evidence spans, model/provider/version, confidence/limitations, token or media usage, cost basis, safety/validation results and artifact references.

Provider registry records data residency/retention policy, approved input classes, capabilities, model version, rate limits, unit pricing date, quotas, health, evaluation results and approved fallback chain. Estimated cost is reserved before work and reconciled to reported cost; unknown provider billing stays labelled unknown, not zero.

Fallback uses only approved providers with compatible data policy and output quality. No automatic move of confidential data to a less restricted model. Failure returns controlled error/review queue; does not fabricate facts. OCR and model outputs stay observations/inferences; provider confidence is not verification.

Untrusted website/PDF/email contents are bounded data, never tool authorization. Use typed outputs, isolated retrieval, prompt/data separation, allowlisted tool operations, minimal credentials and server policy gates. Prompt-injection filtering alone cannot guarantee safety. This layered design follows [OWASP prompt-injection prevention guidance](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html).

## 13. Channel capability matrix

No live account permission was supplied or validated in this audit. Therefore no row is declared Connected. Each cell below is a **candidate integration path**, not confirmed platform capability. Actual status is independently one of Connected/Limited/Manual/Unavailable with verified_at, evidence and reason. Proposed initial status is Unavailable until checked; approved manual workflows can separately become Manual.

| Channel class | Discover | Publish | Advertise | Receive | Reply | Measure |
|---|---|---|---|---|---|---|
| Own website/CMS | Approved pages | CMS/manual | Ad adapter separate | Form/chat adapter | Human/chat/email adapter | First-party events |
| Search / Maps | Licensed/authorized API | Own business account scope | Approved ad account | Supported own-account events only | Supported scope only | Per-API metrics |
| Facebook / Instagram | Approved public/business data | Approved business scope | Ad account scope | Approved lead/message/comment events | Eligible scoped reply | Approved insights |
| LinkedIn | Authorized data/manual | Approved account scope/manual | Approved marketing scope | Approved product/scope only | Manual unless supported | Approved analytics scope |
| YouTube | Authorized public metadata | Own channel upload scope | Ad connector separate | Supported comments/events | Scoped moderation/reply | Channel analytics |
| Email | User-owned/authorized input | Eligible send | Separate ad capability | Mailbox/webhook | Eligible reply | Delivery/reply/bounce; opens uncertain |
| WhatsApp | Authorized number/context only | Eligible template/service send | Click-to-message ad adapter separate | Approved business connector | Policy/window eligible | Provider delivery/events |
| SMS / other messaging | Authorized input | Provider eligibility | Provider-specific | Only supported inbound | Provider-specific | Delivery receipts |
| TikTok / Pinterest / X / others | Per-provider approval | Per-provider approval | Per-provider approval | Per-provider approval | Per-provider approval | Per-provider approval |
| Event/QR/referral/community | Authorized/manual source | Approved content/manual | Separate ad channel | Forms/import/manual | Permission-specific follow-up | Source/QR attribution |

Registry also records token expiry, granted scopes, account/region, quota, storage/attribution policy, reply constraints and health. Connection does not grant all six capabilities. Platform rules must be revalidated from official sources when an actual connector is selected; this draft is not a legal opinion or live platform policy certification.

## 14. Consent, suppression and frequency model

Endpoint availability, endpoint verification, consent and marketing eligibility are independent fields. ConsentRecord contains subject/contact, endpoint, channel, purpose, status, scope, evidence, collected time, withdrawal and expiry. Unknown/OptedIn/OptedOut stay distinct; history is event-based.

Eligibility combines purpose-specific policy, current consent, suppression, endpoint health, current contact relationship, channel action permission, relevant reply context, rights/approval and frequency policy. Unknown permission is fail-closed for marketing until an approved policy establishes eligibility. Customer-request responses and marketing are separate purposes; no invented opt-in from an inquiry.

Opt-out records suppression synchronously, invalidates eligible projections, cancels relevant pending nurture and stops future reservations. Dispatch workers must re-read suppression and reserve contact/endpoint/company frequency atomically immediately before sending. An already transmitted message cannot be recalled; in-flight and provider-queued actions require connector cancellation/reconciliation and an honest status. Reply pauses relevant nurture; resumption requires a new policy decision.

Audience snapshots preserve who was selected but do not freeze consent. Endpoint reassignment/new company role does not carry marketing permission automatically. A minimal suppression marker after deletion needs an approved retention basis; do not keep the whole profile merely to enforce suppression. Global means organization-wide relevant direct-marketing suppression; channel/purpose exceptions and shared mailbox handling require DR-06.

## 15. Background jobs, events and traceability

Within one DB transaction, persist business change + AuditEvent + OutboxEvent. Relay publishes committed events to workers; consumers keep event receipts and deduplicate at least-once delivery. Exactly-once external side effects are not assumed. Worker retries use stable operation identities, database uniqueness and provider-specific idempotency/reconciliation.

Event envelope: event_id, type, schema_version, workspace_id, entity_id/version, actor/service, occurred_at, correlation_id, causation_id and minimal payload/reference. Preserve ordering where required per entity/version, reject stale projections, and handle duplicates/out-of-order webhooks.

Key events: ImportRowValidated, ObservationCollected, FieldVerified, CompanyMerged, RoleChanged, ConsentWithdrawn, AudienceSnapshotted, ContentApproved/Revoked, DispatchReserved/Sent/Failed, ResponseReceived, QualificationDecided, TransferRequested/Acknowledged, ERPStatusReceived. Company/product/role/message/channel attribution IDs propagate without placing full PII in log envelopes.

Queue classes: import, OCR/discovery, inference, media generation, segment refresh, outbound delivery, incoming intake, ERP sync, retention and maintenance. Separate expensive work from urgent suppression/intake. Job has progress/checkpoint, cancellation, timeout, attempts, next_run_at, owner and last_error. Backpressure and per-provider/workspace quotas prevent unlimited enqueueing.

## 16. Security, provenance, audit and operational controls

Authentication via approved identity provider; server-side authorization for every action and resource. Scope constraints apply to APIs, workers, search, exports and object downloads. Least-privilege service identities, secure sessions, secret manager, encrypted transport/storage and credential rotation are deployment requirements. Secrets are never source code, plaintext entity fields or client configuration.

Upload controls: content type/size validation, quarantine, malware scanning, parser isolation, archive/decompression limits, file-hash dedup and signed authorized object access. Escape untrusted text, sanitize rendered rich content and neutralize spreadsheet formula injection in exported files. External fetch restricts protocols, redirects, egress and private/internal addresses. Raw evidence storage follows source policy; a URL/ref/hash may be retained instead of prohibited full content, explicitly marked unavailable for full replay.

FieldObservation stores field identity, raw and normalized values, source type/URL/file/page/row/span, collection/last-check times, confidence, extractor/provider version, verification status, reviewer and supersession history. Verification references a specific observation/version and permitted evidence. A source URL alone is not sufficient verification of a claim. Critical field set is approved in DR-07.

AuditEvent: immutable ID, actor/service, action, resource/version, reason, request/correlation, UTC timestamp, redacted before/after references and result. App roles cannot edit/delete audit rows. Restricted administrative maintenance is itself audited; protected backup/retention storage and optional integrity chaining make tampering detectable. Do not claim a database superuser can never alter data. Personal data deletion and evidence retention require governed redaction/retention rules.

Dashboard is operational: import/error counts; discovery/verification backlog; verified and channel-eligible contacts; segment sizes; approval queue; scheduled/published/failed assets; spend status; responses/backlog; qualified leads; ERP failures; connector health; AI cost/usage. Metrics carry source, freshness and status; unknown connector values are not zero. Sales/revenue KPI remains ERP-owned.

## 17. Error, retry, reconciliation and capacity

| Error class | Action |
|---|---|
| Invalid data/schema/required evidence | Reject or review with field reason; no blind retry |
| 401/403, revoked scope | Pause connector; authorized credential/scope repair; no permission bypass |
| Rate limit | Honor provider retry instruction; bounded exponential backoff with jitter |
| Network/5xx transient | Retry idempotently within configured budget; then recovery queue |
| Unknown send/ERP outcome | Reconcile remote key/state before unsafe resend |
| Permanent business rejection | Rejected + actionable reason; corrected version requires review |
| AI invalid/unsupported output | Validate/review, bounded approved fallback or controlled failure |
| Version conflict / merge rollback conflict | Preserve both histories and send to reviewer |
| Budget/cap/consent stop | Policy stop, not a retryable transport error |

Reconciliation compares expected versus observed IDs, hashes, statuses and acknowledgements. Dead-letter/recovery queues have owners, alerts and manual replay with retained identity. Restore tests include documents, DB, audit/outbox consistency and reapplication of suppression; backup restoration must not restart obsolete campaigns.

The following are **discussion scenarios, not user-approved capacity commitments**:

| Measure | Proposed pilot sizing scenario | Future planning scenario |
|---|---:|---:|
| Companies | 50,000 | 500,000 |
| Average contacts/company | 5 (not a hard maximum) | 10 (not a hard maximum) |
| Total contacts | 250,000 | 5,000,000 |
| Rows/import batch | 25,000 | 250,000 |
| Enrichment jobs/day | 2,000 | 50,000 |
| Campaigns/day | 10 | 100 |
| Messages/day | 5,000 | 100,000 |
| Concurrent users | 15 | 100 |
| Asset storage | 100 GB | 2 TB |
| AI calls/day | 2,000 | 50,000 |
| Webhook/events/day | 20,000 | 500,000 |

Actual limits, peak bursts, provider quotas and budget must be approved in DR-03. Average daily volume alone is insufficient. Proposed R1 service target for discussion: p95 ordinary company lookup/filter ≤2 seconds under approved pilot load; bulk requests acknowledge with job ID ≤2 seconds excluding upload transfer; audit commits atomically; dispatch never proceeds after seeing active suppression. RPO/RTO, job completion windows and availability target remain TBD; no unconditional performance promise before load/restore tests.

## 18. UI navigation and screen inventory

Preserve module IDs and existing design. Each screen has loading, empty, validation error, permission denied, retry/recovery and stale-data states where applicable. Common details drawer exposes fact/source/history or AI inference/review distinctly.

| Module / existing submodules | Proposed screens or tabs |
|---|---|
| M01 S1 products; S2 brand; S3 ICP; S4 objective | Product list/detail/version/claims/materials; brand/glossary; buyer/role taxonomy; campaign brief |
| M02 S1 spreadsheet; S2 OCR; S3 manual; S4 legacy/ERP | Upload/map/preview/job/errors/rollback; OCR source-versus-fields; entry forms; external mapping/reconciliation |
| M03 S1 web; S2 directories/maps; S3 social; S4 refresh | Source registry/query/run; candidate/evidence; official-page match; stale diff review |
| M04 S1 duplicate; S2 endpoints; S3 source conflicts; S4 exceptions | Side-by-side match/merge/undo; verification; field timeline; quarantine/reprocess |
| M05 S1 org; S2 roles; S3 channels; S4 activity | Company 360° tabs: hierarchy, sites, contacts/role history, endpoints/consent, facts, needs/products, timeline, ERP refs |
| M06 S1 rules; S2 AI tags; S3 channel audience; S4 personalization | Segment builder; need/product recommendation review; eligibility exclusions/snapshot; role-angle preview/caps |
| M07 S1 insight; S2 ideas; S3 calendar; S4 prompts | Source-grounded research; angle queue; calendar; versioned brief/prompt library |
| M08 S1 copy; S2 SEO; S3 translation; S4 variants | Brief/facts/editor; SEO draft; bilingual comparison; variant lineage |
| M09 S1 generation; S2 mockups; S3 bulk; S4 design QA | Image jobs; labelled mockup comparison; variant grid; fidelity/rights/contrast review |
| M10 S1 script; S2 video; S3 voice; S4 interactive | Storyboard; render jobs; licensed voice/subtitles; calculator/form preview/test |
| M11 S1 assets; S2 reviews; S3 rights; S4 packages | Search/library; diff/revision/approval; claim/rights exceptions; publication package |
| M12 S1 channels; S2 organic; S3 paid; S4 direct | Six-capability registry; calendar/status; budget/launch; nurture/recipient ledger |
| M13 S1 forms; S2 social; S3 offline/email; S4 triage | Capture forms; central inbox; manual entry/attachment; identity review and response draft |
| M14 S1 extraction; S2 score; S3 questions; S4 readiness | Evidence-backed inquiry; fit/intent/reason; follow-up review; lead checklist |
| M15 S1 contract; S2 transfer; S3 reconcile; S4 operations | Contract mapping/validation; queue/attempt/ack; mismatch recovery; attribution/marketing feedback |
| M16 S1 permissions; S2 retention; S3 AI; S4 reliability | Role matrix/audit; consent/deletion/suppression; provider/cost/evals; jobs/health/pause/restore |

The existing 192 phase descriptions remain linked to these screens. One screen may cover multiple phases; extra detail screens do not silently change module or phase IDs.

## 19. Acceptance test matrix

AT-01–AT-13 wording remains authoritative in the source snapshot; no deletion or weakening. AT-14–AT-30 are additions from the v2 request. “Release” below indicates when complete production evidence is required; foundation tests can run earlier. **All production tests are currently not run/not proven.** Prototype assertions are not marked as acceptance passes.

| ID | Preserved/new acceptance intent | Required evidence / owner | Release |
|---|---|---|---|
| AT-01 | Reimport Excel without unexpected duplicates; counts reconcile | DB row effects, exact input totals; Data QA | R1 |
| AT-02 | Preserve phone codes/zeros; uncertain OCR cannot self-verify | XLSX/OCR fixtures plus reviewer denial; Data QA | R1 |
| AT-03 | Group/company/branch never collapse incorrectly | Shared-domain/email negative matches + constraints; Data QA | R1 |
| AT-04 | Suppress opted-out; unknown WhatsApp consent blocks marketing | Policy API in R1; real queued dispatch in R3; Security QA | R1/R3 |
| AT-05 | Bengali brief → text/design/video; facts/rights gate approval | Real approved provider outputs + review evidence; Content QA | R2 |
| AT-06 | Edit resets approval; unsupported account action unavailable | Version/API denial in R2; connector denial R3; Security QA | R2/R3 |
| AT-07 | Global cap across segments; reply stops nurture | Concurrent dispatch and response race; Campaign QA | R3 |
| AT-08 | Duplicate inquiry prevented; distinct need survives | Replayed/cross-channel inputs, separate project; Lead QA | R3 |
| AT-09 | Unknown preserved, low confidence reviewed, job request irrelevant | Evaluation corpus and human-review trace; Lead QA | R3 |
| AT-10 | Timeout/retry creates one ERP lead; no premature ack | ERP sandbox delayed response + reconciliation; Integration QA | R3 |
| AT-11 | Failure/budget/token errors; pause/restore | R1 data restore; R2 AI controls; R3 connector recovery; Ops | R1–R3 |
| AT-12 | Unauthorized export/publish denied; consent/change audit | Direct API negative tests and scoped roles; Security QA | R1/R3 |
| AT-13 | ERP-owned sales functions not duplicated | API/model boundary checks + signed contract; ERP owner | R1/R3 |
| AT-14 | Correct group/company/branch relationships | Relational constraints and hierarchy E2E; Data QA | R1 |
| AT-15 | Contact changes company without history loss | Old/new/concurrent role validity and historical query; Data QA | R1 |
| AT-16 | Inferred need never saved as verified fact | Persistence type/state tests and review UI; Data QA | R1 |
| AT-17 | Recommendation reason/source/context visible | Product/version/evidence lookup and missing-source rejection; Business owner | R1 |
| AT-18 | AI never invents unknown contact details | Missing-field test corpus and schema/policy validation; AI QA | R1–R3 |
| AT-19 | Phone does not grant WhatsApp eligibility | Separate endpoint/consent policy tests; Security QA | R1/R3 |
| AT-20 | Opt-out suppresses relevant scheduled/active nurture | Outbox/policy cancellation R1; real workers R3; Campaign QA | R1/R3 |
| AT-21 | Creative edit invalidates approval | Approval version + schedule race test; Content QA | R2/R3 |
| AT-22 | Multiple segments respect cap | Parallel workers compete for same recipient reservation; Campaign QA | R3 |
| AT-23 | Uncertain response identity enters review | Ambiguous/shared endpoint payloads; Lead QA | R3 |
| AT-24 | New product/project inquiry survives existing company lead | Distinct InquiryItem/Lead fixture and E2E; Lead QA | R3 |
| AT-25 | ERP retry cannot duplicate lead | Stable key/hash + receiver verification; Integration QA | R3 |
| AT-26 | Malicious external content cannot alter permission | Website/PDF/email adversarial cases; server tool denials; Security QA | R1–R3 |
| AT-27 | Provider failure uses approved fallback or controlled failure | Timeout/quota/schema failure and data-policy mismatch; AI QA | R1/R2 |
| AT-28 | Provenance for every verified critical field | Source-to-field-to-review query, no-source rejection; Data QA | R1 |
| AT-29 | Marketing cannot overwrite ERP sales data | Contract allowlist negative tests + ERP sandbox; ERP owner | R1/R3 |
| AT-30 | Company→product→campaign→response→qualified attribution | Stable IDs across events and trace UI; Marketing QA | R3; learning R4 |

Additional proposed tests (do not replace AT IDs): R1-A company creation with no email/contact; R1-B reversible merge after later edits; R1-C import rollback preserves valid later edits; R1-D verified critical field with absent/expired evidence rejected; R1-E permission revoked during job; R1-F duplicate/out-of-order events; R1-G concurrent row updates; R1-H restore with suppression retained; R1-I upload formula/malware/SSRF quarantine; R1-J cross-workspace object/API/export denial; R1-K proposed performance envelope; R1-L product/claim deprecation invalidates dependent recommendations. Final thresholds and fixtures need approval.

## 20. R1–R4 backlog and R1 acceptance gate

Architecture → Data Model → Interfaces → Acceptance Criteria → R1 is the mandatory order. Every implementation unit records requirement IDs, design, code change, automated test, integration test, acceptance evidence and documentation. No simultaneous implementation of all 16 modules.

| Unit | Build scope | Dependencies / tests |
|---|---|---|
| R1.0 | Decision closure, architecture/ERD/API/test contracts and ERP contract foundation | DR-01–09, approval; no app implementation before gate |
| R1.1 | Auth/RBAC, DB migrations, object access, audit/outbox, jobs, error/restore baseline | M16; AT-11/12/26 and R1-F–K |
| R1.2 | Configurable products/claims/roles/industries/ICP/brand; review/versioning | M01.S1–S4; AT-17/18; R1-L |
| R1.3 | Company groups/legal entities/branches, contacts/temporal roles/endpoints | M05.S1–S4; AT-14/15/19/28; R1-A/J |
| R1.4 | XLSX/CSV mapping/staging/error report/idempotent import/rollback, manual entry, OCR review; ERP import only per signed contract | M02.S1–S4; AT-01/02/18; R1-C/I |
| R1.5 | Authorized discovery source registry/run/refresh, evidence and change review | M03.S1–S4; AT-18/26/27/28; one approved source adapter first |
| R1.6 | Verification, exact/fuzzy candidates, merge/reject/undo and exceptions | M04.S1–S4; AT-03/14/28; R1-B/D/G |
| R1.7 | Need/product/role mapping, separate inference review, dynamic segments/snapshots, eligibility/caps policy | M06.S1–S4; AT-16/17/19/20; concurrent policy tests |
| R1.8 | Operational data dashboard, audit/provenance viewer, export controls, handoff contract simulator and read-only ERP references | M15.S1 foundation/M16; AT-12/13/29; simulator does not count as live ERP acceptance |
| R1.9 | DB/API/E2E/negative/security/performance/restore UAT and documentation | Approved R1 tests, measured capacity, named business sign-off |

R1 M02 OCR and M03 discovery are not declared complete with fixture-only screens. If credentials are unavailable, approved manual intake can work; those connector units remain blocked or explicitly deferred by the user. Likewise M02.S4 cannot be called complete without the agreed ERP import path. No hidden scope cuts.

R2: M07 planning/briefs → M08 writing/localization → M09 images → M10 media → M11 rights/version/review/package; approved providers and measured quality/budget; AT-05/06/18/21/26/27.

R3: verify 1–2 real channel/account capability sets → campaign eligibility/dispatch/budget → signed intake → identity/inquiry → qualification/nurture → reliable ERP contract execution → acknowledgement/feedback. Complete real end-to-end AT-04/07–13/19–25/29/30. Pilot channel names are not assumed.

R4: additional approved connectors/providers, expanded loads, experiments, evaluation-backed recommendations, personalization/localization. No self-learning rule automatically changes facts, consent or launch authority. Reliability gates must remain green before scale.

R1 acceptance requires: signed architecture and blocker decisions; all M01–M06 intended R1 functions mapped to evidence or explicit approved deferral; durable company-first records; temporal relationships; grounded product recommendations; staged source-backed imports/discovery; verified-field provenance; controlled identity merge/undo; scoped consent and server authorization; operational visibility; audit/outbox atomicity; backup/restore; approved capacity measurements; unchanged ERP boundary and accepted contract draft. R1 never claims full campaign, real media creation or ERP handoff implementation.

## 21. Decision Register — user / owner approval required

All rows currently OPEN. A proposed option is not an assumed answer. Credentials should be configured through secure connection settings, not pasted into this document/chat.

| ID | Decision / missing information | Decision owner | Proposal for review / affected gate |
|---|---|---|---|
| DR-01 | ERP vendor/version, API availability/auth, required fields/enums, company/contact ID ownership, existing-customer match, duplicates, attachments, consent sync, deletion, sandbox, retry/reconciliation | User + ERP technical owner | Versioned bidirectional boundary; all items resolved before live integration. User explicitly calls this a pre-development blocker; no exception assumed |
| DR-02 | Hosting/cloud/on-premise, region, domain, deployment budget, maintenance owner and framework | User + technical/ops owner | Authenticated modular monolith + workers; public demo kept separate. Approve stack before R1 implementation |
| DR-03 | Companies/contacts, import rows, enrichment, campaigns/messages, concurrent users, storage, AI calls, events and peaks; latency/availability/RPO/RTO | User + operations | Section 17 numbers are discussion scenarios only; approve actual load and service targets |
| DR-04 | Single GM workspace versus future multi-tenant product; login/SSO/MFA; user list/team scopes | User + security owner | Single organization first with explicit workspace scoping; tenant product expansion not assumed |
| DR-05 | Legal entity/brand/group/branch rules, multi-group membership, contact influence and role history interpretation | Business/data owner | Stable company identity; temporal relationships; shared domains not unique proof |
| DR-06 | Market/jurisdiction, existing consent evidence, marketing/service purposes, global opt-out scope, cap limits, retention/deletion and source rights | User + designated policy owner | Unknown marketing eligibility blocked; purpose-specific rules approved before data/send policy lock |
| DR-07 | Approved product catalogue, capabilities, claim evidence, critical fields, MOQ/lead time/capacity/pricing visibility, priority industries/roles | Product owner | Seed supplied names only; unsupported business facts UNKNOWN |
| DR-08 | Named reviewers, approve/publish/launch/spend/export/ERP transfer permissions; self-approval exceptions | User | Separate sensitive grants; system admin does not automatically approve spend/content |
| DR-09 | Source and AI/OCR providers, authorized accounts, data residency/retention, budgets/fallback/evaluation | User + technical/policy owners | Provider-neutral contracts; enable only individually approved capabilities |
| DR-10 | First 1–2 campaign channels, owned accounts/domains, reply ownership and escalation/SLA | Marketing owner | Choose after audience eligibility and live capability check, before R3 |
| DR-11 | Fit/intent rules, qualification minima, missing-field handling, nurture stop/resume | Marketing + ERP owners | Separate fit/intent/confidence; reasoned human override; before R3 qualification |
| DR-12 | Attribution model, observation window, experiment policy and permitted ERP feedback | Marketing + ERP owners | Explicit source/touch lineage first; no causal/revenue claims from correlation |

No deadline, vendor, price, legal basis, threshold or production credential is finalized in this review. Architecture lock requires recorded decision, owner, approval date, rationale and impacted requirement/test IDs. Changed decisions create a new revision.

## 22. Conflicts, ambiguity and proposed resolution

| Issue | Why it matters | Proposed resolution; not silently finalized |
|---|---|---|
| “Final architecture” requested before critical decisions known | Cannot honestly label implementation-ready yet | This pack is a proposed baseline; lock only after review |
| ERP “before development” blocker versus R1 data foundation | Could stop all R1 while ERP team responds | Honor stricter instruction: no implementation now; user may explicitly approve isolated R1 work with interface-only ERP foundation |
| R1 M01–M06 versus AI controls in R2 | OCR/discovery/inference already need provider safety | Bring minimum M16 AI routing/policy/evaluation into R1; content generation remains R2 |
| Company.branch_id in v1 field list versus one company many branches | Single field can invert ownership | Branch owns current company relationship; no single branch column as company truth |
| Strict hierarchy chain versus many-to-many business relationships | Contacts/campaigns/products are not a single tree | Preserve company-first view using joins and temporal relations |
| “Contact current role” singular versus multiple concurrent relationships | Overwrites valid roles | Current role per company relationship; UI can show a chosen primary relationship |
| 16/64/192 preservation versus expansion | Counts may be mistaken for final screen/entity count | Preserve source IDs; add child requirements and screens without removing source scope |
| Verified source versus reviewed inference | A human accepting a suggestion may falsely become a fact | Separate review status from knowledge origin and verification evidence |
| Immutable audit versus privacy deletion/source retention limits | Indefinite raw evidence can be prohibited | Protected minimal audit; governed redaction/retention, lawful/source-policy evidence references |
| Emergency pause “all queues” versus suppression/receipt processing | Stopping opt-out/ack intake would damage safety/reliability | Pause outbound actions/expensive starts; continue inbound suppression, audit and acknowledgement reconciliation |
| Every available channel/AI opportunity versus actual APIs | Account connection does not prove supported operations | Capability registry with individually verified scopes; unsupported remains Manual/Unavailable |
| Global opt-out versus permitted service reply/shared endpoints | Overbroad or narrow interpretation can be wrong | Define subject, purpose, scope and in-flight limits in DR-06 |
| Reliable retry versus ERP with no idempotency/lookup | Timeout resend can create duplicates | Require receiver contract or controlled manual reconciliation; no false exactly-once guarantee |
| Pricing rule in Product Master versus ERP quote ownership | Competing prices or unauthorized promises | Approved reference only; quotation and commercial commitments stay ERP |
| Full company intelligence versus no contact found | Demo requires email, excluding valid companies | Company can exist with UNKNOWN contact/endpoints and remains ineligible for direct marketing |

## 23. Definition of Done and review checkpoint

A feature is Done only with business requirement satisfied, server permission checks, validation, provenance where applicable, audit, error/retry/idempotency handling, automated/integration/acceptance evidence and updated documentation. Tests marked simulated remain simulated. UI rendering alone is not completion.

Before coding: approve/correct the proposed module-preserving architecture and logical model; resolve DR-01–09 and acceptance/capacity gates relevant to R1, or explicitly authorize bounded deferrals and their consequences. Then produce locked physical schema, versioned interface contracts and test fixtures, followed by the first R1 unit. No v2 deployment or public publication of this architecture pack has been performed.
