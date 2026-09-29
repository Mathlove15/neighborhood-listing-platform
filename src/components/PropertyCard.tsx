import Image from "next/image";
import type { Property } from "@/types";

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  return (
    <article className="overflow-hidden rounded-xl bg-white shadow-md">
      <Image
  src={property.imageUrl}
  alt={property.imageAlt}
  width={800}
  height={500}
  className="h-52 w-full object-cover"
/>

      <div className="p-6">
        {property.badge && (
          <p className="mb-2 text-sm font-semibold text-blue-700">
            {property.badge}
          </p>
        )}

        <h2 className="text-xl font-bold text-slate-900">
          {property.title}
        </h2>

        <p className="mt-2 text-slate-600">{property.address}</p>

        <p className="mt-3 text-lg font-semibold text-slate-900">
          ${property.price.toLocaleString()}
        </p>

        <ul className="mt-3 flex flex-wrap gap-2">
          {property.facts.map((fact) => (
            <li
              key={fact}
              className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
            >
              {fact}
            </li>
          ))}
        </ul>

        <a
          href={property.href}
          className="mt-5 inline-block rounded-md bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label={`View details for ${property.title}`}
        >
          View property
        </a>
      </div>
    </article>
  );
}