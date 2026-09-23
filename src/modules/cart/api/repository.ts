import type {
  AddItemInput,
  Cart,
  UpdateItemQuantityInput,
} from "@/modules/cart/types/cart";

export interface CartRepository {
  get(): Promise<Cart>;
  addItem(input: AddItemInput): Promise<Cart>;
  updateItemQuantity(
    productId: number,
    input: UpdateItemQuantityInput,
  ): Promise<Cart>;
  removeItem(productId: number): Promise<Cart>;
  clear(): Promise<Cart>;
}
