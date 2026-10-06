"use client";

import {
  statusOfLot,
  type LotExpiryStatus,
} from "@/modules/inventory/types/stock-item";
import type { DailyInsights } from "@/modules/insights/types/insights";
import { confidenceLabel, weekdayLabel } from "@/modules/insights/lib/labels";
import { formatDate } from "@/shared/lib/format";
import { Skeleton } from "@/shared/ui/skeleton";

type InsightsBriefingProps = {
  insights: DailyInsights | undefined;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
};

const lotStatusClass: Record<LotExpiryStatus, string> = {
  expired: "bg-destructive/15 text-destructive",
  critical: "bg-warning/15 text-warning",
  ok: "bg-success/15 text-success",
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-border bg-card rounded-md border p-5">
      <h3 className="font-display text-foreground mb-3 text-base font-bold">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground text-sm">{children}</p>;
}

export function InsightsBriefing({
  insights,
  isLoading,
  isError,
  errorMessage,
}: InsightsBriefingProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="border-border bg-card rounded-md border p-5"
          >
            <Skeleton className="mb-3 h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-5/6" />
            <Skeleton className="mt-2 h-4 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="border-border bg-card rounded-md border p-5">
        <p className="text-destructive text-sm">{errorMessage}</p>
      </div>
    );
  }

  if (!insights) return null;

  const demand = [...insights.productDemand].sort((a, b) => {
    if (b.predictedQuantity !== a.predictedQuantity) {
      return b.predictedQuantity - a.predictedQuantity;
    }
    return a.productName.localeCompare(b.productName, "pt-BR");
  });
  const toBuy = insights.purchaseSuggestions.filter(
    (row) => row.quantityToBuy > 0,
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="border-border bg-card rounded-md border p-5">
        <p className="text-foreground text-sm font-medium">
          {insights.storeName} · {formatDate(insights.targetDate)} ·{" "}
          {weekdayLabel(insights.weekday)}
        </p>
        {insights.assumptions.note ? (
          <p className="text-muted-foreground mt-2 text-sm">
            {insights.assumptions.note}
          </p>
        ) : (
          <p className="text-muted-foreground mt-2 text-sm">
            O estoque de insumos é compartilhado entre as lojas. A demanda
            abaixo é do recorte selecionado.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Section title="Previsão de pratos">
          {demand.every((row) => row.predictedQuantity === 0) ? (
            <Empty>
              Sem demanda prevista para este dia. O seed de demo tem histórico
              em terça e sexta.
            </Empty>
          ) : (
            <ul className="flex flex-col gap-2">
              {demand.map((row) => (
                <li
                  key={row.productId}
                  className="flex items-baseline justify-between gap-3 text-sm"
                >
                  <span className="text-foreground min-w-0 truncate">
                    {row.productName}
                  </span>
                  <span className="text-muted-foreground shrink-0">
                    {row.predictedQuantity}{" "}
                    <span className="text-xs">
                      confiança {confidenceLabel(row.confidence)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Comprar insumos">
          {toBuy.length === 0 ? (
            <Empty>Nada a comprar neste horizonte.</Empty>
          ) : (
            <ul className="flex flex-col gap-2">
              {toBuy.map((row) => (
                <li key={row.stockItemId} className="text-sm">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-foreground font-medium">
                      {row.name}
                    </span>
                    <span className="text-muted-foreground shrink-0">
                      +{row.quantityToBuy} {row.unit}
                    </span>
                  </div>
                  {row.belowMinimum ? (
                    <p className="text-warning text-xs">Abaixo do mínimo</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Estoque crítico">
          {insights.criticalStock.length === 0 ? (
            <Empty>Nenhum insumo no mínimo ou abaixo.</Empty>
          ) : (
            <ul className="flex flex-col gap-2">
              {insights.criticalStock.map((row) => (
                <li
                  key={row.stockItemId}
                  className="flex items-baseline justify-between gap-3 text-sm"
                >
                  <span className="text-foreground">{row.name}</span>
                  <span className="text-muted-foreground">
                    {row.currentQuantity}/{row.minimumStock} {row.unit}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Validade e promoção">
          {insights.expiringLots.length === 0 &&
          insights.promotionSuggestions.length === 0 ? (
            <Empty>Nenhum lote na janela de validade.</Empty>
          ) : (
            <div className="flex flex-col gap-4">
              {insights.expiringLots.length > 0 ? (
                <ul className="flex flex-col gap-2">
                  {insights.expiringLots.map((lot) => {
                    const status = statusOfLot(lot.daysUntilExpiry);
                    return (
                      <li
                        key={lot.lotId}
                        className="flex items-baseline justify-between gap-3 text-sm"
                      >
                        <span className="text-foreground min-w-0 truncate">
                          {lot.stockItemName} · {formatDate(lot.expiresAt)}
                        </span>
                        <span
                          className={`shrink-0 rounded-sm px-2 py-0.5 text-xs font-medium ${lotStatusClass[status]}`}
                        >
                          {lot.quantity} · {lot.daysUntilExpiry}d
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
              {insights.promotionSuggestions.length > 0 ? (
                <div>
                  <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
                    Promover
                  </p>
                  <ul className="flex flex-col gap-3">
                    {insights.promotionSuggestions.map((row) => (
                      <li
                        key={`${row.lotId}-${row.stockItemId}`}
                        className="text-sm"
                      >
                        <p className="text-foreground">
                          Lote {row.lotId} vence em {formatDate(row.expiresAt)}{" "}
                          ({row.quantityInLot})
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {row.suggestedProducts
                            .map((product) => product.productName)
                            .join(", ") || "Sem pratos sugeridos"}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
