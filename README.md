# iGrow Learning Centre OS

TypeScript + React + Express + PostgreSQL application for iGrow, Nanganallur, Chennai. All financial amounts in the posted ledger are integer paisa. Schedules and display dates use Asia/Kolkata.

## Release status

Live application: https://igrow-learning-centre-os.onrender.com

Repository: https://github.com/igrowacademynn-art/iGrow-Os

Deployed on the free Render service in the confirmed iGrow workspace, with the separate iGrow Neon production database. Public HTTP checks passed: app and health return 200, setup is required, and operational records return 401 without login. The owner setup page was verified in Chromium with no JavaScript errors.

**First step:** Follow [docs/owner-setup.md](docs/owner-setup.md) to claim the owner account using the private `BOOTSTRAP_TOKEN` in Render. There are no default credentials. Production has no accounts or operational records before that setup.

All six unit tests and the eight requested local E2E scenarios passed. Authenticated production refresh/login verification remains pending the owner's private setup. See `docs/verification.md` and `docs/deployment-status.json` for scope and limitations.

SHA OS was not changed. No paid resources were purchased.

## Local setup

Use Node.js 24 and an isolated PostgreSQL database (or Neon development branch).

```sh
npm ci
cp .env.example .env
# Fill in private database URLs, origin and setup token in .env.
npm run build
npm start
```

`npm start` runs versioned migrations with the direct connection, then serves the built React app and API on `PORT` (default 3000). The migration runner is transactional and uses an advisory lock. Never point a test run at production. Local UI changes require `npm run build`; `npm run dev` runs the API/server without rebuilding the frontend.

Generate a private owner token with:

```sh
node -e "process.stdout.write(require('node:crypto').randomBytes(32).toString('hex'))"
```

## Render deployment

The `render.yaml` defines one **free** Node web service in Singapore and no Render database. It cannot affect SHA OS because it uses its own service name and separate Neon project. Set the following private environment variables:

- `DATABASE_URL`: pooled URL for the iGrow **production** branch.
- `DATABASE_URL_UNPOOLED`: direct URL for that same branch, used only for migration.
- `APP_ORIGIN`: exact HTTPS service URL, without a trailing slash.
- `BOOTSTRAP_TOKEN`: Render-generated private token, or a cryptographically random value of at least 32 characters.

Do not set `PGLITE_PATH` in production. The test adapter refuses to run outside `NODE_ENV=test`. No demo records are seeded in production. The first owner setup creates only the centre, its settings and configurable enquiry stages.

Deploy from the dedicated repository in the selected Render workspace, inject the environment variables, check `/api/health`, and complete the production persistence and permission checks. No paid resource is needed by this configuration. Free hosting may sleep between visits; validate suitability before daily operational use.

## Secure first owner setup

1. Open the deployed HTTPS application.
2. In the one-time setup form, enter the `BOOTSTRAP_TOKEN` from the service's private environment settings.
3. Choose an owner name, email and password of 12–128 characters. There are no default credentials.
4. After setup, remove `BOOTSTRAP_TOKEN` from Render. The singleton bootstrap record prevents public setup from reopening, even after all accounts are disabled.
5. Create staff and parent accounts in **Users & access**. Link every parent to their family. Share credentials privately, then ask them to use **My account** to choose a new password. Password reset is currently performed by an owner; email reset delivery is not configured.

## Everyday usage

- Set up centres, programs, staff, batches and fee plans. Choose the default centre in Settings.
- Create enquiries and follow-up dates. Drag cards between pipeline stages or use Edit on a phone. Convert an enquiry once into a family, guardian, child and multiple batch enrolments.
- End or pause an old enrolment and create another when changing batches. The old record and attendance remain linked to their historical batch.
- Use **Class attendance** for individual or batch marking. Use **Children inside** to check in, hand over between programs, and check out only after verifying an authorised guardian. A program handover does not mark a building departure.
- Create outside-customer records for walk-in sales or events; their IDs keep customers with identical names separate. Post charges by child, family, selected children, batch or outside customer. Categories are free text so fees, tours, materials and other income can be distinguished. Instalments are separate charges/due dates; opening balances are explicitly described charges. Discounts require reasons.
- Record payments separately from charges. Add one or more allocations; unallocated non-deposit balances are credit/advances. Refundable deposits cannot settle charges. Apply credit later with **Apply advance / credit**. Receipt amounts show the amount actually received. Use **Print / save PDF** for downloads.
- Correct charges with credits/cancellations and payments with refunds. Refunds reverse sufficient allocations and reopen the related balances. No posted financial record can be edited or deleted through the generic API.
- Create an item, then record its opening stock as an explained adjustment. Purchases add stock. Sales reserve quantities and create a charge; delivery independently removes physical stock. Customer returns add stock. Process financial refunds/credits separately, so a physical return never silently changes money records.
- Register event participants to post an event-linked charge. Record event expenses with that event selected. Reports calculate net allocated collections, outstanding balances, expenses and cash surplus/shortfall without duplicating payment entries.
- Record learning, daycare, incidents, consents, tasks, expenses and staff payments through their respective forms. Only explicitly shared learning/daycare entries appear to parents.
- Upload child photos or PDFs through **Private documents**. Files are stored durably as PostgreSQL bytes, not on ephemeral Render disk. Set parent visibility explicitly. Parents cannot download another family's files, including by guessing IDs.
- Create notices and use the manual WhatsApp link. There is no automatic messaging or payment gateway.

## Imports, exports and reports

CSV templates contain canonical field names. Download a related module's export to find IDs for reference fields. The importer supports field mapping, preview, per-row validation, within-file duplicate checks, optional blanks and single-centre defaults. It rejects the entire save if any row is invalid. Multi-select values use JSON arrays. Limit 500 rows per import.

Operational tables support search, status/date filters and 12-row display pagination. All authorised records are currently loaded for the single-centre workspace, so server-driven pagination should replace this approach before large-scale adoption.

Export buttons download scoped CSV data with spreadsheet-formula protection. Reports include enquiry conversion, attendance, inventory, billing, collections, expenses and event results. Billed totals, collections, unallocated credits, refundable deposits and refunds are kept separate.

## Tests

```sh
npm test
npm run build
npx playwright install chromium --only-shell
npm run test:e2e
```

The E2E command creates a fresh, isolated local PostgreSQL engine using PGlite under `.test-db/`, generates random test credentials, marks all fixtures `TEST`, launches the server and exercises the API, browser and restart flow. It does not connect to Neon or production. `docs/test-results.json`, if present, records the actual completed run. Browser dependencies must be installed in the execution environment.

See [docs/verification.md](docs/verification.md) for the distinction between local tests, Neon schema checks and pending production tests.

## Architecture and limits

- `shared/schema.ts`: module metadata and strict schemas used by the UI and API.
- `shared/actions.ts`: workflow form definitions.
- `server/domain.ts`: relationship checks, family scopes, stock/ledger calculations and atomic workflows.
- `server/index.ts`: authenticated API, HTTP security, owner setup, import/export and private files.
- `server/db.ts`, `server/migrate.ts`, `migrations/`: database access, versioned migrations and audit.
- `client/`: responsive React interface.

The schema uses a typed JSONB aggregate store for configurable operational modules. Relationships, capacities and ledger invariants are enforced by server validation inside serialized transactions. Separate charge, payment, allocation, refund and stock-movement records are immutable through the public API. Audits retain before/after values. A global write lock favors correctness at a small centre; review concurrency and add more relational constraints before scaling to many branches.

Known product limits: no automatic fee recurrence, late-charge generation, recurring checklist scheduler, automatic instructor commission calculation, automatic WhatsApp/email, integrated payment gateway, external object storage, file malware scanner, OCR, or email password recovery. Fee plans and instructor arrangements are configuration; charges and instructor payouts are posted explicitly. Private files support child, staff and expense-linked JPEG/PNG/PDF up to 2 MB. Richer photo portfolios require extension. Staff can create consent requests; authenticated parents can grant, decline or withdraw consent for their own children. Parent responses retain audit history. Other parent portal records are read-only. This version does not include a public marketing/admission website. It provides a public login/owner-setup entry point. These limitations must not be represented as completed integrations or full production acceptance.
