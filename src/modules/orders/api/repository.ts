import type { Order } from "@/modules/orders/types/order";

export interface OrdersRepository {
  listMine(): Promise<Order[]>;
  getById(saleId: string): Promise<Order>;
  cancel(saleId: string): Promise<void>;
  confirmDelivery(saleId: string): Promise<void>;
}
