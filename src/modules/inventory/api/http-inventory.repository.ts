import type { AxiosInstance } from "axios";
import type { InventoryRepository } from "@/modules/inventory/api/repository";
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
import {
  parseStock,
  parseStockItem,
  parseStockItemPagedResponse,
  parseStockLot,
  stockItemListResponseSchema,
  stockListResponseSchema,
  stockLotListResponseSchema,
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

  async listByStock(
    stockId: number,
    params?: ListStockItemsParams,
  ): Promise<PagedResponse<StockItem>> {
    const cleanParams: Record<string, unknown> = {};
    if (params?.page !== undefined) cleanParams.page = params.page;
    if (params?.size !== undefined) cleanParams.size = params.size;
    if (params?.name && params.name.trim().length > 0) {
      cleanParams.name = params.name.trim();
    }
    if (
      params?.category &&
      params.category.trim().length > 0 &&
      params.category !== "todos"
    ) {
      cleanParams.category = params.category.trim();
    }
    if (params?.active !== undefined) {
      cleanParams.active = params.active;
    }

    const { data } = await this.http.get(`/api/stocks/${stockId}/items`, {
      params: cleanParams,
    });
    return parseStockItemPagedResponse(data);
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

  async listLots(id: number): Promise<StockLot[]> {
    const { data } = await this.http.get(`/api/stock-items/${id}/lots`);
    return stockLotListResponseSchema.parse(data).map(parseStockLot);
  }

  async registerMovement(
    id: number,
    input: RegisterMovementInput,
  ): Promise<StockItem> {
    const { data } = await this.http.post(`/api/stock-items/${id}/movements`, {
      type: input.type,
      quantity: input.quantity,
      reason: input.reason,
      ...(input.expiresAt ? { expiresAt: input.expiresAt } : {}),
    });
    return parseStockItem(data);
  }
}
