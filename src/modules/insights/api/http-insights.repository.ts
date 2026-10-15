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
    const { data } = await this.http.get("/api/insights", { params });
    return parseInsights(data);
  }
}
