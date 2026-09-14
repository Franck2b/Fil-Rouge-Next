"use server";

import { revalidatePath } from "next/cache";
import { requireOnboardedViewer } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { certificationSchema, fieldErrors } from "@/lib/validation";
import { failure, success, type ActionState } from "@/lib/actions/types";
import type { MachineCategory } from "@/lib/types";

export async function requestCertificationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const viewer = await requireOnboardedViewer();

  const parsed = certificationSchema.safeParse({
    category: formData.get("category"),
    motivation: formData.get("motivation"),
  });

  if (!parsed.success) {
    return failure("Vérifiez les champs signalés.", fieldErrors(parsed.error));
  }

  const supabase = await createSupabaseServerClient();

  // Une habilitation déjà validée ne doit pas repartir en examen.
  const { data: existing } = await supabase
    .from("certifications")
    .select("status")
    .eq("user_id", viewer.userId)
    .eq("category", parsed.data.category)
    .maybeSingle();

  if (existing?.status === "approved") {
    return failure("Vous êtes déjà habilité sur cette famille de machines.");
  }

  if (existing?.status === "pending") {
    return failure("Une demande est déjà en cours d'examen pour cette famille.");
  }

  const { error } = await supabase.from("certifications").upsert(
    {
      user_id: viewer.userId,
      category: parsed.data.category as MachineCategory,
      motivation: parsed.data.motivation,
      status: "pending",
      review_note: null,
      reviewed_at: null,
      reviewed_by: null,
    },
    { onConflict: "user_id,category" },
  );

  if (error) return failure("La demande n'a pas pu être envoyée. Réessayez.");

  revalidatePath("/habilitations");
  revalidatePath("/tableau-de-bord");

  return success("Demande envoyée. Un référent vous répond sous 48 h ouvrées.");
}
