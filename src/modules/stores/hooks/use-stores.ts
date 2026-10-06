import { useQueries, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { storeRepository } from "@/modules/stores/api";
import {
  forgetStoreId,
  readKnownStoreIds,
  rememberStoreId,
} from "@/modules/stores/lib/known-store-ids";
import {
  DEMO_STORE_FALLBACK_NAMES,
  DEMO_STORE_IDS,
  type CreateStoreInput,
  type Store,
  type StoreStatus,
  type StoreSummary,
  type UpdateStoreSettingsInput,
} from "@/modules/stores/types/store";

export function storeQueryKey(id: number) {
  return ["stores", id] as const;
}

export const knownStoreIdsQueryKey = ["stores", "known-ids"] as const;

function isNotFound(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 404;
}

async function fetchStoreOrNull(id: number): Promise<Store | null> {
  try {
    return await storeRepository.getById(id);
  } catch (error) {
    if (isNotFound(error)) {
      forgetStoreId(id);
      return null;
    }
    throw error;
  }
}

export function useKnownStores() {
  const idsQuery = useQuery({
    queryKey: knownStoreIdsQueryKey,
    queryFn: async () => readKnownStoreIds(),
    initialData: () =>
      typeof window === "undefined" ? [...DEMO_STORE_IDS] : readKnownStoreIds(),
  });
  const ids = idsQuery.data ?? [...DEMO_STORE_IDS];

  const queries = useQueries({
    queries: ids.map((id) => ({
      queryKey: storeQueryKey(id),
      queryFn: () => fetchStoreOrNull(id),
      retry: false,
    })),
  });

  const stores = queries
    .map((query) => query.data)
    .filter((store): store is Store => store != null);

  return {
    stores,
    isLoading: queries.some((query) => query.isPending),
    isError: queries.some((query) => query.isError && !isNotFound(query.error)),
  };
}

export function useDemoStores() {
  const queries = useQueries({
    queries: DEMO_STORE_IDS.map((id) => ({
      queryKey: [...storeQueryKey(id), "summary"] as const,
      queryFn: () => storeRepository.getSummaryById(id),
      retry: false,
    })),
  });

  const stores: StoreSummary[] = DEMO_STORE_IDS.map((id, index) => {
    const result = queries[index];
    if (result?.data) return result.data;
    return {
      id,
      name: DEMO_STORE_FALLBACK_NAMES[id] ?? `Loja ${id}`,
    };
  });

  return {
    stores,
    isLoading: queries.some((query) => query.isPending),
  };
}

function cacheStore(
  queryClient: ReturnType<typeof useQueryClient>,
  store: Store,
) {
  queryClient.setQueryData(storeQueryKey(store.id), store);
  queryClient.setQueryData(
    knownStoreIdsQueryKey,
    readKnownStoreIds().includes(store.id)
      ? readKnownStoreIds()
      : [...readKnownStoreIds(), store.id],
  );
}

export function useCreateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateStoreInput) => storeRepository.create(input),
    onSuccess: (store) => {
      rememberStoreId(store.id);
      cacheStore(queryClient, store);
    },
  });
}

export function useUpdateStoreSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: UpdateStoreSettingsInput;
    }) => storeRepository.updateSettings(id, input),
    onSuccess: (store) => {
      cacheStore(queryClient, store);
    },
  });
}

export function useSetStoreStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: StoreStatus }) =>
      storeRepository.setStatus(id, status),
    onSuccess: (store) => {
      cacheStore(queryClient, store);
    },
  });
}

export function useClearStoreManualStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => storeRepository.clearManualStatus(id),
    onSuccess: (store) => {
      cacheStore(queryClient, store);
    },
  });
}
