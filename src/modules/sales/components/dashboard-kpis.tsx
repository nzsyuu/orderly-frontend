"use client";

import { ShoppingCart, Wallet, Trophy } from "lucide-react";
import type { SalesKpis } from "@/modules/sales/types/sale";
import { formatBRL } from "@/shared/lib/format";
import { Skeleton } from "@/shared/ui/skeleton";

type DashboardKpisProps = {
  kpis: SalesKpis;
  isLoading: boolean;
};

export function DashboardKpis({ kpis, isLoading }: DashboardKpisProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="border-border bg-card flex items-center gap-4 rounded-md border p-5">
        <div className="bg-accent text-accent-foreground flex h-11 w-11 shrink-0 items-center justify-center rounded-sm">
          <ShoppingCart className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-muted-foreground text-sm">Vendas confirmadas</p>
          {isLoading ? (
            <Skeleton className="mt-1 h-7 w-16" />
          ) : (
            <p className="font-display text-foreground text-2xl font-bold">
              {kpis.confirmedCount}
            </p>
          )}
        </div>
      </div>

      <div className="border-border bg-card flex items-center gap-4 rounded-md border p-5">
        <div className="bg-primary/15 text-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-sm">
          <Wallet className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-muted-foreground text-sm">Faturamento</p>
          {isLoading ? (
            <Skeleton className="mt-1 h-7 w-24" />
          ) : (
            <p className="font-display text-foreground text-2xl font-bold">
              {formatBRL(kpis.revenue)}
            </p>
          )}
        </div>
      </div>

      <div className="border-border bg-card rounded-md border p-5">
        <div className="mb-3 flex items-center gap-2">
          <div className="bg-warning/15 text-warning flex h-8 w-8 items-center justify-center rounded-sm">
            <Trophy className="h-4 w-4" />
          </div>
          <p className="text-foreground text-sm font-medium">Mais vendidos</p>
        </div>
        {isLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : kpis.topProducts.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Nenhuma venda confirmada neste recorte.
          </p>
        ) : (
          <ol className="flex flex-col gap-2">
            {kpis.topProducts.map((product, index) => (
              <li
                key={product.productId}
                className="flex items-baseline justify-between gap-3 text-sm"
              >
                <span className="text-foreground min-w-0 truncate">
                  {index + 1}. {product.name}
                </span>
                <span className="text-muted-foreground shrink-0">
                  {product.quantity}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
