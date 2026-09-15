/**
 * Configuration des langues. Aucun import serveur ici : ce module est partagé
 * par proxy.ts, les Server Components et les Client Components.
 */
export const LOCALES = ["fr", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "fr";

/** Cookie tenu à jour par proxy.ts, lu là où le segment [lang] est inaccessible. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const INTL_LOCALES: Record<Locale, string> = {
  fr: "fr-FR",
  en: "en-GB",
};

export function hasLocale(value: string | undefined): value is Locale {
  return LOCALES.includes(value as Locale);
}

const LOCALE_PREFIX = new RegExp(`^/(${LOCALES.join("|")})(?=/|\\?|#|$)`);

/** "/en/equipements" → "/equipements" */
export function stripLocale(path: string) {
  const stripped = path.replace(LOCALE_PREFIX, "");
  return stripped.startsWith("/") ? stripped : `/${stripped}`;
}

/** "/equipements" → "/fr/equipements" (un préfixe existant est remplacé, jamais doublé) */
export function localizePath(locale: Locale, path: string) {
  const stripped = stripLocale(path);
  return stripped === "/" ? `/${locale}` : `/${locale}${stripped}`;
}
