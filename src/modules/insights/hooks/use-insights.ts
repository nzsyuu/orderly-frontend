import { useQuery } from "@tanstack/react-query";
import { insightsRepository } from "@/modules/insights/api";
import type { InsightsQuery } from "@/modules/insights/types/insights";

export function insightsQueryKey(query: InsightsQuery) {
  return ["insights", query.storeId, query.date ?? ""] as const;
}

export function useInsights(query: InsightsQuery) {
  return useQuery({
    queryKey: insightsQueryKey(query),
    queryFn: () => insightsRepository.get(query),
    retry: false,
  });
}
