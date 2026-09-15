import type { MetadataRoute } from "next";
import { localizePath, LOCALES } from "@/lib/i18n/config";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Tout ce qui vit derrière la session n'a rien à faire dans un index. */
const PRIVATE_PATHS = ["/tableau-de-bord", "/reservations", "/reserver", "/habilitations", "/parametres", "/admin", "/onboarding"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: PRIVATE_PATHS.flatMap((path) => LOCALES.map((locale) => localizePath(locale, path))),
    },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
