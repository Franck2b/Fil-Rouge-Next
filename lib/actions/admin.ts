"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fieldErrors } from "@/lib/validation";
import { revalidateCatalog } from "@/lib/data/tags";
import { failure, success, type ActionState } from "@/lib/actions/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { getRequestI18n, revalidateLocalized } from "@/lib/i18n/request";
import { fill } from "@/lib/i18n/text";

type Messages = Dictionary["validation"];

function reviewSchema(m: Messages) {
  return z.object({
    certificationId: z.uuid(),
    decision: z.enum(["approved", "rejected"]),
    note: z.string().trim().max(280, m.max280).optional().default(""),
  });
}

function machineSchema(m: Messages) {
  return z.object({
    machineId: z.uuid(),
    status: z.enum(["available", "maintenance", "retired"]),
    hourlyCredits: z.coerce.number().int().min(1, m.minCredit).max(20, m.maxCredits),
  });
}

function creditsSchema(m: Messages) {
  return z.object({
    memberId: z.uuid(),
    delta: z.coerce.number().int().refine((value) => value !== 0, m.nonZero),
    reason: z.string().trim().min(3, m.reason),
  });
}

const bookingStatusSchema = z.object({
  bookingId: z.uuid(),
  status: z.enum(["confirmed", "completed", "cancelled"]),
});

/** Arbitrage d'une demande d'habilitation. C'est la décision qui ouvre le planning. */
export async function reviewCertificationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const [admin, { t }] = await Promise.all([requireAdmin(), getRequestI18n()]);

  const parsed = reviewSchema(t.validation).safeParse({
    certificationId: formData.get("certificationId"),
    decision: formData.get("decision"),
    note: formData.get("note") ?? "",
  });

  if (!parsed.success) {
    return failure(t.actions.invalidDecision, fieldErrors(parsed.error));
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

  if (error) return failure(t.actions.decisionFailed);

  revalidateLocalized("/admin");
  revalidateLocalized("/admin/habilitations");

  return success(
    parsed.data.decision === "approved"
      ? t.actions.certificationApproved
      : t.actions.certificationRejected,
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
  const [, { t }] = await Promise.all([requireAdmin(), getRequestI18n()]);

  const parsed = machineSchema(t.validation).safeParse({
    machineId: formData.get("machineId"),
    status: formData.get("status"),
    hourlyCredits: formData.get("hourlyCredits"),
  });

  if (!parsed.success) {
    return failure(t.actions.checkFields, fieldErrors(parsed.error));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("machines")
    .update({ status: parsed.data.status, hourly_credits: parsed.data.hourlyCredits })
    .eq("id", parsed.data.machineId);

  if (error) return failure(t.actions.machineFailed);

  revalidateCatalog();
  revalidateLocalized("/admin/machines");

  return success(t.actions.machineUpdated);
}

/** Créditer ou débiter un membre, en gardant une trace dans l'historique. */
export async function adjustCreditsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const [, { t }] = await Promise.all([requireAdmin(), getRequestI18n()]);

  const parsed = creditsSchema(t.validation).safeParse({
    memberId: formData.get("memberId"),
    delta: formData.get("delta"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return failure(t.actions.checkFields, fieldErrors(parsed.error));
  }

  const supabase = await createSupabaseServerClient();

  const { data: member } = await supabase
    .from("profiles")
    .select("credits_balance")
    .eq("id", parsed.data.memberId)
    .maybeSingle();

  if (!member) return failure(t.actions.memberNotFound);

  const nextBalance = (member.credits_balance as number) + parsed.data.delta;

  if (nextBalance < 0) return failure(t.actions.negativeBalance);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ credits_balance: nextBalance })
    .eq("id", parsed.data.memberId);

  if (updateError) return failure(t.actions.balanceFailed);

  await supabase.from("credit_transactions").insert({
    user_id: parsed.data.memberId,
    delta: parsed.data.delta,
    reason: parsed.data.reason,
  });

  revalidateLocalized("/admin/membres");

  return success(fill(t.actions.balanceAdjusted, { count: nextBalance }));
}

/** Changement d'état d'une réservation depuis le back-office (session honorée, no-show…). */
export async function updateBookingStatusAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const [, { t }] = await Promise.all([requireAdmin(), getRequestI18n()]);

  const parsed = bookingStatusSchema.safeParse({
    bookingId: formData.get("bookingId"),
    status: formData.get("status"),
  });

  if (!parsed.success) return failure(t.actions.invalidStatus);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("bookings")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.bookingId);

  if (error) return failure(t.actions.statusFailed);

  revalidateLocalized("/admin/reservations");
  revalidateLocalized("/admin");

  return success(t.actions.statusUpdated);
}
