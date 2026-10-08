import type { AxiosInstance } from "axios";
import type {
  SalesListFilters,
  SalesRepository,
} from "@/modules/sales/api/repository";
import type { Sale } from "@/modules/sales/types/sale";
import {
  parseSale,
  saleListItemSchema,
  saleListResponseSchema,
} from "@/modules/sales/schemas/sale.api";

export class HttpSalesRepository implements SalesRepository {
  constructor(private readonly http: AxiosInstance) {}

  async list(filters?: SalesListFilters): Promise<Sale[]> {
    const { data } = await this.http.get("/api/sales", { params: filters });
    return saleListResponseSchema.parse(data).map(parseSale);
  }

  async confirm(saleId: string): Promise<Sale> {
    const { data } = await this.http.post(`/api/sales/${saleId}/confirm`);
    return parseSale(saleListItemSchema.parse(data));
  }

  async dispatch(saleId: string): Promise<Sale> {
    const { data } = await this.http.post(`/api/sales/${saleId}/dispatch`);
    return parseSale(saleListItemSchema.parse(data));
  }

  async deliver(saleId: string): Promise<Sale> {
    const { data } = await this.http.post(`/api/sales/${saleId}/deliver`);
    return parseSale(saleListItemSchema.parse(data));
  }

  async cancel(saleId: string): Promise<void> {
    await this.http.post(`/api/sales/${saleId}/cancel`);
  }
}
