import { Lock } from "lucide-react";
import type { Store, StoreStatus } from "@/modules/stores/types/store";

const statusConfig: Record<
  StoreStatus,
  { label: string; className: string; dot: string }
> = {
  ABERTA: {
    label: "Aberta",
    className: "bg-success/15 text-success",
    dot: "bg-success",
  },
  PAUSADA: {
    label: "Pausada",
    className: "bg-warning/15 text-warning",
    dot: "bg-warning",
  },
  FECHADA: {
    label: "Fechada",
    className: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
};

export function StoreStatusBadge({ store }: { store: Store }) {
  const cfg = statusConfig[store.status];
  const isManual = store.manualStatus != null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${cfg.className}`}
      title={
        isManual
          ? "Status definido manualmente"
          : "Status atualizado automaticamente"
      }
    >
      <span className={`size-2 rounded-full ${cfg.dot}`} />
      {cfg.label}
      {isManual ? <Lock className="size-3" aria-hidden /> : null}
    </span>
  );
}
