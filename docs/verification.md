# Verification and release handover

## Passed in this workspace

- TypeScript typecheck and optimized React production build.
- Six unit tests: integer-paisa arithmetic, refund allocation reversals, reservation vs physical inventory, parent scopes, invalid schema values and salted password verification.
- Eight requested end-to-end scenarios against an isolated local PostgreSQL engine (PGlite): enquiry admission into multiple programs; class attendance and daycare handover with authorised pickup; partial and final payments; material sales and deliveries; event collection/expense reporting; import validation and export; parent isolation; persistence after server restart, logout and fresh login.
- Additional API checks: duplicate admission, repeated payment submission with the same idempotency key, cross-family pickup, overdelivery, over-allocation, refundable-deposit isolation, credits, refunds, stale edits and untrusted request origins.
- Browser checks: desktop and mobile login and dashboard; billing and enquiry pipeline rendering; no JavaScript page errors or horizontal overflow in the inspected views.
- `render.yaml` validates against Render's current published JSON Schema. Render CLI/platform validation is not available in this workspace; resource creation remains untested.
- Versioned initial SQL migration runs successfully against the separate Neon `implementation-tests` branch, producing nine application tables. Its records/users remain empty. The user subsequently authorised production migration; `001_core.sql` was applied to the separate iGrow production branch. Operational records and users remain empty before owner setup.

The actual latest E2E run is recorded in `test-results.json`. All test credentials are generated at runtime; no operational data or default owner password is included.

## Infrastructure created

| Resource | Identifier | State |
|---|---|---|
| Neon project | `shiny-dew-84867995` | Separate iGrow project, Singapore, existing free organisation |
| Production branch | `br-spring-bird-b3gop6sh` | Initial migration applied; no operational records or owner account |
| Test branch | `br-twilight-sun-b3rq1l3n` | `implementation-tests`, migration verified, no operational records |
| GitHub | `igrowacademynn-art/iGrow-Os` | Dedicated repository supplied by owner; source uploaded |
| Render | Workspace `iGrow` (`tea-dba71gjbc2fs73aa7skg`) | Service creation blocked pending explicit confirmation of this workspace |

SHA OS and its resources were not modified. No paid plan was purchased.

## Production acceptance

The user supplied the dedicated repository and authorised workspace selection and the production migration on 20 October 2026. That resolved the schema and repository prerequisites. Render service creation was subsequently rejected by automatic approval review because the earlier “Different workspace” selection conflicts with choosing the visible iGrow workspace without naming it explicitly. No Render service was created; explicit confirmation of the exact workspace is required.

Render deployment and public HTTP checks are recorded in `deployment-status.json` when completed. Owner setup remains private and must be completed by the owner with a password of their choice. No test owner or default password is created in production. The full local restart/login suite passed, but production authenticated persistence cannot be certified before the owner claims their account. Keep real operational testing outside production unless authorised by the owner.

The local environment cannot directly resolve the Neon host (`EAI_AGAIN`); connector-based schema checks work. Deployment acceptance must verify connectivity from Render itself.

## Known limits

Server-side permissions, SQL transactions, immutable posted ledger entries and private durable files are implemented. The initial app deliberately uses manual posting for recurring charges, late fees, instructor payouts, notices and payment recording. It has no external payment/messaging integration. CSV imports use UUID reference columns rather than matching ambiguous names. The UI paginates locally after fetching the user's authorised records; this needs server-side pagination before large deployments. PostgreSQL private files have a 2 MB limit. Richer assessment rubrics, galleries, automated recurrent jobs and a marketing website are outside this initial implementation; the core learning entries and private photo uploads are functional.
