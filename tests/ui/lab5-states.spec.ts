import { test, expect } from "@playwright/test";

test("loading resolves to an empty listing state", async ({ page }) => {
  let release = () => {};
  const gate = new Promise<void>((resolve) => { release = resolve; });
  await page.route("**/api/properties", async (route) => {
    await gate;
    await route.fulfill({ json: { listings: [] } });
  });
  try {
    await page.goto("/");
    await expect(page.getByRole("status").filter({ hasText: "Loading listings..." })).toBeVisible();
    release();
    await expect(page.getByText("No approved listings are available at this time.")).toBeVisible();
    await expect(page.getByText("Loading listings...")).toHaveCount(0);
  } finally {
    release();
  }
});

test("a failed listing request shows a safe error and retry recovers", async ({ page }) => {
  let requests = 0;
  await page.route("**/api/properties", async (route) => {
    requests += 1;
    if (requests === 1) {
      await route.fulfill({ status: 503, json: { error: "private backend diagnostic" } });
    } else {
      await route.fulfill({ json: { listings: [{
        id: "10000000-0000-4000-8000-000000000001",
        title: "UI recovery fixture",
        price: 1500,
      }] } });
    }
  });
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Featured properties" }).getByRole("alert")).toContainText("Unable to load listings. Please try again.");
  await expect(page.getByText("private backend diagnostic")).toHaveCount(0);
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByText("UI recovery fixture")).toBeVisible();
  await expect(page.getByRole("region", { name: "Featured properties" }).getByRole("alert")).toHaveCount(0);
  expect(requests).toBe(2);
});

test("malformed listing data shows the validation error state", async ({ page }) => {
  await page.route("**/api/properties", async (route) => {
    await route.fulfill({ json: { listings: [{ id: "invalid", price: "not-a-number" }] } });
  });
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Featured properties" }).getByRole("alert")).toContainText("The listing information could not be read.");
});
