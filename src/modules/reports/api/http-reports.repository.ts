import type { AxiosInstance } from "axios";
import type { ReportsRepository } from "@/modules/reports/api/repository";
import type {
  ReportPeriodParams,
  SalesReport,
  StockReport,
} from "@/modules/reports/types/report";
import {
  parseSalesReport,
  parseStockReport,
} from "@/modules/reports/schemas/report.api";

function cleanParams(params: ReportPeriodParams) {
  return {
    startDate: params.startDate || undefined,
    endDate: params.endDate || undefined,
  };
}

export class HttpReportsRepository implements ReportsRepository {
  constructor(private readonly http: AxiosInstance) {}

  async sales(params: ReportPeriodParams): Promise<SalesReport> {
    const { data } = await this.http.get("/api/reports/sales", {
      params: cleanParams(params),
    });
    return parseSalesReport(data);
  }

  async stock(params: ReportPeriodParams): Promise<StockReport> {
    const { data } = await this.http.get("/api/reports/stock", {
      params: cleanParams(params),
    });
    return parseStockReport(data);
  }
}
