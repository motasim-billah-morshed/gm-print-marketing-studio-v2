# D3 bounded decisions

2026-09-27: owner-approved D3/R1a only. Preserve v1 tag and v2 audited baseline f6a8608. Feature branch codex/delivery-3-company-foundation; no main merge or public application deployment.

Local baseline: existing JavaScript UI/design retained; TypeScript Express API, PostgreSQL relational persistence, express-session with PostgreSQL session store, bcryptjs password verification. One GM workspace, explicit resource scope. No invented cryptography. SQL migrations and database-backed import worker. Private evidence outside static root. Runtime DB principal cannot mutate audit history.

Manual identity: new legal entity without email allowed; same-name records flagged for review. Imports require canonical selection/reviewer resolution for ambiguous same-name identities. Repeated rows linked by stable source company ID or explicit canonical ID. A repeated company name without such identity is not automatically merged. Separate contacts are attached to the resolved company.

Consent: imported grants are untrusted proposals. Operator may withdraw; only reviewer/admin with evidence may grant consent/verify fields. Withdrawal suppresses endpoint-purpose immediately and is never rolled back with imports. A later OptedIn event alone does not release global suppression; suppression release/reconsent workflow is deferred and requires an explicit policy decision.

Recovery: local driver-based logical snapshot/migration/restore is an acceptance exercise. This host's Windows Application Control blocked pg_dump.exe; native binary backup testing is Not run. No production backup/retention policy inferred.

DR-01 remains open for live ERP. Hosting/region/budget/provider/retention/qualification/channel decisions unchanged. OCR/discovery/AI/campaign/ERP and full matching/merge are deferred. Prior architecture audit is historical; it is not blanket approved or implemented.

Local limits are parser protections, not SLA: 5 MB upload; 10,000 rows; 50 columns; 50 MB ZIP expanded size; 1,000 ZIP entries; 20 sheets; 30-second parser worker limit. Numeric XLSX phone values require review because missing zeroes cannot be recovered. Formula cells are rejected, never evaluated.
