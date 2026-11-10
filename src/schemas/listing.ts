import { z } from "zod";

export const ListingCreateSchema = z.strictObject({
  title: z.string().trim().min(1, "Enter a title."),
  price: z
    .number()
    .min(0, "Price cannot be negative.")
    .max(99999999.99, "Price is too large."),
});

export const ListingUpdateSchema = ListingCreateSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: "Provide a title or price to update." }
  );