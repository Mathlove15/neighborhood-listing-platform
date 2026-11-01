"use client";

import { useState, type FormEvent } from "react";

const inputStyle =
  "mt-1 w-full rounded-md border border-slate-300 p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600";

const buttonStyle =
  "min-h-[44px] rounded-md bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50";

const numberFields = [
  { name: "price", label: "Price ($)", min: 0, step: "0.01" },
  { name: "bedrooms", label: "Bedrooms", min: 0, step: "1" },
  { name: "bathrooms", label: "Bathrooms", min: 0, step: "0.1" },
  { name: "square_feet", label: "Square feet", min: 1, step: "1" },
];

export default function ListingDraftForm() {
  const [accessToken, setAccessToken] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);

    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(fields.get("email") ?? ""),
          password: String(fields.get("password") ?? ""),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.accessToken) {
        setMessage(result.error ?? "Unable to sign in.");
        return;
      }

      setAccessToken(result.accessToken);
      setMessage("Signed in. You can now save a listing draft.");
    } catch {
      setMessage("Unable to reach the sign-in service.");
    } finally {
      form.reset();
      setBusy(false);
    }
  }

  async function handleSaveDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);

    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          address: String(fields.get("address") ?? ""),
          price: Number(fields.get("price")),
          bedrooms: Number(fields.get("bedrooms")),
          bathrooms: Number(fields.get("bathrooms")),
          square_feet: Number(fields.get("square_feet")),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setAccessToken("");
        }

        const details = result.issues
          ?.map((issue: { field: string; message: string }) =>
            `${issue.field}: ${issue.message}`
          )
          .join(" ");

        setMessage(
          details ?? result.error ?? "Unable to save the draft."
        );
        return;
      }

      form.reset();
      setMessage(
        "Draft saved to your account. It will remain hidden from public listings until approved."
      );
    } catch {
      setMessage("Unable to reach the listing service.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-md"
      aria-labelledby="draft-heading"
    >
      <header>
        <h2 id="draft-heading" className="text-2xl font-bold">
          Save a listing draft
        </h2>
        <p className="mt-2 text-slate-600">
          Property owners can sign in and save a draft to their account.
        </p>
      </header>

      <p role="status" aria-atomic="true" className="mt-4 text-blue-800">
        {message}
      </p>

      {!accessToken ? (
        <form onSubmit={handleSignIn} className="mt-4 max-w-md space-y-4">
          <div>
            <label htmlFor="owner-email" className="block font-medium">
              Email
            </label>
            <input
              id="owner-email"
              name="email"
              type="email"
              autoComplete="username"
              required
              className={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="owner-password" className="block font-medium">
              Password
            </label>
            <input
              id="owner-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className={inputStyle}
            />
          </div>

          <button type="submit" disabled={busy} className={buttonStyle}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      ) : (
        <form
          onSubmit={handleSaveDraft}
          className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <label htmlFor="draft-address" className="block font-medium">
              Property address
            </label>
            <input
              id="draft-address"
              name="address"
              type="text"
              autoComplete="street-address"
              minLength={5}
              required
              className={inputStyle}
            />
          </div>

          {numberFields.map((field) => (
            <div key={field.name}>
              <label
                htmlFor={`draft-${field.name}`}
                className="block font-medium"
              >
                {field.label}
              </label>
              <input
                id={`draft-${field.name}`}
                name={field.name}
                type="number"
                min={field.min}
                step={field.step}
                required
                className={inputStyle}
              />
            </div>
          ))}

          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button type="submit" disabled={busy} className={buttonStyle}>
              {busy ? "Saving…" : "Save draft"}
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setAccessToken("");
                setMessage("Signed out of this form.");
              }}
              className={buttonStyle}
            >
              Sign out
            </button>
          </div>
        </form>
      )}
    </section>
  );
}