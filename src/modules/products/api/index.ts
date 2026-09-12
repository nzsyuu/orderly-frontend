import { apiClient } from "@/shared/http/api-client";
import type { ProductRepository } from "@/modules/products/api/repository";
import { HttpProductRepository } from "@/modules/products/api/http-product.repository";

export const productRepository: ProductRepository = new HttpProductRepository(
  apiClient,
);
