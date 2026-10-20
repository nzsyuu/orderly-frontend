"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toISODate } from "@/shared/lib/format";

export const PERIOD_PRESETS = [
  { value: "hoje", label: "Hoje" },
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "mes", label: "Este mês" },
  { value: "mes-passado", label: "Mês passado" },
] as const;

export type PeriodPreset = (typeof PERIOD_PRESETS)[number]["value"];
export type PeriodMode = PeriodPreset | "personalizado";

export type ReportPeriod = {
  mode: PeriodMode;
  startDate: string;
  endDate: string;
};

const DEFAULT_PRESET: PeriodPreset = "30d";
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function rangeForPreset(preset: PeriodPreset, today = new Date()) {
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const start = new Date(end);

  switch (preset) {
    case "hoje":
      break;
    case "7d":
      start.setDate(end.getDate() - 6);
      break;
    case "30d":
      start.setDate(end.getDate() - 29);
      break;
    case "mes":
      start.setDate(1);
      break;
    case "mes-passado": {
      const first = new Date(end.getFullYear(), end.getMonth() - 1, 1);
      const last = new Date(end.getFullYear(), end.getMonth(), 0);
      return { startDate: toISODate(first), endDate: toISODate(last) };
    }
  }

  return { startDate: toISODate(start), endDate: toISODate(end) };
}

function isPreset(value: string | null): value is PeriodPreset {
  return PERIOD_PRESETS.some((preset) => preset.value === value);
}

/**
 * Período do relatório guardado na URL (?periodo=7d ou ?de=…&ate=…),
 * para que o link possa ser compartilhado e o "voltar" do navegador funcione.
 */
export function useReportPeriod() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const presetParam = searchParams.get("periodo");
  const fromParam = searchParams.get("de");
  const toParam = searchParams.get("ate");

  const period = useMemo<ReportPeriod>(() => {
    if (
      fromParam &&
      toParam &&
      ISO_DATE.test(fromParam) &&
      ISO_DATE.test(toParam)
    ) {
      const [startDate, endDate] =
        fromParam <= toParam ? [fromParam, toParam] : [toParam, fromParam];
      return { mode: "personalizado", startDate, endDate };
    }
    const preset = isPreset(presetParam) ? presetParam : DEFAULT_PRESET;
    return { mode: preset, ...rangeForPreset(preset) };
  }, [presetParam, fromParam, toParam]);

  const replaceParams = useCallback(
    (next: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(next)) {
        if (value === null) params.delete(key);
        else params.set(key, value);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  const setPreset = useCallback(
    (preset: PeriodPreset) => {
      replaceParams({
        periodo: preset === DEFAULT_PRESET ? null : preset,
        de: null,
        ate: null,
      });
    },
    [replaceParams],
  );

  const setRange = useCallback(
    (startDate: string, endDate: string) => {
      if (!ISO_DATE.test(startDate) || !ISO_DATE.test(endDate)) return;
      const [a, b] =
        startDate <= endDate ? [startDate, endDate] : [endDate, startDate];
      replaceParams({ periodo: null, de: a, ate: b });
    },
    [replaceParams],
  );

  return { period, setPreset, setRange };
}
