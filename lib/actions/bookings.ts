"use server";

import { requireOnboardedViewer } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { bookingSchema, fieldErrors } from "@/lib/validation";
import { failure, success, type ActionState } from "@/lib/actions/types";
import { slotDate } from "@/lib/booking";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { getRequestI18n, redirectTo, revalidateLocalized } from "@/lib/i18n/request";

/** Les erreurs levées par book_machine() sont des codes : on les traduit ici. */
function translateBookingError(message: string, t: Dictionary["actions"]) {
  const codes = Object.keys(t.bookingErrors) as (keyof typeof t.bookingErrors)[];
  const code = codes.find((key) => message.includes(key));
  return code ? t.bookingErrors[code] : t.bookingFailed;
}

export async function createBookingAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const [, { locale, t }] = await Promise.all([requireOnboardedViewer(), getRequestI18n()]);

  const parsed = bookingSchema(t.validation).safeParse({
    machineId: formData.get("machineId"),
    date: formData.get("date"),
    startHour: formData.get("startHour"),
    duration: formData.get("duration"),
    project: formData.get("project") ?? "",
  });

  if (!parsed.success) {
    return failure(t.actions.invalidSlot, fieldErrors(parsed.error));
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

  if (error) return failure(translateBookingError(error.message, t.actions));

  revalidateLocalized("/tableau-de-bord");
  revalidateLocalized("/reservations");
  redirectTo(locale, `/reservations/${data as string}?nouveau=1`);
}

export async function cancelBookingAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const [, { t }] = await Promise.all([requireOnboardedViewer(), getRequestI18n()]);

  const bookingId = String(formData.get("bookingId") ?? "");
  if (!bookingId) return failure(t.actions.bookingNotFound);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("cancel_booking", { p_booking_id: bookingId });

  if (error) {
    if (error.message.includes("NOT_CANCELLABLE")) return failure(t.actions.notCancellable);
    if (error.message.includes("FORBIDDEN")) return failure(t.actions.cancelForbidden);
    return failure(t.actions.cancelFailed);
  }

  revalidateLocalized("/tableau-de-bord");
  revalidateLocalized("/reservations");
  revalidateLocalized(`/reservations/${bookingId}`);

  return success(t.actions.cancelled);
}
