import test from "node:test";
import assert from "node:assert/strict";
import {
  selectSponsor,
  eligibleSponsors,
} from "../src/lib/sponsor-matching.ts";
import { sponsorCampaigns } from "../src/lib/sponsor-campaigns.ts";
import { GET } from "../src/app/api/sponsors/click/route.ts";

const context = {
  zip: "90032",
  placement: "homepage",
  now: "2026-11-18T12:00:00Z",
};

// Explicit audit mapping, matching the SQL fixture.
const tierPriority = { Silver: 1, Gold: 2, Platinum: 3 };

const rows = [
  { id: "A", tier: "Silver", distance: 0.4, impressions: 120, approved: true },
  { id: "B", tier: "Gold", distance: 1.2, impressions: 45, approved: true },
  { id: "C", tier: "Gold", distance: 0.8, impressions: 90, approved: true },
  { id: "D", tier: "Platinum", distance: 0.2, impressions: 10, approved: false },
] as const;

const candidates = rows.map((row) => ({
  ...row,
  name: `Sponsor ${row.id}`,
  imageUrl: "/window.svg",
  imageAlt: "Demo sponsor logo",
  href: "https://example.com/",
  active: true,
  placement: "homepage",
  startsAt: "2026-11-01T00:00:00Z",
  endsAt: "2026-11-30T23:59:59Z",
  serviceZips: ["90032"],
  priority: tierPriority[row.tier],
}));

test("Teacher example selects B using priority then ID", () => {
  const selected = selectSponsor(context, candidates);
  assert.equal(selected?.id, "B");
  console.log("Selected sponsor:", selected?.name);
});

test("Pending Sponsor D is excluded before ranking", () => {
  const ids = eligibleSponsors(context, candidates).map((item) => item.id);
  assert.deepEqual(ids, ["A", "B", "C"]);
});

test("No eligible sponsor returns null for the fallback UI", () => {
  const result = selectSponsor(
    { ...context, zip: "10001" },
    candidates,
  );
  assert.equal(result, null);
});

test("URL audit captures a valid redirect and exact unsafe-URL response", async () => {
  const record = sponsorCampaigns[0];
  const original = { ...record };

  try {
    Object.assign(record, {
      approved: true,
      active: true,
      placement: "homepage",
      startsAt: "2000-01-01T00:00:00Z",
      endsAt: "2099-12-31T23:59:59Z",
      serviceZips: ["90032"],
      href: "https://example.com/",
    });

    const request = () =>
      new Request(
        `http://localhost/api/sponsors/click?id=${encodeURIComponent(record.id)}`,
      );

    const valid = GET(request());
    assert.equal(valid.status, 302);
    assert.equal(valid.headers.get("Location"), "https://example.com/");
    console.log("Valid URL: 302; Location: https://example.com/");

    record.href = "javascript:alert(1)";
    const unsafe = GET(request());
    const body = await unsafe.text();

    assert.equal(unsafe.status, 400);
    assert.equal(body, "Destination rejected.");
    assert.equal(unsafe.headers.get("Location"), null);

    console.log("Unsafe URL status:", unsafe.status);
    console.log("Exact response body:", body);
  } finally {
    Object.assign(record, original);
  }
});
