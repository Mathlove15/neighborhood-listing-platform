import assert from "node:assert/strict";
import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
import { createClient } from "@supabase/supabase-js";

const api = "http://localhost:3000/api/properties";
const approvedId = "10000000-0000-4000-8000-000000000001";

let hidden = false;
let passed = 0;

const output = new Writable({
  write(chunk, encoding, callback) {
    if (!hidden) process.stdout.write(chunk);
    callback();
  },
});

const input = createInterface({
  input: process.stdin,
  output,
  terminal: true,
});

async function password(prompt) {
  process.stdout.write(prompt);
  hidden = true;

  try {
    return await input.question("");
  } finally {
    hidden = false;
    process.stdout.write("\n");
  }
}

async function signIn(email) {
  const value = await password("Password for " + email + ": ");

  const client = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password: value,
  });

  assert.ok(
    !error && data.session,
    "Sign-in failed for " + email + ". Check the password."
  );

  return {
    client,
    token: data.session.access_token,
    userId: data.user.id,
  };
}

async function request(method, path = "", token, body) {
  const response = await fetch(api + path, {
    method,
    headers: {
      ...(body !== undefined
        ? { "Content-Type": "application/json" }
        : {}),
      ...(token
        ? { Authorization: "Bearer " + token }
        : {}),
    },
    ...(body !== undefined
      ? { body: JSON.stringify(body) }
      : {}),
  });

  const text = await response.text();
  let data;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      "The API returned non-JSON data. Check the server terminal."
    );
  }

  return { status: response.status, body: data };
}

function check(name, condition) {
  assert.ok(condition, name);
  passed++;
  console.log("PASS: " + name);
}

try {
  assert.ok(
    process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY,
    "Missing Supabase settings. Run with --env-file=.env.local."
  );

  const owner = await signIn("owner@example.com");
  const other = await signIn("other@example.com");
  input.close();

  const publicResult = await request("GET");

  check(
    "Public GET returns the approved sample listing",
    publicResult.status === 200 &&
      Array.isArray(publicResult.body.listings) &&
      publicResult.body.listings.some(
        (listing) => listing.id === approvedId
      )
  );

  const validDraft = {
    title: "Lab 5 API test draft",
    price: 1500,
  };

  const anonymousPost = await request(
    "POST", "", undefined, validDraft
  );

  check(
    "Unsigned POST is blocked",
    anonymousPost.status === 401
  );

  const anonymousPatch = await request(
    "PATCH",
    "/" + approvedId,
    undefined,
    { title: "Blocked change" }
  );

  check(
    "Unsigned PATCH is blocked",
    anonymousPatch.status === 401
  );

  const invalidToken = await request(
    "POST", "", "invalid-token", validDraft
  );

  check(
    "Invalid token is rejected",
    invalidToken.status === 401
  );

  const invalidPrice = await request(
    "POST",
    "",
    owner.token,
    { title: "Test", price: -1 }
  );

  check(
    "Negative price returns structured validation errors",
    invalidPrice.status === 400 &&
      Array.isArray(invalidPrice.body.details)
  );

  const invalidTitle = await request(
    "POST",
    "",
    owner.token,
    { title: "   ", price: 1500 }
  );

  check(
    "Blank title is rejected",
    invalidTitle.status === 400
  );

  const extraFields = await request(
    "POST",
    "",
    owner.token,
    {
      ...validDraft,
      owner_id: other.userId,
      is_approved: true,
    }
  );

  check(
    "Submitted ownership and approval fields are rejected",
    extraFields.status === 400
  );

  const created = await request(
    "POST", "", owner.token, validDraft
  );

  console.log(
    "Create response:",
    JSON.stringify(created)
  );

  check(
    "Owner can create an unapproved draft",
    created.status === 201 &&
      created.body.listing?.is_approved === false
  );

  const draftId = created.body.listing.id;

  const { data: savedDraft, error: readError } = await owner.client
    .from("properties")
    .select("id, owner_id, title, price, is_approved")
    .eq("id", draftId)
    .single();

  check(
    "Draft is saved with the signed-in owner's ID",
    !readError &&
      savedDraft?.owner_id === owner.userId &&
      savedDraft.title === validDraft.title &&
      savedDraft.price === 1500 &&
      savedDraft.is_approved === false
  );

  const forbidden = await request(
    "PATCH",
    "/" + draftId,
    other.token,
    { title: "Blocked other-user edit" }
  );

  check(
    "Other user cannot edit the draft",
    forbidden.status === 403
  );

  const approved = await request(
    "PATCH",
    "/" + approvedId,
    owner.token,
    { title: "Blocked approved edit" }
  );

  check(
    "Approved listing cannot be edited",
    approved.status === 403
  );

  const approvalAttempt = await request(
    "PATCH",
    "/" + draftId,
    owner.token,
    { is_approved: true }
  );

  check(
    "Approval changes are rejected",
    approvalAttempt.status === 400
  );

  const emptyUpdate = await request(
    "PATCH", "/" + draftId, owner.token, {}
  );

  check(
    "Empty update is rejected",
    emptyUpdate.status === 400
  );

  const updated = await request(
    "PATCH",
    "/" + draftId,
    owner.token,
    {
      title: "Lab 5 API verified draft",
      price: 1250,
    }
  );

  check(
    "Owner can update their own draft",
    updated.status === 200 &&
      updated.body.listing?.title === "Lab 5 API verified draft" &&
      updated.body.listing?.price === 1250
  );

  const { data: finalDraft, error: finalError } = await owner.client
    .from("properties")
    .select("title, price, is_approved")
    .eq("id", draftId)
    .single();

  check(
    "Owner's update is saved and draft stays unapproved",
    !finalError &&
      finalDraft?.title === "Lab 5 API verified draft" &&
      finalDraft.price === 1250 &&
      finalDraft.is_approved === false
  );

  const finalPublic = await request("GET");

  check(
    "Public GET does not expose the new draft",
    finalPublic.status === 200 &&
      Array.isArray(finalPublic.body.listings) &&
      !finalPublic.body.listings.some(
        (listing) => listing.id === draftId
      )
  );

  console.log("\nAll " + passed + " API checks passed.");
  console.log("Unapproved test draft retained: " + draftId);
} catch (error) {
  console.error("\nFAILED: " + error.message);
  console.error(
    "If a test draft was created, it remains unapproved in the database."
  );
  process.exitCode = 1;
} finally {
  input.close();
}