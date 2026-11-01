# Midterm Requirements

Feature: Sponsor-Backed Property Listing & Inquiry Subsystem.

These are acceptance criteria to verify during implementation.
They are not claims that testing has passed.

## Story 1: Property Owner

As a registered property owner, I want to submit listing drafts
so prospective buyers can review them after staff approval.

Role: authenticated user with profiles.role = 'property_owner'.
Scope estimate: Medium.

Acceptance criteria:
- Given a signed-in property owner, when they submit valid listing
  data, then the property is saved with status = 'draft' and
  owner_id equal to their auth.uid().
- Given invalid data or extra fields, when the owner submits it,
  then the API returns HTTP 400 with structured error details.
- Given an owner's draft or rejected listing, when that owner
  updates it, then the update succeeds.
- Given another owner's listing or an approved listing, when
  the owner attempts to update it, then the update is denied.

Implementation links:
- [Database migration](../supabase/migrations/20261029140000_exam_schema_persistence.sql)
- [Property route: POST](../src/app/api/properties/route.ts)
- [Property validation](../src/schemas/property.ts)
- Tables: profiles and properties.
- Enforcement: authenticated session and owner access policies.

## Story 2: Public Inquirer

As a prospective resident, I want to view approved properties
with their sponsor tiers and submit an inquiry while keeping
other people's inquiries private.

Role: anonymous visitor or authenticated public user.
Scope estimate: Large.

Acceptance criteria:
- Given a public visitor, when they request listings, then only
  approved properties and active linked sponsors are shown.
- Given a linked active sponsor, when its property is displayed,
  then the sponsor's name and tier are available.
- Given a valid property reference, email, and message of at least
  10 characters, when a visitor submits an inquiry, then it is saved.
- Given a public inquirer, when they request existing inquiries,
  then no inquiry records are disclosed.
- Given the property's owner, when they request inquiries,
  then they can read inquiries for their own properties only.

Implementation links:
- [Database migration](../supabase/migrations/20261029140000_exam_schema_persistence.sql)
- [Property route: GET](../src/app/api/properties/route.ts)
- [Inquiry route: POST](../src/app/api/inquiries/route.ts)
- Tables: properties, sponsors, property_sponsors, and inquiries.
- Enforcement: public read filters and inquiry access policies.

## Story 3: Platform Administrator

As a platform administrator, I want full access to application
records so I can conduct compliance audits.

Role: verified platform administrator.
Scope estimate: Medium.

Acceptance criteria:
- Given an authorized administrator using elevated server-side
  execution, when they read or write any of the five application
  tables, then the operation succeeds within database constraints.
- Given a public user or property owner, when they attempt to use
  administrator access, then access is denied.
- Given a browser request, when the application responds,
  then no service-role secret is included in the response.

Implementation links:
- [Database migration](../supabase/migrations/20261029140000_exam_schema_persistence.sql)
- [Server client](../src/lib/supabaseServer.ts)
- [Property route](../src/app/api/properties/route.ts)
- [Security audit](security-audit.md)
- Tables: all five application tables.
- Enforcement: elevated credentials used only in trusted server
  execution; public routes never grant administrator authority.

## Traceability Note

Links identify the intended implementation files. Some files
will be created in the next steps. Administrator override is
verified through trusted server execution, not a public admin route.