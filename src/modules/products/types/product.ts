export type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  active: boolean;
};

export type ProductComposition = {
  id: number;
  productId: number;
  stockItemId: number;
  quantity: number;
};

export type CreateProductInput = {
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  active?: boolean;
};

export type AddCompositionInput = {
  stockItemId: number;
  quantity: number;
};

export type UpdateProductInput = {
  name?: string;
  description?: string | null;
  price?: number;
  imageUrl?: string | null;
  active?: boolean;
};

export type UpdateCompositionInput = {
  quantity: number;
};
