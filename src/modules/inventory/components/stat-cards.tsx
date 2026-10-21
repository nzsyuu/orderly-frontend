"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  Boxes,
  Wallet,
  XCircle,
} from "lucide-react";
import { useStockItems } from "@/modules/inventory/hooks/use-stock-items";
import {
  statusOfItem,
  type StockStatus,
} from "@/modules/inventory/types/stock-item";
import { formatBRL, formatNumber } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import { Skeleton } from "@/shared/ui/skeleton";

type StatCardsProps = {
  activeStatus?: StockStatus | "todos";
  onStatusChange?: (status: StockStatus | "todos") => void;
  stockId?: number | null;
};

export function StatCards({
  activeStatus = "todos",
  onStatusChange,
  stockId,
}: StatCardsProps) {
  const { data: allItems = [], isLoading } = useStockItems();

  const items = useMemo(() => {
    if (!stockId) return allItems;
    return allItems.filter((item) => item.stockId === stockId);
  }, [allItems, stockId]);

  const total = items.length;
  const baixo = items.filter((item) => statusOfItem(item) === "baixo").length;
  const esgotado = items.filter(
    (item) => statusOfItem(item) === "esgotado",
  ).length;
  const valorTotal = items.reduce(
    (sum, item) => sum + item.currentQuantity * item.unitCost,
    0,
  );

  const filterCards: {
    id: StockStatus | "todos";
    label: string;
    helper: string;
    valor: string;
    icon: typeof Boxes;
    tone: string;
    iconWrap: string;
  }[] = [
    {
      id: "todos",
      label: "Itens cadastrados",
      helper: "Todos os insumos",
      valor: formatNumber(total),
      icon: Boxes,
      tone: "text-foreground",
      iconWrap: "bg-accent text-accent-foreground",
    },
    {
      id: "baixo",
      label: "Estoque baixo",
      helper: "No mínimo ou abaixo",
      valor: formatNumber(baixo),
      icon: AlertTriangle,
      tone: baixo > 0 ? "text-warning" : "text-foreground",
      iconWrap: "bg-warning/15 text-warning",
    },
    {
      id: "esgotado",
      label: "Esgotados",
      helper: "Saldo zerado",
      valor: formatNumber(esgotado),
      icon: XCircle,
      tone: esgotado > 0 ? "text-destructive" : "text-foreground",
      iconWrap: "bg-destructive/12 text-destructive",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {filterCards.map((card) => {
        const isSelected = onStatusChange && activeStatus === card.id;
        return (
          <button
            key={card.label}
            type="button"
            onClick={() =>
              onStatusChange?.(
                activeStatus === card.id && card.id !== "todos"
                  ? "todos"
                  : card.id,
              )
            }
            className={cn(
              "border-border bg-card flex flex-col justify-between rounded-2xl border p-5 text-left transition-colors",
              onStatusChange && "hover:border-foreground/30 cursor-pointer",
              isSelected && "border-primary ring-primary/15 ring-2",
            )}
          >
            <div className="flex w-full items-center justify-between gap-2">
              <p className="text-muted-foreground text-sm font-medium">
                {card.label}
              </p>
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg",
                  card.iconWrap,
                )}
              >
                <card.icon className="size-4" aria-hidden />
              </span>
            </div>

            <div className="mt-3">
              {isLoading ? (
                <Skeleton className="h-9 w-16" />
              ) : (
                <p
                  className={cn(
                    "font-condensed tabular text-3xl leading-none font-extrabold sm:text-4xl",
                    card.tone,
                  )}
                >
                  {card.valor}
                </p>
              )}
              <p className="text-muted-foreground mt-2 text-xs">
                {card.helper}
              </p>
            </div>
          </button>
        );
      })}

      {/* Card de valor total com porta para o relatório de estoque */}
      <div className="border-border bg-card flex flex-col justify-between rounded-2xl border p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-muted-foreground text-sm font-medium">
            Valor em estoque
          </p>
          <span className="bg-primary/12 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
            <Wallet className="size-4" aria-hidden />
          </span>
        </div>

        <div className="mt-3">
          {isLoading ? (
            <Skeleton className="h-9 w-28" />
          ) : (
            <p className="font-condensed tabular text-foreground text-3xl leading-none font-extrabold sm:text-4xl">
              {formatBRL(valorTotal)}
            </p>
          )}
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Custo imobilizado</span>
            <Link
              href="/relatorios/estoque"
              className="text-primary hover:text-primary/80 inline-flex items-center gap-1 font-semibold"
            >
              Ver relatório
              <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
