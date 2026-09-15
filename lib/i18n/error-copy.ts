import type { Locale } from "@/lib/i18n/config";

/**
 * Textes de la frontière d'erreur, isolés du dictionnaire principal : error.tsx
 * est un Client Component monté par Next.js, sans parent serveur pour lui passer
 * ses traductions. Importer ce petit module coûte quelques octets, là où importer
 * les dictionnaires complets les embarquerait entiers dans le navigateur.
 */
export const ERROR_COPY: Record<
  Locale,
  { eyebrow: string; title: string; text: string; retry: string }
> = {
  fr: {
    eyebrow: "Panne",
    title: "Une pièce a cassé",
    text: "Le chargement a échoué. Vous pouvez relancer l'opération ; si le problème persiste, signalez-le à un référent avec le code ci-dessous.",
    retry: "Réessayer",
  },
  en: {
    eyebrow: "Breakdown",
    title: "A part has broken",
    text: "Loading failed. You can retry the operation; if the problem persists, report it to a supervisor with the code below.",
    retry: "Try again",
  },
};
