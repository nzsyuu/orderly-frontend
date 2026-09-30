import type {
  Address,
  CreateAddressInput,
  UpdateAddressInput,
} from "@/modules/address/types/address";

export interface AddressRepository {
  list(): Promise<Address[]>;
  getById(addressId: string): Promise<Address>;
  create(input: CreateAddressInput): Promise<Address>;
  update(addressId: string, input: UpdateAddressInput): Promise<Address>;
  remove(addressId: string): Promise<void>;
}
