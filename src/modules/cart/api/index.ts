import { apiClient } from "@/shared/http/api-client";
import type { CartRepository } from "@/modules/cart/api/repository";
import { HttpCartRepository } from "@/modules/cart/api/http-cart.repository";

export const cartRepository: CartRepository = new HttpCartRepository(
  apiClient,
);
