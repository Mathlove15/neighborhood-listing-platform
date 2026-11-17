import { sponsorCampaigns } from "../../../../lib/sponsor-campaigns.ts";
import { eligibleSponsors } from "../../../../lib/sponsor-matching.ts";

export function GET(request: Request): Response {
  const url = new URL(request.url);

  // Accept only a sponsor ID, never a destination supplied by the visitor.
  if (
    [...url.searchParams.keys()].some((key) => key !== "id") ||
    url.searchParams.getAll("id").length !== 1
  ) {
    return new Response("Invalid sponsor request.", { status: 400 });
  }

  const id = url.searchParams.get("id");

  const eligible = eligibleSponsors(
    {
      zip: "90032",
      placement: "homepage",
      now: new Date().toISOString(),
    },
    sponsorCampaigns,
  );

  const sponsor = eligible.find((candidate) => candidate.id === id);

  if (!sponsor) {
    return new Response("Sponsor unavailable.", { status: 404 });
  }

  try {
    const destination = new URL(sponsor.href);
    const approvedHosts = new Set(["example.com", "example.org"]);

    if (
      destination.protocol !== "https:" ||
      destination.username !== "" ||
      destination.password !== "" ||
      destination.port !== "" ||
      !approvedHosts.has(destination.hostname)
    ) {
      return new Response("Destination rejected.", { status: 400 });
    }

    // Destination comes only from the approved server-side record.
    return new Response(null, {
      status: 302,
      headers: {
        Location: destination.href,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response("Destination rejected.", { status: 400 });
  }
}