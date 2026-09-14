"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fieldErrors } from "@/lib/validation";
import { revalidateCatalog } from "@/lib/data/tags";
import { failure, success, type ActionState } from "@/lib/actions/types";

const reviewSchema = z.object({
  certificationId: z.uuid(),
  decision: z.enum(["approved", "rejected"]),
  note: z.string().trim().max(280, "280 caractères maximum.").optional().default(""),
});

const machineSchema = z.object({
  machineId: z.uuid(),
  status: z.enum(["available", "maintenance", "retired"]),
  hourlyCredits: z.coerce.number().int().min(1, "Minimum 1 crédit.").max(20, "Maximum 20 crédits."),
});

const creditsSchema = z.object({
  memberId: z.uuid(),
  delta: z.coerce.number().int().refine((value) => value !== 0, "Indiquez un montant non nul."),
  reason: z.string().trim().min(3, "Précisez un motif."),
});

const bookingStatusSchema = z.object({
  bookingId: z.uuid(),
  status: z.enum(["confirmed", "completed", "cancelled"]),
});

/** Arbitrage d'une demande d'habilitation. C'est la décision qui ouvre le planning. */
export async function reviewCertificationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();

  const parsed = reviewSchema.safeParse({
    certificationId: formData.get("certificationId"),
    decision: formData.get("decision"),
    note: formData.get("note") ?? "",
  });

  if (!parsed.success) {
    return failure("Décision invalide.", fieldErrors(parsed.error));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("certifications")
    .update({
      status: parsed.data.decision,
      review_note: parsed.data.note || null,
      reviewed_by: admin.userId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.certificationId);

  if (error) return failure("La décision n'a pas pu être enregistrée.");

  revalidatePath("/admin");
  revalidatePath("/admin/habilitations");

  return success(
    parsed.data.decision === "approved" ? "Habilitation validée." : "Demande refusée.",
  );
}

/**
 * Édition d'une machine du parc.
 * Le catalogue public est mis en cache : sans revalidateCatalog(), une machine
 * passée en maintenance continuerait d'apparaître disponible sur la vitrine.
 */
export async function updateMachineAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = machineSchema.safeParse({
    machineId: formData.get("machineId"),
    status: formData.get("status"),
    hourlyCredits: formData.get("hourlyCredits"),
  });

  if (!parsed.success) {
    return failure("Vérifiez les champs signalés.", fieldErrors(parsed.error));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("machines")
    .update({ status: parsed.data.status, hourly_credits: parsed.data.hourlyCredits })
    .eq("id", parsed.data.machineId);

  if (error) return failure("La machine n'a pas pu être modifiée.");

  revalidateCatalog();
  revalidatePath("/admin/machines");

  return success("Machine mise à jour. Le catalogue public est actualisé.");
}

/** Créditer ou débiter un membre, en gardant une trace dans l'historique. */
export async function adjustCreditsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = creditsSchema.safeParse({
    memberId: formData.get("memberId"),
    delta: formData.get("delta"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return failure("Vérifiez les champs signalés.", fieldErrors(parsed.error));
  }

  const supabase = await createSupabaseServerClient();

  const { data: member } = await supabase
    .from("profiles")
    .select("credits_balance")
    .eq("id", parsed.data.memberId)
    .maybeSingle();

  if (!member) return failure("Membre introuvable.");

  const nextBalance = (member.credits_balance as number) + parsed.data.delta;

  if (nextBalance < 0) return failure("Le solde ne peut pas devenir négatif.");

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ credits_balance: nextBalance })
    .eq("id", parsed.data.memberId);

  if (updateError) return failure("Le solde n'a pas pu être modifié.");

  await supabase.from("credit_transactions").insert({
    user_id: parsed.data.memberId,
    delta: parsed.data.delta,
    reason: parsed.data.reason,
  });

  revalidatePath("/admin/membres");

  return success(`Solde ajusté : ${nextBalance} crédits.`);
}

/** Changement d'état d'une réservation depuis le back-office (session honorée, no-show…). */
export async function updateBookingStatusAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = bookingStatusSchema.safeParse({
    bookingId: formData.get("bookingId"),
    status: formData.get("status"),
  });

  if (!parsed.success) return failure("Statut invalide.");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("bookings")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.bookingId);

  if (error) return failure("Le statut n'a pas pu être modifié.");

  revalidatePath("/admin/reservations");
  revalidatePath("/admin");

  return success("Statut mis à jour.");
}
