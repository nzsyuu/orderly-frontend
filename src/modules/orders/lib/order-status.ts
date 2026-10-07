import {
  Bike,
  ChefHat,
  Clock,
  PackageCheck,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import type { OrderStatus } from "@/modules/orders/types/order";

export const ORDER_FLOW: OrderStatus[] = [
  "PENDENTE",
  "EM_PREPARO",
  "EM_ROTA",
  "ENTREGUE",
];

export type OrderStatusConfig = {
  label: string;
  description: string;
  icon: LucideIcon;
  className: string;
  dot: string;
};

export const statusConfig: Record<OrderStatus, OrderStatusConfig> = {
  PENDENTE: {
    label: "Pedido recebido",
    description: "Aguardando a loja iniciar o preparo",
    icon: Clock,
    className: "bg-warning/15 text-warning",
    dot: "bg-warning",
  },
  EM_PREPARO: {
    label: "Em preparo",
    description: "Seu pedido está sendo preparado",
    icon: ChefHat,
    className: "bg-primary/10 text-primary",
    dot: "bg-primary",
  },
  EM_ROTA: {
    label: "Saiu para entrega",
    description: "O entregador está a caminho. Confirme quando receber!",
    icon: Bike,
    className: "bg-primary/10 text-primary",
    dot: "bg-primary",
  },
  ENTREGUE: {
    label: "Entregue",
    description: "Bom apetite!",
    icon: PackageCheck,
    className: "bg-success/15 text-success",
    dot: "bg-success",
  },
  CANCELADA: {
    label: "Cancelado",
    description: "Este pedido foi cancelado",
    icon: XCircle,
    className: "bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
};

/** Status desconhecido mostra o texto cru e é tratado como ativo. */
export function getStatusConfig(raw: string): OrderStatusConfig {
  return (
    statusConfig[raw as OrderStatus] ?? {
      label: raw,
      description: "Atualizando o status do pedido",
      icon: Clock,
      className: "bg-muted text-muted-foreground",
      dot: "bg-muted-foreground",
    }
  );
}

export const isActiveOrder = (status: string) =>
  status !== "ENTREGUE" && status !== "CANCELADA";

export const canCancelOrder = (status: string) =>
  status === "PENDENTE" || status === "EM_PREPARO";

export const canConfirmDelivery = (status: string) => status === "EM_ROTA";

export function shortOrderId(saleId: string) {
  return saleId.slice(0, 8);
}
