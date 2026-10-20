export type ReportPeriodParams = {
  startDate?: string; // "YYYY-MM-DD"
  endDate?: string; // "YYYY-MM-DD"
};

// ==========================================
// Relatório de vendas
// ==========================================

export type SaleStatusType =
  "PENDENTE" | "EM_PREPARO" | "EM_ROTA" | "ENTREGUE" | "CANCELADA";

export type SalesReportSummary = {
  totalOrders: number;
  deliveredOrders: number;
  canceledOrders: number;
  cancellationRatePercent: number;
  grossRevenue: number;
  deliveryFeeTotal: number;
  netProductRevenue: number;
  averageTicket: number;
};

export type SalesStatusBreakdown = {
  status: SaleStatusType | string;
  orderCount: number;
  totalAmount: number;
};

export type DailySalePoint = {
  date: string;
  deliveredOrders: number;
  revenue: number;
};

export type ProductRankingItem = {
  productId: number;
  productName: string;
  quantitySold: number;
  revenueGenerated: number;
  revenueSharePercent: number;
};

export type SalesReport = {
  startDate: string;
  endDate: string;
  summary: SalesReportSummary;
  byStatus: SalesStatusBreakdown[];
  dailySeries: DailySalePoint[];
  topProducts: ProductRankingItem[];
};

// ==========================================
// Relatório de estoque
// ==========================================

export type ReportMovementType = "ENTRADA" | "SAIDA" | "PERDA" | "AJUSTE";

export type InventoryValuation = {
  activeItemsCount: number;
  belowMinimumCount: number;
  outOfStockCount: number;
  totalInventoryValue: number;
};

export type CategoryValuation = {
  category: string;
  itemsCount: number;
  totalValue: number;
};

export type MovementSummary = {
  type: ReportMovementType | string;
  movementsCount: number;
  totalQuantity: number;
  estimatedFinancialValue: number;
};

export type ItemMovementHighlight = {
  stockItemId: number;
  stockItemName: string;
  category: string;
  unit: string;
  totalQuantity: number;
  totalCost: number;
};

export type StockReport = {
  startDate: string;
  endDate: string;
  currentValuation: InventoryValuation;
  valuationByCategory: CategoryValuation[];
  movementsByType: MovementSummary[];
  topConsumedItems: ItemMovementHighlight[];
  topLostItems: ItemMovementHighlight[];
};

// ==========================================
// Regras puras
// ==========================================

export type AbcClass = "A" | "B" | "C";

/**
 * Curva ABC pela participação acumulada na receita:
 * A até 80%, B até 95%, C o restante. A lista já vem ordenada por receita.
 */
export function classifyAbc(items: ProductRankingItem[]): AbcClass[] {
  let cumulative = 0;
  return items.map((item) => {
    const before = cumulative;
    cumulative += item.revenueSharePercent;
    if (before < 80) return "A";
    if (before < 95) return "B";
    return "C";
  });
}

/** Completa a série diária com zeros nos dias sem venda entregue. */
export function fillDailySeries(
  series: DailySalePoint[],
  startDate: string,
  endDate: string,
): DailySalePoint[] {
  const byDate = new Map(series.map((point) => [point.date, point]));
  const [sy, sm, sd] = startDate.split("-").map(Number);
  const [ey, em, ed] = endDate.split("-").map(Number);
  const cursor = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);
  const filled: DailySalePoint[] = [];

  // Limite de segurança para períodos muito longos.
  while (cursor <= end && filled.length < 400) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
    filled.push(
      byDate.get(key) ?? { date: key, deliveredOrders: 0, revenue: 0 },
    );
    cursor.setDate(cursor.getDate() + 1);
  }

  return filled;
}
