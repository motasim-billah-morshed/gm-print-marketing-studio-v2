# D3 implementation contract

Local-only TypeScript/Express modular monolith + PostgreSQL 17. Existing frontend/design/requirements remain. No paid provider, API placeholder scaffold or ERP call. Read together with the proposed whole-system `ARCHITECTURE-REVIEW.md`; this document defines only the authorized D3 slice.

## Data invariants

`Workspace → CompanyGroup → Company → Branch`; `Contact ↔ ContactCompanyRole ↔ Company/Branch`; `ChannelEndpoint ↔ EndpointAssociation ↔ Company/Contact`. Company exists without any contact/email. SQL composite foreign keys preserve workspace and branch/company relationships. Roles have original designation, separately nullable normalized role, start/end dates, version and active status. Changing employer requires ending old role and adding new relationship. DATE is serialized as calendar text without timezone conversion.

Endpoint is channel + normalized value within a workspace; shared endpoint associations do not merge companies/contacts. Raw phone is text and normalization only removes formatting punctuation; no country code, leading zero or WhatsApp status is inferred. Existing endpoint tombstones can be reactivated with a versioned audited effect.

Source and FieldObservation hold raw/normalized/unknown values, manual/file reference, sheet/row, actor, collection/check dates, selected-current flag and historical observations. VerificationDecision records reviewer, evidence, decision and time. Verification never changes consent/reachability/company existence. A source URL alone does not confer Verified.

ConsentEvent records endpoint/channel through the endpoint reference, nullable contact subject, purpose, status, evidence, actor and time. Withdrawal writes endpoint-purpose SuppressionRule in the same transaction. `*` purpose suppresses all purposes. It conservatively applies to a shared endpoint across subjects. Imported consent is a `supplied_consent_claim` observation. No import writes OptedIn; rollback never changes consent events. D3 cannot release suppression.

## Session and permission matrix

| Action | Admin | Operator | Reviewer | Read-only |
|---|---|---|---|---|
| Read/search/history | yes | yes | yes | yes |
| Create/edit | yes | yes | yes | no |
| Import/commit/rollback | yes | yes | yes | no |
| Withdraw/unknown consent | yes | yes | yes | no |
| Verify / identity review / consent grant | yes | no | yes | no |
| Export | yes | no | yes | no |
| Revoke user sessions | yes | no | no | no |

No delete/publish/campaign/budget/ERP permission or operational endpoint is implemented. Admin still needs source/evidence. Workspace is derived from authenticated user, never accepted from request input. UUID lookups require matching workspace. No RLS/SaaS claim: this is a scoped application serving one GM workspace.

Maintained `express-session` + `connect-pg-simple` stores sessions in PostgreSQL; `bcryptjs` hashes passwords. Session rotates at login, HttpOnly + SameSite Strict, 8-hour lifetime, Secure in production mode. Login limit 20/IP/15 minutes, exact configured Origin check, synchronizer CSRF token on unsafe methods. GET `/session` issues token; then POST login with token. Logout destroys session; admin revocation increments user session version. No password/session secret in audit or public bundle.

Runtime `gm_app` is non-owner. Audit denies UPDATE/DELETE/TRUNCATE via grants and trigger; permissions table is read-only to runtime. Owner migration credentials can administer the database and must be managed separately in a real deployment. Audit is application-protected, not cryptographic/WORM storage. Private source evidence is never served as a static file.

## HTTP API v1

All below `/api/v1`. Except session/login, authentication required. JSON errors include Bengali `error`, optional field issues, `retryable` on 503. 401 session, 403 permission/CSRF/Origin, 404 scoped resource, 409 identity/concurrency/key conflict, 422 validation.

| Method/path | Contract |
|---|---|
| GET `/session` | User, permissions, CSRF, persistent mode, disabled outbound/ERP |
| POST `/login`, `/logout` | Username/password login; destroy session |
| POST `/admin/users/:id/revoke` | Revoke all sessions for scoped user |
| GET `/companies?q=&industry=&limit=&offset=` | Database count + bounded company page |
| GET `/contacts?q=&limit=&offset=` | Contact name search + current/historical company roles |
| GET `/companies/:id` | Overview, group, branches, roles/contacts, endpoints, consent, recent provenance/activity |
| POST `/companies/:id/contacts` | `{name,designation?,department?,source}` atomic contact + initial role |
| GET `/entities/:type?q=&limit=&offset=` | Bounded lookup; name search for company/group/branch/contact |
| POST `/entities/:type` | `{data,source}` → committed ID/version |
| PATCH `/entities/:type/:id` | `{data,source,version}` → new version or preserved conflict |
| GET `/observations?entity_id=&limit=&offset=` | Paginated field history/source |
| POST `/observations/:id/review` | `{status:Verified|Rejected,evidence}` |
| POST `/consent` | `{endpoint_id,contact_id?,purpose,status,evidence}` |
| GET `/endpoints/:id/eligibility?purpose=&contact_id=` | Consent/suppression/verification reasons; dispatch always false |
| GET `/audit?limit=&offset=` | Persisted actor/time/resource/result/redacted references |
| POST `/imports` | Multipart `file`, CSV/XLSX only, private random filename |
| GET `/imports`, `/imports/:id?limit=&offset=` | Batch history, sheet metadata, rows, jobs, first 100 effects |
| POST `/imports/:id/preview` | `{sheet,mapping,namespace,version}`; field→column map |
| POST `/imports/:id/rows/:rowId/resolve` | Reviewer `{company_id OR new_identity,contact_id? OR new_contact?,evidence,version}` |
| POST `/imports/:id/commit`, `/rollback` | `{version}` queues database job, returns job ID |
| GET `/imports/:id/errors.csv`, `/companies.csv` | Export permission, formula-safe, audit; companies capped at 10,000 |

Entity allowlist: `company_group`, `company`, `branch`, `contact`, `contact_company_role`, `channel_endpoint`, `endpoint_association`. Unknown fields/types are rejected by Zod. No arbitrary table access. `limit` capped at 100, default 25.

POST/PATCH mutations (except login/logout/multipart upload) require `Idempotency-Key` (1–160 characters). Key+workspace is transaction-locked and stores payload hash and response. Exact replay returns committed response; different payload/path conflicts. Retry failed network/503 with the same key and payload. Upload may create another private batch, but identical file+sheet+mapping+namespace resolves to original batch before canonical mutation.

Optimistic edit mismatch returns HTTP 409 with `conflict_id`, `current`, `proposed`; both are stored in `edit_conflict`, audited in the same transaction. UI retains them. Reload/review before intentionally submitting with current version. No blind overwrite.

## Import and worker states

`Uploaded → Preview → CommitQueued → Committed → RollbackQueued → RolledBack | RollbackConflict`. Failed commit returns to Preview with Failed job; a new explicit retry creates a new job. Worker validates the requesting actor's current active/import permission.

Jobs: `Queued → Running → Completed | Failed`. `FOR UPDATE SKIP LOCKED` claim and all canonical writes/effects/audit share one DB transaction. A worker crash rolls back the claim and canonical mutation, leaving Queued for another worker. Active job unique index, batch lock and idempotency guard prevent double commits. Database/API requests enqueue and return; independent worker does canonical commit. No external retry service required.

Parser subprocess: 30-second kill limit, 5 MB compressed/input, 50 MB total ZIP expansion, 1,000 entries, 20 sheets, 10,000 data rows, 50 columns; UTF-8 BOM and UTF-16 BOM supported, undecodable bytes rejected. CSV supports quoted commas/newlines/escaped quotes. XLSX formula cells rejected; numeric values flagged for precision/leading-zero review. User maps arbitrary/Bengali/English columns. No formula execution.

Rows: accepted/rejected/duplicate/needs-review/ignored. Commit blocked on unresolved review; rejected/duplicate/ignored rows excluded and downloadable. Stable source identity or selected canonical company links contacts; name/email/phone/domain never proves identity. Same-name contacts in a target company require explicit canonical contact or reviewer-confirmed new person. Exact same row is a duplicate, not another contact.

Canonical mutation is additive. No inferred matching update of existing company facts. Later corrections use versioned manual edits with source. Row count and entity-effect count separate. ImportEffect records created/reactivated entity version and before/after references. Rollback uses soft tombstones, dependency order, version checks, later-source/import/reference/consent guards; unsafe effects remain with reason. Every rollback audited. No reset/delete endpoint or production destructive test hook.

## Boundaries / remaining work

No real SMTP/WhatsApp/AI/OCR/discovery/ERP calls. Eligibility does not mean send permission in a live provider; capability/account/legal policy and send-time frequency caps are deferred. Production hosting, database HA, retention, encryption/backups, secret manager, scalable parser queues, advanced identity merge/unmerge and suppression release need separate design/owner decisions. Bounded selector/profile/export limits are not an approved SLA. R1b/R2/R3/R4 backlog remains in the architecture review.
