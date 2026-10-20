"use client";

import { useState } from "react";
import { CalendarRange, Loader2 } from "lucide-react";
import {
  PERIOD_PRESETS,
  type PeriodMode,
  type PeriodPreset,
  type ReportPeriod,
} from "@/modules/reports/hooks/use-report-period";
import { daysBetweenInclusive, formatDateRange } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import { Segmented } from "@/shared/ui/page";

type PeriodPickerProps = {
  period: ReportPeriod;
  onPreset: (preset: PeriodPreset) => void;
  onRange: (startDate: string, endDate: string) => void;
  /** Datas efetivamente usadas pela API (podem diferir do pedido). */
  appliedStart?: string;
  appliedEnd?: string;
  isFetching?: boolean;
  className?: string;
};

const dateInputClassName =
  "border-input bg-card text-foreground hover:border-foreground/30 focus:border-primary focus:ring-primary/15 tabular h-9 rounded-lg border px-2.5 text-sm outline-none focus:ring-4";

export function PeriodPicker({
  period,
  onPreset,
  onRange,
  appliedStart,
  appliedEnd,
  isFetching,
  className,
}: PeriodPickerProps) {
  const [customOpen, setCustomOpen] = useState(period.mode === "personalizado");
  const [draftStart, setDraftStart] = useState(period.startDate);
  const [draftEnd, setDraftEnd] = useState(period.endDate);
  const showCustom = customOpen || period.mode === "personalizado";

  const start = appliedStart ?? period.startDate;
  const end = appliedEnd ?? period.endDate;
  const days = daysBetweenInclusive(start, end);

  function handleMode(mode: PeriodMode) {
    if (mode === "personalizado") {
      setDraftStart(period.startDate);
      setDraftEnd(period.endDate);
      setCustomOpen(true);
      return;
    }
    setCustomOpen(false);
    onPreset(mode);
  }

  function commit(nextStart: string, nextEnd: string) {
    setDraftStart(nextStart);
    setDraftEnd(nextEnd);
    if (nextStart && nextEnd) onRange(nextStart, nextEnd);
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Segmented<PeriodMode>
          label="Período do relatório"
          value={showCustom ? "personalizado" : period.mode}
          onChange={handleMode}
          options={[
            ...PERIOD_PRESETS,
            {
              value: "personalizado",
              label: (
                <>
                  <CalendarRange className="size-3.5" aria-hidden />
                  Escolher datas
                </>
              ),
            },
          ]}
        />

        <p
          className="text-muted-foreground flex items-center gap-2 text-sm"
          aria-live="polite"
        >
          {isFetching ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
          ) : null}
          <span className="text-foreground font-medium">
            {formatDateRange(start, end)}
          </span>
          <span>
            ({days} {days === 1 ? "dia" : "dias"})
          </span>
        </p>
      </div>

      {showCustom ? (
        <div className="animate-fade-in flex flex-wrap items-center gap-2 text-sm">
          <label className="flex items-center gap-2">
            <span className="text-muted-foreground">De</span>
            <input
              type="date"
              value={draftStart}
              max={draftEnd || undefined}
              onChange={(event) => commit(event.target.value, draftEnd)}
              className={dateInputClassName}
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="text-muted-foreground">até</span>
            <input
              type="date"
              value={draftEnd}
              min={draftStart || undefined}
              onChange={(event) => commit(draftStart, event.target.value)}
              className={dateInputClassName}
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}
