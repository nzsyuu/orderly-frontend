"use client";

import { useStockLots } from "@/modules/inventory/hooks/use-stock-items";
import {
  statusOfLot,
  type LotExpiryStatus,
  type StockItem,
} from "@/modules/inventory/types/stock-item";
import { formatDate } from "@/shared/lib/format";
import { Skeleton } from "@/shared/ui/skeleton";
import { Modal } from "@/shared/ui/modal";

type StockItemLotsDialogProps = {
  item: StockItem | null;
  onClose: () => void;
};

const lotStatusConfig: Record<
  LotExpiryStatus,
  { label: string; className: string }
> = {
  expired: {
    label: "Vencido",
    className: "bg-destructive/15 text-destructive",
  },
  critical: {
    label: "Crítico",
    className: "bg-warning/15 text-warning",
  },
  ok: {
    label: "Ok",
    className: "bg-success/15 text-success",
  },
};

function daysLabel(days: number) {
  if (days < 0) {
    const n = Math.abs(days);
    return n === 1 ? "venceu há 1 dia" : `venceu há ${n} dias`;
  }
  if (days === 0) return "vence hoje";
  if (days === 1) return "vence amanhã";
  return `${days} dias`;
}

export function StockItemLotsDialog({
  item,
  onClose,
}: StockItemLotsDialogProps) {
  const lotsQuery = useStockLots(item?.id ?? null);
  const lots = lotsQuery.data ?? [];
  const lotsTotal = lots.reduce((sum, lot) => sum + lot.quantity, 0);
  const quantityMismatch =
    item !== null && lots.length > 0 && lotsTotal !== item.currentQuantity;

  return (
    <Modal
      open={item !== null}
      title={item?.name ?? "Lotes"}
      subtitle="Validade dos lotes (vence primeiro no topo)"
      wide
      onClose={onClose}
    >
      {item ? (
        <div className="mt-4 flex flex-col gap-4">
          <p className="text-muted-foreground text-sm">
            Saldo total:{" "}
            <span className="text-foreground font-medium">
              {item.currentQuantity} {item.unit}
            </span>
            {quantityMismatch ? (
              <span className="text-warning mt-1 block text-xs">
                A soma dos lotes ({lotsTotal} {item.unit}) não bate com o saldo
                do item. Exibimos o total cadastrado mesmo assim.
              </span>
            ) : null}
          </p>

          {lotsQuery.isLoading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : null}

          {lotsQuery.isError ? (
            <p className="text-destructive text-sm">
              Não foi possível carregar os lotes.
            </p>
          ) : null}

          {!lotsQuery.isLoading && !lotsQuery.isError && lots.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nenhum lote com validade registrado para este item.
            </p>
          ) : null}

          {lots.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] border-collapse text-sm">
                <thead>
                  <tr className="border-border text-muted-foreground border-b text-left text-xs tracking-wider uppercase">
                    <th className="py-2 pr-3 font-medium">Validade</th>
                    <th className="py-2 pr-3 font-medium">Qtd.</th>
                    <th className="py-2 pr-3 font-medium">Dias</th>
                    <th className="py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lots.map((lot) => {
                    const status = statusOfLot(lot.daysUntilExpiry);
                    const cfg = lotStatusConfig[status];
                    return (
                      <tr
                        key={lot.lotId}
                        className="border-border border-b last:border-0"
                      >
                        <td className="py-2.5 pr-3">
                          {formatDate(lot.expiresAt)}
                          <span className="text-muted-foreground block text-xs">
                            recebido {formatDate(lot.receivedAt)}
                          </span>
                        </td>
                        <td className="py-2.5 pr-3">
                          {lot.quantity} {item.unit}
                        </td>
                        <td className="py-2.5 pr-3">
                          {daysLabel(lot.daysUntilExpiry)}
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`inline-flex rounded-sm px-2 py-0.5 text-xs font-medium ${cfg.className}`}
                          >
                            {cfg.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}
