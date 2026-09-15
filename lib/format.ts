import { INTL_LOCALES, type Locale } from "@/lib/i18n/config";
import { plural, type PluralEntry } from "@/lib/i18n/text";

/**
 * Tous les ateliers sont en France : une heure s'affiche toujours à l'heure de
 * Paris, quel que soit le fuseau du serveur. Sans cela, un serveur en UTC
 * (le cas de Vercel) décalerait chaque créneau de une à deux heures.
 */
export const TIME_ZONE = "Europe/Paris";

function formatter(locale: Locale, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(INTL_LOCALES[locale], { timeZone: TIME_ZONE, ...options });
}

export function formatDay(locale: Locale, iso: string) {
  return formatter(locale, { weekday: "long", day: "numeric", month: "long" }).format(new Date(iso));
}

export function formatDateTime(locale: Locale, iso: string) {
  return formatter(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatHour(locale: Locale, iso: string) {
  return formatter(locale, { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

export function formatSlot(locale: Locale, startIso: string, endIso: string) {
  return `${formatDay(locale, startIso)} · ${formatHour(locale, startIso)} – ${formatHour(locale, endIso)}`;
}

export function durationInHours(startIso: string, endIso: string) {
  return Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 3_600_000);
}

/** Mouvement de crédits signé : « +10 crédits », « -3 crédits ». */
export function formatCredits(locale: Locale, entry: PluralEntry, value: number) {
  return `${value > 0 ? "+" : ""}${plural(locale, entry, value)}`;
}
