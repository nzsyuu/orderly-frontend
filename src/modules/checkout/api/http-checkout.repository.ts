import type { AxiosInstance } from "axios";
import type { CheckoutRepository } from "@/modules/checkout/api/repository";
import type {
  CheckoutInput,
  SaleResponse,
  FreightResult,
} from "@/modules/checkout/types/checkout";
import { parseSaleResponse, parseFreight } from "@/modules/checkout/schemas/checkout.api";

export class HttpCheckoutRepository implements CheckoutRepository {
  constructor(private readonly http: AxiosInstance) {}

  async getFreight(addressId: string): Promise<FreightResult> {
    const { data } = await this.http.get("/api/sales/freight", {
      params: { addressId },
    });
    return parseFreight(data);
  }

  async checkout(input: CheckoutInput): Promise<SaleResponse> {
    const { data } = await this.http.post("/api/sales/checkout", input);
    return parseSaleResponse(data);
  }
}
