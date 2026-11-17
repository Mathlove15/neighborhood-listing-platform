import test from "node:test";
import assert from "node:assert/strict";
import { GET } from "../src/app/api/sponsors/click/route.ts";
import { sponsorCampaigns } from "../src/lib/sponsor-campaigns.ts";

function request(query: string): Response {
  return GET(
    new Request(`http://localhost/api/sponsors/click${query}`),
  );
}

test("Approved sponsor redirects to its recorded destination", () => {
  const response = request("?id=demo-partner-01");

  assert.equal(response.status, 302);
  assert.equal(response.headers.get("Location"), "https://example.com/");
  assert.equal(response.headers.get("Cache-Control"), "no-store");
});

test("Unknown sponsor is rejected", () => {
  assert.equal(request("?id=unknown").status, 404);
});

test("Missing sponsor ID is rejected", () => {
  assert.equal(request("").status, 400);
});

test("Duplicate sponsor IDs are rejected", () => {
  assert.equal(
    request("?id=demo-partner-01&id=demo-partner-02").status,
    400,
  );
});

test("Visitor-supplied redirect destination is rejected", () => {
  const response = request(
    "?id=demo-partner-01&url=https://unapproved.example/",
  );

  assert.equal(response.status, 400);
  assert.equal(response.headers.get("Location"), null);
});

test("Unsafe destinations and ineligible sponsors are rejected", () => {
  const sponsor = sponsorCampaigns[0];
  const original = { ...sponsor };

  const cases = [
    { changes: { href: "javascript:alert(1)" }, status: 400 },
    { changes: { href: "http://example.com/" }, status: 400 },
    { changes: { href: "https://unapproved.example/" }, status: 400 },
    { changes: { href: "https://example.com.evil.example/" }, status: 400 },
    { changes: { href: "https://user:pass@example.com/" }, status: 400 },
    { changes: { href: "https://example.com:8443/" }, status: 400 },
    { changes: { href: "not a URL" }, status: 400 },
    { changes: { approved: false }, status: 404 },
    { changes: { active: false }, status: 404 },
    { changes: { endsAt: "2000-01-01T00:00:00Z" }, status: 404 },
  ];

  try {
    for (const entry of cases) {
      Object.assign(sponsor, original, entry.changes);

      const response = request("?id=demo-partner-01");

      assert.equal(
        response.status,
        entry.status,
        JSON.stringify(entry.changes),
      );
      assert.equal(response.headers.get("Location"), null);
    }
  } finally {
    Object.assign(sponsor, original);
  }
});

test("Empty sponsor ID value is rejected", () => {
  assert.equal(request("?id=").status, 404);
});