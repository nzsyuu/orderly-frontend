import type { ReportMovementType } from "@/modules/reports/types/report";

type MovementMeta = {
  label: string;
  /** Verbo curto para frases ("entrou", "saiu"). */
  description: string;
  color: string;
  /** Sinal no balanço financeiro do estoque. */
  sign: 1 | -1 | 0;
};

const movementMeta: Record<ReportMovementType, MovementMeta> = {
  ENTRADA: {
    label: "Entradas",
    description: "Compras e reposições",
    color: "var(--success)",
    sign: 1,
  },
  SAIDA: {
    label: "Saídas",
    description: "Consumo nos pedidos",
    color: "var(--primary)",
    sign: -1,
  },
  PERDA: {
    label: "Perdas",
    description: "Vencimento e desperdício",
    color: "var(--destructive)",
    sign: -1,
  },
  AJUSTE: {
    label: "Ajustes",
    description: "Correções de inventário",
    color: "var(--muted-foreground)",
    sign: 0,
  },
};

export const MOVEMENT_ORDER: ReportMovementType[] = [
  "ENTRADA",
  "SAIDA",
  "PERDA",
  "AJUSTE",
];

export function getMovementMeta(type: string): MovementMeta {
  return (
    movementMeta[type as ReportMovementType] ?? {
      label: type,
      description: "",
      color: "var(--muted-foreground)",
      sign: 0,
    }
  );
}

const unitLabels: Record<string, string> = {
  UNIDADE: "un",
  UN: "un",
  GRAMA: "g",
  G: "g",
  QUILOGRAMA: "kg",
  KG: "kg",
  MILILITRO: "ml",
  ML: "ml",
  LITRO: "L",
  L: "L",
};

/** "GRAMA" → "g". Unidades desconhecidas passam como vieram, em minúsculas. */
export function unitLabel(unit: string) {
  return unitLabels[unit.toUpperCase()] ?? unit.toLowerCase();
}
