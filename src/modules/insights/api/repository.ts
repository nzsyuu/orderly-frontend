import type {
  DailyInsights,
  InsightsQuery,
} from "@/modules/insights/types/insights";

export interface InsightsRepository {
  get(query: InsightsQuery): Promise<DailyInsights>;
}
