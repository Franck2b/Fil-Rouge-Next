import type { MetadataRoute } from "next";
import { getMachines, getWorkshops } from "@/lib/data/catalog";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [workshops, machines] = await Promise.all([getWorkshops(), getMachines()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, priority: 1, changeFrequency: "monthly" },
    { url: `${SITE}/ateliers`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${SITE}/equipements`, priority: 0.8, changeFrequency: "weekly" },
    { url: `${SITE}/tarifs`, priority: 0.6, changeFrequency: "monthly" },
    { url: `${SITE}/faq`, priority: 0.5, changeFrequency: "monthly" },
  ];

  return [
    ...staticRoutes,
    ...workshops.map((workshop) => ({
      url: `${SITE}/ateliers/${workshop.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...machines.map((machine) => ({
      url: `${SITE}/equipements/${machine.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
