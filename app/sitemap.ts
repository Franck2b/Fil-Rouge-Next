import type { MetadataRoute } from "next";
import { getMachines, getWorkshops } from "@/lib/data/catalog";
import { localizePath, LOCALES } from "@/lib/i18n/config";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

type Frequency = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

/** Une entrée par langue, chacune déclarant ses équivalents (hreflang). */
function localizedEntries(path: string, priority: number, changeFrequency: Frequency) {
  const languages = Object.fromEntries(
    LOCALES.map((locale) => [locale, `${SITE}${localizePath(locale, path)}`]),
  );

  return LOCALES.map((locale) => ({
    url: `${SITE}${localizePath(locale, path)}`,
    priority,
    changeFrequency,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [workshops, machines] = await Promise.all([getWorkshops(), getMachines()]);

  return [
    ...localizedEntries("/", 1, "monthly"),
    ...localizedEntries("/ateliers", 0.8, "monthly"),
    ...localizedEntries("/equipements", 0.8, "weekly"),
    ...localizedEntries("/tarifs", 0.6, "monthly"),
    ...localizedEntries("/faq", 0.5, "monthly"),
    ...workshops.flatMap((workshop) =>
      localizedEntries(`/ateliers/${workshop.slug}`, 0.7, "monthly"),
    ),
    ...machines.flatMap((machine) =>
      localizedEntries(`/equipements/${machine.slug}`, 0.6, "weekly"),
    ),
  ];
}
