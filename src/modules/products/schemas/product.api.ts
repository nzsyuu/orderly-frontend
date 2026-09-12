import { z } from "zod";
import type {
  Product,
  ProductComposition,
} from "@/modules/products/types/product";

export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
  price: z.coerce.number(),
  active: z.boolean(),
});

export const productListSchema = z.array(productSchema);

export const productCompositionSchema = z.object({
  id: z.number(),
  productId: z.number(),
  stockItemId: z.number(),
  quantity: z.coerce.number(),
});

export const productCompositionListSchema = z.array(productCompositionSchema);

export function parseProduct(data: unknown): Product {
  const parsed = productSchema.parse(data);
  return {
    id: parsed.id,
    name: parsed.name,
    description: parsed.description ?? null,
    price: parsed.price,
    active: parsed.active,
  };
}

export function parseProductComposition(data: unknown): ProductComposition {
  return productCompositionSchema.parse(data);
}
