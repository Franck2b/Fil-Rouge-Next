"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireOnboardedViewer } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { bookingSchema, fieldErrors } from "@/lib/validation";
import { failure, success, type ActionState } from "@/lib/actions/types";
import { slotDate } from "@/lib/booking";

/** Les erreurs levées par book_machine() sont des codes : on les traduit ici. */
const BOOKING_ERRORS: Record<string, string> = {
  CERTIFICATION_REQUIRED:
    "Votre habilitation pour cette famille de machines n'est pas encore validée.",
  INSUFFICIENT_CREDITS: "Solde de crédits insuffisant pour ce créneau.",
  SLOT_TAKEN: "Ce créneau vient d'être pris. Choisissez-en un autre.",
  SLOT_IN_PAST: "Ce créneau est déjà passé.",
  MACHINE_UNAVAILABLE: "Cette machine est indisponible pour le moment.",
  MACHINE_NOT_FOUND: "Cette machine n'existe plus.",
  INVALID_RANGE: "Durée invalide.",
};

function translateBookingError(message: string) {
  const code = Object.keys(BOOKING_ERRORS).find((key) => message.includes(key));
  return code ? BOOKING_ERRORS[code] : "La réservation a échoué. Réessayez.";
}

export async function createBookingAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireOnboardedViewer();

  const parsed = bookingSchema.safeParse({
    machineId: formData.get("machineId"),
    date: formData.get("date"),
    startHour: formData.get("startHour"),
    duration: formData.get("duration"),
    project: formData.get("project") ?? "",
  });

  if (!parsed.success) {
    return failure("Créneau invalide, reprenez la sélection.", fieldErrors(parsed.error));
  }

  const { machineId, date, startHour, duration, project } = parsed.data;
  const startsAt = slotDate(date, startHour);
  const endsAt = slotDate(date, startHour + duration);

  // Toute la vérification métier (habilitation, solde, chevauchement) est faite
  // en une seule transaction Postgres, pas ici : impossible de la contourner.
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("book_machine", {
    p_machine_id: machineId,
    p_starts_at: startsAt.toISOString(),
    p_ends_at: endsAt.toISOString(),
    p_project: project,
  });

  if (error) return failure(translateBookingError(error.message));

  revalidatePath("/tableau-de-bord");
  revalidatePath("/reservations");
  redirect(`/reservations/${data as string}?nouveau=1`);
}

export async function cancelBookingAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireOnboardedViewer();

  const bookingId = String(formData.get("bookingId") ?? "");
  if (!bookingId) return failure("Réservation introuvable.");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("cancel_booking", { p_booking_id: bookingId });

  if (error) {
    if (error.message.includes("NOT_CANCELLABLE")) {
      return failure("Cette réservation n'est plus annulable.");
    }
    if (error.message.includes("FORBIDDEN")) {
      return failure("Vous ne pouvez pas annuler cette réservation.");
    }
    return failure("L'annulation a échoué. Réessayez.");
  }

  revalidatePath("/tableau-de-bord");
  revalidatePath("/reservations");
  revalidatePath(`/reservations/${bookingId}`);

  return success("Réservation annulée. Les crédits éligibles ont été recrédités.");
}
