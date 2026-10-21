import type {
  CreateStockInput,
  CreateStockItemInput,
  ListStockItemsParams,
  PagedResponse,
  RegisterMovementInput,
  Stock,
  StockItem,
  StockLot,
  UpdateStockItemInput,
} from "@/modules/inventory/types/stock-item";

export interface InventoryRepository {
  listStocks(): Promise<Stock[]>;
  createStock(input: CreateStockInput): Promise<Stock>;
  list(): Promise<StockItem[]>;
  listByStock(
    stockId: number,
    params?: ListStockItemsParams,
  ): Promise<PagedResponse<StockItem>>;
  getById(id: number): Promise<StockItem>;
  create(stockId: number, input: CreateStockItemInput): Promise<StockItem>;
  update(id: number, input: UpdateStockItemInput): Promise<StockItem>;
  delete(id: number): Promise<void>;
  listLots(id: number): Promise<StockLot[]>;
  registerMovement(
    id: number,
    input: RegisterMovementInput,
  ): Promise<StockItem>;
}
