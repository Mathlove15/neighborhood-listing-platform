"use client";

import React, { useState, useEffect } from "react";

interface DraftFormData {
  property_id: string;
  description: string;
  property_type: "house" | "condominium" | "townhouse" | "apartment";
  listing_status: "draft" | "available" | "pending" | "sold";
  price: number | "";
  bedrooms: number | "";
  bathrooms: number | "";
  square_feet: number | "";
  street: string;
  city: string;
  state: string;
  zip_code: string;
}

const STORAGE_KEY = "neighborhood_listing_draft_v1";

const initialDraft: DraftFormData = {
  property_id: "",
  description: "",
  property_type: "apartment",
  listing_status: "draft",
  price: "",
  bedrooms: "",
  bathrooms: "",
  square_feet: "",
  street: "",
  city: "",
  state: "CA",
  zip_code: "",
};

export default function ListingDraftForm() {
  const [formData, setFormData] = useState<DraftFormData>(initialDraft);
  const [saveMessage, setSaveMessage] = useState<string>("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setFormData(JSON.parse(saved));
        setSaveMessage("Restored previous draft from local storage.");
      }
    } catch {
      // Ignore parse errors on mount
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveDraft = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: DraftFormData = {
        ...formData,
        listing_status: "draft",
        property_id: formData.property_id || `PROP-${Math.floor(100 + Math.random() * 900)}`,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setFormData(payload);
      setSaveMessage("Draft saved successfully to browser storage!");
    } catch {
      setSaveMessage("Failed to save draft to storage.");
    }
  };

  const handleClearDraft = () => {
    localStorage.removeItem(STORAGE_KEY);
    setFormData(initialDraft);
    setSaveMessage("Draft cleared.");
  };

  return (
    <section className="mt-8 rounded-xl bg-white p-6 shadow-md border border-slate-200">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Save Listing Draft (US-01)</h2>
          <p className="text-sm text-slate-500">
            Form state is preserved in local storage with draft listing status.
          </p>
        </div>
        <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
          Status: {formData.listing_status}
        </span>
      </div>

      {saveMessage && (
        <div className="mt-4 rounded-md bg-blue-50 p-3 text-xs text-blue-700">
          {saveMessage}
        </div>
      )}

      <form onSubmit={handleSaveDraft} className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-700">Description</label>
          <textarea
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            placeholder="Detailed description of the property..."
            className="mt-1 w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700">Property Type</label>
          <select
            name="property_type"
            value={formData.property_type}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="condominium">Condominium</option>
            <option value="townhouse">Townhouse</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700">Monthly Rent / Price ($)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="2100"
            className="mt-1 w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700">Bedrooms</label>
          <input
            type="number"
            name="bedrooms"
            value={formData.bedrooms}
            onChange={handleChange}
            placeholder="2"
            className="mt-1 w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700">Bathrooms</label>
          <input
            type="number"
            name="bathrooms"
            value={formData.bathrooms}
            onChange={handleChange}
            placeholder="1"
            className="mt-1 w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700">Square Feet</label>
          <input
            type="number"
            name="square_feet"
            value={formData.square_feet}
            onChange={handleChange}
            placeholder="850"
            className="mt-1 w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700">Street Address</label>
          <input
            type="text"
            name="street"
            value={formData.street}
            onChange={handleChange}
            placeholder="5151 State University Dr"
            className="mt-1 w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700">City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Los Angeles"
            className="mt-1 w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700">ZIP Code</label>
          <input
            type="text"
            name="zip_code"
            value={formData.zip_code}
            onChange={handleChange}
            placeholder="90032"
            className="mt-1 w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="sm:col-span-2 flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={handleClearDraft}
            className="rounded-md border border-slate-300 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 min-h-[44px]"
          >
            Clear Draft
          </button>
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-5 py-2 text-xs font-medium text-white hover:bg-blue-700 min-h-[44px]"
          >
            Save Draft
          </button>
        </div>
      </form>
    </section>
  );
}