"use client";

import { Ban, CheckCircle2, Package } from "lucide-react";
import { useProducts } from "@/modules/products/hooks/use-products";
import { formatBRL, formatNumber } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import { Skeleton } from "@/shared/ui/skeleton";

export type ProductStatusFilter = "todos" | "ativos" | "inativos";

type ProductStatCardsProps = {
  filter?: ProductStatusFilter;
  onFilterChange?: (next: ProductStatusFilter) => void;
};

export function ProductStatCards({
  filter = "todos",
  onFilterChange,
}: ProductStatCardsProps) {
  const { data: products = [], isLoading } = useProducts();

  const total = products.length;
  const active = products.filter((product) => product.active).length;
  const inactive = products.filter((product) => !product.active).length;
  const avgPrice =
    total > 0 ? products.reduce((sum, p) => sum + p.price, 0) / total : 0;

  const cards: {
    id: ProductStatusFilter;
    label: string;
    helper: string;
    valor: string;
    icon: typeof Package;
    tone: string;
    iconWrap: string;
  }[] = [
    {
      id: "todos",
      label: "Total no catálogo",
      helper: total > 0 ? `Preço médio ${formatBRL(avgPrice)}` : "Sem itens",
      valor: formatNumber(total),
      icon: Package,
      tone: "text-foreground",
      iconWrap: "bg-accent text-accent-foreground",
    },
    {
      id: "ativos",
      label: "Visíveis no cardápio",
      helper: "Disponíveis para venda",
      valor: formatNumber(active),
      icon: CheckCircle2,
      tone: "text-success",
      iconWrap: "bg-success/12 text-success",
    },
    {
      id: "inativos",
      label: "Pausados / inativos",
      helper: "Ocultos para o cliente",
      valor: formatNumber(inactive),
      icon: Ban,
      tone: "text-muted-foreground",
      iconWrap: "bg-muted text-muted-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card) => {
        const isSelected = onFilterChange && filter === card.id;
        return (
          <button
            key={card.label}
            type="button"
            onClick={() =>
              onFilterChange?.(
                filter === card.id && card.id !== "todos" ? "todos" : card.id,
              )
            }
            className={cn(
              "border-border bg-card flex flex-col justify-between rounded-2xl border p-5 text-left transition-colors",
              onFilterChange && "hover:border-foreground/30 cursor-pointer",
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
    </div>
  );
}
