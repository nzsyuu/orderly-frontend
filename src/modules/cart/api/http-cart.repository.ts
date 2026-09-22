import type { AxiosInstance } from "axios";
import type { CartRepository } from "@/modules/cart/api/repository";
import type {
  AddItemInput,
  Cart,
  UpdateItemQuantityInput,
} from "@/modules/cart/types/cart";
import { parseCart } from "@/modules/cart/schemas/cart.api";

export class HttpCartRepository implements CartRepository {
  constructor(private readonly http: AxiosInstance) {}

  async get(): Promise<Cart> {
    const { data } = await this.http.get("/api/cart");
    return parseCart(data);
  }

  async addItem(input: AddItemInput): Promise<Cart> {
    const { data } = await this.http.post("/api/cart", {
      productId: input.productId,
      quantity: input.quantity,
      observation: input.observation,
    });
    return parseCart(data);
  }

  async updateItemQuantity(
    productId: number,
    input: UpdateItemQuantityInput,
  ): Promise<Cart> {
    const { data } = await this.http.patch(`/api/cart/${productId}`, {
      quantity: input.quantity,
    });
    return parseCart(data);
  }

  async removeItem(productId: number): Promise<Cart> {
    const { data } = await this.http.delete(`/api/cart/${productId}`);
    return parseCart(data);
  }

  async clear(): Promise<Cart> {
    const { data } = await this.http.delete("/api/cart");
    return parseCart(data);
  }
}
