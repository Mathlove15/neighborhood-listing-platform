# Row-Level Security Audit

Date: November 1, 2026
Environment: Supabase project neighborhood-listing-dev
Migration: supabase/migrations/20261029140000_exam_schema_persistence.sql

## Method

Tests were run in the Supabase SQL Editor.
SET LOCAL ROLE simulated anonymous, authenticated, and service_role access.
Authenticated tests also set the test user's identity.
Test changes were enclosed in transactions and rolled back.

## Observed Results

| Test | Expected result | Observed result | Outcome |
| --- | --- | --- | --- |
| Check RLS on all five application tables | Enabled on every table | All five showed true | Pass |
| Anonymous visitor reads properties | Approved listings visible; drafts hidden | Maple Street approved listing visible; Oak Street draft absent | Pass |
| Anonymous visitor submits a valid inquiry | Insert allowed | Visitor inquiry accepted | Pass |
| Anonymous visitor reads inquiries | Access denied | Permission denied, error 42501 | Pass |
| Owner reads their properties | Own draft and approved listing visible | Both listings returned | Pass |
| Owner updates their draft | Update allowed | Draft price temporarily changed to 1250 | Pass |
| Another signed-in user updates that draft | No rows changed | listings_changed = 0 | Pass |
| Owner reads inquiries about their property | Inquiry visible | Existing fictional inquiry returned | Pass |
| Inquiry sender reads inquiries | No inquiries visible | inquiries_visible = 0 | Pass |
| Trusted service_role updates a listing and reads inquiries | Update and read allowed | listings_changed = 1; inquiries_visible = 1 | Pass |
| Owner updates their approved listing | No rows changed | listings_changed = 0 | Pass |

## Access Design

Anonymous visitors may submit inquiries about approved properties.
Inquiry contents are private to the property owner and trusted administration.
Administrative access uses service_role in trusted server code.
An ordinary profile with role = 'admin' does not automatically receive service_role access.

## Verification Limits

These results cover the SQL tests listed above.
Local API checks are recorded below. Browser behavior and deployment still require testing.
Additional checks remain for sponsor visibility, owner self-approval,
and isolation between two users who both have the property_owner role.
## API Verification

Tested locally on November 1, 2026:

- GET /api/properties returned the approved Maple Street listing.
  The private draft was absent.
- POST with a short address, negative price, and extra status field
  returned 400 Bad Request.
- POST with valid data but no sign-in token returned 401 Unauthorized.
- POST as owner@example.com with valid data returned 201 Created.
  The saved listing had status draft.
- The newly created test draft was deleted successfully afterward.
- npm run build passed with /api/properties in the route list.
## Browser Verification

- Signed in through the website as owner@example.com.
- Saved 789 Fictional Pine Street using the listing form.
- Confirmed the record exists in Supabase with status draft.
- Corrected its price to 1400 using the SQL Editor.
- Refreshed the homepage: only the approved Maple Street listing appeared.
- The Pine Street browser-test draft remains in the database.

## Additional SQL Verification — November 1, 2026

- Anonymous sponsor access returned 1 sponsor and 1 sponsor link,
  matching the expected fictional test data.
- Owner self-approval was blocked with error 42501:
  new row violates row-level security policy for properties.
  ROLLBACK was run afterward.
- Temporarily assigned the second test user the property_owner role.
  That user saw 0 rows for the first owner's tested draft and
  changed 0 listings.
- The second-owner test was rolled back, restoring the original
  profile role and leaving listing data unchanged.

These checks complete the sponsor visibility, owner self-approval,
and two-owner isolation checks previously listed as outstanding.

## Inquiry Browser Verification — November 1, 2026

- Opened the Maple Street inquiry form using Contact owner.
- Submitted a fictional inquiry as visitor@example.com without signing in.
- The website displayed a success confirmation.
- A separate SQL query confirmed the email, message, and property ID
  were saved in Supabase.
- The test inquiry remains in the database.
- This feature saves inquiries; it does not send email notifications.

## Keyboard and Layout Checks — November 2, 2026

- Keyboard navigation showed visible focus on the inquiry email field,
  message field, and Send inquiry button.
- Inspected the page in Chrome's responsive preview at widths of
  375, 768, and 1280 pixels.
- The visible property card and inquiry controls fit within their containers.
- These were manual checks, not a full accessibility audit.