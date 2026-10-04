export function toTimeInputValue(value: string) {
  return value.slice(0, 5);
}

export function toApiTime(value: string) {
  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) return value;
  if (/^\d{2}:\d{2}$/.test(value)) return `${value}:00`;
  return value;
}

export function formatStoreHours(openingTime: string, closingTime: string) {
  const opening = toTimeInputValue(openingTime);
  const closing = toTimeInputValue(closingTime);
  if (opening === closing) return `${opening}–${closing} (24 h)`;
  if (opening > closing) return `${opening}–${closing} (vira a noite)`;
  return `${opening}–${closing}`;
}
