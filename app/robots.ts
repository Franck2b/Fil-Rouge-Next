import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Tout ce qui vit derrière la session n'a rien à faire dans un index.
      disallow: ["/tableau-de-bord", "/reservations", "/reserver", "/habilitations", "/parametres", "/admin", "/onboarding"],
    },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
