import type { AxiosInstance } from "axios";
import type { InventoryRepository } from "@/modules/inventory/api/repository";
import type {
  CreateStockInput,
  CreateStockItemInput,
  RegisterMovementInput,
  Stock,
  StockItem,
  UpdateStockItemInput,
} from "@/modules/inventory/types/stock-item";
import {
  parseStock,
  parseStockItem,
  stockItemListResponseSchema,
  stockListResponseSchema,
} from "@/modules/inventory/schemas/stock-item.api";

export class HttpInventoryRepository implements InventoryRepository {
  constructor(private readonly http: AxiosInstance) {}

  async listStocks(): Promise<Stock[]> {
    const { data } = await this.http.get("/api/stocks");
    return stockListResponseSchema.parse(data).map(parseStock);
  }

  async createStock(input: CreateStockInput): Promise<Stock> {
    const { data } = await this.http.post("/api/stocks", { name: input.name });
    return parseStock(data);
  }

  async list(): Promise<StockItem[]> {
    const { data } = await this.http.get("/api/stock-items");
    return stockItemListResponseSchema.parse(data).map(parseStockItem);
  }

  async listByStock(stockId: number): Promise<StockItem[]> {
    const { data } = await this.http.get(`/api/stocks/${stockId}/items`);
    return stockItemListResponseSchema.parse(data).map(parseStockItem);
  }

  async getById(id: number): Promise<StockItem> {
    const { data } = await this.http.get(`/api/stock-items/${id}`);
    return parseStockItem(data);
  }

  async create(
    stockId: number,
    input: CreateStockItemInput,
  ): Promise<StockItem> {
    const { data } = await this.http.post(`/api/stocks/${stockId}/items`, {
      name: input.name,
      category: input.category,
      unit: input.unit,
      currentQuantity: input.currentQuantity,
      minimumStock: input.minimumStock,
      unitCost: input.unitCost,
      active: input.active ?? true,
    });
    return parseStockItem(data);
  }

  async update(id: number, input: UpdateStockItemInput): Promise<StockItem> {
    const { data } = await this.http.patch(`/api/stock-items/${id}`, {
      name: input.name,
      category: input.category,
      minimumStock: input.minimumStock,
      unitCost: input.unitCost,
      active: input.active,
    });
    return parseStockItem(data);
  }

  async delete(id: number): Promise<void> {
    await this.http.delete(`/api/stock-items/${id}`);
  }

  async registerMovement(
    id: number,
    input: RegisterMovementInput,
  ): Promise<StockItem> {
    const { data } = await this.http.post(`/api/stock-items/${id}/movements`, {
      type: input.type,
      quantity: input.quantity,
      reason: input.reason,
    });
    return parseStockItem(data);
  }
}
