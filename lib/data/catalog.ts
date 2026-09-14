import { cacheLife, cacheTag } from "next/cache";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import type { Machine, MachineWithWorkshop, Workshop } from "@/lib/types";

/**
 * Catalogue public. Ces données changent rarement (le parc bouge quand un admin
 * l'édite) mais sont lues à chaque visite anonyme : elles sont donc mises en
 * cache et invalidées par tag depuis le back-office, plutôt que par une durée.
 *
 * Tags : "workshops" et "machines" — voir revalidateCatalog() dans lib/data/tags.ts.
 */

export const CATALOG_TAGS = {
  workshops: "workshops",
  machines: "machines",
} as const;

export async function getWorkshops(): Promise<Workshop[]> {
  "use cache";
  cacheTag(CATALOG_TAGS.workshops);
  cacheLife("days");

  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("workshops")
    .select("*")
    .eq("published", true)
    .order("city");

  if (error) throw new Error(`Chargement des ateliers impossible : ${error.message}`);
  return data as Workshop[];
}

export async function getWorkshopBySlug(slug: string): Promise<Workshop | null> {
  "use cache";
  cacheTag(CATALOG_TAGS.workshops);
  cacheLife("days");

  const supabase = createSupabasePublicClient();
  const { data } = await supabase
    .from("workshops")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  return (data as Workshop) ?? null;
}

export async function getMachines(): Promise<MachineWithWorkshop[]> {
  "use cache";
  cacheTag(CATALOG_TAGS.machines);
  cacheLife("hours");

  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("machines")
    .select("*, workshop:workshops (id, slug, name, city)")
    .neq("status", "retired")
    .order("name");

  if (error) throw new Error(`Chargement du parc impossible : ${error.message}`);
  return data as MachineWithWorkshop[];
}

export async function getMachineBySlug(slug: string): Promise<MachineWithWorkshop | null> {
  "use cache";
  cacheTag(CATALOG_TAGS.machines);
  cacheLife("hours");

  const supabase = createSupabasePublicClient();
  const { data } = await supabase
    .from("machines")
    .select("*, workshop:workshops (id, slug, name, city)")
    .eq("slug", slug)
    .maybeSingle();

  return (data as MachineWithWorkshop) ?? null;
}

export async function getMachinesByWorkshop(workshopId: string): Promise<Machine[]> {
  const machines = await getMachines();
  return machines.filter((machine) => machine.workshop_id === workshopId);
}
