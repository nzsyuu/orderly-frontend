import { z } from "zod";
import type {
  Stock,
  StockItem,
  StockLot,
} from "@/modules/inventory/types/stock-item";

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

export const stockLotResponseSchema = z.object({
  lotId: z.number(),
  stockItemId: z.number(),
  quantity: z.coerce.number(),
  expiresAt: z.string(),
  receivedAt: z.string(),
  daysUntilExpiry: z.coerce.number(),
});

export const stockLotListResponseSchema = z.array(stockLotResponseSchema);

export function parseStockLot(data: unknown): StockLot {
  return stockLotResponseSchema.parse(data);
}
