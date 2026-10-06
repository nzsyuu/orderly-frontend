import { DEMO_STORE_IDS } from "@/modules/stores/types/store";

const STORAGE_KEY = "orderly.known-store-ids";

function readStoredIds(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (value): value is number =>
        typeof value === "number" && Number.isInteger(value) && value > 0,
    );
  } catch {
    return [];
  }
}

function writeStoredIds(ids: number[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function readKnownStoreIds(): number[] {
  return [...new Set([...DEMO_STORE_IDS, ...readStoredIds()])].sort(
    (a, b) => a - b,
  );
}

export function rememberStoreId(id: number) {
  writeStoredIds([...new Set([...readStoredIds(), id])]);
}

export function forgetStoreId(id: number) {
  writeStoredIds(readStoredIds().filter((stored) => stored !== id));
}
