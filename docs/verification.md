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
| Render | Workspace `iGrow` (`tea-dba71gjbc2fs73aa7skg`) | Confirmed by owner; free web service srv-dbbiaouq1p3s73cngaig is live |

SHA OS and its resources were not modified. No paid plan was purchased.

## Production acceptance

The owner supplied the dedicated repository, authorised the initial production migration, and explicitly confirmed the Render workspace named iGrow under igrowacademy.nn@gmail.com. All earlier approval blockers were resolved.

Deployment `dep-dbbiapeq1p3s73cngcfg` reached **live** on the free Render service `srv-dbbiaouq1p3s73cngaig` in Singapore. The deployed app connects to the separate Neon production branch. Public HTTPS checks passed:

- `/`: 200 and compiled React assets served.
- `/api/health`: 200, `status: ok`, timezone Asia/Kolkata.
- `/api/setup-status`: 200, `required: true`.
- `/api/records`: 401 without a session.
- Chromium: the one-time owner setup page rendered with its private token field and zero JavaScript page errors.

Read-only production database checks confirmed no accounts or operational records were created during deployment. The migration record persists in Neon. No default owner credentials or demo records were seeded. `docs/deployment-status.json` records the deployed source commit and checks.

The full local restart/login suite passed. Authenticated **production** persistence is still pending the owner claiming the account and entering their own data, so this is not represented as tested. Follow `docs/owner-setup.md` to complete private setup, then check refresh and fresh-login behaviour. The direct-creation tool used Render's default TCP readiness check; the HTTP `/api/health` endpoint was separately verified.

## Known limits

Server-side permissions, SQL transactions, immutable posted ledger entries and private durable files are implemented. The initial app deliberately uses manual posting for recurring charges, late fees, instructor payouts, notices and payment recording. It has no external payment/messaging integration. CSV imports use UUID reference columns rather than matching ambiguous names. The UI paginates locally after fetching the user's authorised records; this needs server-side pagination before large deployments. PostgreSQL private files have a 2 MB limit. Richer assessment rubrics, galleries, automated recurrent jobs and a marketing website are outside this initial implementation; the core learning entries and private photo uploads are functional.
