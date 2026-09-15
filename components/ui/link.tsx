"use client";

import NextLink from "next/link";
import { useParams } from "next/navigation";
import type { ComponentProps } from "react";
import { DEFAULT_LOCALE, hasLocale, localizePath } from "@/lib/i18n/config";

/**
 * next/link qui préfixe automatiquement les chemins internes par la langue
 * courante : on écrit href="/equipements", le navigateur reçoit
 * "/en/equipements". Les ancres (#) et les requêtes relatives (?jour=…) ne sont
 * pas touchées.
 *
 * Client Component parce que useParams() est le seul moyen de lire la langue
 * sans la faire passer en prop à chaque lien.
 */
export function Link({ href, ...props }: ComponentProps<typeof NextLink>) {
  const params = useParams<{ lang?: string }>();
  const locale = hasLocale(params.lang) ? params.lang : DEFAULT_LOCALE;
  const localized =
    typeof href === "string" && href.startsWith("/") ? localizePath(locale, href) : href;

  return <NextLink href={localized} {...props} />;
}
