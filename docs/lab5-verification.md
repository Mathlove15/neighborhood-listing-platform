# Lab 5 verification and configuration

Partners: Charles Braden and Diana Moron-Mendez.

## Database and reproducibility

- Schema and RLS enablement: `supabase/migrations/001_create_tables.sql`.
- Grants and policies: `supabase/migrations/002_access_policies.sql`.
- Fictional fixtures: `supabase/seed.sql`.
- Entity relationship diagram: `docs/database-design.md`.
- Four-role SQL tests: `tests/rls_tests.sql`.
- Charles previously applied both migrations in the separate `lab5-rebuild-test`
  development project, created the two test authentication users, applied the
  seed, and observed all 16 SQL checks pass. This clean rebuild is recorded in
  `docs/ai-log.md` and commit `31194a1`.
- The original SQL suite expects the original seed counts. Run it in a clean
  seeded test project; additional retained API/browser drafts change those counts.
  Do not delete drafts or change production policies merely to force a pass.

Rebuild order in a fresh development project:
1. Apply migration 001.
2. Apply migration 002.
3. Create `owner@example.com` and `other@example.com` in Supabase Authentication
   using private test passwords. Ensure email confirmation permits testing.
4. Run the seed, which resolves those users' actual UUIDs and creates their profiles.
5. Run the SQL suite in the privileged SQL Editor. It switches roles and rolls back.

Schema review: every table has a primary key; the join table has a composite key.
Foreign keys enforce profile, listing and sponsor relationships. Required fields
are NOT NULL; blank names, titles and messages and negative prices are rejected.
Creation timestamps default to now(). Foreign keys use ON DELETE CASCADE: deleting
an authentication account can remove its profile, owned properties and dependent
links/inquiries. Administrative deletion must account for that intentional behavior.

## Current application verification (observed)

Implementation commit: `402f049` on `diana-week5-crud`.

- ESLint completed without errors or warnings.
- Existing property-schema unit tests: 6 passed, 0 failed.
- Production build and TypeScript checks passed.
- API suite: all 16 checks passed against the running production build.
  Retained unapproved fixture: `8bfcaa86-2b19-4434-b192-2d988affb0f1`.
- API checks cover approved public reads; unsigned/invalid-token rejection;
  invalid price/title and forged ownership/approval fields; persisted owner ID;
  cross-user and approved-record update denial; empty/approval update rejection;
  owner draft updates; and exclusion of the retained draft from public GET.
- Browser sign-in as the owner succeeded. Draft creation at 1500 succeeded.
  Editing the same draft to 1600 succeeded and remained unapproved.
- Partners reported that a negative-price save showed an error, sign-out returned
  the sign-in form and disabled saving, and a refreshed public page showed only
  the approved sample. These manual checks were reported by the partners.

## Additional evidence commands

- `node scripts/lab5-secret-scan.mjs`: pattern scan of tracked files/all-ref patch
  history, credential-path history checks and environment-name checks. Writes its
  actual result to `docs/lab5-secret-scan.txt`; findings require review before PR.
- `npx.cmd playwright test --config=playwright.lab5.config.ts`: browser tests for
  loading, empty results, safe error/retry recovery and invalid response data.
  These intercept only the test browser's read requests; no database records or
  policies are changed. This file does not claim these new checks have passed.

## Redacted configuration

Place these names in an ignored `.env.local` with the development project's actual values:

```dotenv
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=YOUR_PROJECT_PUBLISHABLE_OR_ANON_KEY
```

The server client uses those two server environment variables and the caller's
Bearer token. No service-role key is needed for ordinary listing routes. Do not
put privileged credentials in NEXT_PUBLIC variables or commit them. A reference
to a variable name is not a credential value. `.gitignore` ignores `.env*` except
the placeholder `.env.example`.

The client validates form data, but server validation and database grants/RLS
enforce authorization independently. POST derives owner_id from verified auth,
and PATCH restricts IDs, ownership and unapproved rows. Both use selected columns
and Supabase query methods rather than concatenating SQL. The password sign-in
route uses a server-created client; access tokens stay in React memory, and the
form clears passwords after attempts. Refresh requires signing in again.

There is no admin approval endpoint in this lab implementation. service_role
access is demonstrated in the SQL tests; its key must remain in authorized server
or administrative workflows. The static sponsor example is not evidence of a
database-driven sponsor UI; sponsor visibility is covered by the RLS tests.

## Contribution and release handoff

Charles: schema/relationship review, numbered migrations, fictional fixtures,
RLS policies and SQL testing, clean rebuild, and coordination/review of integration.
Related database commits and original AI consultation are in `docs/ai-log.md`.

Diana: application integration on her branch, running and reporting the build,
lint, unit/API and browser checks, and committing/pushing `402f049`. ChatGPT
assisted with code and diagnosis, including the replacement form and sign-in route.

Before submission: record the new scan/UI results; review the PR changes and
history; obtain the partner's actual review; provide repository and PR URLs,
deployment/demonstration URL when applicable, and each partner's contribution.
Do not label an older deployed page as this Lab 5 version without verifying it.

## Final observed checks
- Browser-state tests: 3 passed after narrowing alert selectors to Featured properties.
- Final lint and production build: passed.
- Secret/history scan: no findings for the checked rules; see lab5-secret-scan.txt.
