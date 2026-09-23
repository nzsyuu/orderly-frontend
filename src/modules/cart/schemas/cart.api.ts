import { z } from "zod";
import type { Cart, CartItem } from "@/modules/cart/types/cart";

/**
 * The backend returns productId as a wrapped value object string
 * like "ProductId[value=1]". We extract the numeric id from it.
 */
function parseProductId(raw: unknown): number {
  if (typeof raw === "number") return raw;
  const str = String(raw);
  const match = str.match(/value=(\d+)/);
  if (match) return Number(match[1]);
  const parsed = Number(str);
  if (!Number.isNaN(parsed)) return parsed;
  throw new Error(`Cannot parse productId: ${str}`);
}

const cartItemSchema = z
  .object({
    productId: z.unknown().transform(parseProductId),
    name: z.string(),
    quantity: z.coerce.number(),
    unitPrice: z.coerce.number(),
    observation: z.string().nullable().default(null),
    totalPrice: z.coerce.number(),
  })
  .passthrough();

export const cartSchema = z
  .object({
    id: z.string(),
    items: z.array(cartItemSchema).default([]),
    subTotal: z.coerce.number().default(0),
  })
  .passthrough();

export function parseCartItem(data: unknown): CartItem {
  const parsed = cartItemSchema.parse(data);
  return {
    productId: parsed.productId,
    productName: parsed.name,
    quantity: parsed.quantity,
    unitPrice: parsed.unitPrice,
    observation: parsed.observation,
    totalPrice: parsed.totalPrice,
  };
}

export function parseCart(data: unknown): Cart {
  const parsed = cartSchema.parse(data);
  return {
    id: parsed.id,
    items: parsed.items.map((item) => ({
      productId: item.productId,
      productName: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      observation: item.observation,
      totalPrice: item.totalPrice,
    })),
    subTotal: parsed.subTotal,
  };
}
