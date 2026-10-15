import type { AxiosInstance } from "axios";
import type { StoreRepository } from "@/modules/stores/api/repository";
import type {
  Store,
  StoreStatus,
  UpdateStoreSettingsInput,
} from "@/modules/stores/types/store";
import { parseStore } from "@/modules/stores/schemas/store.api";

export class HttpStoreRepository implements StoreRepository {
  constructor(private readonly http: AxiosInstance) {}

  async get(): Promise<Store> {
    const { data } = await this.http.get("/api/store");
    return parseStore(data);
  }

  async updateSettings(input: UpdateStoreSettingsInput): Promise<Store> {
    const { data } = await this.http.patch("/api/store/settings", {
      openingTime: input.openingTime,
      closingTime: input.closingTime,
      maxOrdersInProgress: input.maxOrdersInProgress,
      automaticPause: input.automaticPause,
    });
    return parseStore(data);
  }

  async setStatus(status: StoreStatus): Promise<Store> {
    const { data } = await this.http.put("/api/store/status", { status });
    return parseStore(data);
  }

  async clearManualStatus(): Promise<Store> {
    const { data } = await this.http.delete("/api/store/status/manual");
    return parseStore(data);
  }
}
