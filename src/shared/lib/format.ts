export function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/** R$ sem centavos para eixos e rótulos curtos de gráfico ("R$ 1,2 mil"). */
export function formatCompactBRL(value: number) {
  if (Math.abs(value) < 1000) {
    return `R$ ${Math.round(value).toLocaleString("pt-BR")}`;
  }
  return `R$ ${(value / 1000).toLocaleString("pt-BR", {
    maximumFractionDigits: 1,
  })} mil`;
}

export function formatNumber(value: number, maximumFractionDigits = 0) {
  return value.toLocaleString("pt-BR", { maximumFractionDigits });
}

export function formatPercent(value: number, maximumFractionDigits = 1) {
  return `${value.toLocaleString("pt-BR", {
    maximumFractionDigits,
    minimumFractionDigits: 0,
  })}%`;
}

export function formatDate(value: string) {
  const dateOnly = value.slice(0, 10);
  const [year, month, day] = dateOnly.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Date(year, month - 1, day).toLocaleDateString("pt-BR");
}

export function formatDateTime(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  if (!match) return formatDate(value);
  const [, year, month, day, hour, minute] = match;
  return `${day}/${month}/${year} às ${hour}:${minute}`;
}

/** "YYYY-MM-DD" → Date local (sem deslocamento de fuso). */
export function parseISODate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

/** Date local → "YYYY-MM-DD". */
export function toISODate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const monthShort = new Intl.DateTimeFormat("pt-BR", { month: "short" });

function shortMonth(date: Date) {
  return monthShort.format(date).replace(".", "");
}

/** "1 a 20 de out. de 2026", "28 de set. a 4 de out. de 2026", "20 de out. de 2026". */
export function formatDateRange(start: string, end: string) {
  const a = parseISODate(start);
  const b = parseISODate(end);
  const sameYear = a.getFullYear() === b.getFullYear();
  const sameMonth = sameYear && a.getMonth() === b.getMonth();

  if (start === end) {
    return `${b.getDate()} de ${shortMonth(b)}. de ${b.getFullYear()}`;
  }
  if (sameMonth) {
    return `${a.getDate()} a ${b.getDate()} de ${shortMonth(b)}. de ${b.getFullYear()}`;
  }
  if (sameYear) {
    return `${a.getDate()} de ${shortMonth(a)}. a ${b.getDate()} de ${shortMonth(b)}. de ${b.getFullYear()}`;
  }
  return `${formatDate(start)} a ${formatDate(end)}`;
}

/** Quantidade de dias corridos entre duas datas, inclusiva. */
export function daysBetweenInclusive(start: string, end: string) {
  const ms = parseISODate(end).getTime() - parseISODate(start).getTime();
  return Math.round(ms / 86_400_000) + 1;
}

/** "há 5 min", "há 1 h 20 min". */
export function formatElapsed(fromIso: string, now = Date.now()) {
  const minutes = Math.max(
    0,
    Math.floor((now - new Date(fromIso).getTime()) / 60_000),
  );
  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `há ${hours} h ${rest} min` : `há ${hours} h`;
}
