import { z } from "zod";
import type { Sale, SaleStatus } from "@/modules/sales/types/sale";

const saleItemSchema = z.object({
  productId: z.coerce.number(),
  quantity: z.coerce.number(),
  unitPrice: z.coerce.number(),
  subtotal: z.coerce.number(),
});

export const saleListItemSchema = z
  .object({
    saleId: z.string(),
    storeId: z.coerce.number(),
    date: z.string(),
    status: z.string(),
    totalAmount: z.coerce.number(),
    observation: z.string().optional(),
    items: z.array(saleItemSchema).default([]),
    userId: z.string().default(""),
    deliveryFee: z.coerce.number().default(0),
    deliveryStreet: z.string().default(""),
    deliveryNumber: z.string().default(""),
    deliveryNeighborhood: z.string().default(""),
    deliveryCity: z.string().default(""),
    deliveryZipCode: z.string().default(""),
  })
  .passthrough();

export const saleListResponseSchema = z.array(saleListItemSchema);

export function parseSale(data: unknown): Sale {
  const parsed = saleListItemSchema.parse(data);
  return {
    saleId: parsed.saleId,
    storeId: parsed.storeId,
    date: parsed.date,
    status: parsed.status as SaleStatus,
    totalAmount: parsed.totalAmount,
    observation: parsed.observation,
    items: parsed.items,
    userId: parsed.userId,
    deliveryFee: parsed.deliveryFee,
    deliveryStreet: parsed.deliveryStreet,
    deliveryNumber: parsed.deliveryNumber,
    deliveryNeighborhood: parsed.deliveryNeighborhood,
    deliveryCity: parsed.deliveryCity,
    deliveryZipCode: parsed.deliveryZipCode,
  };
}
