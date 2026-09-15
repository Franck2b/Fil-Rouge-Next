import { INTL_LOCALES, type Locale } from "@/lib/i18n/config";

export type PluralEntry = { one: string; other: string };

/** Remplace les {variables} d'une chaîne du dictionnaire. */
export function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

/**
 * Accorde une chaîne au nombre, selon les règles de la langue : 0 est singulier
 * en français (« 0 machine ») mais pluriel en anglais (« 0 machines »).
 */
export function plural(
  locale: Locale,
  entry: PluralEntry,
  count: number,
  values: Record<string, string | number> = {},
) {
  const rule = new Intl.PluralRules(INTL_LOCALES[locale]).select(Math.abs(count));
  return fill(rule === "one" ? entry.one : entry.other, { count, ...values });
}
