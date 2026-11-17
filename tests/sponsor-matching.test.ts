import test from "node:test";
import assert from "node:assert/strict";
import {
  selectSponsor,
  type SponsorCampaign,
} from "../src/lib/sponsor-matching.ts";

const context = {
  zip: "90032",
  placement: "homepage",
  now: "2026-11-09T12:00:00Z",
};

const sponsor: SponsorCampaign = {
  id: "sponsor-01",
  name: "Demo Local Partner",
  imageUrl: "/window.svg",
  imageAlt: "Demo partner logo",
  href: "https://example.com/",
  tagline: "Supporting the neighborhood.",
  approved: true,
  active: true,
  placement: "homepage",
  startsAt: "2026-11-01T00:00:00Z",
  endsAt: "2026-11-30T23:59:59Z",
  serviceZips: ["90032", "90033"],
  priority: 10,
};

test("Exact ZIP match selects an eligible sponsor", () => {
  assert.equal(selectSponsor(context, [sponsor])?.id, sponsor.id);
});

test("An additional ZIP in the service area also matches", () => {
  const result = selectSponsor({ ...context, zip: "90033" }, [sponsor]);
  assert.equal(result?.id, sponsor.id);
});

const rejectedCases: [string, Partial<SponsorCampaign>][] = [
  ["inactive sponsor", { active: false }],
  ["unapproved sponsor", { approved: false }],
  ["wrong placement", { placement: "sidebar" }],
  ["expired campaign", { endsAt: "2026-11-08T00:00:00Z" }],
  ["future campaign", { startsAt: "2026-11-10T00:00:00Z" }],
  ["ZIP outside service area", { serviceZips: ["10001"] }],
  ["invalid date", { startsAt: "invalid" }],
  ["reversed dates", { startsAt: "2026-12-01T00:00:00Z" }],
  ["invalid priority", { priority: NaN }],
];

for (const [label, changes] of rejectedCases) {
  test(`Rejects ${label}`, () => {
    assert.equal(
      selectSponsor(context, [{ ...sponsor, ...changes }]),
      null,
    );
  });
}

test("Empty candidates return no match", () => {
  assert.equal(selectSponsor(context, []), null);
});

test("Malformed ZIP returns no match", () => {
  assert.equal(selectSponsor({ ...context, zip: "9032" }, [sponsor]), null);
});

test("Invalid context date returns no match", () => {
  assert.equal(selectSponsor({ ...context, now: "invalid" }, [sponsor]), null);
});

test("Campaign start and end times are inclusive", () => {
  for (const now of [sponsor.startsAt, sponsor.endsAt]) {
    assert.equal(selectSponsor({ ...context, now }, [sponsor])?.id, sponsor.id);
  }
});

test("Higher priority wins", () => {
  const higher = { ...sponsor, id: "sponsor-02", priority: 20 };
  assert.equal(selectSponsor(context, [sponsor, higher])?.id, higher.id);
});

test("Ties use ID consistently regardless of candidate order", () => {
  const other = { ...sponsor, id: "sponsor-02" };
  for (const candidates of [[sponsor, other], [other, sponsor]]) {
    assert.equal(selectSponsor(context, candidates)?.id, sponsor.id);
  }
});

test("Repeated calls return identical results without changing input", () => {
  const candidates = [{ ...sponsor, id: "sponsor-02" }, sponsor];
  const before = JSON.stringify(candidates);
  const first = selectSponsor(context, candidates);

  assert.deepEqual(selectSponsor(context, candidates), first);
  assert.equal(JSON.stringify(candidates), before);
});

test("Selected display data excludes internal fields", () => {
  const result = selectSponsor(context, [sponsor]);
  assert.ok(result);
  assert.equal("approved" in result, false);
  assert.equal("serviceZips" in result, false);
  assert.equal("priority" in result, false);
});

test("Rejects timestamps 1ms outside start and end boundaries", () => {
  assert.equal(
    selectSponsor({ ...context, now: "2026-10-31T23:59:59.999Z" }, [sponsor]),
    null,
  );
  assert.equal(
    selectSponsor({ ...context, now: "2026-11-30T23:59:59.001Z" }, [sponsor]),
    null,
  );
});

test("Ineligible high-priority sponsor never beats eligible lower-priority sponsor", () => {
  const unapprovedHigh = {
    ...sponsor,
    id: "sponsor-00",
    approved: false,
    priority: 999,
  };
  assert.equal(
    selectSponsor(context, [unapprovedHigh, sponsor])?.id,
    sponsor.id,
  );
});