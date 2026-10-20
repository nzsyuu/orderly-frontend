"use client";

import { useMemo, useState } from "react";
import {
  fillDailySeries,
  type DailySalePoint,
} from "@/modules/reports/types/report";
import {
  formatBRL,
  formatCompactBRL,
  formatDate,
  parseISODate,
} from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

type ChartMetric = "revenue" | "orders";

type DailyRevenueChartProps = {
  series: DailySalePoint[];
  startDate: string;
  endDate: string;
};

const shortDayFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
});

const fullDayFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

function formatShortDay(iso: string) {
  return shortDayFormatter.format(parseISODate(iso));
}

function formatFullDay(iso: string) {
  return fullDayFormatter.format(parseISODate(iso)).replace(".", "");
}

export function DailyRevenueChart({
  series,
  startDate,
  endDate,
}: DailyRevenueChartProps) {
  const [metric, setMetric] = useState<ChartMetric>("revenue");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const points = useMemo(
    () => fillDailySeries(series, startDate, endDate),
    [series, startDate, endDate],
  );

  const stats = useMemo(() => {
    const values = points.map((p) =>
      metric === "revenue" ? p.revenue : p.deliveredOrders,
    );
    const max = Math.max(...values, 0);
    const sum = values.reduce((acc, v) => acc + v, 0);
    const activeDays = points.filter(
      (p) => (metric === "revenue" ? p.revenue : p.deliveredOrders) > 0,
    ).length;
    const avg = points.length > 0 ? sum / points.length : 0;

    let peakIndex = -1;
    let peakValue = 0;
    values.forEach((v, idx) => {
      if (v > peakValue) {
        peakValue = v;
        peakIndex = idx;
      }
    });

    return { max, sum, avg, activeDays, peakIndex };
  }, [points, metric]);

  const inspectedIndex =
    activeIndex !== null && points[activeIndex]
      ? activeIndex
      : stats.peakIndex >= 0
        ? stats.peakIndex
        : points.length - 1;

  const inspected = points[inspectedIndex] ?? null;
  const avgPct =
    stats.max > 0
      ? Math.min(100, Math.round((stats.avg / stats.max) * 100))
      : 0;

  const labelStep =
    points.length <= 10
      ? 1
      : points.length <= 21
        ? 3
        : points.length <= 45
          ? 5
          : Math.ceil(points.length / 8);

  return (
    <div className="flex flex-col gap-4">
      {/* Cabeçalho do gráfico com leitura do dia inspecionado e alternador */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-h-[3.25rem]">
          {inspected ? (
            <>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-foreground font-semibold capitalize">
                  {formatFullDay(inspected.date)}
                </span>
                {inspectedIndex === stats.peakIndex && stats.max > 0 ? (
                  <span className="bg-brand/25 text-foreground rounded-full px-2 py-0.5 text-[11px] font-semibold">
                    Pico do período
                  </span>
                ) : null}
                <span className="text-muted-foreground">
                  · {inspected.deliveredOrders}{" "}
                  {inspected.deliveredOrders === 1
                    ? "pedido entregue"
                    : "pedidos entregues"}
                </span>
              </div>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="font-condensed tabular text-foreground text-2xl font-extrabold sm:text-3xl">
                  {metric === "revenue"
                    ? formatBRL(inspected.revenue)
                    : `${inspected.deliveredOrders} ${
                        inspected.deliveredOrders === 1 ? "pedido" : "pedidos"
                      }`}
                </span>
                {inspected.deliveredOrders > 0 ? (
                  <span className="text-muted-foreground tabular text-xs">
                    {metric === "revenue"
                      ? `Ticket médio ${formatBRL(inspected.revenue / inspected.deliveredOrders)}`
                      : `Receita ${formatBRL(inspected.revenue)}`}
                  </span>
                ) : (
                  <span className="text-muted-foreground text-xs">
                    Sem vendas entregues neste dia
                  </span>
                )}
              </div>
            </>
          ) : null}
        </div>

        <div className="bg-muted flex items-center gap-1 self-start rounded-xl p-1 sm:self-auto">
          <button
            type="button"
            onClick={() => setMetric("revenue")}
            className={cn(
              "h-7 rounded-lg px-2.5 text-xs font-semibold transition-colors",
              metric === "revenue"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Faturamento
          </button>
          <button
            type="button"
            onClick={() => setMetric("orders")}
            className={cn(
              "h-7 rounded-lg px-2.5 text-xs font-semibold transition-colors",
              metric === "orders"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Pedidos
          </button>
        </div>
      </div>

      {/* Área das barras */}
      <div className="relative pt-2" onMouseLeave={() => setActiveIndex(null)}>
        {/* Guia de topo e linha de média */}
        <div className="relative h-48 w-full sm:h-56">
          {/* Linhas de grade horizontais discretas */}
          <div className="border-border/70 text-muted-foreground pointer-events-none absolute inset-x-0 top-0 flex justify-between border-t pt-1 text-[11px]">
            <span>Máx.</span>
            <span className="tabular">
              {metric === "revenue"
                ? formatCompactBRL(stats.max)
                : `${stats.max} ped.`}
            </span>
          </div>

          {stats.avg > 0 && avgPct > 12 && avgPct < 90 ? (
            <div
              className="border-foreground/25 pointer-events-none absolute inset-x-0 z-10 border-t border-dashed"
              style={{ bottom: `${avgPct}%` }}
            >
              <span className="bg-card/90 text-muted-foreground tabular absolute -top-2.5 right-0 rounded px-1.5 text-[11px]">
                média{" "}
                {metric === "revenue"
                  ? formatCompactBRL(stats.avg)
                  : stats.avg.toLocaleString("pt-BR", {
                      maximumFractionDigits: 1,
                    })}
              </span>
            </div>
          ) : null}

          <div
            role="list"
            aria-label={
              metric === "revenue"
                ? "Faturamento diário no período"
                : "Pedidos entregues por dia no período"
            }
            className="relative flex h-full items-end gap-[3px] pt-6 sm:gap-1.5"
          >
            {points.map((point, index) => {
              const value =
                metric === "revenue" ? point.revenue : point.deliveredOrders;
              const ratio = stats.max > 0 ? value / stats.max : 0;
              const heightPct =
                value > 0 ? Math.max(8, Math.round(ratio * 100)) : 0;
              const isPeak = index === stats.peakIndex && stats.max > 0;
              const isActive = index === inspectedIndex;

              return (
                <button
                  key={point.date}
                  type="button"
                  role="listitem"
                  aria-label={`${formatDate(point.date)}: ${formatBRL(point.revenue)}, ${point.deliveredOrders} pedidos`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                  className="group relative flex h-full min-w-0 flex-1 flex-col items-center justify-end focus:outline-none"
                >
                  {value > 0 ? (
                    <span
                      style={{
                        height: `${heightPct}%`,
                        animationDelay: `${Math.min(index * 12, 240)}ms`,
                      }}
                      className={cn(
                        "animate-grow-y w-full rounded-t-[5px] transition-opacity",
                        isPeak ? "bg-brand" : "bg-primary",
                        isActive
                          ? "ring-foreground/25 opacity-100 ring-2"
                          : activeIndex !== null
                            ? "opacity-45 group-hover:opacity-85"
                            : "opacity-85 group-hover:opacity-100",
                      )}
                    />
                  ) : (
                    <span
                      className={cn(
                        "h-1 w-full rounded-full transition-colors",
                        isActive ? "bg-foreground/45" : "bg-border",
                      )}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Eixo X com datas espaçadas */}
        <div className="border-border text-muted-foreground mt-2 flex items-center justify-between border-t pt-2 text-[11px]">
          {points.map((point, index) => {
            const isFirst = index === 0;
            const isLast = index === points.length - 1;
            const showTick =
              isFirst ||
              isLast ||
              (index % labelStep === 0 &&
                index < points.length - labelStep / 2);

            if (!showTick) return null;
            return (
              <span key={point.date} className="tabular">
                {formatShortDay(point.date)}
              </span>
            );
          })}
        </div>
      </div>

      {/* Legenda enxuta no rodapé */}
      <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="bg-primary size-2.5 rounded-xs" />
            Dia com entregas ({stats.activeDays} de {points.length})
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="bg-brand size-2.5 rounded-xs" />
            Maior movimento
          </span>
        </div>
        <span className="tabular">
          Passe o cursor ou toque nas barras para inspecionar um dia
        </span>
      </div>
    </div>
  );
}
