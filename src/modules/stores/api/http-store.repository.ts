import type { AxiosInstance } from "axios";
import type { StoreRepository } from "@/modules/stores/api/repository";
import type {
  CreateStoreInput,
  Store,
  StoreStatus,
  StoreSummary,
  UpdateStoreSettingsInput,
} from "@/modules/stores/types/store";
import {
  parseStore,
  parseStoreSummary,
} from "@/modules/stores/schemas/store.api";

export class HttpStoreRepository implements StoreRepository {
  constructor(private readonly http: AxiosInstance) {}

  async getById(id: number): Promise<Store> {
    const { data } = await this.http.get(`/api/stores/${id}`);
    return parseStore(data);
  }

  async getSummaryById(id: number): Promise<StoreSummary> {
    const { data } = await this.http.get(`/api/stores/${id}`);
    return parseStoreSummary(data);
  }

  async create(input: CreateStoreInput): Promise<Store> {
    const { data } = await this.http.post("/api/stores", {
      name: input.name,
      openingTime: input.openingTime,
      closingTime: input.closingTime,
      maxOrdersInProgress: input.maxOrdersInProgress,
      automaticPause: input.automaticPause,
      addressStreet: input.addressStreet,
      addressNumber: input.addressNumber,
      addressNeighborhood: input.addressNeighborhood,
      addressCity: input.addressCity,
      addressZipCode: input.addressZipCode,
    });
    return parseStore(data);
  }

  async updateSettings(
    id: number,
    input: UpdateStoreSettingsInput,
  ): Promise<Store> {
    const { data } = await this.http.patch(`/api/stores/${id}/settings`, {
      openingTime: input.openingTime,
      closingTime: input.closingTime,
      maxOrdersInProgress: input.maxOrdersInProgress,
      automaticPause: input.automaticPause,
    });
    return parseStore(data);
  }

  async setStatus(id: number, status: StoreStatus): Promise<Store> {
    const { data } = await this.http.put(`/api/stores/${id}/status`, {
      status,
    });
    return parseStore(data);
  }

  async clearManualStatus(id: number): Promise<Store> {
    const { data } = await this.http.delete(`/api/stores/${id}/status/manual`);
    return parseStore(data);
  }
}
