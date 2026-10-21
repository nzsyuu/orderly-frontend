import { z } from "zod";
import type {
  PagedResponse,
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

export const stockItemPagedResponseSchema = z.object({
  content: z.array(stockItemResponseSchema),
  page: z.coerce.number(),
  size: z.coerce.number(),
  totalElements: z.coerce.number(),
  totalPages: z.coerce.number(),
  isFirst: z.boolean(),
  last: z.boolean(),
});

export function parseStock(data: unknown): Stock {
  return stockResponseSchema.parse(data);
}

export function parseStockItem(data: unknown): StockItem {
  return stockItemResponseSchema.parse(data);
}

export function parseStockItemPagedResponse(
  data: unknown,
): PagedResponse<StockItem> {
  return stockItemPagedResponseSchema.parse(data);
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
