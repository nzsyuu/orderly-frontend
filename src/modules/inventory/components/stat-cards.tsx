"use client";

import { Boxes, AlertTriangle, XCircle, Wallet } from "lucide-react";
import { useStockItems } from "@/modules/inventory/hooks/use-stock-items";
import { statusOfItem } from "@/modules/inventory/types/stock-item";
import { formatBRL } from "@/shared/lib/format";

export function StatCards() {
  const { data: items = [], isLoading } = useStockItems();

  const total = items.length;
  const baixo = items.filter((item) => statusOfItem(item) === "baixo").length;
  const esgotado = items.filter(
    (item) => statusOfItem(item) === "esgotado",
  ).length;
  const valorTotal = items.reduce(
    (sum, item) => sum + item.currentQuantity * item.unitCost,
    0,
  );

  const cards = [
    {
      label: "Itens cadastrados",
      valor: isLoading ? "â€”" : String(total),
      icon: Boxes,
      tone: "text-foreground",
      iconWrap: "bg-accent text-accent-foreground",
    },
    {
      label: "Estoque baixo",
      valor: isLoading ? "â€”" : String(baixo),
      icon: AlertTriangle,
      tone: "text-warning",
      iconWrap: "bg-warning/15 text-warning",
    },
    {
      label: "Esgotados",
      valor: isLoading ? "â€”" : String(esgotado),
      icon: XCircle,
      tone: "text-destructive",
      iconWrap: "bg-destructive/15 text-destructive",
    },
    {
      label: "Valor em estoque",
      valor: isLoading ? "â€”" : formatBRL(valorTotal),
      icon: Wallet,
      tone: "text-foreground",
      iconWrap: "bg-primary/15 text-primary",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
            <p className={`font-display text-2xl font-bold ${card.tone}`}>
              {card.valor}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
