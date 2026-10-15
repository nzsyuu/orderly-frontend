"use client";

import { useStore } from "@/modules/stores/hooks/use-stores";
import { formatStoreHours } from "@/modules/stores/lib/time";
import type { StoreStatus } from "@/modules/stores/types/store";

const dot: Record<StoreStatus, string> = {
  ABERTA: "bg-success",
  PAUSADA: "bg-warning",
  FECHADA: "bg-muted-foreground",
};

const label: Record<StoreStatus, string> = {
  ABERTA: "Aberta",
  PAUSADA: "Pausada",
  FECHADA: "Fechada",
};

/** Status atual e horário da loja, exibido no cabeçalho do cardápio. */
export function StoreHoursPill() {
  const { data: store } = useStore();
  if (!store) return null;

  return (
    <p className="text-muted-foreground inline-flex items-center gap-2 text-xs">
      <span
        className={`h-2 w-2 rounded-full ${dot[store.status]}`}
        aria-hidden
      />
      <span className="text-foreground font-medium">{label[store.status]}</span>
      <span className="hidden md:inline">
        {formatStoreHours(store.openingTime, store.closingTime)}
      </span>
    </p>
  );
}
