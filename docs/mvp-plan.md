# Team A - Week 8 MVP Scope & Delivery Plan

## 1. Executive Summary
This document defines the Minimum Viable Product (MVP) boundary for the Neighborhood Listing Platform targeted for delivery in Week 8. The goal is to provide a fully functional, end-to-end prototype supporting core property listing discovery, draft persistence, responsive mobile inspection, and local sponsor ad card previews.

## 2. In-Scope User Stories (Week 8 MVP)
The following stories are committed for the Week 8 release and tracked in the `Ready` and `In progress` columns of the project board:

- **US-01: Save property listing as draft (P1 | M)**
  - Allows listers to save property forms locally before formal submission.
- **US-02: Review property listings before publication (P1 | M)**
    - Allows an authorized reviewer to approve submitted listings or return them for corrections before publication.
- **US-04: Mobile responsive listing view with 44px touch targets (P1 | S)**
  - Ensures mobile usability adhering to accessibility target standards.
- **US-06: Sponsor ad card template (P1 | S)**
   - Allows sponsors to enter business details and promo codes into a structured template that generates an ad card.
- **US-07: Preview sponsor promotional card (P1 | S)**
  - Enables local businesses to verify promotion details and promo codes before submitting.
- **US-08: Filter listings by price and neighborhood (P1 | M)**
  - Allows prospective renters to filter listings by budget and location with fallback zero-state feedback.

## 3. Out-of-Scope Items (Deferred to Backlog)
The following items are deferred to post-MVP iterations to preserve delivery focus:
- **US-03: Automatically compress listing photos (P2 | L)**
- **US-05: Submit a property inquiry (P2 | S)**

## 4. Acceptance & Verification Gates
1. Dual-layer schema validation passing on all fixtures.
2. 100% automated test pass rate for core schemas (`npm test`).
3. Clean Git feature branch workflow with peer-reviewed pull requests.