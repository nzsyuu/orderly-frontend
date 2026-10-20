import { apiClient } from "@/shared/http/api-client";
import type { ReportsRepository } from "@/modules/reports/api/repository";
import { HttpReportsRepository } from "@/modules/reports/api/http-reports.repository";

export const reportsRepository: ReportsRepository = new HttpReportsRepository(
  apiClient,
);
