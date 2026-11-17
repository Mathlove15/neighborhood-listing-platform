import type { SponsorCampaign } from "./sponsor-matching.ts";

// Fictional sponsors and service areas for the classroom demo.
export const sponsorCampaigns: SponsorCampaign[] = [
  {
    id: "demo-partner-01",
    name: "Neighborhood Services Demo",
    imageUrl: "/window.svg",
    imageAlt: "Demo neighborhood services logo",
    href: "https://example.com/",
    tagline: "Supporting local neighborhoods.",
    approved: true,
    active: true,
    placement: "homepage",
    startsAt: "2026-01-01T00:00:00Z",
    endsAt: "2027-12-31T23:59:59Z",
    serviceZips: ["90032", "90033"],
    priority: 10,
  },
  {
    id: "demo-partner-02",
    name: "Community Resources Demo",
    imageUrl: "/window.svg",
    imageAlt: "Demo community resources logo",
    href: "https://example.org/",
    tagline: "Explore community resources.",
    approved: true,
    active: true,
    placement: "homepage",
    startsAt: "2026-01-01T00:00:00Z",
    endsAt: "2027-12-31T23:59:59Z",
    serviceZips: ["90032"],
    priority: 5,
  },
];