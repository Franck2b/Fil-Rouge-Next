"use client";

import NextLink from "next/link";
import { Suspense } from "react";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import {
  DEFAULT_LOCALE,
  hasLocale,
  localizePath,
  LOCALES,
  stripLocale,
  type Locale,
} from "@/lib/i18n/config";

/**
 * Le libellé est rédigé dans la langue de destination (« Switch to English »
 * sur la version française) : c'est à la personne qui cherche cette langue
 * qu'il s'adresse. Il ne dépend donc pas du dictionnaire de la page.
 */
const SWITCH_LABELS: Record<Locale, string> = {
  fr: "Passer en français",
  en: "Switch to English",
};

type Tone = "ink" | "paper";

/**
 * Bascule FR / EN en conservant la page et ses paramètres (?jour=…) : changer
 * de langue au milieu d'une réservation ne fait pas perdre l'étape en cours.
 *
 * useSearchParams() impose un <Suspense> sur une page pré-rendue ; le repli
 * affiche la même bascule, simplement sans les paramètres de requête.
 */
export function LocaleSwitcher({ tone = "ink" }: { tone?: Tone }) {
  return (
    <Suspense fallback={<SwitcherLink tone={tone} search="" />}>
      <SwitcherWithSearch tone={tone} />
    </Suspense>
  );
}

function SwitcherWithSearch({ tone }: { tone: Tone }) {
  const search = useSearchParams().toString();
  return <SwitcherLink tone={tone} search={search} />;
}

function SwitcherLink({ tone, search }: { tone: Tone; search: string }) {
  const pathname = usePathname();
  const params = useParams<{ lang?: string }>();
  const current = hasLocale(params.lang) ? params.lang : DEFAULT_LOCALE;
  const target = LOCALES.find((locale) => locale !== current) ?? DEFAULT_LOCALE;

  const path = localizePath(target, stripLocale(pathname));
  const href = search ? `${path}?${search}` : path;

  const frame = tone === "paper" ? "border-bone/25" : "border-line";
  const active = tone === "paper" ? "bg-bone text-ink" : "bg-ink text-paper";
  const idle = tone === "paper" ? "text-bone/60" : "text-kraft";

  return (
    <NextLink
      href={href}
      hrefLang={target}
      lang={target}
      aria-label={SWITCH_LABELS[target]}
      title={SWITCH_LABELS[target]}
      className={`label-tech inline-flex shrink-0 items-center border p-0.5 transition-colors hover:border-rust ${frame}`}
    >
      {LOCALES.map((locale) => (
        <span
          key={locale}
          aria-hidden
          className={`px-2 py-1 ${locale === current ? active : idle}`}
        >
          {locale.toUpperCase()}
        </span>
      ))}
    </NextLink>
  );
}
