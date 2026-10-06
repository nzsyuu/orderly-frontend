export type SaleStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export type SaleItem = {
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type Sale = {
  saleId: string;
  storeId: number;
  date: string;
  status: string;
  totalAmount: number;
  items: SaleItem[];
};

export type StoreFilter = number | "all";

export type TopSoldProduct = {
  productId: number;
  name: string;
  quantity: number;
};

export type SalesKpis = {
  confirmedCount: number;
  revenue: number;
  topProducts: TopSoldProduct[];
};

export function aggregateSalesKpis(
  sales: Sale[],
  productNames: Map<number, string>,
  storeFilter: StoreFilter,
): SalesKpis {
  const confirmed = sales.filter((sale) => {
    if (sale.status !== "CONFIRMED") return false;
    if (storeFilter === "all") return true;
    return sale.storeId === storeFilter;
  });

  const quantityByProduct = new Map<number, number>();
  for (const sale of confirmed) {
    for (const item of sale.items) {
      quantityByProduct.set(
        item.productId,
        (quantityByProduct.get(item.productId) ?? 0) + item.quantity,
      );
    }
  }

  const topProducts = [...quantityByProduct.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([productId, quantity]) => ({
      productId,
      quantity,
      name: productNames.get(productId) ?? `Produto #${productId}`,
    }));

  return {
    confirmedCount: confirmed.length,
    revenue: Math.round(
      confirmed.reduce((sum, sale) => sum + sale.totalAmount, 0) * 100,
    ) / 100,
    topProducts,
  };
}
