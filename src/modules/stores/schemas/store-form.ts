import { z } from "zod";

const timeField = z
  .string()
  .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Informe um horário válido");

export const createStoreFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Informe o nome da loja")
    .max(120, "O nome deve ter no máximo 120 caracteres"),
  openingTime: timeField,
  closingTime: timeField,
  maxOrdersInProgress: z
    .number({ error: "Informe o limite de pedidos" })
    .int("O limite deve ser um número inteiro")
    .min(1, "O limite deve ser maior que zero"),
  automaticPause: z.boolean(),
  addressStreet: z.string().trim().min(1, "Informe o logradouro"),
  addressNumber: z
    .string()
    .trim()
    .min(1, "Informe o número")
    .regex(/^\d+$/, "O número deve conter apenas dígitos")
    .max(20, "O número deve ter no máximo 20 dígitos"),
  addressNeighborhood: z.string().trim().min(1, "Informe o bairro"),
  addressCity: z.string().trim().min(1, "Informe a cidade"),
  addressZipCode: z
    .string()
    .trim()
    .min(1, "Informe o CEP")
    .max(20, "O CEP deve ter no máximo 20 caracteres"),
});

export type CreateStoreFormValues = z.infer<typeof createStoreFormSchema>;

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
