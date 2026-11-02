import { z } from "zod";

export const propertySchema = z
  .object({
    address: z.string().trim().min(5),
    price: z.number().finite().nonnegative(),
    bedrooms: z.number().int().nonnegative(),
    bathrooms: z.number().finite().nonnegative(),
    square_feet: z.number().int().positive(),
  })
  .strict();

export type PropertyInput = z.infer<typeof propertySchema>;