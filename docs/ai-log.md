# AI Interaction Log

| Tool | Prompt | Output used | Output rejected | Verification | Commit |
|---|---|---|---|---|---|
| ChatGPT | In plain language, explain the proposed technology stack for a neighborhood property listing platform: Next.js with the App Router, TypeScript, and Tailwind CSS. Explain what each technology does, why it is useful for this project, and how the technologies work together. Do not include any credentials or secrets. | Plain-language descriptions of Next.js, TypeScript, Tailwind CSS, and responsive design. | None at this stage. | Compared the response with the required technology stack in the lab instructions. | a5901ec |
| Gemini | In plain language, explain the proposed technology stack for a neighborhood property listing platform: Next.js with the App Router, TypeScript, and Tailwind CSS. Explain what each technology does, why it is useful for this project, and how the technologies work together. Do not include any credentials or secrets. | Explanations of SEO, server rendering, fast page loads, and property-data validation. | Extra technical details about backend APIs were not needed for the basic explanation. | Compared the response with the required technology stack in the lab instructions. | a5901ec |
| Google AI Studio | Act as a senior teaching assistant. Propose a minimal Next.js App Router + TypeScript + Tailwind starter for a neighborhood property platform. Give a file plan, terminal commands, accessibility requirements, and a verification checklist. Never invent command results or credentials. | Used the suggested stack, file-plan concepts, accessibility requirements, and verification ideas. | Did not use unverified command results or credentials. | Created the application with the instructor-required settings and confirmed that the local page loaded. | e46ee87 |

## Two Differences Between ChatGPT and Gemini

1. Gemini provided a more technical explanation. It discussed Server Components, pre-rendering, backend APIs, and how search engines index property information. ChatGPT focused more on page organization and navigation using simpler language.

2. ChatGPT emphasized visual design and responsiveness by discussing buttons, menus, filters, and layouts for desktops, tablets, and phones. Gemini placed greater emphasis on performance, SEO, and preventing property-data errors.


## Lab 2: TypeScript Interface Consultation

- **Date:** September 25, 2026
- **Tool:** Google AI Studio — Gemini 3.7 Flash
- **Purpose:** Generate typed data blueprints for property listings and sponsors.

### Prompt

Create TypeScript interfaces only for a neighborhood property listing application.

Create a `Property` interface with these required fields: `id`, `title`, `address`, `price`, `facts`, `imageUrl`, `imageAlt`, and `href`. Include `badge` as an optional field.

Create a `Sponsor` interface with these required fields: `id`, `name`, `imageUrl`, `imageAlt`, and `href`. Include `tagline` as an optional field.

Return only the TypeScript interfaces. Do not create React components, JSX, functions, sample data, or explanations.

### Response and Evaluation

Gemini returned `Property` and `Sponsor` interfaces with the requested field types. It used `string[]` for the property facts, `number` for the price, and question marks for the optional `badge` and `tagline` fields.

I reviewed the response and confirmed that all required and optional fields were correct. I then added the reviewed interfaces to `src/types/index.ts`. I did not use Gemini to create the React components or sample data.

## Lab 2: Reusable Components and Page Assembly

- **Date:** September 29, 2026
- **Tool:** ChatGPT
- **Purpose:** Create and explain reusable interface components and assemble the property-listing page.

### Prompt Summary

I asked ChatGPT to guide me step by step while creating a reusable `PropertyCard`, a reusable `SponsorBanner`, search filters, three sample property listings, responsive layouts, and accessibility features. I also asked for explanations of the code and Git commands in beginner-friendly language.

### Response and Evaluation

ChatGPT suggested TypeScript and React code for `PropertyCard.tsx`, `SponsorBanner.tsx`, `SearchFilters.tsx`, and `page.tsx`. It also explained the component structure, terminal commands, Git staging, commits, and local testing.

I reviewed the suggested code, saved each file, ran `npm run lint`, and tested the website at `http://localhost:3000`. The lint check passed, and I visually confirmed that the search controls, three property cards, sponsor banner, responsive layout, and accessibility section appeared on the page.

## Accessibility and Responsive Verification

**Date:** October 1, 2026  
**Website:** https://neighborhood-listing-platform-vert.vercel.app

### Keyboard Testing

- Tab moved forward through the form controls and property links in a logical order.
- Shift + Tab moved backward through the same controls.
- Return and Space activated the Search button.
- A visible focus outline showed which item was selected.
- No keyboard-accessibility failures were observed.

### Lighthouse Accessibility Test

- Tested the deployed website with Chrome Lighthouse in an Incognito window.
- Accessibility score: 100.
- Lighthouse reported no automated accessibility issues.

### Responsive Layout Testing

- 375 pixels: one-column layout displayed correctly.
- 768 pixels: two-column layout displayed correctly.
- 1280 pixels: three-column layout displayed correctly.
- No horizontal overflow or cut-off content was observed.

## Synthetic Data Generation

- **Tool:** Google AI Studio (Gemini Flash Latest)
- **Method:** Structured Output using JSON Schema (`schemas/property.schema.json`) wrapped in an object root.
- **Output:** 5 valid fictional California property records saved to `data/generated/properties.json`.
- **Note:** Data is strictly synthetic for development and runtime validation testing.

## Step 8: Validation Fixes and Layer Explanations

- **Root Structure Mismatch (`type: object` vs `array`):** Fixed at the **Data Generation Layer** by standardizing the generated output into discrete property records conforming directly to the entity schema.
- **Unexpected Property (`title` rejected by `additionalProperties: false`):** Fixed at the **Data Generation Layer** by omitting fields absent from the contract.
- **Pattern Failures (`property_id` and `sponsor_id` regex):** Fixed at the **Prompt/Generation Layer** by aligning ID formats to `^PROP-[0-9]{3}$` and `^SPON-[0-9]{3}$`.
- **Nested Object Requirement (`address`):** Fixed at the **Prompt/Generation Layer** by nesting `street`, `city`, and `state` objects rather than top-level strings.
- **URI Format Plugin:** Handled at the **Tooling Layer** by providing `-c ajv-formats` to Ajv Draft 2020.

## Step 9: TypeScript Type Strategy and Single Source of Truth

- **Decision:** Adopted a single Zod source of truth (`src/types/property.ts`) with inferred TypeScript types (`z.infer<typeof PropertySchema>`).
- **Rationale:** 
  - Generates static TypeScript types and runtime validation rules from one unified definition, preventing drift between compile-time checks and incoming JSON payloads.
  - Matches the existing `schemas/property.schema.json` contract (enforcing regex patterns, enum values, and nested address objects) while integrating seamlessly with Next.js components.

  ## Step 10: Component Integration and Fail-Safe Rendering

- **Integration:** Replaced hardcoded listing items in `src/app/page.tsx` with dynamic records from `data/generated/properties.json`.
- **Validation Pipeline:** Each record is validated against `PropertySchema.safeParse()` at runtime. Valid items are mapped to the UI `Property` type required by `<PropertyCard />`.
- **Fail-Safe Mechanism:** Any record failing schema parsing logs a structured warning (`console.warn`) and returns `null`, preventing malformed items from breaking the page render or throwing unhandled runtime exceptions. An empty-state fallback UI renders if zero valid items exist.

## 2026-10-16 - Step 14: Peer Review Handoff & Contract Merge

- **PR:** Opened Pull Request #5 (`feat(contract): implement dual-layer schema validation, test suite, and ADR`).
- **Peer Review Sign-off:** Received verification review from peer reviewer (`dianamoranm`) confirming JSON Schema compliance, runtime Zod validation, test coverage (5/5 passing), and ADR 001 architecture documentation.
- **Normalization Review:** Evaluated amenity representations (free text vs controlled enum vs join table); consolidated amenities to controlled enum values across schema and Zod types.
- **Merge & Sync:** Merged PR #5 into `main` and fast-forwarded local `main` branch. All tests pass on `main`.

## Lab 4: Discovery, Requirements, and MVP Planning

- **Date:** October 23, 2026
- **Author:** Charles Braden
- **Tools:** Google Gemini and ChatGPT
- **Context:** Fictional scenarios and simulated stakeholder information were used as permitted by the assignment.

### Prompt Summary

I used Gemini to help prepare discovery and requirements drafts. I asked ChatGPT to review the work and guide me through user stories, acceptance criteria, GitHub issues, priorities, estimates, the project board, MVP scope, implementation, testing, and peer review.

### Output Used and Changes Made

- Organized eight user stories with priorities, size estimates, and project statuses.
- Revised user stories and acceptance criteria for listing review, sponsor cards, sponsor previews, and listing filters.
- Documented the Week 8 MVP scope in `docs/mvp-plan.md`.
- Added draft listing status, an automated test, and a browser-based form that saves drafts in localStorage.
- Corrected sample amenities to match the schema's allowed values.

### Human Review and Verification

I reviewed and applied the changes, ran `npm test` with six passing tests, and ran `npm run build` successfully. I checked that the five fictional listings displayed and confirmed that a saved draft remained after refreshing the deployed preview.

AhmedFarah24 reviewed and approved PR #15. I merged the PR and updated my local main branch.

### Limitations and Corrections

Drafts are saved locally in the browser. Sample property image URLs remain placeholders, so those photos do not load. I corrected earlier story wording and invalid amenity values rather than keeping those suggestions unchanged.

### Related Evidence

- PR: https://github.com/Mathlove15/neighborhood-listing-platform/pull/15
- MVP plan: `docs/mvp-plan.md`

## Midterm Practical — October 29, 2026

Tool: ChatGPT.
Exact user prompt: "Lets do whats do by 2:55"
Goal: Prepare the required in-class progress submission.

| Step / Tool | Prompt Summary | Model Output Used | Model Output Rejected & Rationale | Verification Method | Associated Git Commit |
| --- | --- | --- | --- | --- | --- |
| Repository access / ChatGPT | Guide me through the midterm setup. | Opened repository collaborator settings. | None. | GitHub shows pdt605 has a pending invitation; acceptance is not yet confirmed. | Not applicable: GitHub setting. |
| Branch setup / ChatGPT | Prepare the progress check. | Saved unfinished Lab 5 changes with git stash and created exam/practical-persistence-eval. | None. | Terminal confirmed the stash was saved and the exam branch was created. | Pending. |
| Environment hygiene / ChatGPT | Review the uploaded .gitignore screenshot. | Kept existing environment exclusions and added dist/. | None. | Reviewed .gitignore and git status; no credential files appeared in the status output. | Pending. |

### Remaining Work

Requirements, exam migration, access policies, security tests, API validation, and accessible UI still require implementation or verification against the exam instructions. No exam test results are claimed yet.

## Midterm Practical — November 1, 2026

Tool/model: ChatGPT — GPT-6.1 Sol, Medium, as displayed in the chat.

This entry updates the October 29 progress report. Earlier lab results
describe earlier versions and do not verify the current implementation.

### Prompts and Assistance

Exact user messages from this session included:

- "Before we proceed. Explain to me in simpler terms, what im actually doing on Supabase right now?"
- "npm audit fix means?"
- "Once I type it in the terminal, where does it fix it?"
- "Lets change 1399.92."

Other requests were short instructions to proceed, uploaded code, and
screenshots of results. The following descriptions summarize those
interactions; they are not exact prompt quotations.

ChatGPT provided step-by-step guidance and code for requirements,
the database migration, access policies, SQL security tests,
Zod validation, the Supabase server connection, API routes,
website sign-in, and the database-backed listing form.

### Output Used and Technical Decisions

- Created docs/requirements.md and the versioned exam migration.
- Applied the migration in Supabase and recorded SQL security checks
  in docs/security-audit.md.
- Added a strict Zod schema in src/schemas/property.ts.
  It rejects invalid values and unexpected fields such as status.
- Added a server-only Supabase helper using environment settings.
- Added GET and POST handlers in /api/properties.
  POST verifies the user and assigns ownership on the server.
- Replaced homepage JSON listings with approved Supabase records.
- Added /api/auth/sign-in and connected ListingDraftForm to the API.
- Kept the form's access token in memory. Refreshing clears the
  form's sign-in state.
- Updated Next.js to 16.4.3 following the local npm audit report.

### Suggestions Not Applied and Corrections

- Did not apply the suggested GRANT SELECT for anonymous inquiry
  access. Permission denied was the expected security-test result.
- Did not use npm audit fix --force. The report proposed changes
  outside existing version limits, including a breaking ESLint change.
- Changed the other-user update test to return a count because
  the earlier displayed result showed the identity setup value.
  The revised test clearly returned listings_changed = 0.
- Replaced the old browser-storage form because it did not save
  records in Supabase.
- Updated outdated audit wording after local API testing.
- Corrected the browser-test draft price from 1399.92 to 1400
  through the Supabase SQL Editor.

### Human Verification

I entered and ran the commands, saved the files, reviewed the results,
and shared screenshots for review.

Observed results:

- Row-level security was enabled on all five tables.
- Anonymous access returned the approved listing and denied inquiry reads.
- A visitor inquiry insert succeeded inside a rolled-back test.
- The owner could read and edit their draft.
- The tested other user changed zero draft listings.
- The owner could read the property's inquiry; the sender saw zero.
- The trusted service role could update a listing and read inquiries.
- The owner changed zero already-approved listings.
- GET /api/properties returned the approved Maple Street listing.
- Invalid POST data returned 400; valid data without a token returned 401.
- An authenticated POST returned 201 and status draft.
  That API-test draft was deleted afterward.
- Website sign-in and draft submission succeeded.
- A separate SQL query confirmed the browser-test Pine Street draft.
  That draft remains in Supabase.
- Refreshing the homepage showed only the approved Maple Street listing.
- The latest npm run build passed with the homepage,
  /api/auth/sign-in, and /api/properties.
- The dependency report after updates showed 16 moderate vulnerabilities.
  No claim of zero vulnerabilities is made.

### Remaining Verification

Sponsor visibility, owner self-approval, isolation between two property
owners, current UI accessibility, deployment, and final submission
checks still need review. Earlier accessibility scores do not verify
the updated website.

Associated implementation commit: 95478cd.

## Follow-up Verification — November 1–2, 2026

AI assistance: ChatGPT, GPT-6.1 Sol Medium.

### Assistance Used
- Guided additional SQL security tests.
- Helped implement the inquiry API and property-card inquiry form.
- Explained build results, keyboard navigation, and responsive previews.

### Human Verification
- Anonymous access returned 1 active sponsor and 1 sponsor link.
- Owner self-approval was blocked by row-level security.
- A second property owner could not see or update the tested owner's draft.
- Temporary SQL test changes were rolled back.
- Submitted a fictional inquiry through the website without signing in.
- A separate SQL query confirmed the inquiry was saved in Supabase.
- npm run build passed and included /api/inquiries.
- Inquiry fields and the submit button showed visible keyboard focus.
- Inspected layouts at widths of 375, 768, and 1280 pixels.

### Limits
- Inquiries are saved in the database; email notifications are not implemented.
- Manual layout and keyboard checks are not a full accessibility audit.
- Deployment and final submission checks remain.

Associated implementation commit: f5c140d.

## Deployment Troubleshooting — November 2, 2026

- ChatGPT helped add error logging and identify an invalid Supabase URL in Vercel.
- I corrected the Preview setting and redeployed.
- I verified the approved listing loaded and submitted a test inquiry.
- A SQL query confirmed the deployed inquiry was saved in Supabase.
- Diagnostic logging commit: eb2cc4d.

## Final Rubric Follow-up — November 2, 2026

Tool used: ChatGPT.

ChatGPT provided code and placement instructions to display each
property's linked active sponsors and tiers, add a server-only
administrator client, and update the setup documentation.

I applied the changes manually. I corrected an accidental deletion
of the sponsor mapping with ChatGPT's guidance.

Human verification:
- Ran npm run build successfully after the sponsor changes.
- Confirmed the active sponsor and bronze tier appeared locally.
- Ran a separate read-only administrator connection check successfully.
- Confirmed .env.local is ignored by Git.
- Tested visible keyboard focus, Tab, Shift+Tab, Enter, and Space.

Retained the existing public/authenticated client for user requests
because using the administrator client there would bypass RLS.

The administrator connection check tested the configured key directly;
it did not execute the new createSupabaseAdmin() helper.

Associated implementation commit: bab1ef6.