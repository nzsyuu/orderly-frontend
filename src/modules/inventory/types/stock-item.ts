export type Stock = {
  id: number;
  name: string;
};

export type StockStatus = "ok" | "baixo" | "esgotado";

export type MovementType = "ENTRADA" | "SAIDA" | "PERDA" | "AJUSTE";

export type StockItem = {
  id: number;
  stockId: number;
  name: string;
  category: string;
  unit: string;
  currentQuantity: number;
  minimumStock: number;
  unitCost: number;
  active: boolean;
};

export type CreateStockInput = {
  name: string;
};

export type CreateStockItemInput = {
  name: string;
  category: string;
  unit: string;
  currentQuantity: number;
  minimumStock: number;
  unitCost: number;
  active?: boolean;
};

export type UpdateStockItemInput = {
  name?: string;
  category?: string;
  minimumStock?: number;
  unitCost?: number;
  active?: boolean;
};

export type RegisterMovementInput = {
  type: MovementType;
  quantity: number;
  reason: string;
};

export function statusOfItem(item: StockItem): StockStatus {
  if (item.currentQuantity <= 0) return "esgotado";
  if (item.currentQuantity <= item.minimumStock) return "baixo";
  return "ok";
}
