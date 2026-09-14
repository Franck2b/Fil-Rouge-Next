import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  BookingWithMachine,
  Certification,
  CreditTransaction,
  MachineCategory,
} from "@/lib/types";

/**
 * Données de l'espace membre. Volontairement NON mises en cache : elles
 * dépendent de la session, changent à chaque action, et les politiques RLS
 * doivent s'appliquer avec le JWT du visiteur.
 */

const BOOKING_SELECT =
  "*, machine:machines (*, workshop:workshops (slug, name, city))";

export async function getUpcomingBookings(userId: string, limit = 5) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_SELECT)
    .eq("user_id", userId)
    .eq("status", "confirmed")
    .gte("ends_at", new Date().toISOString())
    .order("starts_at")
    .limit(limit);

  if (error) throw new Error(`Chargement des créneaux impossible : ${error.message}`);

  return (data ?? []) as BookingWithMachine[];
}

export async function getBookings(
  userId: string,
  { status, page = 1, perPage = 8 }: { status?: string; page?: number; perPage?: number } = {},
) {
  const supabase = await createSupabaseServerClient();
  const from = (page - 1) * perPage;

  let query = supabase
    .from("bookings")
    .select(BOOKING_SELECT, { count: "exact" })
    .eq("user_id", userId)
    .order("starts_at", { ascending: false })
    .range(from, from + perPage - 1);

  if (status) query = query.eq("status", status);

  const { data, count, error } = await query;

  if (error) throw new Error(`Chargement des réservations impossible : ${error.message}`);

  return {
    bookings: (data ?? []) as BookingWithMachine[],
    total: count ?? 0,
    page,
    perPage,
  };
}

export async function getBookingById(bookingId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("bookings")
    .select(BOOKING_SELECT)
    .eq("id", bookingId)
    .maybeSingle();

  return (data as BookingWithMachine) ?? null;
}

export async function getCertifications(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("certifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Chargement des habilitations impossible : ${error.message}`);

  return (data ?? []) as Certification[];
}

export async function getApprovedCategories(userId: string): Promise<MachineCategory[]> {
  const certifications = await getCertifications(userId);
  return certifications.filter((c) => c.status === "approved").map((c) => c.category);
}

export async function getCreditHistory(userId: string, limit = 10) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("credit_transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Chargement des crédits impossible : ${error.message}`);

  return (data ?? []) as CreditTransaction[];
}

/**
 * Créneaux déjà pris sur une machine pour un jour donné.
 * Passe par une fonction SQL security definer : les politiques RLS interdisent
 * de lire les réservations d'autrui, et on ne veut de toute façon exposer que
 * des bornes horaires, jamais l'identité de celui qui occupe le créneau.
 */
export async function getMachineBusySlots(machineId: string, day: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("machine_busy_slots", {
    p_machine_id: machineId,
    p_day: day,
  });

  if (error) throw new Error(`Chargement des disponibilités impossible : ${error.message}`);

  return (data ?? []) as { starts_at: string; ends_at: string }[];
}
