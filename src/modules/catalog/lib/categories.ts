import type { Product } from "@/modules/products/types/product";

export type CategoryId = "hamburgueres" | "batatas" | "milkshakes" | "bebidas";

export type Category = {
  id: CategoryId;
  label: string;
};

export const categories: readonly Category[] = [
  { id: "hamburgueres", label: "Hambúrgueres" },
  { id: "batatas", label: "Batatas fritas" },
  { id: "milkshakes", label: "Milkshakes" },
  { id: "bebidas", label: "Bebidas" },
];

// Categorização fixa no frontend, baseada no id do produto.
export function getCategoryId(productId: number): CategoryId {
  if (productId <= 5) return "hamburgueres";
  if (productId <= 7) return "batatas";
  if (productId <= 10) return "milkshakes";
  return "bebidas";
}

export function groupProductsByCategory(products: Product[]) {
  return categories
    .map((category) => ({
      category,
      products: products.filter((p) => getCategoryId(p.id) === category.id),
    }))
    .filter((group) => group.products.length > 0);
}
