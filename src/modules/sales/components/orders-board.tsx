"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Bike,
  CheckCheck,
  Clock,
  Flame,
  MapPin,
  MessageSquareWarning,
  Store,
  XCircle,
} from "lucide-react";
import { useProducts } from "@/modules/products/hooks/use-products";
import {
  useCancelSale,
  useConfirmSale,
  useDeliverSale,
  useDispatchSale,
  useSales,
} from "@/modules/sales/hooks/use-sales";
import { getSaleStatusMeta } from "@/modules/sales/lib/sale-status";
import type { Sale } from "@/modules/sales/types/sale";
import { getApiErrorMessage } from "@/shared/http/api-error";
import { formatBRL, formatElapsed } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { PageHeader, Panel } from "@/shared/ui/page";
import { Skeleton } from "@/shared/ui/skeleton";

const COLUMNS = [
  {
    id: "PENDENTE" as const,
    title: "Na fila",
    subtitle: "Aguardando aceite",
    icon: Clock,
    accentBar: "bg-warning",
    emptyText: "Nenhum pedido aguardando aceite.",
  },
  {
    id: "EM_PREPARO" as const,
    title: "Na chapa",
    subtitle: "Cozinha preparando",
    icon: Flame,
    accentBar: "bg-brand",
    emptyText: "Nenhum pedido em preparo agora.",
  },
  {
    id: "EM_ROTA" as const,
    title: "Em rota",
    subtitle: "Saiu para entrega",
    icon: Bike,
    accentBar: "bg-info",
    emptyText: "Nenhuma entrega a caminho.",
  },
  {
    id: "ENTREGUE" as const,
    title: "Entregues hoje",
    subtitle: "Concluídos no dia",
    icon: CheckCheck,
    accentBar: "bg-success",
    emptyText: "Nenhuma entrega concluída hoje ainda.",
  },
];

export function OrdersBoard() {
  const {
    data: sales = [],
    isLoading,
    isError,
    refetch,
  } = useSales(undefined, {
    refetchInterval: 10000,
  });
  const { data: products = [] } = useProducts();

  const [now, setNow] = useState(() => Date.now());
  const [cancelingSale, setCancelingSale] = useState<Sale | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const productNames = useMemo(() => {
    const map = new Map<number, string>();
    for (const p of products) {
      map.set(p.id, p.name);
    }
    return map;
  }, [products]);

  const confirmSale = useConfirmSale();
  const dispatchSale = useDispatchSale();
  const deliverSale = useDeliverSale();
  const cancelSale = useCancelSale();

  const salesByStatus = useMemo(() => {
    const grouped = {
      PENDENTE: [] as Sale[],
      EM_PREPARO: [] as Sale[],
      EM_ROTA: [] as Sale[],
      ENTREGUE: [] as Sale[],
    };

    const today = new Date().toISOString().split("T")[0];

    for (const sale of sales) {
      if (sale.status === "CANCELADA") continue;

      if (sale.status === "ENTREGUE") {
        const saleDate = sale.date.split("T")[0];
        if (saleDate !== today) continue;
      }

      if (grouped[sale.status as keyof typeof grouped]) {
        grouped[sale.status as keyof typeof grouped].push(sale);
      }
    }

    Object.values(grouped).forEach((list) => {
      list.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
    });

    return grouped;
  }, [sales]);

  const activeCount =
    salesByStatus.PENDENTE.length +
    salesByStatus.EM_PREPARO.length +
    salesByStatus.EM_ROTA.length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Comandas do turno"
        description="Fila ao vivo da cozinha e expedição. Atualiza automaticamente a cada 10 segundos."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <span className="border-border bg-card text-muted-foreground inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-xs font-medium">
              <span className="bg-success size-2 rounded-full" />
              {activeCount === 0
                ? "Fila livre"
                : `${activeCount} ${activeCount === 1 ? "pedido em andamento" : "pedidos em andamento"}`}
            </span>
            <Link
              href="/loja"
              className="border-input bg-card text-foreground hover:bg-muted inline-flex h-10 items-center gap-2 rounded-lg border px-3.5 text-sm font-semibold transition-colors"
            >
              <Store className="size-4" />
              Status da loja
            </Link>
          </div>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((col) => (
            <Skeleton key={col.id} className="h-[460px] rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <Panel>
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <XCircle className="text-destructive size-8" />
            <p className="text-foreground font-semibold">
              Não foi possível carregar o quadro de pedidos
            </p>
            <p className="text-muted-foreground text-sm">
              Verifique a conexão com a API e tente novamente.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-2"
              onClick={() => refetch()}
            >
              Tentar novamente
            </Button>
          </div>
        </Panel>
      ) : (
        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((col) => {
            const columnSales = salesByStatus[col.id] || [];
            const meta = getSaleStatusMeta(col.id);
            const ColIcon = col.icon;

            return (
              <section
                key={col.id}
                aria-label={col.title}
                className="border-border bg-muted/55 flex min-h-[420px] flex-col overflow-hidden rounded-2xl border"
              >
                {/* Faixa superior da raia */}
                <div className={cn("h-1.5 w-full", col.accentBar)} />

                <header className="border-border bg-card flex items-center justify-between gap-2 border-b px-4 py-3.5">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-lg",
                        meta.badgeClassName,
                      )}
                    >
                      <ColIcon className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-foreground truncate text-sm font-bold">
                        {col.title}
                      </h2>
                      <p className="text-muted-foreground truncate text-xs">
                        {col.subtitle}
                      </p>
                    </div>
                  </div>

                  <span className="font-condensed tabular bg-muted text-foreground inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-sm font-extrabold">
                    {columnSales.length}
                  </span>
                </header>

                {/* Comandas da coluna */}
                <div className="flex flex-1 flex-col gap-3 p-3">
                  {columnSales.map((sale) => {
                    const isDelivered = sale.status === "ENTREGUE";
                    const timeStr = new Intl.DateTimeFormat("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(sale.date));

                    return (
                      <article
                        key={sale.saleId}
                        className="border-border bg-card flex flex-col rounded-xl border p-4 shadow-[0_1px_2px_rgb(15_26_19/0.06)]"
                      >
                        {/* Cabeçalho da comanda */}
                        <div className="border-border flex items-baseline justify-between gap-2 border-b border-dashed pb-2.5">
                          <span className="font-condensed tabular text-foreground text-xl font-extrabold">
                            #{sale.saleId.slice(0, 6).toUpperCase()}
                          </span>
                          <div className="text-muted-foreground tabular flex items-center gap-1.5 text-xs font-medium">
                            <span>{timeStr}</span>
                            {!isDelivered ? (
                              <span className="bg-muted text-foreground rounded-md px-1.5 py-0.5 text-[11px] font-semibold">
                                {formatElapsed(sale.date, now)}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        {/* Itens do pedido */}
                        <ul className="mt-3 flex flex-col gap-1.5 text-sm">
                          {sale.items.map((item, i) => (
                            <li
                              key={i}
                              className="flex items-start justify-between gap-2"
                            >
                              <span className="text-foreground font-medium">
                                <strong className="font-condensed tabular text-primary mr-1 font-extrabold">
                                  {item.quantity}×
                                </strong>
                                {productNames.get(item.productId) ||
                                  `Produto #${item.productId}`}
                              </span>
                              <span className="text-muted-foreground tabular shrink-0 text-xs">
                                {formatBRL(item.subtotal)}
                              </span>
                            </li>
                          ))}
                        </ul>

                        {/* Observação da cozinha */}
                        {sale.observation ? (
                          <div className="bg-warning/12 text-warning-foreground mt-3 flex items-start gap-2 rounded-lg p-2.5 text-xs font-semibold">
                            <MessageSquareWarning
                              className="text-warning mt-0.5 size-4 shrink-0"
                              aria-hidden
                            />
                            <span>Obs: {sale.observation}</span>
                          </div>
                        ) : null}

                        {/* Endereço e valor total */}
                        <div className="border-border mt-3 border-t border-dashed pt-2.5">
                          <p className="text-muted-foreground flex items-start gap-1.5 text-xs">
                            <MapPin
                              className="mt-0.5 size-3.5 shrink-0"
                              aria-hidden
                            />
                            <span>
                              {sale.deliveryStreet}, {sale.deliveryNumber} ·{" "}
                              {sale.deliveryNeighborhood}
                            </span>
                          </p>

                          <div className="mt-2.5 flex items-baseline justify-between">
                            <span className="text-muted-foreground text-xs">
                              Total
                            </span>
                            <span className="font-condensed tabular text-foreground text-lg font-extrabold">
                              {formatBRL(sale.totalAmount)}
                            </span>
                          </div>
                        </div>

                        {/* Ações da comanda */}
                        {!isDelivered ? (
                          <div className="mt-3 flex gap-1.5">
                            {sale.status === "PENDENTE" ? (
                              <>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="brand"
                                  className="min-w-0 flex-1 px-2.5"
                                  disabled={confirmSale.isPending}
                                  onClick={() =>
                                    confirmSale.mutate(sale.saleId)
                                  }
                                >
                                  Aceitar pedido
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="destructive-soft"
                                  className="shrink-0 px-2.5"
                                  disabled={cancelSale.isPending}
                                  onClick={() => {
                                    cancelSale.reset();
                                    setCancelingSale(sale);
                                  }}
                                >
                                  Cancelar
                                </Button>
                              </>
                            ) : null}

                            {sale.status === "EM_PREPARO" ? (
                              <Button
                                type="button"
                                size="sm"
                                className="w-full"
                                disabled={dispatchSale.isPending}
                                onClick={() => dispatchSale.mutate(sale.saleId)}
                              >
                                <Bike className="size-4" />
                                Despachar entrega
                              </Button>
                            ) : null}

                            {sale.status === "EM_ROTA" ? (
                              <Button
                                type="button"
                                size="sm"
                                className="bg-success text-success-foreground hover:bg-success/90 w-full"
                                disabled={deliverSale.isPending}
                                onClick={() => deliverSale.mutate(sale.saleId)}
                              >
                                <CheckCheck className="size-4" />
                                Confirmar entrega
                              </Button>
                            ) : null}
                          </div>
                        ) : null}
                      </article>
                    );
                  })}

                  {columnSales.length === 0 ? (
                    <div className="text-muted-foreground flex flex-1 items-center justify-center px-4 py-12 text-center text-xs">
                      {col.emptyText}
                    </div>
                  ) : null}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={cancelingSale !== null}
        title="Cancelar este pedido?"
        description={
          cancelingSale
            ? `O pedido #${cancelingSale.saleId.slice(0, 6).toUpperCase()} (${formatBRL(cancelingSale.totalAmount)}) será marcado como cancelado.`
            : ""
        }
        confirmLabel="Cancelar pedido"
        cancelLabel="Voltar"
        tone="destructive"
        pending={cancelSale.isPending}
        error={
          cancelSale.isError
            ? getApiErrorMessage(
                cancelSale.error,
                "Não foi possível cancelar o pedido.",
              )
            : null
        }
        onConfirm={() => {
          if (!cancelingSale) return;
          cancelSale.mutate(cancelingSale.saleId, {
            onSuccess: () => setCancelingSale(null),
          });
        }}
        onClose={() => setCancelingSale(null)}
      />
    </div>
  );
}
