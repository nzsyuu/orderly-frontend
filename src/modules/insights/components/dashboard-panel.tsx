"use client";

import { useMemo, useState } from "react";
import { DashboardKpis } from "@/modules/sales/components/dashboard-kpis";
import { InsightsBriefing } from "@/modules/insights/components/insights-briefing";
import { useInsights } from "@/modules/insights/hooks/use-insights";
import { useSales } from "@/modules/sales/hooks/use-sales";
import {
  aggregateSalesKpis,
  type StoreFilter,
} from "@/modules/sales/types/sale";
import { useProducts } from "@/modules/products/hooks/use-products";
import { useDemoStores } from "@/modules/stores/hooks/use-stores";
import { getApiErrorMessage } from "@/shared/http/api-error";
import { fieldClassName } from "@/shared/ui/modal";

export function DashboardPanel() {
  const { stores } = useDemoStores();
  const [storeFilter, setStoreFilter] = useState<StoreFilter>(1);
  const [date, setDate] = useState("");

  const salesQuery = useSales();
  const productsQuery = useProducts();
  const insightsQuery = useInsights({
    storeId: storeFilter,
    date: date || undefined,
  });

  const productNames = useMemo(() => {
    const map = new Map<number, string>();
    for (const product of productsQuery.data ?? []) {
      map.set(product.id, product.name);
    }
    return map;
  }, [productsQuery.data]);

  const kpis = useMemo(
    () => aggregateSalesKpis(salesQuery.data ?? [], productNames, storeFilter),
    [salesQuery.data, productNames, storeFilter],
  );

  const filterClass = (active: boolean) =>
    `shrink-0 rounded-sm px-3.5 py-1.5 text-sm font-medium transition-colors ${
      active
        ? "bg-primary text-primary-foreground"
        : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    }`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1">
          {stores.map((store) => (
            <button
              key={store.id}
              type="button"
              className={filterClass(storeFilter === store.id)}
              onClick={() => setStoreFilter(store.id)}
            >
              {store.name}
            </button>
          ))}
          <button
            type="button"
            className={filterClass(storeFilter === "all")}
            onClick={() => setStoreFilter("all")}
          >
            Todas as lojas
          </button>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground shrink-0">Data</span>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className={fieldClassName}
          />
        </label>
      </div>
      <p className="text-muted-foreground -mt-3 text-xs">
        Deixe a data vazia para hoje. Na demo, use uma terça (ex.: 2026-10-06)
        para ver demanda preenchida.
      </p>

      {salesQuery.isError ? (
        <p className="text-destructive text-sm">
          {getApiErrorMessage(
            salesQuery.error,
            "Não foi possível carregar as vendas.",
          )}
        </p>
      ) : null}

      <DashboardKpis
        kpis={kpis}
        isLoading={salesQuery.isLoading || productsQuery.isLoading}
      />

      <InsightsBriefing
        insights={insightsQuery.data}
        isLoading={insightsQuery.isLoading}
        isError={insightsQuery.isError}
        errorMessage={getApiErrorMessage(
          insightsQuery.error,
          "Não foi possível carregar o briefing. Confira se a loja existe.",
        )}
      />
    </div>
  );
}
