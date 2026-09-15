import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  DEFAULT_LOCALE,
  hasLocale,
  LOCALE_COOKIE,
  localizePath,
  LOCALES,
  type Locale,
} from "@/lib/i18n/config";
import { DICTIONARIES } from "@/lib/i18n/dictionaries";

/**
 * Langue de la requête, pour les Server Actions et les gardes d'accès.
 *
 * `next/root-params` n'y est pas disponible : on lit donc le cookie que
 * proxy.ts aligne sur la langue de l'URL à chaque requête.
 */
export async function getRequestI18n() {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  const locale: Locale = hasLocale(value) ? value : DEFAULT_LOCALE;

  return { locale, t: DICTIONARIES[locale] };
}

/** redirect() vers un chemin interne, préfixé par la langue. */
export function redirectTo(locale: Locale, path: string): never {
  redirect(localizePath(locale, path));
}

/** Une même page existe une fois par langue : on revalide toutes ses versions. */
export function revalidateLocalized(path: string) {
  for (const locale of LOCALES) {
    revalidatePath(localizePath(locale, path));
  }
}
