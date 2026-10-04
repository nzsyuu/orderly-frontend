export const DEMO_STORE_IDS = [1, 2] as const;

export const DEMO_STORE_FALLBACK_NAMES: Record<number, string> = {
  1: "Loja Principal",
  2: "Orderly Campus",
};

export const STORE_STATUSES = ["ABERTA", "FECHADA", "PAUSADA"] as const;

export type StoreStatus = (typeof STORE_STATUSES)[number];

export type Store = {
  id: number;
  name: string;
  openingTime: string;
  closingTime: string;
  maxOrdersInProgress: number;
  automaticPause: boolean;
  status: StoreStatus;
  manualStatus: StoreStatus | null;
  addressStreet: string;
  addressNumber: string;
  addressNeighborhood: string;
  addressCity: string;
  addressZipCode: string;
};

export type StoreSummary = {
  id: number;
  name: string;
};

export type CreateStoreInput = {
  name: string;
  openingTime: string;
  closingTime: string;
  maxOrdersInProgress: number;
  automaticPause: boolean;
  addressStreet: string;
  addressNumber: string;
  addressNeighborhood: string;
  addressCity: string;
  addressZipCode: string;
};

export type UpdateStoreSettingsInput = {
  openingTime: string;
  closingTime: string;
  maxOrdersInProgress: number;
  automaticPause: boolean;
};
