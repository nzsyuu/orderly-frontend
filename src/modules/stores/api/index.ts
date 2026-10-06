import { apiClient } from "@/shared/http/api-client";
import type { StoreRepository } from "@/modules/stores/api/repository";
import { HttpStoreRepository } from "@/modules/stores/api/http-store.repository";

export const storeRepository: StoreRepository = new HttpStoreRepository(
  apiClient,
);
