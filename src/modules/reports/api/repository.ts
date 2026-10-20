import type {
  ReportPeriodParams,
  SalesReport,
  StockReport,
} from "@/modules/reports/types/report";

export interface ReportsRepository {
  sales(params: ReportPeriodParams): Promise<SalesReport>;
  stock(params: ReportPeriodParams): Promise<StockReport>;
}
