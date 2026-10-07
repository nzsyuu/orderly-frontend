"use client";

import Link from "next/link";
import { Bike, ChevronRight, Receipt } from "lucide-react";
import { useActiveOrders } from "@/modules/orders/hooks/use-orders";
import {
  canConfirmDelivery,
  getStatusConfig,
  shortOrderId,
} from "@/modules/orders/lib/order-status";

/** Pílula fixa no cardápio. Some sozinha quando não há pedido em andamento. */
export function ActiveOrderBanner() {
  const { activeOrders } = useActiveOrders(true);

  const count = activeOrders.length;

  if (count === 0) return null;

  const single = count === 1 ? activeOrders[0] : null;
  const href = single ? `/pedidos/${single.saleId}` : "/pedidos";
  const awaitingConfirmation = single ? canConfirmDelivery(single.status) : false;
  const Icon = single ? getStatusConfig(single.status).icon : Receipt;

  let text: string;
  if (!single) {
    text = `${count} pedidos em andamento`;
  } else if (awaitingConfirmation) {
    text = "Pedido a caminho · Chegou? Confirme a entrega";
  } else {
    text = `Pedido #${shortOrderId(single.saleId)} · ${getStatusConfig(single.status).label}`;
  }

  return (
    <Link
      href={href}
      className="bg-primary text-primary-foreground focus-visible:ring-ring/50 fixed inset-x-4 bottom-4 z-30 mx-auto flex max-w-md items-center gap-3 rounded-lg px-4 py-3 shadow-lg transition-colors outline-none hover:bg-primary/95 focus-visible:ring-3"
    >
      <span className="bg-primary-foreground/15 flex h-8 w-8 shrink-0 items-center justify-center rounded-md">
        {awaitingConfirmation ? (
          <Bike className="h-4 w-4" />
        ) : (
          <Icon className="h-4 w-4" />
        )}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{text}</span>
      <ChevronRight className="h-4 w-4 shrink-0 opacity-80" />
    </Link>
  );
}
