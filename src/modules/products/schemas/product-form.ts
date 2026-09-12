import { z } from "zod";

export const createProductFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe um nome com pelo menos 2 caracteres")
    .max(100, "O nome deve ter no máximo 100 caracteres"),
  description: z.string().trim().optional(),
  price: z
    .number({ error: "Informe um preço válido" })
    .min(0, "O preço não pode ser negativo"),
});

export type CreateProductFormValues = z.infer<typeof createProductFormSchema>;

export const updateProductFormSchema = createProductFormSchema.extend({
  active: z.boolean(),
});

export type UpdateProductFormValues = z.infer<typeof updateProductFormSchema>;

export const updateCompositionFormSchema = z.object({
  quantity: z.number().int().min(1, "A quantidade mínima é 1"),
});

export type UpdateCompositionFormValues = z.infer<
  typeof updateCompositionFormSchema
>;

export const addCompositionFormSchema = z.object({
  stockItemId: z.number().min(1, "Selecione um item de estoque"),
  quantity: z.number().int().min(1, "A quantidade mínima é 1"),
});

export type AddCompositionFormValues = z.infer<typeof addCompositionFormSchema>;
