import type { Sale } from "@/modules/sales/types/sale";

export interface SalesRepository {
  list(): Promise<Sale[]>;
}
