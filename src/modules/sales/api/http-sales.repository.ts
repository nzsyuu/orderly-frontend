import type { AxiosInstance } from "axios";
import type { SalesRepository } from "@/modules/sales/api/repository";
import type { Sale } from "@/modules/sales/types/sale";
import {
  parseSale,
  saleListResponseSchema,
} from "@/modules/sales/schemas/sale.api";

export class HttpSalesRepository implements SalesRepository {
  constructor(private readonly http: AxiosInstance) {}

  async list(): Promise<Sale[]> {
    const { data } = await this.http.get("/api/sales");
    return saleListResponseSchema.parse(data).map(parseSale);
  }
}
