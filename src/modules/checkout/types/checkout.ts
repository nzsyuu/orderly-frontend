export type CheckoutInput = {
  shoppingCartId: string;
  addressId: string;
  storeId: number;
  observation: string;
};

export type SaleItem = {
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type SaleResponse = {
  saleId: string;
  storeId: number;
  date: string;
  status: string;
  totalAmount: number;
  observation: string;
  items: SaleItem[];
  userId: string;
  deliveryFee: number;
  deliveryStreet: string;
  deliveryNumber: string;
  deliveryNeighborhood: string;
  deliveryCity: string;
  deliveryZipCode: string;
};

export type FreightResult = {
  deliveryFee: number;
};
