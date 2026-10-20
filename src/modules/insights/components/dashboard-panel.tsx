"use client";

import { useMemo, useState } from "react";
import { Calendar } from "lucide-react";
import { InsightsBriefing } from "@/modules/insights/components/insights-briefing";
import { useInsights } from "@/modules/insights/hooks/use-insights";
import { useProducts } from "@/modules/products/hooks/use-products";
import { DashboardKpis } from "@/modules/sales/components/dashboard-kpis";
import { useSales } from "@/modules/sales/hooks/use-sales";
import { aggregateSalesKpis } from "@/modules/sales/types/sale";
import { getApiErrorMessage } from "@/shared/http/api-error";
import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page";

export function DashboardPanel() {
  const [date, setDate] = useState("");

  const salesQuery = useSales();
  const productsQuery = useProducts();
  const insightsQuery = useInsights({
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
    () => aggregateSalesKpis(salesQuery.data ?? [], productNames),
    [salesQuery.data, productNames],
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Painel do dia"
        description="Resumo de vendas confirmadas e previsão de preparo, compras e validade para o turno."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <label className="border-input bg-card text-foreground flex h-10 items-center gap-2 rounded-lg border px-3 text-sm">
              <Calendar className="text-muted-foreground size-4" aria-hidden />
              <span className="text-muted-foreground text-xs">Data:</span>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="tabular bg-transparent text-sm font-medium outline-none"
              />
            </label>
            {date ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDate("")}
              >
                Hoje
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDate("2026-10-06")}
                title="Carrega uma terça-feira com histórico de demonstração"
              >
                Ver terça de demo
              </Button>
            )}
          </div>
        }
      />

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
          "Não foi possível carregar o briefing. Tente novamente em instantes.",
        )}
      />
    </div>
  );
}
