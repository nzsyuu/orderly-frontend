import { apiClient } from "@/shared/http/api-client";
import type { AddressRepository } from "@/modules/address/api/repository";
import { HttpAddressRepository } from "@/modules/address/api/http-address.repository";

export const addressRepository: AddressRepository = new HttpAddressRepository(
  apiClient,
);
