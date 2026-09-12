import type { AxiosInstance } from "axios";
import type { ProductRepository } from "@/modules/products/api/repository";
import type {
  AddCompositionInput,
  CreateProductInput,
  Product,
  ProductComposition,
  UpdateCompositionInput,
  UpdateProductInput,
} from "@/modules/products/types/product";
import {
  parseProduct,
  parseProductComposition,
  productCompositionListSchema,
  productListSchema,
} from "@/modules/products/schemas/product.api";

export class HttpProductRepository implements ProductRepository {
  constructor(private readonly http: AxiosInstance) {}

  async list(): Promise<Product[]> {
    const { data } = await this.http.get("/api/products");
    return productListSchema.parse(data).map(parseProduct);
  }

  async getById(id: number): Promise<Product> {
    const { data } = await this.http.get(`/api/products/${id}`);
    return parseProduct(data);
  }

  async create(input: CreateProductInput): Promise<Product> {
    const { data } = await this.http.post("/api/products", {
      name: input.name,
      description: input.description ?? null,
      price: input.price,
      active: input.active ?? true,
    });
    return parseProduct(data);
  }

  async update(id: number, input: UpdateProductInput): Promise<Product> {
    const { data } = await this.http.patch(`/api/products/${id}`, {
      name: input.name,
      description: input.description ?? null,
      price: input.price,
      active: input.active,
    });
    return parseProduct(data);
  }

  async delete(id: number): Promise<void> {
    await this.http.delete(`/api/products/${id}`);
  }

  async listCompositions(productId: number): Promise<ProductComposition[]> {
    const { data } = await this.http.get(
      `/api/products/${productId}/compositions`,
    );
    return productCompositionListSchema.parse(data);
  }

  async addComposition(
    productId: number,
    input: AddCompositionInput,
  ): Promise<ProductComposition> {
    const { data } = await this.http.post(
      `/api/products/${productId}/compositions`,
      {
        stockItemId: input.stockItemId,
        quantity: input.quantity,
      },
    );
    return parseProductComposition(data);
  }

  async updateComposition(
    productId: number,
    compositionId: number,
    input: UpdateCompositionInput,
  ): Promise<ProductComposition> {
    const { data } = await this.http.patch(
      `/api/products/${productId}/compositions/${compositionId}`,
      { quantity: input.quantity },
    );
    return parseProductComposition(data);
  }

  async removeComposition(
    productId: number,
    compositionId: number,
  ): Promise<void> {
    await this.http.delete(
      `/api/products/${productId}/compositions/${compositionId}`,
    );
  }
}
