"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  Flame,
  RotateCcw,
  SlidersHorizontal,
  Trash2,
  XCircle,
} from "lucide-react";
import { PeriodPicker } from "@/modules/reports/components/period-picker";
import { ReportSwitcher } from "@/modules/reports/components/report-switcher";
import { useReportPeriod } from "@/modules/reports/hooks/use-report-period";
import { useStockReport } from "@/modules/reports/hooks/use-reports";
import {
  getMovementMeta,
  MOVEMENT_ORDER,
  unitLabel,
} from "@/modules/reports/lib/labels";
import type { MovementSummary } from "@/modules/reports/types/report";
import { getApiErrorMessage } from "@/shared/http/api-error";
import { formatBRL, formatNumber, formatPercent } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { EmptyState, PageHeader, Panel } from "@/shared/ui/page";
import { Skeleton } from "@/shared/ui/skeleton";

const categoryPalette = [
  "var(--brand)",
  "var(--primary)",
  "var(--info)",
  "var(--success)",
  "var(--warning)",
  "var(--muted-foreground)",
];

function movementIcon(type: string) {
  switch (type) {
    case "ENTRADA":
      return ArrowDownLeft;
    case "SAIDA":
      return Flame;
    case "PERDA":
      return Trash2;
    default:
      return SlidersHorizontal;
  }
}

function normalizeMovementType(type: string): string {
  if (type === "SAIDA_VENDA") return "SAIDA";
  if (type === "SAIDA_PERDA") return "PERDA";
  return type;
}

function normalizeMovements(rows: MovementSummary[]) {
  const byType = new Map(
    rows.map((row) => {
      const normalized = normalizeMovementType(row.type);
      return [normalized, { ...row, type: normalized }];
    }),
  );
  const result: MovementSummary[] = [];

  for (const key of MOVEMENT_ORDER) {
    const existing = byType.get(key);
    if (existing) {
      result.push(existing);
      byType.delete(key);
    } else if (key !== "AJUSTE") {
      // Sempre mostra Entrada, Saída e Perda para leitura completa do balanço
      result.push({
        type: key,
        movementsCount: 0,
        totalQuantity: 0,
        estimatedFinancialValue: 0,
      });
    }
  }

  for (const extra of byType.values()) {
    result.push(extra);
  }
  return result;
}

export function StockReportPanel() {
  const { period, setPreset, setRange } = useReportPeriod();
  const reportQuery = useStockReport({
    startDate: period.startDate,
    endDate: period.endDate,
  });

  const report = reportQuery.data;
  const valuation = report?.currentValuation;

  const healthyCount = valuation
    ? Math.max(
        0,
        valuation.activeItemsCount -
          valuation.belowMinimumCount -
          valuation.outOfStockCount,
      )
    : 0;

  const movements = report ? normalizeMovements(report.movementsByType) : [];
  const maxMovementValue = Math.max(
    ...movements.map((m) => m.estimatedFinancialValue),
    0,
  );

  const saidaValue =
    movements.find((m) => m.type === "SAIDA")?.estimatedFinancialValue ?? 0;
  const perdaValue =
    movements.find((m) => m.type === "PERDA")?.estimatedFinancialValue ?? 0;
  const totalOutflow = saidaValue + perdaValue;
  const wasteRatePct = totalOutflow > 0 ? (perdaValue / totalOutflow) * 100 : 0;

  const maxConsumedCost = report
    ? Math.max(...report.topConsumedItems.map((i) => i.totalCost), 0)
    : 0;
  const maxLostCost = report
    ? Math.max(...report.topLostItems.map((i) => i.totalCost), 0)
    : 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Relatório de estoque"
        description="Valor imobilizado hoje por categoria e balanço de entradas, consumo e desperdício no período."
        actions={<ReportSwitcher active="estoque" />}
      />

      {reportQuery.isError ? (
        <Panel>
          <EmptyState
            icon={Boxes}
            title="Não foi possível carregar o relatório de estoque"
            description={getApiErrorMessage(
              reportQuery.error,
              "Verifique o intervalo de datas selecionado e tente novamente.",
            )}
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPreset("30d")}
                >
                  <RotateCcw className="size-4" />
                  Últimos 30 dias
                </Button>
                <Button type="button" onClick={() => reportQuery.refetch()}>
                  Tentar novamente
                </Button>
              </div>
            }
          />
        </Panel>
      ) : null}

      {reportQuery.isPending && !report ? (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <Skeleton className="h-80 rounded-2xl xl:col-span-5" />
            <Skeleton className="h-80 rounded-2xl xl:col-span-7" />
          </div>
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      ) : null}

      {report && valuation ? (
        <>
          {/* BLOCO 1: Fotografia atual em tempo real */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            {/* Cartão escuro de posição atual */}
            <section className="bg-sidebar text-sidebar-foreground flex flex-col justify-between rounded-2xl p-5 sm:p-6 xl:col-span-5">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sidebar-foreground/75 text-sm font-medium">
                    Valor em estoque agora
                  </span>
                  <span className="bg-sidebar-accent text-sidebar-foreground inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium">
                    <span className="bg-success size-1.5 rounded-full" />
                    Tempo real
                  </span>
                </div>

                <p className="font-condensed tabular text-sidebar-foreground mt-2 text-4xl leading-none font-extrabold sm:text-5xl">
                  {formatBRL(valuation.totalInventoryValue)}
                </p>
                <p className="text-sidebar-foreground/65 mt-1.5 text-xs">
                  Soma de quantidade atual × custo unitário em{" "}
                  {formatNumber(valuation.activeItemsCount)}{" "}
                  {valuation.activeItemsCount === 1
                    ? "insumo ativo"
                    : "insumos ativos"}
                </p>
              </div>

              {/* Portas para a operação de estoque */}
              <div className="mt-6 grid grid-cols-3 gap-2.5">
                <Link
                  href="/estoque?status=esgotado"
                  className={cn(
                    "group flex flex-col justify-between rounded-xl border p-3 transition-colors",
                    valuation.outOfStockCount > 0
                      ? "bg-destructive/20 hover:bg-destructive/30 border-[#ff8f7d]/40"
                      : "border-sidebar-border bg-sidebar-accent/60 hover:bg-sidebar-accent",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <XCircle
                      className={cn(
                        "size-4",
                        valuation.outOfStockCount > 0
                          ? "text-[#ff8f7d]"
                          : "text-sidebar-foreground/60",
                      )}
                      aria-hidden
                    />
                    <ArrowUpRight className="text-sidebar-foreground/50 group-hover:text-sidebar-foreground size-3.5 transition-colors" />
                  </div>
                  <div className="mt-3">
                    <p className="font-condensed tabular text-2xl leading-none font-extrabold">
                      {formatNumber(valuation.outOfStockCount)}
                    </p>
                    <p className="text-sidebar-foreground/70 mt-1 text-xs">
                      Esgotados
                    </p>
                  </div>
                </Link>

                <Link
                  href="/estoque?status=baixo"
                  className={cn(
                    "group flex flex-col justify-between rounded-xl border p-3 transition-colors",
                    valuation.belowMinimumCount > 0
                      ? "border-brand/40 bg-brand/15 hover:bg-brand/25"
                      : "border-sidebar-border bg-sidebar-accent/60 hover:bg-sidebar-accent",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <AlertTriangle
                      className={cn(
                        "size-4",
                        valuation.belowMinimumCount > 0
                          ? "text-brand"
                          : "text-sidebar-foreground/60",
                      )}
                      aria-hidden
                    />
                    <ArrowUpRight className="text-sidebar-foreground/50 group-hover:text-sidebar-foreground size-3.5 transition-colors" />
                  </div>
                  <div className="mt-3">
                    <p className="font-condensed tabular text-2xl leading-none font-extrabold">
                      {formatNumber(valuation.belowMinimumCount)}
                    </p>
                    <p className="text-sidebar-foreground/70 mt-1 text-xs">
                      Estoque baixo
                    </p>
                  </div>
                </Link>

                <Link
                  href="/estoque?status=ok"
                  className="border-sidebar-border bg-sidebar-accent/60 hover:bg-sidebar-accent group flex flex-col justify-between rounded-xl border p-3 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <CheckCircle2
                      className="text-sidebar-foreground/75 size-4"
                      aria-hidden
                    />
                    <ArrowUpRight className="text-sidebar-foreground/50 group-hover:text-sidebar-foreground size-3.5 transition-colors" />
                  </div>
                  <div className="mt-3">
                    <p className="font-condensed tabular text-2xl leading-none font-extrabold">
                      {formatNumber(healthyCount)}
                    </p>
                    <p className="text-sidebar-foreground/70 mt-1 text-xs">
                      Em dia
                    </p>
                  </div>
                </Link>
              </div>
            </section>

            {/* Valoração por categoria */}
            <Panel
              title="Capital imobilizado por categoria"
              description="Onde está concentrado o valor do seu estoque hoje. Clique em uma categoria para abrir os itens."
              action={
                <Link
                  href="/estoque"
                  className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-xs font-semibold"
                >
                  Abrir estoque
                  <ArrowUpRight className="size-3.5" aria-hidden />
                </Link>
              }
              className="xl:col-span-7"
            >
              {report.valuationByCategory.length === 0 ? (
                <EmptyState
                  icon={Boxes}
                  title="Sem itens ativos no estoque"
                  description="Cadastre insumos na página de estoque para acompanhar o valor por categoria."
                />
              ) : (
                <div className="flex flex-col gap-5">
                  {/* Barra empilhada de participação financeira */}
                  {valuation.totalInventoryValue > 0 ? (
                    <div
                      className="bg-muted flex h-3 w-full overflow-hidden rounded-full"
                      aria-hidden
                    >
                      {report.valuationByCategory.map((cat, idx) => {
                        if (cat.totalValue <= 0) return null;
                        const pct =
                          (cat.totalValue / valuation.totalInventoryValue) *
                          100;
                        return (
                          <span
                            key={cat.category}
                            style={{
                              width: `${pct}%`,
                              backgroundColor:
                                categoryPalette[idx % categoryPalette.length],
                            }}
                            className="h-full first:rounded-l-full last:rounded-r-full"
                          />
                        );
                      })}
                    </div>
                  ) : null}

                  <ul className="divide-border divide-y">
                    {report.valuationByCategory.map((cat, idx) => {
                      const share =
                        valuation.totalInventoryValue > 0
                          ? (cat.totalValue / valuation.totalInventoryValue) *
                            100
                          : 0;
                      const dotColor =
                        categoryPalette[idx % categoryPalette.length];

                      return (
                        <li key={cat.category}>
                          <Link
                            href={`/estoque?categoria=${encodeURIComponent(cat.category)}`}
                            className="hover:bg-muted/60 -mx-2 flex items-center justify-between gap-4 rounded-xl px-2 py-2.5 transition-colors"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <span
                                style={{ backgroundColor: dotColor }}
                                className="size-3 shrink-0 rounded-xs"
                                aria-hidden
                              />
                              <div className="min-w-0">
                                <p className="text-foreground truncate text-sm font-semibold">
                                  {cat.category}
                                </p>
                                <p className="text-muted-foreground tabular text-xs">
                                  {formatNumber(cat.itemsCount)}{" "}
                                  {cat.itemsCount === 1 ? "item" : "itens"} ·{" "}
                                  {formatPercent(share, 1)} do estoque
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="font-condensed tabular text-foreground text-lg font-bold">
                                {formatBRL(cat.totalValue)}
                              </span>
                              <ArrowUpRight
                                className="text-muted-foreground size-4"
                                aria-hidden
                              />
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </Panel>
          </div>

          {/* BLOCO 2: Fluxo no período selecionado */}
          <Panel bodyClassName="py-4 sm:py-4">
            <PeriodPicker
              period={period}
              onPreset={setPreset}
              onRange={setRange}
              appliedStart={report.startDate}
              appliedEnd={report.endDate}
              isFetching={reportQuery.isFetching}
            />
          </Panel>

          {/* Balanço de movimentações por tipo */}
          <Panel
            title="Balanço de movimentações no período"
            description="Impacto financeiro estimado de tudo que entrou, saiu para produção ou foi perdido."
            action={
              totalOutflow > 0 ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                    wasteRatePct > 8
                      ? "bg-destructive/12 text-destructive"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  Desperdício sobre saídas: {formatPercent(wasteRatePct, 1)}
                </span>
              ) : null
            }
          >
            <div
              className={cn(
                "grid grid-cols-1 gap-4",
                movements.length >= 4
                  ? "sm:grid-cols-2 xl:grid-cols-4"
                  : "md:grid-cols-3",
              )}
            >
              {movements.map((mov) => {
                const meta = getMovementMeta(mov.type);
                const Icon = movementIcon(mov.type);
                const barWidth =
                  maxMovementValue > 0 && mov.estimatedFinancialValue > 0
                    ? Math.max(
                        6,
                        Math.round(
                          (mov.estimatedFinancialValue / maxMovementValue) *
                            100,
                        ),
                      )
                    : 0;

                return (
                  <div
                    key={mov.type}
                    className="border-border bg-background/50 flex flex-col justify-between rounded-xl border p-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-foreground text-sm font-semibold">
                          {meta.label}
                        </span>
                        <span
                          style={{ color: meta.color }}
                          className="bg-card border-border flex size-8 items-center justify-center rounded-lg border"
                        >
                          <Icon className="size-4" aria-hidden />
                        </span>
                      </div>
                      {meta.description ? (
                        <p className="text-muted-foreground mt-0.5 text-xs">
                          {meta.description}
                        </p>
                      ) : null}

                      <p
                        style={
                          mov.type === "PERDA" &&
                          mov.estimatedFinancialValue > 0
                            ? { color: "var(--destructive)" }
                            : mov.type === "ENTRADA" &&
                                mov.estimatedFinancialValue > 0
                              ? { color: "var(--success)" }
                              : undefined
                        }
                        className="font-condensed tabular text-foreground mt-3 text-3xl leading-none font-extrabold"
                      >
                        {formatBRL(mov.estimatedFinancialValue)}
                      </p>
                    </div>

                    <div className="mt-4">
                      <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                        <div
                          style={{
                            width: `${barWidth}%`,
                            backgroundColor: meta.color,
                          }}
                          className="animate-grow-x h-full rounded-full"
                        />
                      </div>
                      <p className="text-muted-foreground tabular mt-2 text-xs">
                        {formatNumber(mov.movementsCount)}{" "}
                        {mov.movementsCount === 1
                          ? "movimentação"
                          : "movimentações"}{" "}
                        · volume bruto {formatNumber(mov.totalQuantity)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>

          {/* Rankings lado a lado: Maior consumo vs. Maior perda */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Insumos mais consumidos */}
            <Panel
              title="Insumos mais consumidos (saídas)"
              description="Itens com maior custo consumido na operação durante o período."
            >
              {report.topConsumedItems.length === 0 ? (
                <EmptyState
                  icon={Flame}
                  title="Sem consumo registrado no período"
                  description="As baixas de produção e vendas aparecerão aqui ordenadas por custo."
                />
              ) : (
                <ul className="divide-border divide-y">
                  {report.topConsumedItems.map((item, idx) => {
                    const widthPct =
                      maxConsumedCost > 0
                        ? Math.max(
                            6,
                            Math.round(
                              (item.totalCost / maxConsumedCost) * 100,
                            ),
                          )
                        : 0;

                    return (
                      <li
                        key={item.stockItemId}
                        className="py-3 first:pt-0 last:pb-0"
                      >
                        <Link
                          href={`/estoque?q=${encodeURIComponent(item.stockItemName)}`}
                          className="group block"
                        >
                          <div className="flex items-baseline justify-between gap-3">
                            <div className="min-w-0">
                              <span className="text-muted-foreground tabular mr-2 text-xs font-semibold">
                                {idx + 1}.
                              </span>
                              <span className="text-foreground group-hover:text-primary text-sm font-semibold transition-colors">
                                {item.stockItemName}
                              </span>
                              <span className="bg-muted text-muted-foreground ml-2 rounded-md px-1.5 py-0.5 text-[11px] font-medium">
                                {item.category}
                              </span>
                            </div>

                            <span className="font-condensed tabular text-foreground shrink-0 text-lg font-bold">
                              {formatBRL(item.totalCost)}
                            </span>
                          </div>

                          <div className="mt-1.5 flex items-center gap-3">
                            <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
                              <div
                                style={{ width: `${widthPct}%` }}
                                className="bg-primary animate-grow-x h-full rounded-full"
                              />
                            </div>
                            <span className="text-muted-foreground tabular shrink-0 text-xs">
                              {formatNumber(item.totalQuantity)}{" "}
                              {unitLabel(item.unit)}
                            </span>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>

            {/* Insumos com maior perda */}
            <Panel
              title="Insumos com maior perda"
              description="Desperdícios e baixas por validade ordenados pelo prejuízo financeiro."
            >
              {report.topLostItems.length === 0 ? (
                <EmptyState
                  icon={CheckCircle2}
                  title="Nenhuma perda registrada neste período"
                  description="Bom controle de validade! Nenhum insumo teve baixa por perda no intervalo selecionado."
                />
              ) : (
                <ul className="divide-border divide-y">
                  {report.topLostItems.map((item, idx) => {
                    const widthPct =
                      maxLostCost > 0
                        ? Math.max(
                            8,
                            Math.round((item.totalCost / maxLostCost) * 100),
                          )
                        : 0;

                    return (
                      <li
                        key={item.stockItemId}
                        className="py-3 first:pt-0 last:pb-0"
                      >
                        <Link
                          href={`/estoque?q=${encodeURIComponent(item.stockItemName)}`}
                          className="group block"
                        >
                          <div className="flex items-baseline justify-between gap-3">
                            <div className="min-w-0">
                              <span className="text-muted-foreground tabular mr-2 text-xs font-semibold">
                                {idx + 1}.
                              </span>
                              <span className="text-foreground group-hover:text-destructive text-sm font-semibold transition-colors">
                                {item.stockItemName}
                              </span>
                              <span className="bg-muted text-muted-foreground ml-2 rounded-md px-1.5 py-0.5 text-[11px] font-medium">
                                {item.category}
                              </span>
                            </div>

                            <span className="font-condensed tabular text-destructive shrink-0 text-lg font-bold">
                              −{formatBRL(item.totalCost)}
                            </span>
                          </div>

                          <div className="mt-1.5 flex items-center gap-3">
                            <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
                              <div
                                style={{ width: `${widthPct}%` }}
                                className="bg-destructive animate-grow-x h-full rounded-full"
                              />
                            </div>
                            <span className="text-muted-foreground tabular shrink-0 text-xs">
                              {formatNumber(item.totalQuantity)}{" "}
                              {unitLabel(item.unit)} perdidos
                            </span>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>
          </div>
        </>
      ) : null}
    </div>
  );
}
