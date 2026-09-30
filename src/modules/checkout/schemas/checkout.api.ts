import { z } from "zod";
import type { SaleResponse, FreightResult } from "@/modules/checkout/types/checkout";

const saleItemSchema = z.object({
  productId: z.coerce.number(),
  quantity: z.coerce.number(),
  unitPrice: z.coerce.number(),
  subtotal: z.coerce.number(),
});

const saleResponseSchema = z
  .object({
    saleId: z.string(),
    storeId: z.coerce.number(),
    date: z.string(),
    status: z.string(),
    totalAmount: z.coerce.number(),
    observation: z.string().nullable().default(""),
    items: z.array(saleItemSchema).default([]),
    userId: z.string(),
    deliveryFee: z.coerce.number(),
    deliveryStreet: z.string(),
    deliveryNumber: z.string(),
    deliveryNeighborhood: z.string(),
    deliveryCity: z.string(),
    deliveryZipCode: z.string(),
  })
  .passthrough();

const freightSchema = z.object({
  deliveryFee: z.coerce.number(),
});

export function parseSaleResponse(data: unknown): SaleResponse {
  const parsed = saleResponseSchema.parse(data);
  return {
    saleId: parsed.saleId,
    storeId: parsed.storeId,
    date: parsed.date,
    status: parsed.status,
    totalAmount: parsed.totalAmount,
    observation: parsed.observation ?? "",
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

export function parseFreight(data: unknown): FreightResult {
  return freightSchema.parse(data);
}
