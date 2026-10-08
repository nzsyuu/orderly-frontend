import type { Sale } from "@/modules/sales/types/sale";

export interface SalesListFilters {
  saleStatus?: string;
  date?: string;
}

export interface SalesRepository {
  list(filters?: SalesListFilters): Promise<Sale[]>;
  confirm(saleId: string): Promise<Sale>;
  dispatch(saleId: string): Promise<Sale>;
  deliver(saleId: string): Promise<Sale>;
  cancel(saleId: string): Promise<void>;
}
