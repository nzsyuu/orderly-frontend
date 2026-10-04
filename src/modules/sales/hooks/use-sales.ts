import { useQuery } from "@tanstack/react-query";
import { salesRepository } from "@/modules/sales/api";

export const salesQueryKey = ["sales"] as const;

export function useSales() {
  return useQuery({
    queryKey: salesQueryKey,
    queryFn: () => salesRepository.list(),
  });
}
