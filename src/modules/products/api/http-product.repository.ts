import type { AxiosInstance } from "axios";
import type { ProductRepository, UploadImageResult } from "@/modules/products/api/repository";
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
      imageUrl: input.imageUrl ?? null,
      active: input.active ?? true,
    });
    return parseProduct(data);
  }

  async update(id: number, input: UpdateProductInput): Promise<Product> {
    const { data } = await this.http.patch(`/api/products/${id}`, {
      name: input.name,
      description: input.description ?? null,
      price: input.price,
      imageUrl: input.imageUrl,
      active: input.active,
    });
    return parseProduct(data);
  }

  async delete(id: number): Promise<void> {
    await this.http.delete(`/api/products/${id}`);
  }

  async uploadImage(file: File): Promise<UploadImageResult> {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await this.http.post("/api/products/images", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data as UploadImageResult;
  }

  async replaceImage(productId: number, file: File): Promise<Product> {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await this.http.put(
      `/api/products/${productId}/image`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return parseProduct(data);
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
