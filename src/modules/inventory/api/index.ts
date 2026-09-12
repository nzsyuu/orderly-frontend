import { apiClient } from "@/shared/http/api-client";
import type { InventoryRepository } from "@/modules/inventory/api/repository";
import { HttpInventoryRepository } from "@/modules/inventory/api/http-inventory.repository";

export const inventoryRepository: InventoryRepository =
  new HttpInventoryRepository(apiClient);
