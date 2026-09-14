import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  BookingWithMachine,
  Certification,
  MachineWithWorkshop,
  Profile,
} from "@/lib/types";

/**
 * Lectures du back-office. Aucune clé de service ici : le client porte le JWT
 * de l'administrateur et ce sont les politiques RLS `is_admin()` qui ouvrent
 * l'accès à l'ensemble des lignes. Un membre qui appellerait ces fonctions
 * n'obtiendrait que ses propres données.
 */

export type AdminCertification = Certification & {
  profile: Pick<Profile, "id" | "full_name"> | null;
};

export async function getAdminOverview() {
  const supabase = await createSupabaseServerClient();
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();

  const [members, pendingCertifications, upcoming, weekBookings, machines] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("certifications")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "confirmed")
      .gte("starts_at", new Date().toISOString()),
    supabase.from("bookings").select("credits").gte("created_at", weekAgo),
    supabase.from("machines").select("status"),
  ]);

  const creditsThisWeek = (weekBookings.data ?? []).reduce(
    (total, row) => total + (row.credits as number),
    0,
  );

  return {
    members: members.count ?? 0,
    pendingCertifications: pendingCertifications.count ?? 0,
    upcomingBookings: upcoming.count ?? 0,
    creditsThisWeek,
    machinesTotal: (machines.data ?? []).length,
    machinesInMaintenance: (machines.data ?? []).filter((m) => m.status === "maintenance").length,
  };
}

/**
 * `certifications` porte deux clés étrangères vers `profiles` (user_id et
 * reviewed_by) : sans nommer explicitement la contrainte, PostgREST ne sait pas
 * laquelle joindre et rejette la requête. D'où le `!certifications_user_id_fkey`.
 */
const CERTIFICATION_SELECT = "*, profile:profiles!certifications_user_id_fkey (id, full_name)";

export async function getPendingCertifications(): Promise<AdminCertification[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("certifications")
    .select(CERTIFICATION_SELECT)
    .eq("status", "pending")
    .order("created_at");

  if (error) throw new Error(`Chargement des habilitations impossible : ${error.message}`);

  return (data ?? []) as AdminCertification[];
}

export async function getReviewedCertifications(limit = 10): Promise<AdminCertification[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("certifications")
    .select(CERTIFICATION_SELECT)
    .neq("status", "pending")
    .order("reviewed_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Chargement de l'historique impossible : ${error.message}`);

  return (data ?? []) as AdminCertification[];
}

export type AdminBooking = BookingWithMachine & {
  profile: Pick<Profile, "id" | "full_name"> | null;
};

export async function getAdminBookings({
  status,
  workshop,
  page = 1,
  perPage = 12,
}: { status?: string; workshop?: string; page?: number; perPage?: number } = {}) {
  const supabase = await createSupabaseServerClient();
  const from = (page - 1) * perPage;

  let query = supabase
    .from("bookings")
    .select(
      "*, machine:machines (*, workshop:workshops (slug, name, city)), profile:profiles (id, full_name)",
      { count: "exact" },
    )
    .order("starts_at", { ascending: false })
    .range(from, from + perPage - 1);

  if (status) query = query.eq("status", status);

  const { data, count, error } = await query;

  if (error) throw new Error(`Chargement des réservations impossible : ${error.message}`);

  const bookings = (data ?? []) as AdminBooking[];

  // Le filtre par atelier porte sur une table jointe : plus simple et plus lisible
  // appliqué ici que via un filtre imbriqué PostgREST, le volume restant faible.
  const filtered = workshop
    ? bookings.filter((booking) => booking.machine?.workshop?.slug === workshop)
    : bookings;

  return { bookings: filtered, total: count ?? 0, page, perPage };
}

export async function getAdminMachines(): Promise<MachineWithWorkshop[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("machines")
    .select("*, workshop:workshops (id, slug, name, city)")
    .order("name");

  if (error) throw new Error(`Chargement du parc impossible : ${error.message}`);

  return (data ?? []) as MachineWithWorkshop[];
}

export async function getAdminMembers(search = "") {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("profiles")
    .select("*, workshop:workshops (name, city)")
    .order("created_at", { ascending: false })
    .limit(50);

  if (search) query = query.ilike("full_name", `%${search}%`);

  const { data, error } = await query;

  if (error) throw new Error(`Chargement des membres impossible : ${error.message}`);

  return (data ?? []) as (Profile & { workshop: { name: string; city: string } | null })[];
}
