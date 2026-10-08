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
    observation: z.string().nullish().transform(v => v ?? undefined),
    items: z.array(saleItemSchema).nullish().transform(v => v ?? []),
    userId: z.string().nullish().transform(v => v ?? ""),
    deliveryFee: z.coerce.number().nullish().transform(v => v ?? 0),
    deliveryStreet: z.string().nullish().transform(v => v ?? ""),
    deliveryNumber: z.string().nullish().transform(v => v ?? ""),
    deliveryNeighborhood: z.string().nullish().transform(v => v ?? ""),
    deliveryCity: z.string().nullish().transform(v => v ?? ""),
    deliveryZipCode: z.string().nullish().transform(v => v ?? ""),
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
