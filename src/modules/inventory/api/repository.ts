import type {
  CreateStockInput,
  CreateStockItemInput,
  RegisterMovementInput,
  Stock,
  StockItem,
  UpdateStockItemInput,
} from "@/modules/inventory/types/stock-item";

export interface InventoryRepository {
  listStocks(): Promise<Stock[]>;
  createStock(input: CreateStockInput): Promise<Stock>;
  list(): Promise<StockItem[]>;
  listByStock(stockId: number): Promise<StockItem[]>;
  getById(id: number): Promise<StockItem>;
  create(stockId: number, input: CreateStockItemInput): Promise<StockItem>;
  update(id: number, input: UpdateStockItemInput): Promise<StockItem>;
  delete(id: number): Promise<void>;
  registerMovement(
    id: number,
    input: RegisterMovementInput,
  ): Promise<StockItem>;
}
