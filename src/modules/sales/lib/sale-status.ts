import {
  Bike,
  CheckCheck,
  Clock,
  Flame,
  XCircle,
  type LucideIcon,
} from "lucide-react";

export type SaleStatusMeta = {
  /** Rótulo do lado da loja (o cliente vê textos próprios em orders/lib). */
  label: string;
  icon: LucideIcon;
  /** Cor sólida (CSS var) usada em gráficos, pontos e bordas. */
  color: string;
  /** Classes de selo: fundo suave + texto legível. */
  badgeClassName: string;
};

export const SALE_STATUS_ORDER = [
  "PENDENTE",
  "EM_PREPARO",
  "EM_ROTA",
  "ENTREGUE",
  "CANCELADA",
] as const;

const saleStatusMeta: Record<string, SaleStatusMeta> = {
  PENDENTE: {
    label: "Pendente",
    icon: Clock,
    color: "var(--warning)",
    badgeClassName: "bg-warning/12 text-warning",
  },
  EM_PREPARO: {
    label: "Em preparo",
    icon: Flame,
    color: "var(--brand)",
    badgeClassName: "bg-brand/20 text-[#6b4f00]",
  },
  EM_ROTA: {
    label: "Em rota",
    icon: Bike,
    color: "var(--info)",
    badgeClassName: "bg-info/12 text-info",
  },
  ENTREGUE: {
    label: "Entregue",
    icon: CheckCheck,
    color: "var(--success)",
    badgeClassName: "bg-success/12 text-success",
  },
  CANCELADA: {
    label: "Cancelado",
    icon: XCircle,
    color: "var(--destructive)",
    badgeClassName: "bg-destructive/10 text-destructive",
  },
  CANCELADO: {
    label: "Cancelado",
    icon: XCircle,
    color: "var(--destructive)",
    badgeClassName: "bg-destructive/10 text-destructive",
  },
};

export function getSaleStatusMeta(status: string): SaleStatusMeta {
  return (
    saleStatusMeta[status] ?? {
      label: status,
      icon: Clock,
      color: "var(--muted-foreground)",
      badgeClassName: "bg-muted text-muted-foreground",
    }
  );
}
