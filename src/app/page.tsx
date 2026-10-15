import PropertyCard from "@/components/PropertyCard";
import SearchFilters from "@/components/SearchFilters";
import SponsorBanner from "@/components/SponsorBanner";
import type { Property, Sponsor } from "@/types";
import { PropertySchema } from "@/types/property";
import rawPropertiesData from "../../data/generated/properties.json";

const sponsor: Sponsor = {
  id: "spon-01",
  name: "Bay Area First Financial",
  imageUrl: "/window.svg",
  imageAlt: "Bay Area First Financial logo",
  href: "#sponsor",
  tagline: "Helping families find home financing that fits.",
};

// Safe runtime validation: validate each item and filter out invalid records
const validatedProperties: Property[] = rawPropertiesData
  .map((rawItem, index) => {
    const parseResult = PropertySchema.safeParse(rawItem);
    if (!parseResult.success) {
      console.warn(`Record #${index + 1} failed schema validation:`, parseResult.error.format());
      return null;
    }

    const item = parseResult.data;
    const formattedAddress = `${item.address.street}, ${item.address.city}, ${item.address.state} ${item.zip_code}`;

    const uiProperty: Property = {
      id: item.property_id,
      title: `${item.property_type.charAt(0).toUpperCase() + item.property_type.slice(1)} in ${item.address.city}`,
      address: formattedAddress,
      price: item.price,
      facts: [
        `${item.bedrooms} bedrooms`,
        `${item.bathrooms} bathrooms`,
        `${item.square_feet.toLocaleString()} sq. ft.`,
      ],
      imageUrl: item.image_url || "/window.svg",
      imageAlt: item.description,
      href: `#${item.property_id}`,
      badge: item.listing_status.toUpperCase(),
    };

    return uiProperty;
  })
  .filter((item): item is Property => item !== null);

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 px-4 py-8 md:px-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Neighborhood Listing Platform</h1>
        <p className="mt-2 text-slate-600">
          Find homes, explore verified listings, and connect with organizations serving the neighborhood.
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
          <p className="text-sm text-slate-600">{validatedProperties.length} listings</p>
        </div>

        {validatedProperties.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {validatedProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-slate-200">
            <p className="text-slate-600">No valid listings available at this time.</p>
          </div>
        )}
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
          Use your browser&apos;s voice tools or keyboard navigation to explore listings and reach every search control and property link.
        </p>
      </section>
    </main>
  );
}