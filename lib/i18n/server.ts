import { lang } from "next/root-params";
import {
  DEFAULT_LOCALE,
  hasLocale,
  localizePath,
  LOCALES,
  type Locale,
} from "@/lib/i18n/config";
import { DICTIONARIES } from "@/lib/i18n/dictionaries";

/**
 * Langue et dictionnaire de la page en cours, pour les Server Components.
 *
 * `next/root-params` lit le segment [lang] depuis n'importe quel composant
 * serveur : inutile de faire descendre la langue de prop en prop. Il est en
 * revanche indisponible dans les Server Actions — voir lib/i18n/request.ts.
 */
export async function getI18n() {
  const value = await lang();
  const locale: Locale = hasLocale(value) ? value : DEFAULT_LOCALE;

  return { locale, t: DICTIONARIES[locale] };
}

/** URL canonique et balises hreflang d'une page publique. */
export async function localizedAlternates(path: string) {
  const { locale } = await getI18n();

  const languages = Object.fromEntries(
    LOCALES.map((code) => [code, localizePath(code, path)]),
  ) as Record<Locale, string>;

  return {
    canonical: localizePath(locale, path),
    languages: { ...languages, "x-default": localizePath(DEFAULT_LOCALE, path) },
  };
}
