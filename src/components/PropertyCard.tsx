"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import type { Property } from "@/types";

interface PropertyCardProps {
  property: Property;
}

const buttonStyle =
  "min-h-[44px] rounded-md bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50";

const inputStyle =
  "mt-1 w-full rounded-md border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-600";

export default function PropertyCard({ property }: PropertyCardProps) {
  const [showInquiry, setShowInquiry] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const headingId = `property-heading-${property.id}`;
  const formId = `inquiry-form-${property.id}`;
  const emailId = `inquiry-email-${property.id}`;
  const messageId = `inquiry-message-${property.id}`;

  async function handleInquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);

    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_id: property.id,
          inquirer_email: String(fields.get("inquirer_email") ?? ""),
          message: String(fields.get("message") ?? ""),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error ?? "Unable to send your inquiry.");
        return;
      }

      form.reset();
      setMessage("Your inquiry was sent to the property owner.");
    } catch {
      setMessage("Unable to reach the inquiry service. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article
      aria-labelledby={headingId}
      className="overflow-hidden rounded-xl bg-white shadow-md"
    >
      <Image
        src={property.imageUrl}
        alt={property.imageAlt}
        width={800}
        height={500}
        className="h-52 w-full object-cover"
      />

      <div className="p-6">
        <header>
          {property.badge && (
            <p className="mb-2 text-sm font-semibold text-blue-700">
              {property.badge}
            </p>
          )}

          <h3
            id={headingId}
            className="text-xl font-bold text-slate-900"
          >
            {property.title}
          </h3>

          {property.address !== property.title && (
            <p className="mt-2 text-slate-600">{property.address}</p>
          )}

          <p className="mt-3 text-lg font-semibold text-slate-900">
            {property.price.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
          </p>
        </header>

        <ul
          aria-label="Property specifications"
          className="mt-3 flex flex-wrap gap-2"
        >
          {property.facts.map((fact) => (
            <li
              key={fact}
              className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
            >
              {fact}
            </li>
          ))}
        </ul>

        <button
          type="button"
          aria-expanded={showInquiry}
          aria-controls={formId}
          aria-label={
            showInquiry
              ? `Close inquiry form for ${property.title}`
              : `Contact owner about ${property.title}`
          }
          onClick={() => setShowInquiry(!showInquiry)}
          className={`mt-5 ${buttonStyle}`}
        >
          {showInquiry ? "Close inquiry form" : "Contact owner"}
        </button>

        <form
          id={formId}
          hidden={!showInquiry}
          onSubmit={handleInquiry}
          className="mt-4 space-y-4"
          aria-label={`Inquiry about ${property.title}`}
        >
          <div>
            <label htmlFor={emailId} className="block font-medium">
              Your email
            </label>
            <input
              id={emailId}
              name="inquirer_email"
              type="email"
              autoComplete="email"
              maxLength={254}
              required
              className={inputStyle}
            />
          </div>

          <div>
            <label htmlFor={messageId} className="block font-medium">
              Your message
            </label>
            <textarea
              id={messageId}
              name="message"
              rows={4}
              minLength={10}
              maxLength={5000}
              required
              className={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className={buttonStyle}
          >
            {busy ? "Sending…" : "Send inquiry"}
          </button>
        </form>

        <p role="status" aria-atomic="true" className="mt-3 text-blue-800">
          {message}
        </p>
      </div>
    </article>
  );
}