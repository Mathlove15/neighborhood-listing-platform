export default function SearchFilters() {
  return (
    <form
      className="grid gap-4 rounded-xl bg-white p-6 shadow-md md:grid-cols-4"
      role="search"
    >
      <div>
        <label
          htmlFor="location"
          className="block text-sm font-semibold text-slate-700"
        >
          Location
        </label>

        <input
          id="location"
          name="location"
          type="search"
          placeholder="Neighborhood or address"
          className="mt-1 w-full rounded-md border border-slate-300 p-2"
        />
      </div>

      <div>
        <label
          htmlFor="max-price"
          className="block text-sm font-semibold text-slate-700"
        >
          Maximum price
        </label>

        <select
          id="max-price"
          name="maxPrice"
          className="mt-1 w-full rounded-md border border-slate-300 p-2"
        >
          <option value="">Any price</option>
          <option value="300000">$300,000</option>
          <option value="500000">$500,000</option>
          <option value="750000">$750,000</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="property-type"
          className="block text-sm font-semibold text-slate-700"
        >
          Property type
        </label>

        <select
          id="property-type"
          name="propertyType"
          className="mt-1 w-full rounded-md border border-slate-300 p-2"
        >
          <option value="">All types</option>
          <option value="house">House</option>
          <option value="condo">Condo</option>
          <option value="townhouse">Townhouse</option>
        </select>
      </div>

      <button
        type="submit"
        className="self-end rounded-md bg-blue-700 p-2 font-semibold text-white hover:bg-blue-800"
      >
        Search
      </button>
    </form>
  );
}