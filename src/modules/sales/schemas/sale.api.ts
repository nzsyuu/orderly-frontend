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
    items: z.array(saleItemSchema).default([]),
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
    items: parsed.items,
  };
}
