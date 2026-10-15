import type {
  Store,
  StoreStatus,
  UpdateStoreSettingsInput,
} from "@/modules/stores/types/store";

export interface StoreRepository {
  get(): Promise<Store>;
  updateSettings(input: UpdateStoreSettingsInput): Promise<Store>;
  setStatus(status: StoreStatus): Promise<Store>;
  clearManualStatus(): Promise<Store>;
}
