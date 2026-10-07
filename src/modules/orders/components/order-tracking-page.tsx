"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  MapPin,
  MessageSquare,
  PackageCheck,
  ShoppingBag,
} from "lucide-react";
import { AuthGate } from "@/modules/auth/components/auth-gate";
import { CustomerHeader } from "@/modules/shell/components/customer-header";
import { OrderStatusBadge } from "@/modules/orders/components/order-status-badge";
import { OrderStatusStepper } from "@/modules/orders/components/order-status-stepper";
import {
  useCancelOrder,
  useConfirmDelivery,
  useOrder,
} from "@/modules/orders/hooks/use-orders";
import {
  canCancelOrder,
  canConfirmDelivery,
  getStatusConfig,
  isActiveOrder,
  shortOrderId,
} from "@/modules/orders/lib/order-status";
import { useProducts } from "@/modules/products/hooks/use-products";
import { formatBRL, formatDateTime } from "@/shared/lib/format";
import { getApiErrorMessage } from "@/shared/http/api-error";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { Skeleton } from "@/shared/ui/skeleton";

type OrderTrackingPageProps = {
  saleId: string;
  isNew: boolean;
};

function useSecondsSince(timestamp: number, enabled: boolean) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [enabled]);

  return Math.max(0, Math.round((now - timestamp) / 1000));
}

function formatAge(seconds: number) {
  if (seconds < 5) return "Atualizado agora";
  if (seconds < 60) return `Atualizado há ${seconds}s`;
  return `Atualizado há ${Math.floor(seconds / 60)} min`;
}

const sectionClassName = "border-border bg-card mb-4 rounded-lg border p-4";

export function OrderTrackingPage(props: OrderTrackingPageProps) {
  return (
    <AuthGate>
      <OrderTracking {...props} />
    </AuthGate>
  );
}

function OrderTracking({ saleId, isNew }: OrderTrackingPageProps) {
  const order = useOrder(saleId);
  const products = useProducts();
  const cancelOrder = useCancelOrder();
  const confirmDelivery = useConfirmDelivery();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [deliverOpen, setDeliverOpen] = useState(false);

  const data = order.data;
  const live = !!data && isActiveOrder(data.status);
  const age = useSecondsSince(order.dataUpdatedAt, live);

  const productNames = useMemo(
    () => new Map((products.data ?? []).map((p) => [p.id, p.name])),
    [products.data],
  );

  const title = `Pedido #${shortOrderId(saleId)}`;

  if (order.isPending) {
    return (
      <div className="bg-background flex min-h-screen flex-col">
        <CustomerHeader title={title} backHref="/pedidos" backLabel="Voltar para meus pedidos" />
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
          <Skeleton className="mb-4 h-32 w-full rounded-lg" />
          <Skeleton className="mb-4 h-56 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </main>
      </div>
    );
  }

  if (order.isError || !data) {
    return (
      <div className="bg-background flex min-h-screen flex-col">
        <CustomerHeader title={title} backHref="/pedidos" backLabel="Voltar para meus pedidos" />
        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
          <ShoppingBag className="text-muted-foreground/30 mb-3 h-10 w-10" />
          <p className="text-foreground text-sm font-semibold">
            Pedido não encontrado
          </p>
          <p className="text-muted-foreground mt-1 max-w-xs text-xs">
            Ele pode ter sido removido ou não pertence à sua conta.
          </p>
          <Link
            href="/pedidos"
            className="bg-primary text-primary-foreground hover:bg-primary/90 mt-5 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors"
          >
            Ver meus pedidos
          </Link>
        </main>
      </div>
    );
  }

  const cfg = getStatusConfig(data.status);
  const StatusIcon = cfg.icon;
  const subtotal = Math.max(0, data.totalAmount - data.deliveryFee);
  const showCancel = canCancelOrder(data.status);
  const showDeliver = canConfirmDelivery(data.status);
  const hasPrimaryAction = showCancel || showDeliver;
  const deliveredNow = confirmDelivery.isSuccess && data.status === "ENTREGUE";

  function handleCancel() {
    cancelOrder.mutate(saleId, { onSuccess: () => setCancelOpen(false) });
  }

  function handleDeliver() {
    confirmDelivery.mutate(saleId, { onSuccess: () => setDeliverOpen(false) });
  }

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <CustomerHeader title={title} backHref="/pedidos" backLabel="Voltar para meus pedidos" />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        {isNew && (
          <div className="bg-success/10 mb-4 flex items-start gap-3 rounded-lg p-4">
            <CheckCircle2 className="text-success mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="text-foreground text-sm font-semibold">
                Pedido enviado! 🎉
              </p>
              <p className="text-muted-foreground text-xs">
                A loja já recebeu seu pedido. Você acompanha tudo por aqui.
              </p>
            </div>
          </div>
        )}

        {deliveredNow && (
          <div
            role="status"
            className="bg-success/10 mb-4 flex items-center gap-3 rounded-lg p-4"
          >
            <PackageCheck className="text-success h-5 w-5 shrink-0" />
            <p className="text-foreground text-sm font-semibold">
              Entrega confirmada. Bom apetite! 🎉
            </p>
          </div>
        )}

        {/* Status atual */}
        <section className={sectionClassName}>
          <div className="flex items-start gap-4">
            <span
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${cfg.className}`}
            >
              <StatusIcon className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-foreground text-xl font-bold tracking-tight">
                  {cfg.label}
                </h2>
                <OrderStatusBadge status={data.status} />
              </div>
              <p className="text-muted-foreground mt-0.5 text-sm">
                {cfg.description}
              </p>
              <p className="text-muted-foreground/80 mt-3 flex items-center gap-2 text-xs">
                {live ? (
                  <>
                    <span className="relative flex h-2 w-2" aria-hidden>
                      <span className="bg-success/60 absolute inset-0 rounded-full motion-safe:animate-ping" />
                      <span className="bg-success relative h-2 w-2 rounded-full" />
                    </span>
                    <span aria-live="off">{formatAge(age)}</span>
                  </>
                ) : (
                  <span>Feito em {formatDateTime(data.date)}</span>
                )}
              </p>
            </div>
          </div>
        </section>

        {/* Etapas */}
        <section className={sectionClassName}>
          <OrderStatusStepper status={data.status} />
        </section>

        {/* Endereço */}
        <section className={sectionClassName}>
          <div className="mb-2 flex items-center gap-2">
            <MapPin className="text-primary h-4 w-4" />
            <h2 className="text-foreground text-sm font-semibold">
              Endereço de entrega
            </h2>
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed">
            {data.deliveryStreet}, {data.deliveryNumber}
            <br />
            {data.deliveryNeighborhood}, {data.deliveryCity}
            <br />
            CEP: {data.deliveryZipCode}
          </p>
        </section>

        {/* Itens */}
        <section className={sectionClassName}>
          <div className="mb-3 flex items-center gap-2">
            <ShoppingBag className="text-primary h-4 w-4" />
            <h2 className="text-foreground text-sm font-semibold">
              Itens ({data.items.length})
            </h2>
          </div>
          <ul className="flex flex-col gap-2">
            {data.items.map((item) => (
              <li
                key={item.productId}
                className="flex items-start justify-between gap-2"
              >
                <p className="text-foreground min-w-0 flex-1 text-sm">
                  {item.quantity}x{" "}
                  {productNames.get(item.productId) ?? `Produto #${item.productId}`}
                </p>
                <span className="text-foreground shrink-0 text-sm font-medium">
                  {formatBRL(item.subtotal)}
                </span>
              </li>
            ))}
          </ul>

          {data.observation && (
            <div className="bg-muted/50 mt-3 flex items-start gap-2 rounded-md p-2.5">
              <MessageSquare className="text-muted-foreground mt-0.5 h-3.5 w-3.5 shrink-0" />
              <p className="text-muted-foreground text-xs italic">
                {data.observation}
              </p>
            </div>
          )}

          <div className="border-border mt-4 flex flex-col gap-1.5 border-t pt-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">{formatBRL(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Taxa de entrega</span>
              <span className="text-foreground">
                {formatBRL(data.deliveryFee)}
              </span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-foreground font-semibold">Total</span>
              <span className="font-display text-foreground text-lg font-bold">
                {formatBRL(data.totalAmount)}
              </span>
            </div>
          </div>
        </section>

        {order.isRefetchError && live && (
          <div className="bg-destructive/10 flex items-center gap-1.5 rounded-lg px-3 py-2">
            <AlertTriangle className="text-destructive h-3.5 w-3.5 shrink-0" />
            <p className="text-destructive text-xs font-medium">
              Não conseguimos atualizar o status agora. Tentando de novo em instantes.
            </p>
          </div>
        )}
      </main>

      {/* Ações conforme o status */}
      <div className="border-border bg-card sticky bottom-0 border-t px-4 py-4">
        <div className="mx-auto flex max-w-2xl gap-2">
          <Link
            href="/cardapio"
            className={`focus-visible:ring-ring/50 rounded-lg border px-4 py-3 text-center text-sm font-medium transition-colors outline-none focus-visible:ring-3 ${
              hasPrimaryAction
                ? "border-border text-muted-foreground hover:bg-muted flex-1"
                : "bg-primary text-primary-foreground hover:bg-primary/90 w-full border-transparent"
            }`}
          >
            Voltar ao cardápio
          </Link>

          {showCancel && (
            <button
              type="button"
              onClick={() => {
                cancelOrder.reset();
                setCancelOpen(true);
              }}
              className="border-destructive/40 text-destructive hover:bg-destructive/10 focus-visible:ring-ring/50 flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors outline-none focus-visible:ring-3"
            >
              Cancelar pedido
            </button>
          )}

          {showDeliver && (
            <button
              type="button"
              onClick={() => {
                confirmDelivery.reset();
                setDeliverOpen(true);
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring/50 flex flex-[1.4] items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors outline-none focus-visible:ring-3"
            >
              <PackageCheck className="h-4 w-4" />
              Confirmar entrega
            </button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={cancelOpen}
        title="Cancelar este pedido?"
        description={`O pedido #${shortOrderId(saleId)} será cancelado e você não poderá desfazer.`}
        confirmLabel="Cancelar pedido"
        cancelLabel="Manter pedido"
        tone="destructive"
        pending={cancelOrder.isPending}
        error={
          cancelOrder.isError
            ? getApiErrorMessage(cancelOrder.error, "Não foi possível cancelar o pedido.")
            : null
        }
        onConfirm={handleCancel}
        onClose={() => setCancelOpen(false)}
      />

      <ConfirmDialog
        open={deliverOpen}
        title="Você recebeu seu pedido?"
        description="Ao confirmar, o pedido será marcado como entregue."
        confirmLabel="Sim, recebi"
        cancelLabel="Ainda não"
        pending={confirmDelivery.isPending}
        error={
          confirmDelivery.isError
            ? getApiErrorMessage(confirmDelivery.error, "Não foi possível confirmar a entrega.")
            : null
        }
        onConfirm={handleDeliver}
        onClose={() => setDeliverOpen(false)}
      />
    </div>
  );
}
