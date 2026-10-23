# Lab 4: Discovery and Product Requirements

**Course:** CIS 3610
**Team:** Team A — Aster
**Prepared by:** Charles Braden
**Date:** October 23, 2026

## Research Context

This academic project uses fictional scenarios and simulated stakeholder
responses, as permitted by the instructor. These notes do not represent
interviews with real people. Personas and requirements are design inputs
for the prototype.

## 1. Stakeholders and Assumptions

### Property Professional

Scenario: A property manager prepares and maintains neighborhood listings.

Assumptions to explore:
- Repeated data entry makes listing updates time-consuming.
- Saving unfinished work would make listing preparation easier.
- Listings need review before publication.
- Prospective renters frequently browse on phones.

### Local Sponsor

Scenario: A neighborhood business promotes its services alongside listings.

Assumptions to explore:
- The business has limited advertising and design resources.
- A structured template would simplify promotional card creation.
- Previewing business details would help prevent publishing errors.
- The sponsor wants a practical way to judge promotional results.

These are scenario assumptions, not established facts about real businesses.

## 2. Eight Neutral Discovery Questions

1. Can you walk us through how you create, publish, and update a listing?
2. How do you maintain the accuracy of listing information over time?
3. How are descriptions, photos, and prices reviewed before publication?
4. What device or format requirements help people view and use listings?
5. How do you currently promote your business in the neighborhood?
6. What types of community members are your services intended to reach?
7. How do you review promotional details before they are published?
8. How do you decide whether a promotional effort has been successful?

## 3. Question Review

The earlier draft was revised to use neutral language and avoid requesting
sensitive information.

Examples:
- Changed a question focused on "difficulties" to an open question about
  maintaining listing accuracy.
- Focused accessibility questions on devices, formats, and interface needs.
- Asked about audience categories rather than customer identities.

## 4. Invitation and Consent Template

Subject: Invitation to a student project discovery discussion

Hello [Name],

I am Charles Braden, a Cal State LA student working with Team A — Aster.
We are designing a classroom prototype for neighborhood property listings
and local sponsor promotions.

Would you be willing to discuss your general workflow for about 15 minutes?
Participation is voluntary. You may skip questions or stop at any time.
Please do not share customer identities, confidential records, or sensitive
personal information.

With your permission, we would summarize your feedback without identifying
you. De-identified summaries could appear in classroom materials and our
public GitHub repository. We would not record the conversation without
separate permission.

Do you consent to participate and to this use of your de-identified feedback?

Thank you,
Charles Braden
Team A — Aster

This is a draft template. The discovery notes below are simulated.

## 5. Discovery Method

The assignment's permitted fictional/simulated approach was used.
No real participant consent is claimed for the simulated responses.
The invitation above documents how a real interview could be introduced.

## 6. Simulated Interview Notes

### S1: Property Professional

- Manages 15–20 fictional rental listings.
- Prepares descriptions, prices, and photos using spreadsheets and portals.
- Spends approximately 30–45 minutes preparing or updating a listing.
- Wants another authorized person to review information before publication.
- Describes mobile browsing problems involving small buttons, layout,
  and slow-loading photos.
- Values useful inquiries more than raw page views.

### S2: Local Sponsor

- Operates a fictional neighborhood hardware and paint business.
- Uses local bulletin and booklet advertising.
- Has a hypothetical advertising budget of $150–$300 per month.
- Has no dedicated graphic design staff.
- Needs to check hours, address, and promotional codes before publication.
- Serves nearby homeowners and renters.
- Judges promotions partly by customers mentioning a promotional code.

## 7. Synthesis and Source Review

### Themes Supported by the Simulated Notes

- Listing preparation involves multiple manual steps: S1.
- Review before publication matters to the property professional: S1.
- Mobile layout and photo performance affect browsing: S1.
- Simple sponsor content creation could reduce design effort: S2.
- Checking promotional details before publication matters: S2.

### Proposed Features and Inferences

- Saving drafts is a proposed response to S1's preparation workflow.
- Sponsor templates and previews are proposed responses to S2's needs.
- Price and neighborhood filters are a proposed renter feature.
  They were not directly requested in S1 or S2.
- Inquiry forms and automatic photo compression are proposed solutions;
  their detailed behavior requires further design.

### Scope Decisions

External portal synchronization, geofencing, and redemption analytics
are outside the Week 8 MVP.

### Questions Still Open

- Which listing fields must be complete before submission for review?
- Who is authorized to review listings?
- What distinguishes a useful inquiry?
- Which neighborhood names should the filters support?
- What photo size and quality targets should future compression use?

### AI Assistance and Human Review

Gemini helped prepare the earlier discovery draft. ChatGPT helped review
and revise requirements and align this package with the GitHub backlog.
Tool use and verification are summarized in `docs/ai-log.md`.

Claims in this package are traced to simulated notes or labeled as
proposals. No exact model version or additional AI run is asserted here.

## 8. Personas Based on Simulated Notes

### Persona A: Property Manager

Source: S1.

Goal: Prepare accurate listings efficiently and submit them for review.

Context: Maintains several listings and moves information between tools.

Needs:
- Save unfinished listing work.
- Understand the listing's review status.
- Present readable listings on mobile devices.

Frustrations: Repeated entry, slow photos, and difficult mobile layouts.

### Persona B: Neighborhood Sponsor

Source: S2.

Goal: Create a clear local promotion without design expertise.

Context: Runs a small business with limited promotional resources.

Needs:
- Enter business information through a structured template.
- Preview hours, address, and promotional codes.
- Correct mistakes before submitting the promotion.

Frustrations: Design effort and outdated promotional information.

## 9. User Stories and Planning

P1 = High priority. P2 = Medium priority.
Sizes are relative estimates: S = Small, M = Medium, L = Large.

| Story | User need | Priority | Size | Week 8 |
|---|---|---|---|---|
| US-01 / #6 | As a property manager, I want to save a listing draft so I can finish it later. | P1 | M | MVP |
| US-02 / #7 | As an authorized reviewer, I want to approve listings or return them for corrections before publication. | P1 | M | MVP |
| US-03 / #8 | As a property manager, I want automatic photo compression so listings load efficiently. | P2 | L | Later |
| US-04 / #9 | As a renter, I want mobile-friendly listings so I can browse on my phone. | P1 | S | MVP |
| US-05 / #11 | As a renter, I want to submit a property inquiry so I can request more information. | P2 | S | Later |
| US-06 / #12 | As a sponsor, I want an ad template so I can create a card without design software. | P1 | S | MVP |
| US-07 / #13 | As a sponsor, I want to preview my card so I can check details before submission. | P1 | S | MVP |
| US-08 / #14 | As a renter, I want price and neighborhood filters so I can find relevant listings. | P1 | M | MVP |

The GitHub issues contain the working acceptance criteria.
See `docs/mvp-plan.md` for the delivery plan.

## 10. Acceptance Criteria for High-Priority Stories

### US-01: Save a Draft

Given a property manager has entered unfinished listing information,
when they save a draft,
then the entered information is retained without publishing the listing.

Given a draft was saved in the same browser,
when the user refreshes and returns to the form,
then the saved information is restored.

Current prototype storage is browser localStorage.

### US-02: Review a Listing

Given a submitted listing is awaiting review,
when an authorized reviewer approves it,
then it becomes eligible for public display.

Given a submitted listing needs corrections,
when the reviewer returns it with feedback,
then it remains unpublished and the manager can correct it.

### US-04: Mobile Listing View

Given a visitor uses a narrow mobile viewport,
when the listing page loads,
then content fits without horizontal scrolling and primary touch targets
measure at least 44 by 44 CSS pixels.

### US-06: Sponsor Template

Given a sponsor opens the card builder,
when they enter business details and promotional information,
then the system generates a consistently formatted promotional card.

### US-07: Sponsor Preview

Given a sponsor has entered promotional details,
when they open the preview,
then they can inspect the business hours, location, and promotional code
before submitting the card.

Given the preview contains a mistake,
when the sponsor returns to edit,
then they can revise the information and preview it again.

### US-08: Listing Filters

Given listings are available,
when a visitor applies a maximum price, neighborhood, or both,
then the results match all selected filters.

Given no listings match the selected filters,
when results are displayed,
then the page shows a clear no-results message.

## Implementation Status

PR #15 implemented draft-related changes, an automated test, the MVP plan,
and sample amenity corrections. The remaining MVP stories describe planned
work; this document does not claim that all stories are implemented.

PR: https://github.com/Mathlove15/neighborhood-listing-platform/pull/15