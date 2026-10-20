"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  statusOfLot,
  type LotExpiryStatus,
} from "@/modules/inventory/types/stock-item";
import { confidenceLabel, weekdayLabel } from "@/modules/insights/lib/labels";
import type { DailyInsights } from "@/modules/insights/types/insights";
import { formatDate, formatNumber } from "@/shared/lib/format";
import { Panel } from "@/shared/ui/page";
import { Skeleton } from "@/shared/ui/skeleton";

type InsightsBriefingProps = {
  insights: DailyInsights | undefined;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
};

const lotStatusClass: Record<LotExpiryStatus, string> = {
  expired: "bg-destructive/12 text-destructive",
  critical: "bg-warning/15 text-warning",
  ok: "bg-success/12 text-success",
};

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
            className="border-border bg-card rounded-2xl border p-5"
          >
            <Skeleton className="mb-3 h-5 w-36" />
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
      <Panel>
        <p className="text-destructive text-sm">{errorMessage}</p>
      </Panel>
    );
  }

  if (!insights) return null;

  const demand = [...insights.productDemand].sort((a, b) => {
    if (b.predictedQuantity !== a.predictedQuantity) {
      return b.predictedQuantity - a.predictedQuantity;
    }
    return a.productName.localeCompare(b.productName, "pt-BR");
  });
  const maxDemand = Math.max(...demand.map((d) => d.predictedQuantity), 0);
  const toBuy = insights.purchaseSuggestions.filter(
    (row) => row.quantityToBuy > 0,
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Faixa de contexto da previsão */}
      <div className="bg-sidebar text-sidebar-foreground flex flex-col justify-between gap-2 rounded-2xl px-5 py-4 sm:flex-row sm:items-center">
        <div>
          <p className="font-condensed text-sidebar-foreground text-xl font-bold capitalize">
            {weekdayLabel(insights.weekday)}, {formatDate(insights.targetDate)}
          </p>
          <p className="text-sidebar-foreground/70 text-xs">
            {insights.assumptions.note ||
              "Previsão calculada a partir do histórico de vendas da loja para este dia da semana."}
          </p>
        </div>
        <span className="bg-sidebar-accent text-sidebar-foreground self-start rounded-full px-3 py-1 text-xs font-medium sm:self-auto">
          {insights.storeName}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel
          title="Previsão de saída de pratos"
          description="Estimativa de unidades para preparar a praça do turno."
        >
          {demand.every((row) => row.predictedQuantity === 0) ? (
            <Empty>
              Sem demanda prevista para este dia. No ambiente de demonstração, o
              histórico está concentrado às terças e sextas-feiras.
            </Empty>
          ) : (
            <ul className="flex flex-col gap-3">
              {demand.map((row) => {
                const widthPct =
                  maxDemand > 0 && row.predictedQuantity > 0
                    ? Math.max(
                        6,
                        Math.round((row.predictedQuantity / maxDemand) * 100),
                      )
                    : 0;
                return (
                  <li key={row.productId} className="text-sm">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-foreground min-w-0 truncate font-medium">
                        {row.productName}
                      </span>
                      <span className="text-muted-foreground shrink-0 text-xs">
                        <strong className="font-condensed tabular text-foreground mr-1.5 text-base font-bold">
                          {formatNumber(row.predictedQuantity)} un
                        </strong>
                        confiança {confidenceLabel(row.confidence)}
                      </span>
                    </div>
                    <div className="bg-muted mt-1.5 h-1.5 w-full overflow-hidden rounded-full">
                      <div
                        style={{ width: `${widthPct}%` }}
                        className="bg-primary h-full rounded-full"
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel
          title="Lista de compras sugerida"
          description="Insumos para repor antes do turno começar."
          action={
            <Link
              href="/estoque"
              className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-xs font-semibold"
            >
              Abrir estoque
              <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
          }
        >
          {toBuy.length === 0 ? (
            <Empty>Nenhum insumo precisa de compra neste horizonte.</Empty>
          ) : (
            <ul className="divide-border divide-y">
              {toBuy.map((row) => (
                <li
                  key={row.stockItemId}
                  className="py-2.5 text-sm first:pt-0 last:pb-0"
                >
                  <Link
                    href={`/estoque?q=${encodeURIComponent(row.name)}`}
                    className="group flex items-baseline justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <span className="text-foreground group-hover:text-primary font-semibold transition-colors">
                        {row.name}
                      </span>
                      {row.belowMinimum ? (
                        <span className="bg-warning/15 text-warning ml-2 rounded-full px-2 py-0.5 text-[11px] font-semibold">
                          Abaixo do mínimo
                        </span>
                      ) : null}
                    </div>
                    <span className="font-condensed tabular text-foreground shrink-0 text-base font-bold">
                      +{formatNumber(row.quantityToBuy)} {row.unit}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Estoque crítico agora"
          description="Insumos que já atingiram ou ficaram abaixo do mínimo."
          action={
            insights.criticalStock.length > 0 ? (
              <Link
                href="/estoque?status=baixo"
                className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-xs font-semibold"
              >
                Filtrar críticos
                <ArrowUpRight className="size-3.5" aria-hidden />
              </Link>
            ) : null
          }
        >
          {insights.criticalStock.length === 0 ? (
            <Empty>Nenhum insumo no mínimo ou abaixo.</Empty>
          ) : (
            <ul className="divide-border divide-y">
              {insights.criticalStock.map((row) => (
                <li
                  key={row.stockItemId}
                  className="flex items-baseline justify-between gap-3 py-2.5 text-sm first:pt-0 last:pb-0"
                >
                  <Link
                    href={`/estoque?q=${encodeURIComponent(row.name)}`}
                    className="text-foreground hover:text-primary font-medium transition-colors"
                  >
                    {row.name}
                  </Link>
                  <span className="text-muted-foreground tabular text-xs">
                    <strong className="text-warning font-bold">
                      {row.currentQuantity}
                    </strong>{" "}
                    / mín. {row.minimumStock} {row.unit}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Validade e giro rápido"
          description="Lotes próximos do vencimento e pratos sugeridos para promoção."
        >
          {insights.expiringLots.length === 0 &&
          insights.promotionSuggestions.length === 0 ? (
            <Empty>Nenhum lote na janela crítica de validade.</Empty>
          ) : (
            <div className="flex flex-col gap-4">
              {insights.expiringLots.length > 0 ? (
                <ul className="divide-border divide-y">
                  {insights.expiringLots.map((lot) => {
                    const status = statusOfLot(lot.daysUntilExpiry);
                    return (
                      <li
                        key={lot.lotId}
                        className="flex items-baseline justify-between gap-3 py-2 text-sm first:pt-0 last:pb-0"
                      >
                        <span className="text-foreground min-w-0 truncate font-medium">
                          {lot.stockItemName}{" "}
                          <span className="text-muted-foreground text-xs font-normal">
                            · vence {formatDate(lot.expiresAt)}
                          </span>
                        </span>
                        <span
                          className={`tabular shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${lotStatusClass[status]}`}
                        >
                          {lot.quantity} un · {lot.daysUntilExpiry}d
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : null}

              {insights.promotionSuggestions.length > 0 ? (
                <div className="border-border border-t pt-3">
                  <p className="text-foreground mb-2 text-xs font-semibold">
                    Sugestão para girar antes do vencimento
                  </p>
                  <ul className="flex flex-col gap-2.5">
                    {insights.promotionSuggestions.map((row) => (
                      <li
                        key={`${row.lotId}-${row.stockItemId}`}
                        className="bg-muted/60 rounded-xl p-3 text-sm"
                      >
                        <p className="text-foreground font-medium">
                          Lote #{row.lotId} vence em {formatDate(row.expiresAt)}{" "}
                          ({row.quantityInLot} em saldo)
                        </p>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                          Promover:{" "}
                          <strong className="text-foreground font-semibold">
                            {row.suggestedProducts
                              .map((product) => product.productName)
                              .join(", ") || "Sem pratos sugeridos"}
                          </strong>
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
