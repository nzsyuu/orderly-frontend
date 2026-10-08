"use client";

import { useMemo } from "react";
import {
  useSales,
  useConfirmSale,
  useDispatchSale,
  useDeliverSale,
  useCancelSale,
} from "@/modules/sales/hooks/use-sales";
import { useProducts } from "@/modules/products/hooks/use-products";
import type { Sale } from "@/modules/sales/types/sale";
import { formatBRL } from "@/shared/lib/format";

const COLUMNS = [
  {
    id: "PENDENTE",
    title: "Pendentes",
    bgClass: "bg-amber-100",
    headerClass: "bg-amber-400 text-amber-900",
    cardClass: "border-amber-300 bg-amber-50",
  },
  {
    id: "EM_PREPARO",
    title: "Em Preparo",
    bgClass: "bg-blue-50",
    headerClass: "bg-blue-400 text-blue-900",
    cardClass: "border-blue-200 bg-blue-50/50",
  },
  {
    id: "EM_ROTA",
    title: "Em Rota",
    bgClass: "bg-orange-50",
    headerClass: "bg-orange-400 text-orange-900",
    cardClass: "border-orange-200 bg-orange-50/50",
  },
  {
    id: "ENTREGUE",
    title: "Entregues (Hoje)",
    bgClass: "bg-emerald-50",
    headerClass: "bg-emerald-400 text-emerald-900",
    cardClass: "border-emerald-200 bg-emerald-50/50",
  },
];

export function OrdersBoard() {
  const { data: sales = [], isLoading, isError } = useSales(undefined, {
    refetchInterval: 10000,
  });
  const { data: products = [] } = useProducts();

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
      
      // Filter ENTREGUE for today only
      if (sale.status === "ENTREGUE") {
        const saleDate = sale.date.split("T")[0];
        if (saleDate !== today) continue;
      }
      
      if (grouped[sale.status as keyof typeof grouped]) {
        grouped[sale.status as keyof typeof grouped].push(sale);
      }
    }

    // Sort by date ASC (oldest first for queues)
    Object.values(grouped).forEach((list) => {
      list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });

    return grouped;
  }, [sales]);

  if (isLoading) {
    return <div className="text-muted-foreground p-8 text-center">Carregando painel de pedidos...</div>;
  }

  if (isError) {
    return <div className="text-destructive p-8 text-center">Erro ao carregar pedidos.</div>;
  }

  return (
    <div className="flex h-full w-full gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const columnSales = salesByStatus[col.id as keyof typeof salesByStatus] || [];
        
        return (
          <div
            key={col.id}
            className={`flex h-full w-[350px] shrink-0 flex-col overflow-hidden rounded-xl border border-gray-200 shadow-sm ${col.bgClass}`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-3 px-4 font-bold ${col.headerClass}`}>
              <span className="uppercase tracking-wider">{col.title}</span>
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white/50 px-2 text-sm text-black">
                {columnSales.length}
              </span>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {columnSales.map((sale) => (
                <div
                  key={sale.saleId}
                  className={`flex flex-col gap-3 rounded-lg border p-4 shadow-sm ${col.cardClass}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">
                      #{sale.saleId.slice(0, 5).toUpperCase()}
                    </span>
                    <span className="text-muted-foreground text-sm font-medium tabular-nums">
                      {new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(sale.date))}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm">
                    {sale.items.map((item, i) => (
                      <div key={i} className="flex justify-between font-medium">
                        <span>
                          {item.quantity}x {productNames.get(item.productId) || `Prod #${item.productId}`}
                        </span>
                        <span className="text-muted-foreground">{formatBRL(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>

                  {sale.observation && (
                    <div className="rounded border border-red-200 bg-red-50 p-2 text-sm font-semibold text-red-900">
                      OBS: {sale.observation}
                    </div>
                  )}

                  <div className="text-muted-foreground mt-2 border-t pt-2 text-xs">
                    {sale.deliveryStreet}, {sale.deliveryNumber} - {sale.deliveryNeighborhood}
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <span className="font-bold text-base">{formatBRL(sale.totalAmount)}</span>
                  </div>

                  {/* Actions */}
                  <div className="mt-2 flex gap-2">
                    {sale.status === "PENDENTE" && (
                      <button
                        onClick={() => confirmSale.mutate(sale.saleId)}
                        disabled={confirmSale.isPending}
                        className="flex-1 rounded bg-blue-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
                      >
                        Aceitar Pedido
                      </button>
                    )}
                    {sale.status === "EM_PREPARO" && (
                      <button
                        onClick={() => dispatchSale.mutate(sale.saleId)}
                        disabled={dispatchSale.isPending}
                        className="flex-1 rounded bg-orange-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-orange-700 disabled:opacity-50"
                      >
                        Despachar
                      </button>
                    )}
                    {sale.status === "EM_ROTA" && (
                      <button
                        onClick={() => deliverSale.mutate(sale.saleId)}
                        disabled={deliverSale.isPending}
                        className="flex-1 rounded bg-emerald-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Confirmar Entrega
                      </button>
                    )}
                    
                    {sale.status === "PENDENTE" && (
                      <button
                        onClick={() => {
                          if (confirm("Tem certeza que deseja cancelar este pedido?")) {
                            cancelSale.mutate(sale.saleId);
                          }
                        }}
                        disabled={cancelSale.isPending}
                        className="rounded bg-red-100 px-3 py-2 text-sm font-bold text-red-700 transition hover:bg-red-200 disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {columnSales.length === 0 && (
                <div className="text-muted-foreground/60 p-4 text-center text-sm font-medium">
                  Nenhum pedido nesta etapa.
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
