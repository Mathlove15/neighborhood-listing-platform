import type { Sponsor } from "../types/index.ts";

export type SponsorCampaign = Sponsor & {
  approved: boolean;
  active: boolean;
  placement: string;
  startsAt: string;
  endsAt: string;
  serviceZips: string[];
  priority: number;
};

export type SponsorContext = {
  zip: string;
  placement: string;
  now: string;
};

export function eligibleSponsors(
  context: SponsorContext,
  candidates: readonly SponsorCampaign[],
): SponsorCampaign[] {
  const now = Date.parse(context.now);

  if (!/^\d{5}$/.test(context.zip) || !Number.isFinite(now)) {
    return [];
  }

  return candidates.filter((sponsor) => {
    const start = Date.parse(sponsor.startsAt);
    const end = Date.parse(sponsor.endsAt);

    return (
      sponsor.approved === true &&
      sponsor.active === true &&
      sponsor.placement === context.placement &&
      Number.isFinite(start) &&
      Number.isFinite(end) &&
      start <= end &&
      start <= now &&
      now <= end &&
      sponsor.serviceZips.includes(context.zip) &&
      Number.isFinite(sponsor.priority)
    );
  });
}

export function selectSponsor(
  context: SponsorContext,
  candidates: readonly SponsorCampaign[],
): Sponsor | null {
  const eligible = eligibleSponsors(context, candidates);

  // Higher priority wins. Equal priorities use the smallest ID.
  eligible.sort((a, b) => {
    if (a.priority !== b.priority) {
      return b.priority - a.priority;
    }

    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });

  const selected = eligible[0];

  if (!selected) {
    return null;
  }

  // Return only display fields, keeping internal fields private.
  return {
    id: selected.id,
    name: selected.name,
    imageUrl: selected.imageUrl,
    imageAlt: selected.imageAlt,
    href: selected.href,
    tagline: selected.tagline,
  };
}