import type {
  CheckoutInput,
  SaleResponse,
  FreightResult,
} from "@/modules/checkout/types/checkout";

export interface CheckoutRepository {
  getFreight(addressId: string): Promise<FreightResult>;
  checkout(input: CheckoutInput): Promise<SaleResponse>;
}
