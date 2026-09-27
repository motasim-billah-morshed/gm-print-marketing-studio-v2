# GM Print · Marketing Studio v2

**Development workspace — copied from the preserved v1 baseline.**

- [Original v1 live demo](https://motasim-billah-morshed.github.io/gm-print-marketing-studio/)
- [Preserved v1 release](https://github.com/motasim-billah-morshed/gm-print-marketing-studio/releases/tag/v1)
- [Changes since v1](https://github.com/motasim-billah-morshed/gm-print-marketing-studio-v2/compare/v1...main)
- [Versioning and recovery](VERSIONING.md) · [Changelog](CHANGELOG.md)
- [Proposed v2 architecture review](ARCHITECTURE-REVIEW.md) · [Audited v1 requirements](V1-SOURCE.md)

The initial v2 application retains v1 functionality with a visible development label. Production architecture decisions remain open for owner review; no real AI, delivery or ERP integration has been enabled.

Interactive UI/UX prototype for company intelligence, AI-assisted content, digital campaigns and qualified lead generation.

## Scope

- **16 modules, 64 submodules, 192 workflow phases**, mapped to the functional blueprint.
- Every submodule has four editable demo fields, a review gate, and a distinct example result.
- CSV preview/import, duplicate detection, company search, copy generation simulation, creative approval, campaign pause/resume, inbox qualification and idempotent ERP handoff simulation.
- Responsive desktop/mobile interface, keyboard navigation, global search, module explorer, local session state and reset.

All people, company records and contact endpoints are fictional. `.example` domains are reserved examples. No live AI calls, campaigns, messages, authentication, CRM or ERP connections are made. UI controls that represent integration/AI processing are labelled as simulations. Sales, orders, revenue and KPI calculations remain in the existing ERP.

## Run

Requires Node.js 18+; no package installation needed.

```sh
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

This is a reviewable prototype, not production marketing software. Production requires real APIs, consent enforcement, server-side access control, data storage, background jobs, ERP contract validation, monitoring and provider-specific quality checks. The workflow result examples are predefined; changed inputs are included in review and export but do not invoke real AI. Live SEO, OCR, media generation and external publishing are not implemented in this prototype.

## Files

- `requirements.json`: module/submodule/phase requirements in Bengali.
- `demo.js`: fictional company data and 64 distinct work items.
- `app.js`: views, interactions and state.
- `styles.css`: responsive visual system.
- `bundle.js`: generated standalone browser app, including all requirements and fixtures.
- `build.mjs`: zero-dependency bundle generator.
- `server.mjs`: local static server.
- `qc.mjs`: deterministic QC without network or third-party dependencies.

The local authoring checkout uses `dist/`; the public GitHub Pages copy uses the same assets at repository root.
