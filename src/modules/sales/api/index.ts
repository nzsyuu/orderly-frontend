import { apiClient } from "@/shared/http/api-client";
import type { SalesRepository } from "@/modules/sales/api/repository";
import { HttpSalesRepository } from "@/modules/sales/api/http-sales.repository";

export const salesRepository: SalesRepository = new HttpSalesRepository(
  apiClient,
);
