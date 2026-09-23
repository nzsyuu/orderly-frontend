export type CartItem = {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  observation: string | null;
  totalPrice: number;
};

export type Cart = {
  id: string;
  items: CartItem[];
  subTotal: number;
};

export type AddItemInput = {
  productId: number;
  quantity: number;
  observation?: string;
};

export type UpdateItemQuantityInput = {
  quantity: number;
};
