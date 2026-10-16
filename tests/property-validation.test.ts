import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Ajv from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { PropertySchema } from "../src/types/property.ts";

const schemaPath = path.resolve(process.cwd(), "schemas/property.schema.json");
const propertySchemaJson = JSON.parse(fs.readFileSync(schemaPath, "utf-8"));

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const validateJsonSchema = ajv.compile(propertySchemaJson);

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

test("Case 1: Valid property record passes JSON Schema and Zod validation", () => {
  const jsonValid = validateJsonSchema(baseValidRecord);
  assert.equal(jsonValid, true, "Valid record must pass JSON Schema Draft 2020-12");

  const zodResult = PropertySchema.safeParse(baseValidRecord);
  assert.equal(zodResult.success, true, "Valid record must pass Zod schema");
});

test("Case 2: Invalid fixture - missing ID fails validation", () => {
  const { property_id, ...invalidRecord } = baseValidRecord;

  const jsonValid = validateJsonSchema(invalidRecord);
  assert.equal(jsonValid, false, "Missing property_id must fail JSON schema");

  const zodResult = PropertySchema.safeParse(invalidRecord);
  assert.equal(zodResult.success, false, "Missing property_id must fail Zod schema");
});

test("Case 3: Invalid fixture - negative price fails validation", () => {
  const invalidRecord = {
    ...baseValidRecord,
    price: -450000,
  };

  const jsonValid = validateJsonSchema(invalidRecord);
  assert.equal(jsonValid, false, "Negative price must fail JSON schema minimum constraint");

  const zodResult = PropertySchema.safeParse(invalidRecord);
  assert.equal(zodResult.success, false, "Negative price must fail Zod non-negative constraint");
});

test("Case 4: Invalid fixture - bad ZIP code fails validation", () => {
  const invalidRecord = {
    ...baseValidRecord,
    zip_code: "9021",
  };

  const jsonValid = validateJsonSchema(invalidRecord);
  assert.equal(jsonValid, false, "Invalid zip code pattern must fail JSON schema regex");

  const zodResult = PropertySchema.safeParse(invalidRecord);
  assert.equal(zodResult.success, false, "Invalid zip code pattern must fail Zod regex");
});

test("Case 5: Invalid fixture - unknown property field fails validation (additionalProperties: false)", () => {
  const invalidRecord = {
    ...baseValidRecord,
    unauthorized_field: "disallowed",
  };

  const jsonValid = validateJsonSchema(invalidRecord);
  assert.equal(jsonValid, false, "Unknown field must be rejected by additionalProperties: false");
});