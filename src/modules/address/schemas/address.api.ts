import { z } from "zod";
import type { Address } from "@/modules/address/types/address";

const addressSchema = z
  .object({
    addressId: z.string(),
    userId: z.string(),
    name: z.string(),
    street: z.string(),
    number: z.string(),
    complement: z.string().default(""),
    neighborhood: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
  })
  .passthrough();

export function parseAddress(data: unknown): Address {
  return addressSchema.parse(data);
}

export function parseAddressList(data: unknown): Address[] {
  return z.array(addressSchema).parse(data);
}
