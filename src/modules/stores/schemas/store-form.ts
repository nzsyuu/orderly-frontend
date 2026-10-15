import { z } from "zod";

const timeField = z
  .string()
  .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Informe um horário válido");

export const storeSettingsFormSchema = z.object({
  openingTime: timeField,
  closingTime: timeField,
  maxOrdersInProgress: z
    .number({ error: "Informe o limite de pedidos" })
    .int("O limite deve ser um número inteiro")
    .min(1, "O limite deve ser maior que zero"),
  automaticPause: z.boolean(),
});

export type StoreSettingsFormValues = z.infer<typeof storeSettingsFormSchema>;
