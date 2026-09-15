"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { DEFAULT_LOCALE, hasLocale } from "@/lib/i18n/config";
import { ERROR_COPY } from "@/lib/i18n/error-copy";

/**
 * Frontière d'erreur globale. Obligatoirement un Client Component : React doit
 * pouvoir la remonter côté navigateur et proposer un reset sans rechargement.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams<{ lang?: string }>();
  const copy = ERROR_COPY[hasLocale(params.lang) ? params.lang : DEFAULT_LOCALE];

  useEffect(() => {
    // En production, cet endroit est le bon pour pousser vers un collecteur d'erreurs.
    console.error(error);
  }, [error]);

  return (
    <div className="grid-plan flex min-h-screen flex-col items-center justify-center bg-ink px-5 text-center text-bone">
      <Logo tone="paper" />
      <p className="label-tech mt-12 text-rust">{copy.eyebrow}</p>
      <h1 className="mt-4 max-w-lg text-4xl uppercase sm:text-5xl">{copy.title}</h1>
      <p className="mt-5 max-w-md text-bone/70">{copy.text}</p>
      {error.digest ? (
        <p className="label-tech mt-6 border border-bone/20 px-3 py-2 text-kraft">
          digest {error.digest}
        </p>
      ) : null}
      <Button onClick={reset} className="mt-9">
        {copy.retry}
      </Button>
    </div>
  );
}
