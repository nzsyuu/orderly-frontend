import { z } from "zod";
import type { SalesReport, StockReport } from "@/modules/reports/types/report";

const num = z.coerce
  .number()
  .nullish()
  .transform((value) => value ?? 0);
const list = <T extends z.ZodTypeAny>(schema: T) =>
  z
    .array(schema)
    .nullish()
    .transform((value) => value ?? []);

export const salesReportSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  summary: z.object({
    totalOrders: num,
    deliveredOrders: num,
    canceledOrders: num,
    cancellationRatePercent: num,
    grossRevenue: num,
    deliveryFeeTotal: num,
    netProductRevenue: num,
    averageTicket: num,
  }),
  byStatus: list(
    z.object({
      status: z.string(),
      orderCount: num,
      totalAmount: num,
    }),
  ),
  dailySeries: list(
    z.object({
      date: z.string(),
      deliveredOrders: num,
      revenue: num,
    }),
  ),
  topProducts: list(
    z.object({
      productId: z.coerce.number(),
      productName: z.string(),
      quantitySold: num,
      revenueGenerated: num,
      revenueSharePercent: num,
    }),
  ),
});

const itemHighlightSchema = z.object({
  stockItemId: z.coerce.number(),
  stockItemName: z.string(),
  category: z
    .string()
    .nullish()
    .transform((value) => value ?? "Sem categoria"),
  unit: z
    .string()
    .nullish()
    .transform((value) => value ?? ""),
  totalQuantity: num,
  totalCost: num,
});

export const stockReportSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  currentValuation: z.object({
    activeItemsCount: num,
    belowMinimumCount: num,
    outOfStockCount: num,
    totalInventoryValue: num,
  }),
  valuationByCategory: list(
    z.object({
      category: z
        .string()
        .nullish()
        .transform((value) => value ?? "Sem categoria"),
      itemsCount: num,
      totalValue: num,
    }),
  ),
  movementsByType: list(
    z.object({
      type: z.string(),
      movementsCount: num,
      totalQuantity: num,
      estimatedFinancialValue: num,
    }),
  ),
  topConsumedItems: list(itemHighlightSchema),
  topLostItems: list(itemHighlightSchema),
});

export function parseSalesReport(data: unknown): SalesReport {
  return salesReportSchema.parse(data);
}

export function parseStockReport(data: unknown): StockReport {
  return stockReportSchema.parse(data);
}
