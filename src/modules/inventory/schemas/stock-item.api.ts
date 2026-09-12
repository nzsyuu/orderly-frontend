import { z } from "zod";
import type { Stock, StockItem } from "@/modules/inventory/types/stock-item";

export const stockResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const stockListResponseSchema = z.array(stockResponseSchema);

export const stockItemResponseSchema = z.object({
  id: z.number(),
  stockId: z.number(),
  name: z.string(),
  category: z.string(),
  unit: z.string(),
  currentQuantity: z.coerce.number(),
  minimumStock: z.coerce.number(),
  unitCost: z.coerce.number(),
  active: z.boolean(),
});

export const stockItemListResponseSchema = z.array(stockItemResponseSchema);

export function parseStock(data: unknown): Stock {
  return stockResponseSchema.parse(data);
}

export function parseStockItem(data: unknown): StockItem {
  return stockItemResponseSchema.parse(data);
}
