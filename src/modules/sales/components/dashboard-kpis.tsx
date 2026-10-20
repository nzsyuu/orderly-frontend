"use client";

import Link from "next/link";
import { ArrowUpRight, ShoppingCart, Trophy, Wallet } from "lucide-react";
import type { SalesKpis } from "@/modules/sales/types/sale";
import { formatBRL, formatNumber } from "@/shared/lib/format";
import { Skeleton } from "@/shared/ui/skeleton";

type DashboardKpisProps = {
  kpis: SalesKpis;
  isLoading: boolean;
};

export function DashboardKpis({ kpis, isLoading }: DashboardKpisProps) {
  const avgTicket =
    kpis.confirmedCount > 0 ? kpis.revenue / kpis.confirmedCount : 0;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      {/* Receita confirmada */}
      <div className="border-border bg-card flex flex-col justify-between rounded-2xl border p-5 lg:col-span-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-muted-foreground text-sm font-medium">
            Faturamento confirmado
          </p>
          <span className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
            <Wallet className="size-4" aria-hidden />
          </span>
        </div>

        <div className="mt-3">
          {isLoading ? (
            <Skeleton className="h-9 w-36" />
          ) : (
            <p className="font-condensed tabular text-foreground text-3xl leading-none font-extrabold sm:text-4xl">
              {formatBRL(kpis.revenue)}
            </p>
          )}
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-muted-foreground tabular">
              Ticket médio {formatBRL(avgTicket)}
            </span>
            <Link
              href="/relatorios/vendas"
              className="text-primary hover:text-primary/80 inline-flex items-center gap-1 font-semibold"
            >
              Relatório
              <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>

      {/* Vendas realizadas */}
      <div className="border-border bg-card flex flex-col justify-between rounded-2xl border p-5 lg:col-span-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-muted-foreground text-sm font-medium">
            Pedidos confirmados
          </p>
          <span className="bg-accent text-accent-foreground flex size-9 items-center justify-center rounded-lg">
            <ShoppingCart className="size-4" aria-hidden />
          </span>
        </div>

        <div className="mt-3">
          {isLoading ? (
            <Skeleton className="h-9 w-20" />
          ) : (
            <p className="font-condensed tabular text-foreground text-3xl leading-none font-extrabold sm:text-4xl">
              {formatNumber(kpis.confirmedCount)}
            </p>
          )}
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Em rota ou entregues</span>
            <Link
              href="/painel/pedidos"
              className="text-primary hover:text-primary/80 inline-flex items-center gap-1 font-semibold"
            >
              Ver fila
              <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>

      {/* Mais vendidos */}
      <div className="border-border bg-card flex flex-col justify-between rounded-2xl border p-5 lg:col-span-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-brand/25 text-foreground flex size-8 items-center justify-center rounded-lg">
              <Trophy className="size-4" aria-hidden />
            </span>
            <p className="text-foreground text-sm font-semibold">
              Mais vendidos no geral
            </p>
          </div>
          <Link
            href="/relatorios/vendas"
            className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-xs font-semibold"
          >
            Curva ABC
            <ArrowUpRight className="size-3.5" aria-hidden />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : kpis.topProducts.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Nenhuma venda realizada neste recorte.
          </p>
        ) : (
          <ol className="flex flex-col gap-2">
            {kpis.topProducts.map((product, index) => (
              <li
                key={product.productId}
                className="flex items-baseline justify-between gap-3 text-sm"
              >
                <span className="text-foreground min-w-0 truncate font-medium">
                  <span className="text-muted-foreground tabular mr-1.5 text-xs font-semibold">
                    {index + 1}.
                  </span>
                  {product.name}
                </span>
                <span className="font-condensed tabular text-foreground shrink-0 font-bold">
                  {formatNumber(product.quantity)} un
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
