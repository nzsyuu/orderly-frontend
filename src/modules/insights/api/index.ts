import { apiClient } from "@/shared/http/api-client";
import type { InsightsRepository } from "@/modules/insights/api/repository";
import { HttpInsightsRepository } from "@/modules/insights/api/http-insights.repository";

export const insightsRepository: InsightsRepository =
  new HttpInsightsRepository(apiClient);
