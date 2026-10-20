import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { reportsRepository } from "@/modules/reports/api";
import type { ReportPeriodParams } from "@/modules/reports/types/report";

export const reportsQueryKey = ["reports"] as const;

export function useSalesReport(params: ReportPeriodParams) {
  return useQuery({
    queryKey: [
      ...reportsQueryKey,
      "sales",
      params.startDate ?? "",
      params.endDate ?? "",
    ],
    queryFn: () => reportsRepository.sales(params),
    // Mantém o relatório anterior na tela enquanto o novo período carrega.
    placeholderData: keepPreviousData,
    retry: false,
  });
}

export function useStockReport(params: ReportPeriodParams) {
  return useQuery({
    queryKey: [
      ...reportsQueryKey,
      "stock",
      params.startDate ?? "",
      params.endDate ?? "",
    ],
    queryFn: () => reportsRepository.stock(params),
    placeholderData: keepPreviousData,
    retry: false,
  });
}
