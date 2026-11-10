"use client";

import { useRef, useState, type FormEvent } from "react";
import { z } from "zod";
import { ListingCreateSchema } from "@/schemas/listing";

const SessionSchema = z.object({
  accessToken: z.string().min(1),
  expiresAt: z.number(),
  email: z.string().email(),
});
const SavedSchema = z.object({
  listing: z.object({
    id: z.string().uuid(),
    title: z.string(),
    price: z.number(),
    is_approved: z.literal(false),
  }),
});
type Session = z.infer<typeof SessionSchema>;
type SavedListing = z.infer<typeof SavedSchema>["listing"];

const inputClass = "mt-1 w-full rounded-md border border-slate-400 p-3 focus-visible:outline-2 focus-visible:outline-blue-600";
const buttonClass = "min-h-[44px] rounded-md bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800 disabled:opacity-50";

function apiError(body: unknown, fallback: string): string {
  if (typeof body === "object" && body !== null && "error" in body && typeof body.error === "string") {
    return body.error;
  }
  return fallback;
}

export default function ListingDraftForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [saved, setSaved] = useState<SavedListing | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const pending = useRef(false);
  const previousEmail = useRef("");

  function resetDraft() {
    setTitle("");
    setPrice("");
    setSaved(null);
    setMessage("");
    setError("");
  }

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
        cache: "no-store",
      });
      const body: unknown = await response.json();
      if (!response.ok) throw new Error(apiError(body, "Unable to sign in."));
      const result = SessionSchema.safeParse(body);
      if (!result.success) throw new Error("The sign-in response could not be read.");
      if (previousEmail.current && previousEmail.current !== result.data.email) resetDraft();
      previousEmail.current = result.data.email;
      setSession(result.data);
      setMessage("Signed in. You can create an unapproved draft.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to connect. Please try again.");
    } finally {
      setPassword("");
      pending.current = false;
      setBusy(false);
    }
  }

  async function saveDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    setMessage("");
    setError("");
    if (!session || session.expiresAt * 1000 <= Date.now()) {
      setSession(null);
      setError("Please sign in again before saving. Your entered title and price are still here.");
      return;
    }
    if (price.trim() === "") {
      setError("Enter a price.");
      return;
    }
    const parsed = ListingCreateSchema.safeParse({ title, price: Number(price) });
    if (!parsed.success) {
      setError(parsed.error.issues.map((issue) => issue.message).join(" "));
      return;
    }
    pending.current = true;
    setBusy(true);
    try {
      const response = await fetch(saved ? `/api/properties/${saved.id}` : "/api/properties", {
        method: saved ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify(parsed.data),
      });
      const body: unknown = await response.json();
      if (!response.ok) {
        if (response.status === 401) setSession(null);
        throw new Error(apiError(body, "Unable to save. Your entered values have been kept."));
      }
      const result = SavedSchema.safeParse(body);
      if (!result.success) throw new Error("The save response could not be read. Check the saved record before retrying.");
      setSaved(result.data.listing);
      setTitle(result.data.listing.title);
      setPrice(String(result.data.listing.price));
      setMessage(saved ? "Changes saved. Your draft is still unapproved." : "Draft saved to the database. It is unapproved and hidden from public listings.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to connect. Your entered values have been kept.");
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="draft-heading" className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-md">
      <h2 id="draft-heading" className="text-xl font-bold">Save Listing Draft (US-01)</h2>
      <p className="mt-2 text-slate-600">Save a title and price as a private draft. Only approved listings appear publicly.</p>

      {!session ? (
        <form onSubmit={signIn} className="mt-5 grid gap-4 sm:grid-cols-2" aria-label="Sign in to manage drafts">
          <div>
            <label htmlFor="draft-email" className="font-medium">Email</label>
            <input id="draft-email" type="email" autoComplete="username" required value={email} disabled={busy}
              onChange={(event) => setEmail(event.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="draft-password" className="font-medium">Password</label>
            <input id="draft-password" type="password" autoComplete="current-password" required value={password} disabled={busy}
              onChange={(event) => setPassword(event.target.value)} className={inputClass} />
          </div>
          <button type="submit" disabled={busy} className={buttonClass}>{busy ? "Signing in..." : "Sign in"}</button>
        </form>
      ) : (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p>Signed in as <strong>{session.email}</strong></p>
          <button type="button" disabled={busy} className="min-h-[44px] rounded-md border border-slate-400 px-4 py-2"
            onClick={() => { setSession(null); setPassword(""); resetDraft(); }}>Sign out</button>
        </div>
      )}

      <form onSubmit={saveDraft} noValidate className="mt-6">
        <fieldset disabled={busy || !session} aria-busy={busy} className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-3 font-semibold">{saved ? "Edit your saved draft" : "Create a draft"}</legend>
          <div>
            <label htmlFor="draft-title" className="font-medium">Listing title</label>
            <input id="draft-title" required value={title} onChange={(event) => setTitle(event.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="draft-price" className="font-medium">Price ($)</label>
            <input id="draft-price" type="number" min="0" max="99999999.99" step="0.01" required value={price}
              onChange={(event) => setPrice(event.target.value)} className={inputClass} />
          </div>
          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button type="submit" className={buttonClass}>{busy ? "Saving..." : saved ? "Save changes" : "Save draft"}</button>
            <button type="button" onClick={resetDraft} className="min-h-[44px] rounded-md border border-slate-400 px-4 py-2">New draft</button>
          </div>
        </fieldset>
      </form>
      <p role="status" aria-live="polite" className="mt-4 text-green-800">{message}</p>
      {error && <p role="alert" className="mt-4 rounded-md bg-red-50 p-3 text-red-800">{error}</p>}
      {saved && <p className="mt-3 break-all text-sm text-slate-600">Draft ID: {saved.id} | Status: unapproved</p>}
      <p className="mt-3 text-sm text-slate-500">New draft clears this form without deleting saved records. Refreshing this page requires signing in again.</p>
    </section>
  );
}
