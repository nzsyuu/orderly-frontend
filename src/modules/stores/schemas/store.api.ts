import { z } from "zod";
import type { Store, StoreSummary } from "@/modules/stores/types/store";
import { STORE_STATUSES } from "@/modules/stores/types/store";

const timeSchema = z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/);

export const storeResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  openingTime: timeSchema,
  closingTime: timeSchema,
  maxOrdersInProgress: z.number().int(),
  automaticPause: z.boolean(),
  status: z.enum(STORE_STATUSES),
  manualStatus: z.enum(STORE_STATUSES).nullable(),
  addressStreet: z.string(),
  addressNumber: z.string(),
  addressNeighborhood: z.string(),
  addressCity: z.string(),
  addressZipCode: z.string(),
});

export function parseStore(data: unknown): Store {
  return storeResponseSchema.parse(data);
}

export function parseStoreSummary(data: unknown): StoreSummary {
  const parsed = z
    .object({
      id: z.number(),
      name: z.string(),
    })
    .passthrough()
    .parse(data);
  return { id: parsed.id, name: parsed.name };
}
