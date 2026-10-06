import type { AxiosInstance } from "axios";
import type { InsightsRepository } from "@/modules/insights/api/repository";
import type {
  DailyInsights,
  InsightsQuery,
} from "@/modules/insights/types/insights";
import { parseInsights } from "@/modules/insights/schemas/insights.api";

export class HttpInsightsRepository implements InsightsRepository {
  constructor(private readonly http: AxiosInstance) {}

  async get(query: InsightsQuery): Promise<DailyInsights> {
    const params = query.date ? { date: query.date } : undefined;
    const path =
      query.storeId === "all"
        ? "/api/insights"
        : `/api/stores/${query.storeId}/insights`;
    const { data } = await this.http.get(path, { params });
    return parseInsights(data);
  }
}
