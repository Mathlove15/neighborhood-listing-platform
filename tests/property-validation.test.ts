import test from "node:test";
import assert from "node:assert/strict";
import { PropertySchema } from "../src/types/property.ts";

const baseValidRecord = {
  property_id: "PROP-101",
  description: "Contemporary eco-friendly residence with private rooftop deck and smart home integration.",
  property_type: "house",
  listing_status: "available",
  price: 1250000,
  bedrooms: 3,
  bathrooms: 2.5,
  square_feet: 2200,
  address: {
    street: "742 Evergreen Terrace",
    city: "Springfield",
    state: "CA",
  },
  zip_code: "90210",
  image_url: "https://images.example.com/properties/prop_ca_101.jpg",
  amenities: ["Solar Panels", "EV Charger", "Rooftop Deck"],
  local_sponsors: [
    {
      sponsor_id: "SPON-501",
      placement: "property_card",
      is_featured: true,
    },
  ],
};

test("Case 1: Valid property record passes schema validation", () => {
  const result = PropertySchema.safeParse(baseValidRecord);
  assert.equal(result.success, true, "Valid record must pass schema parsing");
});

test("Case 2: Invalid fixture - missing ID fails validation", () => {
  const { property_id, ...invalidRecord } = baseValidRecord;
  const result = PropertySchema.safeParse(invalidRecord);
  assert.equal(result.success, false, "Missing property_id must fail schema");
});

test("Case 3: Invalid fixture - negative price fails validation", () => {
  const invalidRecord = {
    ...baseValidRecord,
    price: -450000,
  };
  const result = PropertySchema.safeParse(invalidRecord);
  assert.equal(result.success, false, "Negative price must fail schema");
});

test("Case 4: Invalid fixture - bad ZIP code fails validation", () => {
  const invalidRecord = {
    ...baseValidRecord,
    zip_code: "9021",
  };
  const result = PropertySchema.safeParse(invalidRecord);
  assert.equal(result.success, false, "Invalid zip code pattern must fail schema");
});

test("Case 5: Invalid fixture - unknown property field fails validation (strict schema)", () => {
  const StrictPropertySchema = PropertySchema.strict();
  const invalidRecord = {
    ...baseValidRecord,
    unauthorized_field: "disallowed",
  };
  const result = StrictPropertySchema.safeParse(invalidRecord);
  assert.equal(result.success, false, "Unknown field must be rejected");
});
test("Case 6: Valid listing with draft status passes validation", () => {
  const draftProperty = {
    ...baseValidRecord,
    property_id: "PROP-999",
    listing_status: "draft",
  };

  const result = PropertySchema.safeParse(draftProperty);
  assert.strictEqual(result.success, true);
});