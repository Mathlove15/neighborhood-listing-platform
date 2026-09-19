const features = [
  {
    title: "Property Listings",
    description:
      "Browse neighborhood homes and find important property information in one convenient place.",
  },
  {
    title: "Neighborhood Sponsors",
    description:
      "Discover local businesses and organizations that support and serve the community.",
  },
  {
    title: "Voice Help",
    description:
      "Use accessible voice assistance to search listings and navigate the platform more easily.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <header className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Neighborhood Listing Platform - Evidence Audit
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-700">
            Our purpose is to help residents explore property listings,
            connect with neighborhood sponsors, and receive accessible voice
            assistance.
          </p>
        </header>

        <section aria-labelledby="features-heading" className="mt-12">
          <h2 id="features-heading" className="sr-only">
            Platform features
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-xl bg-white p-6 shadow-md"
              >
                <h3 className="text-xl font-semibold">{feature.title}</h3>

                <p className="mt-3 leading-7 text-slate-600">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}