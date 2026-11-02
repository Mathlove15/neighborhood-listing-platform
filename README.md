# Neighborhood Listing Platform

A responsive neighborhood property listing platform created for CIS 3610 Lab 1.

## Live Website

[View the deployed website](https://neighborhood-listing-platform-vert.vercel.app)

## Features

- Property listings
- Neighborhood sponsor information
- Accessible voice-help section
- Responsive page layout

## Technology Stack

- Next.js
- TypeScript
- Tailwind CSS
- Vercel

## Run Locally

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Then open `http://localhost:3000` in a browser.
## Lab 2 Component Hierarchy

- Page
  - SearchFilters
  - ListingGrid
    - PropertyCard
    - PropertyCard
    - PropertyCard
  - SponsorBanner

  ## Midterm Setup

Branch: `exam/practical-persistence-eval`

### Database

For a new Supabase project, run these migration files in order using
the Supabase SQL Editor:

1. `supabase/migrations/001_create_tables.sql`
2. `supabase/migrations/002_access_policies.sql`
3. `supabase/migrations/20261029140000_exam_schema_persistence.sql`

The exam migration upgrades the earlier schema.
Do not rerun these scripts on the existing configured database.
The older `supabase/seed.sql` targets the earlier schema and should
not be run after the exam migration.

### Environment Settings

Create `.env.local` using `.env.example` as a template. Configure:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Keep actual keys in local environment settings or hosting secrets.
Never commit them or prefix the administrator key with `NEXT_PUBLIC_`.

`createSupabaseServer()` handles public and authenticated requests.
`createSupabaseAdmin()` is reserved for trusted server administration.

### Run and Verify

Install dependencies with `npm ci`.
Start locally with `npm run dev`.
Check the production build with `npm run build`.

Listings display their linked active sponsors and sponsor tiers.
Inquiries are stored in Supabase; email notifications are not implemented.

Requirements: `docs/requirements.md`
Security verification: `docs/security-audit.md`
AI assistance record: `docs/ai-log.md`