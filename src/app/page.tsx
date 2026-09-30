import PropertyCard from "@/components/PropertyCard";
import SearchFilters from "@/components/SearchFilters";
import SponsorBanner from "@/components/SponsorBanner";
import type { Property, Sponsor } from "@/types";

const properties: Property[] = [
  {
    id: "property-1",
    title: "Sunny Craftsman Home",
    address: "125 Maple Avenue, Los Angeles, CA",
    price: 625000,
    facts: ["3 bedrooms", "2 bathrooms", "1,650 sq. ft."],
    imageUrl: "/window.svg",
    imageAlt: "Placeholder image for the Sunny Craftsman Home",
    href: "#property-1",
    badge: "New listing",
  },
  {
    id: "property-2",
    title: "Downtown Modern Condo",
    address: "800 Grand Avenue, Los Angeles, CA",
    price: 475000,
    facts: ["2 bedrooms", "2 bathrooms", "1,100 sq. ft."],
    imageUrl: "/globe.svg",
    imageAlt: "Placeholder image for the Downtown Modern Condo",
    href: "#property-2",
  },
  {
    id: "property-3",
    title: "Spacious Family Townhouse",
    address: "42 Cedar Lane, Pasadena, CA",
    price: 715000,
    facts: ["4 bedrooms", "3 bathrooms", "2,050 sq. ft."],
    imageUrl: "/file.svg",
    imageAlt: "Placeholder image for the Spacious Family Townhouse",
    href: "#property-3",
    badge: "Open house",
  },
];

const sponsor: Sponsor = {
  id: "sponsor-1",
  name: "Neighborhood Community Credit Union",
  imageUrl: "/vercel.svg",
  imageAlt: "Neighborhood Community Credit Union placeholder logo",
  href: "#sponsor",
  tagline: "Helping local families find a place to call home.",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-12 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <header className="text-center">
          <p className="font-semibold uppercase tracking-widest text-blue-700">
            Find your next home
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Neighborhood Property Listings
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Explore available homes, compare important property details, and
            connect with organizations serving the neighborhood.
          </p>
        </header>

        <section className="mt-10" aria-labelledby="search-heading">
          <h2 id="search-heading" className="sr-only">
            Search property listings
          </h2>
          <SearchFilters />
        </section>

        <section className="mt-12" aria-labelledby="listings-heading">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="font-semibold text-blue-700">Available now</p>
              <h2 id="listings-heading" className="text-3xl font-bold">
                Featured properties
              </h2>
            </div>

            <p className="text-sm text-slate-600">
              {properties.length} listings
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </section>

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
            Use your browser&apos;s voice tools or keyboard navigation to
            explore listings and reach every search control and property link.
          </p>
        </section>
      </div>
    </main>
  );
}