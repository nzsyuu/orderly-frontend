import { z } from "zod";
import type { DailyInsights } from "@/modules/insights/types/insights";

const assumptionsSchema = z.object({
  stockScope: z.string(),
  demandScope: z.string(),
  forecastMethod: z.string(),
  forecastWeeks: z.coerce.number(),
  note: z.string(),
});

const productDemandSchema = z.object({
  productId: z.coerce.number(),
  productName: z.string(),
  unitPrice: z.coerce.number(),
  predictedQuantity: z.coerce.number(),
  method: z.string(),
  sampleSize: z.coerce.number(),
  confidence: z.string(),
});

const purchaseSuggestionSchema = z.object({
  stockItemId: z.coerce.number(),
  name: z.string(),
  unit: z.string(),
  currentQuantity: z.coerce.number(),
  minimumStock: z.coerce.number(),
  predictedConsumption: z.coerce.number(),
  quantityToBuy: z.coerce.number(),
  belowMinimum: z.boolean(),
  affectedProductIds: z.array(z.coerce.number()).default([]),
});

const criticalStockSchema = z.object({
  stockItemId: z.coerce.number(),
  name: z.string(),
  unit: z.string(),
  currentQuantity: z.coerce.number(),
  minimumStock: z.coerce.number(),
  affectedProductIds: z.array(z.coerce.number()).default([]),
});

const expiringLotSchema = z.object({
  lotId: z.coerce.number(),
  stockItemId: z.coerce.number(),
  stockItemName: z.string(),
  quantity: z.coerce.number(),
  expiresAt: z.string(),
  daysUntilExpiry: z.coerce.number(),
});

const suggestedProductSchema = z.object({
  productId: z.coerce.number(),
  productName: z.string(),
  predictedQuantityToday: z.coerce.number(),
});

const promotionSuggestionSchema = z.object({
  stockItemId: z.coerce.number(),
  lotId: z.coerce.number(),
  expiresAt: z.string(),
  quantityInLot: z.coerce.number(),
  suggestedProducts: z.array(suggestedProductSchema).default([]),
});

export const insightsResponseSchema = z.object({
  storeId: z.number().nullable().optional(),
  storeName: z.string(),
  targetDate: z.string(),
  weekday: z.string(),
  horizonDays: z.coerce.number(),
  expiryWindowDays: z.coerce.number(),
  assumptions: assumptionsSchema,
  productDemand: z.array(productDemandSchema).default([]),
  purchaseSuggestions: z.array(purchaseSuggestionSchema).default([]),
  criticalStock: z.array(criticalStockSchema).default([]),
  expiringLots: z.array(expiringLotSchema).default([]),
  promotionSuggestions: z.array(promotionSuggestionSchema).default([]),
});

export function parseInsights(data: unknown): DailyInsights {
  const parsed = insightsResponseSchema.parse(data);
  return {
    ...parsed,
    storeId: parsed.storeId ?? null,
  };
}
