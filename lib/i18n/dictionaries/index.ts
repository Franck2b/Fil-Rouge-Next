import type { Locale } from "@/lib/i18n/config";
import { en } from "@/lib/i18n/dictionaries/en";
import { fr, type Dictionary } from "@/lib/i18n/dictionaries/fr";

export type { Dictionary };

/**
 * À n'importer que côté serveur : un Client Component qui importerait cette
 * valeur embarquerait les deux dictionnaires dans le JavaScript du navigateur.
 * Les Client Components reçoivent leur tranche de dictionnaire en props.
 */
export const DICTIONARIES: Record<Locale, Dictionary> = { fr, en };
