import type {
  CreateStoreInput,
  Store,
  StoreStatus,
  StoreSummary,
  UpdateStoreSettingsInput,
} from "@/modules/stores/types/store";

export interface StoreRepository {
  getById(id: number): Promise<Store>;
  getSummaryById(id: number): Promise<StoreSummary>;
  create(input: CreateStoreInput): Promise<Store>;
  updateSettings(id: number, input: UpdateStoreSettingsInput): Promise<Store>;
  setStatus(id: number, status: StoreStatus): Promise<Store>;
  clearManualStatus(id: number): Promise<Store>;
}
