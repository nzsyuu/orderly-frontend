"use client";

import Link from "next/link";
import { ChevronRight, Receipt } from "lucide-react";
import { AuthGate } from "@/modules/auth/components/auth-gate";
import { CustomerHeader } from "@/modules/shell/components/customer-header";
import { OrderStatusBadge } from "@/modules/orders/components/order-status-badge";
import { useMyOrders } from "@/modules/orders/hooks/use-orders";
import {
  canConfirmDelivery,
  isActiveOrder,
  shortOrderId,
} from "@/modules/orders/lib/order-status";
import type { Order } from "@/modules/orders/types/order";
import { formatBRL, formatDateTime } from "@/shared/lib/format";
import { Skeleton } from "@/shared/ui/skeleton";

function itemsLabel(order: Order) {
  const total = order.items.reduce((sum, item) => sum + item.quantity, 0);
  return `${total} ${total === 1 ? "item" : "itens"}`;
}

function ActiveOrderCard({ order }: { order: Order }) {
  return (
    <Link
      href={`/pedidos/${order.saleId}`}
      className="border-primary/25 bg-card hover:border-primary/50 focus-visible:ring-ring/50 block rounded-lg border p-4 transition-colors outline-none focus-visible:ring-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-foreground text-base font-bold">
            Pedido #{shortOrderId(order.saleId)}
          </p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {formatDateTime(order.date)} · {itemsLabel(order)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="border-border mt-4 flex items-center justify-between border-t pt-3">
        <span className="font-display text-foreground text-base font-bold">
          {formatBRL(order.totalAmount)}
        </span>
        <span className="text-primary flex items-center gap-1 text-sm font-medium">
          {canConfirmDelivery(order.status)
            ? "Confirmar entrega"
            : "Acompanhar"}
          <ChevronRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

function HistoryRow({ order }: { order: Order }) {
  return (
    <li>
      <Link
        href={`/pedidos/${order.saleId}`}
        className="hover:bg-muted/50 focus-visible:ring-ring/50 flex items-center gap-3 px-4 py-3 transition-colors outline-none focus-visible:ring-3 focus-visible:ring-inset"
      >
        <div className="min-w-0 flex-1">
          <p className="text-foreground text-sm font-medium">
            Pedido #{shortOrderId(order.saleId)}
          </p>
          <p className="text-muted-foreground text-xs">
            {formatDateTime(order.date)} · {itemsLabel(order)}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="text-foreground text-sm font-medium">
            {formatBRL(order.totalAmount)}
          </span>
          <OrderStatusBadge status={order.status} />
        </div>
      </Link>
    </li>
  );
}

export function OrdersPage() {
  return (
    <AuthGate>
      <Orders />
    </AuthGate>
  );
}

function Orders() {
  const orders = useMyOrders();
  const list = orders.data ?? [];
  const active = list.filter((order) => isActiveOrder(order.status));
  const history = list.filter((order) => !isActiveOrder(order.status));

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <CustomerHeader
        title="Meus pedidos"
        backHref="/cardapio"
        backLabel="Voltar ao cardápio"
      />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        {orders.isPending && (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-28 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        )}

        {orders.isError && (
          <p className="text-destructive py-16 text-center text-sm">
            Não foi possível carregar seus pedidos.
          </p>
        )}

        {orders.isSuccess && list.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <Receipt className="text-muted-foreground/30 mb-3 h-10 w-10" />
            <p className="text-foreground text-sm font-semibold">
              Você ainda não fez pedidos
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              Quando fizer, eles aparecem aqui para você acompanhar.
            </p>
            <Link
              href="/cardapio"
              className="bg-primary text-primary-foreground hover:bg-primary/90 mt-5 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors"
            >
              Ver cardápio
            </Link>
          </div>
        )}

        {active.length > 0 && (
          <section className="mb-8">
            <h2 className="font-display text-foreground mb-3 text-base font-bold">
              Em andamento
            </h2>
            <div className="flex flex-col gap-3">
              {active.map((order) => (
                <ActiveOrderCard key={order.saleId} order={order} />
              ))}
            </div>
          </section>
        )}

        {history.length > 0 && (
          <section>
            <h2 className="font-display text-foreground mb-3 text-base font-bold">
              Histórico
            </h2>
            <ul className="border-border bg-card divide-border divide-y overflow-hidden rounded-lg border">
              {history.map((order) => (
                <HistoryRow key={order.saleId} order={order} />
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
