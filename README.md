# GM Print · Marketing Studio v2

**Development workspace — copied from the preserved v1 baseline.**

- [Original v1 live demo](https://motasim-billah-morshed.github.io/gm-print-marketing-studio/)
- [Preserved v1 release](https://github.com/motasim-billah-morshed/gm-print-marketing-studio/releases/tag/v1)
- [Changes since v1](https://github.com/motasim-billah-morshed/gm-print-marketing-studio-v2/compare/v1...main)
- [Versioning and recovery](VERSIONING.md) · [Changelog](CHANGELOG.md)
- [Proposed v2 architecture review](ARCHITECTURE-REVIEW.md) · [Audited v1 requirements](V1-SOURCE.md)

## D3 / R1a local implementation — 2026-09-27

This feature branch adds a real, authenticated Company & Contact Foundation to the preserved demo. It is **not all of R1/v2 and has not been deployed publicly**. Owner authorization is recorded in [D3-DECISIONS.md](D3-DECISIONS.md). The earlier architecture audit describes the pre-D3 baseline; other production decisions remain open.

Two separate targets:

- `/` — fictional static demo, 16 modules / 64 submodules / 192 phases; isolated `gm-print:v2:public-demo:2026` storage. Existing v1 storage is neither read nor deleted.
- `/workspace/` on the local API — PostgreSQL business records, authenticated sessions, no fixture fallback. GitHub Pages cannot run this backend.

Implemented: groups/companies/branches, contacts and temporal roles, shared endpoints, manual entry/edit/search, Company 360, field provenance/reviewer decisions, endpoint-purpose consent/suppression, CSV/XLSX mapping/preview/review/queued commit/effect ledger/safe rollback, immutable application audit and role checks.

See [API and security contract](D3-API.md), [acceptance evidence](D3-EVIDENCE.md), and [feature manifest](ui/features.json). M02/M04/M05/M16 remain **Partial** at parent-module level.

### Local setup

Use Node.js 22.13+ (tested 24.19), npm, and PostgreSQL 17 (tested 17.11). Dependencies are exact-pinned in `package-lock.json`; use `npm ci`. No cloud services or paid queues are required.

1. Run `npm ci` in this v2 feature-branch checkout.
2. Windows convenience: extract official PostgreSQL Windows binaries so `.local-tools/postgres/pgsql/bin/pg_ctl.exe` exists; run `powershell -File scripts/local-db.ps1 init`. This creates loopback-only PostgreSQL on port 55433, a non-owner `gm_app` role, database `gm_d3`, and random private `.env` values. Existing `.env`/database is never overwritten. Start/stop later with `scripts/local-db.ps1 start` / `stop`.
3. Alternatively create a local PostgreSQL database and non-owner login role, copy `.env.example` to `.env`, and set `DATABASE_URL`, owner-only `MIGRATION_DATABASE_URL`, random `SESSION_SECRET` (32+ characters), and a private random `SEED_PASSWORD` (16+ characters). Keep owner credentials out of the API runtime in deployments. Production secret management is not approved in D3.
4. Run:

```sh
npm run migrate
npm run seed
npm run build
npm start
```

In a second terminal:

```sh
npm run worker
```

Open **http://127.0.0.1:4183/workspace/**. Local usernames are `admin`, `operator`, `reviewer`, `reader`; the password is the private random `SEED_PASSWORD` supplied during setup, never a public default. Existing users are never reset by seed. These synthetic development accounts are not production provisioning. Restarting API/worker does not erase records.

### Validation and recovery

```sh
npm run typecheck
npm run test:demo
npm test
node --env-file=.env scripts/backup-restore.mjs --logical
```

Stop the continuously running worker before `npm test`; the test runner starts its own transactional worker calls. Tests require a **local synthetic** database and add uniquely named fixtures; they never expose a reset endpoint. They use real PostgreSQL and HTTP sessions, not a mock database.

The recovery exercise creates a separate `d3_restore_*` database, compares all 24 domain/config table fingerprints, and copies/hash-checks private uploaded evidence. It never overwrites the source DB. `--logical` uses driver-based JSON data export + migrations + transactional restore; without it the script uses `pg_dump`/`pg_restore`. On this Windows host Application Control blocked `pg_dump.exe`, so only the logical recovery method was executed successfully. Keep `.private/backups` private. Production retention, encryption, offsite backups and scheduled recovery policy remain open.

Windows Codex sandbox note: this host required normal-user execution for `tsx` and PostgreSQL child processes. That is an execution-environment restriction, not an application bypass. If init stops after creating `pgdata`, do not reinitialize or delete it; inspect the local PostgreSQL log and complete configuration with its existing private credentials.

### D3 constraints

- Sources/contacts are unverified by default; absent typed fields stay `null` with `UNKNOWN` knowledge status.
- Imports add records/relationships; they do not silently update existing company facts. Use versioned manual edit + source for later corrections. Ambiguous identities require canonical IDs or reviewer decisions. Imported consent text is evidence to review, never a grant.
- Rolled-back records are tombstones; source/audit history remains. Later edits, references or withdrawals produce retained effects/conflicts. A rolled-back fingerprint cannot be silently recommitted; corrected data requires an explicitly different source/mapping and review.
- Global endpoint-purpose withdrawal is conservative across shared subjects. Regrant alone does **not** clear suppression in D3; audited suppression-release workflow is deferred. Eligibility is an advisory foundation; **all dispatch remains disabled**.
- UI selectors show the first 100 entities; API search/pagination is available. Profile shows recent 200 observations/50 activity events; full history is paginated via API/audit view. Error exports and company exports are bounded, protected and formula-safe.
- Real OCR, discovery/enrichment, AI creation, publishing/campaigns, nurture, live ERP and production hosting remain blocked/deferred. No sales/quotation/order/payment/KPI modules were added.

## Preserved static prototype (historical baseline)

Interactive UI/UX prototype for company intelligence, AI-assisted content, digital campaigns and qualified lead generation.

## Scope

- **16 modules, 64 submodules, 192 workflow phases**, mapped to the functional blueprint.
- Every submodule has four editable demo fields, a review gate, and a distinct example result.
- CSV preview/import, duplicate detection, company search, copy generation simulation, creative approval, campaign pause/resume, inbox qualification and idempotent ERP handoff simulation.
- Responsive desktop/mobile interface, keyboard navigation, global search, module explorer, local session state and reset.

All records in the **static prototype** are fictional. `.example` domains are reserved examples. Its AI/campaign/ERP controls remain simulations. The separate D3 local application above has real authentication and persistence. Sales, orders, revenue and KPI calculations remain in the existing ERP.

## Run

The static demo itself needs no third-party package. Build its allowlisted static directory first:

```sh
node build.mjs
node scripts/public-build.mjs
node server.mjs
```

Open `http://127.0.0.1:4173`.

You can also double-click `index.html`. The generated `bundle.js` embeds the requirements and avoids ES-module/file-fetch restrictions. Keep `styles.css` and `bundle.js` beside the HTML file. After editing sources, run `node build.mjs` to regenerate the bundle.

```sh
node qc.mjs
```

The QC checks cover all module/phase routes, source IDs, CSV parsing and import safety, campaign approval, qualified lead checks, emergency pause and ERP retry semantics. Browser checks are documented in `QC.md`.

## Sharing and state

Static hosting requires `index.html`, `styles.css`, `app.js`, `demo.js` and `requirements.json` together. Hash routes allow deep links on GitHub Pages without server rewrites. Demo edits persist only in the current browser tab/session, not across users. The reset control restores fixtures.

## Implementation boundaries

The static prototype remains a review tool. D3 implements the bounded local API/storage/permissions/consent foundation described above; production operations and the rest of the architecture remain unapproved. Static workflow result examples do not invoke real AI. Live SEO, OCR, media generation and external publishing are not implemented.

## Files

- `requirements.json`: module/submodule/phase requirements in Bengali.
- `demo.js`: fictional company data and 64 distinct work items.
- `app.js`: views, interactions and state.
- `styles.css`: responsive visual system.
- `bundle.js`: generated standalone browser app, including all requirements and fixtures.
- `build.mjs`: zero-dependency bundle generator.
- `server.mjs`: local static server.
- `qc.mjs`: deterministic QC without network or third-party dependencies.

This v2 checkout keeps demo sources at repository root. `.public/` is the only local static server root; private files, `.env`, backups, source code and architecture documents are not served.
