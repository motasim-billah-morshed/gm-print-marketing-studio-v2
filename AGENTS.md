# GM Print v2 development scope

## D3 bounded implementation authorization (2026-09-27)

The owner explicitly authorizes local D3/R1a persistent company/contact foundation, auth, import, provenance, consent and UI integration on codex/delivery-3-company-foundation. ERP contract DR-01 blocks live ERP, not this isolated slice. Local TypeScript/PostgreSQL baseline is allowed. Other architecture decisions remain proposed. No paid resources, main merge, public application release or real personal-data migration. D3 is not all R1/v2. User's Delivery 3 request takes precedence over the earlier blanket coding gate below.

- Work only in this v2 repository for future implementation. The sibling gm-print-studio project and original GitHub repository preserve v1.
- Never move/delete the v1 tag or force-push the baseline history.
- Preserve M01–M16 and the existing 64 submodule / 192 workflow IDs.
- Read ARCHITECTURE-REVIEW.md before implementing. It is a proposed review, not approved architecture. Resolve critical decisions with the owner before dependent implementation.
- Preserve the ERP boundary: no salesperson assignment, quotation, order, payment or sales KPI implementation here.
- No real personal data, credentials or production connection secrets in the public demo/repository.
- Each development unit needs requirement, design, implementation, automated/integration/acceptance evidence and documentation. Demo checks do not prove production acceptance.
- Update CHANGELOG.md and build bundle.js after source edits. Run node qc.mjs for prototype regressions.
- Use codex/ branches for feature development; keep main reviewable and compare with v1.
