import PropertyCard from "@/components/PropertyCard";
import SearchFilters from "@/components/SearchFilters";
import SponsorBanner from "@/components/SponsorBanner";
import ListingDraftForm from "@/components/ListingDraftForm";
import { createSupabaseServer } from "@/lib/supabaseServer";
import type { Property, Sponsor } from "@/types";

export const dynamic = "force-dynamic";

const sponsor: Sponsor = {
  id: "spon-01",
  name: "Bay Area First Financial",
  imageUrl: "/window.svg",
  imageAlt: "Bay Area First Financial logo",
  href: "#sponsor",
  tagline: "Helping families find home financing that fits.",
};

export default async function Home() {
  let properties: Property[] = [];
  let loadFailed = false;

  try {
    const supabase = createSupabaseServer();

    const { data, error } = await supabase
      .from("properties")
      .select("id,address,price,bedrooms,bathrooms,square_feet")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Listing query failed:", error.code, error.message);
      loadFailed = true;
    } else {
      properties = (data ?? []).map((item) => ({
        id: item.id,
        title: item.address,
        address: item.address,
        price: Number(item.price),
        facts: [
          `${item.bedrooms} bedrooms`,
          `${item.bathrooms} bathrooms`,
          `${Number(item.square_feet).toLocaleString("en-US")} sq. ft.`,
        ],
        imageUrl: "/window.svg",
        imageAlt: "Illustration of a window",
        href: `#${item.id}`,
        badge: "APPROVED",
      }));
    }
  } catch (error) {
  console.error(
    "Listing connection failed:",
    error instanceof Error ? error.message : "Unknown error"
  );
  loadFailed = true;
}

  return (
    <main className="mx-auto min-h-screen max-w-7xl bg-slate-50 px-4 py-8 text-slate-900 md:px-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">
          Neighborhood Listing Platform
        </h1>
        <p className="mt-2 text-slate-600">
          Find homes and explore approved neighborhood listings.
        </p>
      </header>

      <section className="mt-10" aria-labelledby="search-heading">
        <h2 id="search-heading" className="sr-only">
          Search property listings
        </h2>
        <SearchFilters />
      </section>

      <section className="mt-12" aria-labelledby="listings-heading">
        <header className="mb-6">
          <h2 id="listings-heading" className="text-3xl font-bold">
            Featured properties
          </h2>
          {!loadFailed && (
            <p className="mt-2 text-sm text-slate-600">
              {properties.length} approved listings
            </p>
          )}
        </header>

        {loadFailed ? (
          <p role="alert" className="rounded-xl bg-white p-6 text-red-700">
            Unable to load listings. Please try again later.
          </p>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <p className="rounded-xl bg-white p-6 text-slate-600">
            No approved listings are available yet.
          </p>
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
        <h2 id="accessibility-heading" className="text-2xl font-bold">
          Accessible property assistance
        </h2>
        <p className="mt-3 text-slate-600">
          Use keyboard navigation to reach the search controls and property links.
        </p>
      </section>
    </main>
  );
}