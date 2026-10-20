"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Receipt,
  RotateCcw,
  UtensilsCrossed,
} from "lucide-react";
import { DailyRevenueChart } from "@/modules/reports/components/daily-revenue-chart";
import { PeriodPicker } from "@/modules/reports/components/period-picker";
import { ReportSwitcher } from "@/modules/reports/components/report-switcher";
import { useReportPeriod } from "@/modules/reports/hooks/use-report-period";
import { useSalesReport } from "@/modules/reports/hooks/use-reports";
import {
  classifyAbc,
  type AbcClass,
  type SalesStatusBreakdown,
} from "@/modules/reports/types/report";
import {
  getSaleStatusMeta,
  SALE_STATUS_ORDER,
} from "@/modules/sales/lib/sale-status";
import { getApiErrorMessage } from "@/shared/http/api-error";
import { formatBRL, formatNumber, formatPercent } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { EmptyState, PageHeader, Panel } from "@/shared/ui/page";
import { Skeleton } from "@/shared/ui/skeleton";

const abcBadgeStyles: Record<AbcClass, { label: string; className: string }> = {
  A: {
    label: "Classe A",
    className: "bg-brand text-brand-foreground",
  },
  B: {
    label: "Classe B",
    className: "bg-primary/12 text-primary",
  },
  C: {
    label: "Classe C",
    className: "bg-muted text-muted-foreground",
  },
};

function sortStatuses(rows: SalesStatusBreakdown[]) {
  const byKey = new Map(rows.map((row) => [row.status, row]));
  const ordered: SalesStatusBreakdown[] = [];

  for (const key of SALE_STATUS_ORDER) {
    const found = byKey.get(key);
    if (found) {
      ordered.push(found);
      byKey.delete(key);
    }
  }
  for (const leftover of byKey.values()) {
    ordered.push(leftover);
  }
  return ordered;
}

export function SalesReportPanel() {
  const { period, setPreset, setRange } = useReportPeriod();
  const reportQuery = useSalesReport({
    startDate: period.startDate,
    endDate: period.endDate,
  });

  const report = reportQuery.data;
  const summary = report?.summary;

  const productSharePct =
    summary && summary.grossRevenue > 0
      ? Math.round((summary.netProductRevenue / summary.grossRevenue) * 100)
      : 100;
  const deliverySharePct = Math.max(0, 100 - productSharePct);

  const inProgressOrders = summary
    ? Math.max(
        0,
        summary.totalOrders - summary.deliveredOrders - summary.canceledOrders,
      )
    : 0;

  const orderedStatuses = report ? sortStatuses(report.byStatus) : [];
  const totalStatusOrders = orderedStatuses.reduce(
    (sum, item) => sum + item.orderCount,
    0,
  );

  const abcClasses = report ? classifyAbc(report.topProducts) : [];
  const classACount = abcClasses.filter((c) => c === "A").length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Relatório de vendas"
        description="Fechamento financeiro de pedidos entregues, funil operacional e curva ABC do cardápio."
        actions={<ReportSwitcher active="vendas" />}
      />

      <Panel bodyClassName="py-4 sm:py-4">
        <PeriodPicker
          period={period}
          onPreset={setPreset}
          onRange={setRange}
          appliedStart={report?.startDate}
          appliedEnd={report?.endDate}
          isFetching={reportQuery.isFetching}
        />
      </Panel>

      {reportQuery.isError ? (
        <Panel>
          <EmptyState
            icon={Receipt}
            title="Não foi possível carregar o relatório de vendas"
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
            <Skeleton className="h-96 rounded-2xl xl:col-span-5" />
            <Skeleton className="h-96 rounded-2xl xl:col-span-7" />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <Skeleton className="h-80 rounded-2xl lg:col-span-5" />
            <Skeleton className="h-80 rounded-2xl lg:col-span-7" />
          </div>
        </div>
      ) : null}

      {report && summary ? (
        <>
          {/* Hero: Fechamento financeiro + Evolução diária */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            {/* Coluna esquerda: Balanço financeiro consolidado */}
            <section className="bg-sidebar text-sidebar-foreground flex flex-col justify-between rounded-2xl p-5 sm:p-6 xl:col-span-5">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sidebar-foreground/75 text-sm font-medium">
                    Faturamento bruto (pedidos entregues)
                  </p>
                  <span className="bg-sidebar-accent text-sidebar-foreground tabular rounded-full px-2.5 py-0.5 text-xs font-medium">
                    {formatNumber(summary.deliveredOrders)}{" "}
                    {summary.deliveredOrders === 1 ? "entrega" : "entregas"}
                  </span>
                </div>

                <p className="font-condensed tabular text-sidebar-foreground mt-2 text-4xl leading-none font-extrabold sm:text-5xl">
                  {formatBRL(summary.grossRevenue)}
                </p>

                {/* Composição Receita de produtos vs. Taxas de entrega */}
                <div className="mt-6">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-sidebar-foreground/80">
                      Receita líquida de produtos ({productSharePct}%)
                    </span>
                    <span className="text-sidebar-foreground/80">
                      Frete ({deliverySharePct}%)
                    </span>
                  </div>

                  <div className="bg-sidebar-accent mt-2 flex h-2.5 overflow-hidden rounded-full">
                    <div
                      className="bg-brand h-full transition-all"
                      style={{ width: `${productSharePct}%` }}
                    />
                  </div>

                  <div className="mt-2.5 flex items-baseline justify-between gap-3">
                    <div>
                      <p className="font-condensed tabular text-brand text-xl font-bold sm:text-2xl">
                        {formatBRL(summary.netProductRevenue)}
                      </p>
                      <p className="text-sidebar-foreground/65 text-xs">
                        Caixa da cozinha (sem frete)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-condensed tabular text-sidebar-foreground text-xl font-bold sm:text-2xl">
                        {formatBRL(summary.deliveryFeeTotal)}
                      </p>
                      <p className="text-sidebar-foreground/65 text-xs">
                        Repasse de entregas
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Faixa inferior de indicadores operacionais do período */}
              <dl className="border-sidebar-border mt-6 grid grid-cols-3 gap-3 border-t pt-5">
                <div>
                  <dt className="text-sidebar-foreground/65 text-xs">
                    Ticket médio
                  </dt>
                  <dd className="font-condensed tabular text-sidebar-foreground mt-1 text-xl font-bold sm:text-2xl">
                    {formatBRL(summary.averageTicket)}
                  </dd>
                  <p className="text-sidebar-foreground/55 mt-0.5 text-[11px]">
                    por entrega
                  </p>
                </div>

                <div className="border-sidebar-border border-l pl-3">
                  <dt className="text-sidebar-foreground/65 text-xs">
                    Total de pedidos
                  </dt>
                  <dd className="font-condensed tabular text-sidebar-foreground mt-1 text-xl font-bold sm:text-2xl">
                    {formatNumber(summary.totalOrders)}
                  </dd>
                  <p className="text-sidebar-foreground/55 mt-0.5 text-[11px]">
                    {inProgressOrders > 0
                      ? `${inProgressOrders} em aberto`
                      : `${summary.deliveredOrders} concluídos`}
                  </p>
                </div>

                <div className="border-sidebar-border border-l pl-3">
                  <dt className="text-sidebar-foreground/65 text-xs">
                    Cancelamentos
                  </dt>
                  <dd
                    className={cn(
                      "font-condensed tabular mt-1 text-xl font-bold sm:text-2xl",
                      summary.cancellationRatePercent >= 10
                        ? "text-[#ff8f7d]"
                        : "text-sidebar-foreground",
                    )}
                  >
                    {formatPercent(summary.cancellationRatePercent)}
                  </dd>
                  <p className="text-sidebar-foreground/55 mt-0.5 text-[11px]">
                    {formatNumber(summary.canceledOrders)}{" "}
                    {summary.canceledOrders === 1 ? "cancelado" : "cancelados"}
                  </p>
                </div>
              </dl>
            </section>

            {/* Coluna direita: Série histórica dia a dia */}
            <Panel
              title="Evolução diária"
              description="Vendas confirmadas e entregues a cada dia do intervalo."
              className="xl:col-span-7"
            >
              <DailyRevenueChart
                series={report.dailySeries}
                startDate={report.startDate}
                endDate={report.endDate}
              />
            </Panel>
          </div>

          {/* Segunda linha: Quebra por status + Ranking Curva ABC */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Funil por status */}
            <Panel
              title="Pedidos por etapa"
              description="Distribuição de todos os pedidos registrados no período."
              action={
                <Link
                  href="/painel/pedidos"
                  className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-xs font-semibold"
                >
                  Quadro de pedidos
                  <ArrowUpRight className="size-3.5" aria-hidden />
                </Link>
              }
              className="lg:col-span-5"
            >
              {orderedStatuses.length === 0 ? (
                <EmptyState
                  icon={Receipt}
                  title="Sem pedidos no período"
                  description="Quando clientes fizerem pedidos neste intervalo, a divisão por etapa aparece aqui."
                />
              ) : (
                <div className="flex flex-col gap-5">
                  {/* Barra proporcional empilhada */}
                  {totalStatusOrders > 0 ? (
                    <div
                      className="bg-muted flex h-3 w-full overflow-hidden rounded-full"
                      aria-hidden
                    >
                      {orderedStatuses.map((row) => {
                        if (row.orderCount <= 0) return null;
                        const meta = getSaleStatusMeta(row.status);
                        const pct = (row.orderCount / totalStatusOrders) * 100;
                        return (
                          <span
                            key={row.status}
                            style={{
                              width: `${pct}%`,
                              backgroundColor: meta.color,
                            }}
                            className="h-full first:rounded-l-full last:rounded-r-full"
                          />
                        );
                      })}
                    </div>
                  ) : null}

                  <ul className="divide-border divide-y">
                    {orderedStatuses.map((row) => {
                      const meta = getSaleStatusMeta(row.status);
                      const Icon = meta.icon;
                      const share =
                        totalStatusOrders > 0
                          ? (row.orderCount / totalStatusOrders) * 100
                          : 0;

                      return (
                        <li
                          key={row.status}
                          className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span
                              className={cn(
                                "flex size-9 shrink-0 items-center justify-center rounded-lg",
                                meta.badgeClassName,
                              )}
                            >
                              <Icon className="size-4" aria-hidden />
                            </span>
                            <div className="min-w-0">
                              <p className="text-foreground text-sm font-semibold">
                                {meta.label}
                              </p>
                              <p className="text-muted-foreground tabular text-xs">
                                {formatNumber(row.orderCount)}{" "}
                                {row.orderCount === 1 ? "pedido" : "pedidos"} ·{" "}
                                {formatPercent(share, 1)}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="font-condensed tabular text-foreground text-lg font-bold">
                              {formatBRL(row.totalAmount)}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </Panel>

            {/* Ranking de produtos (Curva ABC) */}
            <Panel
              title="Ranking de produtos (Curva ABC)"
              description={
                report.topProducts.length > 0
                  ? `${classACount} ${classACount === 1 ? "produto concentra" : "produtos concentram"} a faixa principal de receita (Classe A, até 80%).`
                  : "Participação de cada item na receita líquida de produtos entregues."
              }
              action={
                <Link
                  href="/produtos"
                  className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-xs font-semibold"
                >
                  Ver catálogo
                  <ArrowUpRight className="size-3.5" aria-hidden />
                </Link>
              }
              className="lg:col-span-7"
            >
              {report.topProducts.length === 0 ? (
                <EmptyState
                  icon={UtensilsCrossed}
                  title="Nenhuma venda entregue no período"
                  description="Assim que houver pedidos concluídos, você verá quais lanches puxam o faturamento."
                />
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[480px] border-collapse text-sm">
                      <thead>
                        <tr className="border-border text-muted-foreground border-b text-left text-xs">
                          <th className="pb-2.5 font-medium">#</th>
                          <th className="pb-2.5 font-medium">Produto</th>
                          <th className="pb-2.5 font-medium">Curva</th>
                          <th className="px-3 pb-2.5 text-right font-medium">
                            Vendidos
                          </th>
                          <th className="px-3 pb-2.5 text-right font-medium">
                            Receita
                          </th>
                          <th className="w-36 pb-2.5 pl-4 text-right font-medium">
                            Participação
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-border divide-y">
                        {report.topProducts.map((item, index) => {
                          const abc = abcClasses[index] ?? "C";
                          const badge = abcBadgeStyles[abc];
                          const barWidth = Math.min(
                            100,
                            Math.max(4, Math.round(item.revenueSharePercent)),
                          );

                          return (
                            <tr key={item.productId}>
                              <td className="text-muted-foreground tabular py-3 pr-2 font-semibold">
                                {index + 1}
                              </td>
                              <td className="py-3 pr-3">
                                <span className="text-foreground font-semibold">
                                  {item.productName}
                                </span>
                              </td>
                              <td className="py-3 pr-3">
                                <span
                                  className={cn(
                                    "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
                                    badge.className,
                                  )}
                                >
                                  {badge.label}
                                </span>
                              </td>
                              <td className="text-foreground tabular px-3 py-3 text-right font-medium whitespace-nowrap">
                                {formatNumber(item.quantitySold)} un
                              </td>
                              <td className="font-condensed tabular text-foreground px-3 py-3 text-right text-base font-bold whitespace-nowrap">
                                {formatBRL(item.revenueGenerated)}
                              </td>
                              <td className="py-3 pl-4">
                                <div className="flex flex-col items-end gap-1">
                                  <span className="text-foreground tabular text-xs font-semibold">
                                    {formatPercent(item.revenueSharePercent, 1)}
                                  </span>
                                  <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                                    <div
                                      style={{
                                        width: `${barWidth}%`,
                                        animationDelay: `${index * 40}ms`,
                                      }}
                                      className={cn(
                                        "animate-grow-x h-full rounded-full",
                                        abc === "A"
                                          ? "bg-brand"
                                          : abc === "B"
                                            ? "bg-primary"
                                            : "bg-muted-foreground/50",
                                      )}
                                    />
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </Panel>
          </div>
        </>
      ) : null}
    </div>
  );
}
