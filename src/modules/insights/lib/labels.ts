import type { ForecastConfidence } from "@/modules/insights/types/insights";

const weekdayLabels: Record<string, string> = {
  MONDAY: "segunda-feira",
  TUESDAY: "terça-feira",
  WEDNESDAY: "quarta-feira",
  THURSDAY: "quinta-feira",
  FRIDAY: "sexta-feira",
  SATURDAY: "sábado",
  SUNDAY: "domingo",
};

export function weekdayLabel(weekday: string) {
  return weekdayLabels[weekday] ?? weekday;
}

const confidenceLabels: Record<string, string> = {
  HIGH: "alta",
  MEDIUM: "média",
  LOW: "baixa",
};

export function confidenceLabel(confidence: ForecastConfidence | string) {
  return confidenceLabels[confidence] ?? confidence;
}
