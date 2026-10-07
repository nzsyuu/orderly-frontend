import { apiClient } from "@/shared/http/api-client";
import type { OrdersRepository } from "@/modules/orders/api/repository";
import { HttpOrdersRepository } from "@/modules/orders/api/http-orders.repository";

export const ordersRepository: OrdersRepository = new HttpOrdersRepository(
  apiClient,
);
