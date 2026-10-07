import type { AxiosInstance } from "axios";
import type { OrdersRepository } from "@/modules/orders/api/repository";
import type { Order } from "@/modules/orders/types/order";
import { parseSaleResponse } from "@/modules/checkout/schemas/checkout.api";

export class HttpOrdersRepository implements OrdersRepository {
  constructor(private readonly http: AxiosInstance) {}

  async listMine(): Promise<Order[]> {
    const { data } = await this.http.get("/api/sales/me");
    const list: unknown[] = Array.isArray(data) ? data : [];
    return list
      .map(parseSaleResponse)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  async getById(saleId: string): Promise<Order> {
    const { data } = await this.http.get(`/api/sales/${saleId}`);
    return parseSaleResponse(data);
  }

  async cancel(saleId: string): Promise<void> {
    await this.http.post(`/api/sales/${saleId}/cancel`);
  }

  // O corpo da resposta é ignorado: o front aplica ENTREGUE localmente e revalida.
  async confirmDelivery(saleId: string): Promise<void> {
    await this.http.post(`/api/sales/${saleId}/deliver`);
  }
}
