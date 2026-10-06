export function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatDate(value: string) {
  const dateOnly = value.slice(0, 10);
  const [year, month, day] = dateOnly.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Date(year, month - 1, day).toLocaleDateString("pt-BR");
}
