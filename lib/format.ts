const DAY = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" });
const DAY_SHORT = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" });
const DATE_TIME = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const HOUR = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" });

export const formatDay = (iso: string) => DAY.format(new Date(iso));
export const formatDayShort = (iso: string) => DAY_SHORT.format(new Date(iso));
export const formatDateTime = (iso: string) => DATE_TIME.format(new Date(iso));
export const formatHour = (iso: string) => HOUR.format(new Date(iso));

export function formatSlot(startIso: string, endIso: string) {
  return `${formatDay(startIso)} · ${formatHour(startIso)} – ${formatHour(endIso)}`;
}

export function durationInHours(startIso: string, endIso: string) {
  return Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 3_600_000);
}

export function formatCredits(value: number) {
  return `${value > 0 ? "+" : ""}${value} crédit${Math.abs(value) > 1 ? "s" : ""}`;
}

/** Date au format YYYY-MM-DD dans le fuseau local, utilisée par les <input type="date">. */
export function toDateInputValue(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}
