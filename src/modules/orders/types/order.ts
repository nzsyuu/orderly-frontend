import type { SaleResponse } from "@/modules/checkout/types/checkout";
import type { SaleStatus } from "@/modules/sales/types/sale";

/** Pedido do cliente: mesmo formato devolvido por `/api/sales/me` e pelo checkout. */
export type Order = SaleResponse;
export type OrderStatus = SaleStatus;
