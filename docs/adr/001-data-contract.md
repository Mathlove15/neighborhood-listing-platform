# ADR 001: Data Contract Architecture and Multi-Layer Validation Strategy

## Status
Accepted

## Context
Our application ingests synthetic real estate property datasets that require strict structural conformity, type safety, and resilient runtime behavior. We needed an architecture that prevents malformed external data from causing unhandled application crashes while maintaining a clean developer experience with TypeScript.

## Decision
We adopted a dual-layer data validation and typing architecture:

1. **Contract Specification (JSON Schema Draft 2020-12 & Ajv):**
   - Defined `schemas/property.schema.json` under the Draft 2020-12 standard with `additionalProperties: false`.
   - Used `ajv` and `ajv-formats` for strict pipeline and dataset ingestion validation, enforcing URI formatting, non-negative numerical boundaries, and regex patterns (`PROP-[0-9]{3}`, `SPON-[0-9]{3}`, `^[0-9]{5}$`).

2. **Runtime Application Validation & Types (Zod):**
   - Established `src/types/property.ts` as our runtime application boundary.
   - Derived static TypeScript types via `z.infer<typeof PropertySchema>` to eliminate duplicate interface declarations.
   - Enforced fail-safe parsing via `PropertySchema.safeParse` at UI component boundaries, allowing valid records to render smoothly while providing graceful warning fallbacks for invalid entries.

3. **Automated Verification:**
   - Implemented an automated test suite (`tests/property-validation.test.ts`) using Node's native test runner (`node:test`, `node:assert/strict`) verifying valid records alongside deliberate defect fixtures (missing IDs, negative prices, malformed postal codes, and unexpected properties).

## Consequences
- **Positive:** System resilience against corrupted upstream data; deterministic compile-time and runtime type safety; explicit audit logs for schema re-conformance.
- **Trade-offs:** Dual maintenance of JSON Schema for ingestion contracts and Zod for TypeScript application runtime parsing, mitigated by strict integration test coverage.