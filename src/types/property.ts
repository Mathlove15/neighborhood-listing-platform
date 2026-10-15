import { z } from "zod";

export const AddressSchema = z.object({
  street: z.string().min(5),
  city: z.string().min(2),
  state: z.string().regex(/^[A-Z]{2}$/),
});

export const LocalSponsorSchema = z.object({
  sponsor_id: z.string().regex(/^SPON-[0-9]{3}$/),
  placement: z.enum(["property_card", "detail_page", "voice_response"]),
  is_featured: z.boolean(),
});

export const PropertySchema = z.object({
  property_id: z.string().regex(/^PROP-[0-9]{3}$/),
  description: z.string().min(10),
  property_type: z.enum(["house", "condominium", "townhouse", "apartment"]),
  listing_status: z.enum(["available", "pending", "sold"]),
  price: z.number().nonnegative(),
  bedrooms: z.number().int().nonnegative(),
  bathrooms: z.number().nonnegative(),
  square_feet: z.number().nonnegative(),
  address: AddressSchema,
  zip_code: z.string().regex(/^[0-9]{5}$/),
  image_url: z.string().url(),
  amenities: z.array(z.string()).min(1),
  local_sponsors: z.array(LocalSponsorSchema).min(1),
});

export const PropertiesListSchema = z.array(PropertySchema);

export type Address = z.infer<typeof AddressSchema>;
export type LocalSponsor = z.infer<typeof LocalSponsorSchema>;
export type ValidatedProperty = z.infer<typeof PropertySchema>;