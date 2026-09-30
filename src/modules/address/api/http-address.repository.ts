import type { AxiosInstance } from "axios";
import type { AddressRepository } from "@/modules/address/api/repository";
import type {
  Address,
  CreateAddressInput,
  UpdateAddressInput,
} from "@/modules/address/types/address";
import {
  parseAddress,
  parseAddressList,
} from "@/modules/address/schemas/address.api";

export class HttpAddressRepository implements AddressRepository {
  constructor(private readonly http: AxiosInstance) {}

  async list(): Promise<Address[]> {
    const { data } = await this.http.get("/api/addresses");
    return parseAddressList(data);
  }

  async getById(addressId: string): Promise<Address> {
    const { data } = await this.http.get(`/api/addresses/${addressId}`);
    return parseAddress(data);
  }

  async create(input: CreateAddressInput): Promise<Address> {
    const { data } = await this.http.post("/api/addresses", input);
    return parseAddress(data);
  }

  async update(addressId: string, input: UpdateAddressInput): Promise<Address> {
    const { data } = await this.http.put(`/api/addresses/${addressId}`, input);
    return parseAddress(data);
  }

  async remove(addressId: string): Promise<void> {
    await this.http.delete(`/api/addresses/${addressId}`);
  }
}
