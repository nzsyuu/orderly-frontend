import { apiClient } from "@/shared/http/api-client";
import type { CheckoutRepository } from "@/modules/checkout/api/repository";
import { HttpCheckoutRepository } from "@/modules/checkout/api/http-checkout.repository";

export const checkoutRepository: CheckoutRepository =
  new HttpCheckoutRepository(apiClient);
