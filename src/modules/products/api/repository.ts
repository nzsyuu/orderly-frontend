import type {
  AddCompositionInput,
  CreateProductInput,
  Product,
  ProductComposition,
  UpdateCompositionInput,
  UpdateProductInput,
} from "@/modules/products/types/product";

export interface ProductRepository {
  list(): Promise<Product[]>;
  getById(id: number): Promise<Product>;
  create(input: CreateProductInput): Promise<Product>;
  update(id: number, input: UpdateProductInput): Promise<Product>;
  delete(id: number): Promise<void>;
  listCompositions(productId: number): Promise<ProductComposition[]>;
  addComposition(
    productId: number,
    input: AddCompositionInput,
  ): Promise<ProductComposition>;
  updateComposition(
    productId: number,
    compositionId: number,
    input: UpdateCompositionInput,
  ): Promise<ProductComposition>;
  removeComposition(productId: number, compositionId: number): Promise<void>;
}
