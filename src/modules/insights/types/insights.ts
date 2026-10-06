export type ForecastConfidence = "HIGH" | "MEDIUM" | "LOW";

export type InsightsAssumptions = {
  stockScope: string;
  demandScope: string;
  forecastMethod: string;
  forecastWeeks: number;
  note: string;
};

export type ProductDemand = {
  productId: number;
  productName: string;
  unitPrice: number;
  predictedQuantity: number;
  method: string;
  sampleSize: number;
  confidence: ForecastConfidence | string;
};

export type PurchaseSuggestion = {
  stockItemId: number;
  name: string;
  unit: string;
  currentQuantity: number;
  minimumStock: number;
  predictedConsumption: number;
  quantityToBuy: number;
  belowMinimum: boolean;
  affectedProductIds: number[];
};

export type CriticalStock = {
  stockItemId: number;
  name: string;
  unit: string;
  currentQuantity: number;
  minimumStock: number;
  affectedProductIds: number[];
};

export type ExpiringLot = {
  lotId: number;
  stockItemId: number;
  stockItemName: string;
  quantity: number;
  expiresAt: string;
  daysUntilExpiry: number;
};

export type SuggestedProduct = {
  productId: number;
  productName: string;
  predictedQuantityToday: number;
};

export type PromotionSuggestion = {
  stockItemId: number;
  lotId: number;
  expiresAt: string;
  quantityInLot: number;
  suggestedProducts: SuggestedProduct[];
};

export type DailyInsights = {
  storeId: number | null;
  storeName: string;
  targetDate: string;
  weekday: string;
  horizonDays: number;
  expiryWindowDays: number;
  assumptions: InsightsAssumptions;
  productDemand: ProductDemand[];
  purchaseSuggestions: PurchaseSuggestion[];
  criticalStock: CriticalStock[];
  expiringLots: ExpiringLot[];
  promotionSuggestions: PromotionSuggestion[];
};

export type InsightsQuery = {
  storeId: number | "all";
  date?: string;
};
