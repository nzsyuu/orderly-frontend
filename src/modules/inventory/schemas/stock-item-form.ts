import { z } from "zod";

export const createStockItemFormSchema = z
  .object({
    stockId: z.string(),
    newStockName: z.string().trim().optional(),
    name: z
      .string()
      .trim()
      .min(2, "Informe um nome com pelo menos 2 caracteres")
      .max(100, "O nome deve ter no máximo 100 caracteres"),
    category: z.string().trim().min(2, "Informe a categoria"),
    unit: z.string().trim().min(1, "Informe a unidade"),
    currentQuantity: z
      .number({ error: "Informe a quantidade" })
      .int("A quantidade deve ser um número inteiro")
      .min(0, "A quantidade não pode ser negativa"),
    minimumStock: z
      .number({ error: "Informe o estoque mínimo" })
      .int("O mínimo deve ser um número inteiro")
      .min(0, "O mínimo não pode ser negativo"),
    unitCost: z
      .number({ error: "Informe o custo unitário" })
      .min(0, "O custo não pode ser negativo"),
  })
  .superRefine((values, ctx) => {
    if (values.stockId !== "__new__") return;
    if (!values.newStockName || values.newStockName.length < 2) {
      ctx.addIssue({
        code: "custom",
        path: ["newStockName"],
        message: "Informe o nome do depósito",
      });
    }
  });

export type CreateStockItemFormValues = z.infer<
  typeof createStockItemFormSchema
>;

export const updateStockItemFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe um nome com pelo menos 2 caracteres")
    .max(100, "O nome deve ter no máximo 100 caracteres"),
  category: z.string().trim().min(2, "Informe a categoria"),
  minimumStock: z
    .number({ error: "Informe o estoque mínimo" })
    .int("O mínimo deve ser um número inteiro")
    .min(0, "O mínimo não pode ser negativo"),
  unitCost: z
    .number({ error: "Informe o custo unitário" })
    .min(0, "O custo não pode ser negativo"),
  active: z.boolean(),
});

export type UpdateStockItemFormValues = z.infer<
  typeof updateStockItemFormSchema
>;

export const STOCK_UNITS = ["un", "kg", "g", "L", "ml", "pct", "cx"] as const;

export const STOCK_CATEGORIES = [
  "Carnes",
  "Pães",
  "Laticínios",
  "Vegetais",
  "Bebidas",
  "Condimentos",
  "Embalagens",
] as const;

export function stockCategoryOptions(current?: string) {
  const extras =
    current &&
    !STOCK_CATEGORIES.includes(current as (typeof STOCK_CATEGORIES)[number])
      ? [current]
      : [];
  return [...STOCK_CATEGORIES, ...extras];
}
