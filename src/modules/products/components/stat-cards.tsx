"use client";

import { CheckCircle2, Ban } from "lucide-react";
import { useProducts } from "@/modules/products/hooks/use-products";
import { Skeleton } from "@/shared/ui/skeleton";

export function ProductStatCards() {
  const { data: products = [], isLoading } = useProducts();

  const active = products.filter((product) => product.active).length;
  const inactive = products.filter((product) => !product.active).length;

  const cards = [
    {
      label: "Ativos",
      valor: String(active),
      icon: CheckCircle2,
      tone: "text-success",
      iconWrap: "bg-success/15 text-success",
    },
    {
      label: "Inativos",
      valor: String(inactive),
      icon: Ban,
      tone: "text-muted-foreground",
      iconWrap: "bg-muted text-muted-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {cards.map((card) => (
        <div
          key={card.label}
          className="border-border bg-card flex items-center gap-4 rounded-md border p-5"
        >
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-sm ${card.iconWrap}`}
          >
            <card.icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-muted-foreground text-sm">{card.label}</p>
            {isLoading ? (
              <Skeleton className="mt-1 h-7 w-12" />
            ) : (
              <p className={`font-display text-2xl font-bold ${card.tone}`}>
                {card.valor}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
