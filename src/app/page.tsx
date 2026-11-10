"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import PropertyCard from "@/components/PropertyCard";
import SearchFilters from "@/components/SearchFilters";
import SponsorBanner from "@/components/SponsorBanner";
import ListingDraftForm from "@/components/ListingDraftForm";
import type { Sponsor } from "@/types";

const ListingsResponseSchema = z.object({
  listings: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      price: z.number(),
    })
  ),
});

type Listing = z.infer<
  typeof ListingsResponseSchema
>["listings"][number];

const sponsor: Sponsor = {
  id: "spon-01",
  name: "Bay Area First Financial",
  imageUrl: "/window.svg",
  imageAlt: "Bay Area First Financial logo",
  href: "#sponsor",
  tagline: "Helping families find home financing that fits.",
};

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadListings() {
      try {
        const response = await fetch("/api/properties", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load listings. Please try again.");
        }

        const result = ListingsResponseSchema.safeParse(
          await response.json()
        );

        if (!result.success) {
          throw new Error("The listing information could not be read.");
        }

        if (!controller.signal.aborted) {
          setListings(result.data.listings);
          setError("");
        }
      } catch (caught) {
        if (!controller.signal.aborted) {
          setError(
            caught instanceof Error
              ? caught.message
              : "Unable to load listings."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadListings();

    return () => controller.abort();
  }, [attempt]);

  function retry() {
    setLoading(true);
    setError("");
    setAttempt((current) => current + 1);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 md:px-8 max-w-7xl
mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">
          Neighborhood Listing Platform
        </h1>
        <p className="mt-2 text-slate-600">
          Browse approved property listings and explore neighborhood
          resources.
        </p>
      </header>

      <SearchFilters />

      <section className="mt-8" aria-labelledby="listings-heading">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2
            id="listings-heading"
            className="text-2xl font-bold"
          >
            Featured properties
          </h2>

          {!loading && !error && (
            <p className="text-sm text-slate-600">
              {listings.length} listings
            </p>
          )}
        </div>

        {loading && (
          <p role="status" className="rounded-xl bg-white p-6">
            Loading listings...
          </p>
        )}

        {!loading && error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-6"
          >
            <p>{error}</p>
            <button
              type="button"
              onClick={retry}
              className="mt-3 min-h-[44px] rounded-md bg-blue-600 px-4 py-2 text-white
hover:bg-blue-700"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && listings.length === 0 && (
          <p
            role="status"
            className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600"
          >
            No approved listings are available at this time.
          </p>
        )}

        {!loading && !error && listings.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <div
                key={listing.id}
                id={"listing-" + listing.id}
              >
                <PropertyCard
                  property={{
                    id: listing.id,
                    title: listing.title,
                    price: listing.price,
                    address: "Address not provided",
                    facts: [],
                    imageUrl: "/window.svg",
                    imageAlt: "Property illustration",
                    href: "#listing-" + listing.id,
                    badge: "APPROVED",
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <ListingDraftForm />

      <section className="mt-12" id="sponsor">
        <SponsorBanner sponsor={sponsor} />
      </section>

      <section
        className="mt-12 rounded-xl bg-white p-6 shadow-md"
        aria-labelledby="accessibility-heading"
      >
        <h2
          id="accessibility-heading"
          className="text-2xl font-bold"
        >
          Accessible property assistance
        </h2>
        <p className="mt-3 text-slate-600">
          Use your browser&apos;s voice tools or keyboard navigation
          to explore listings and reach the page controls.
        </p>
      </section>
    </main>
  );
}