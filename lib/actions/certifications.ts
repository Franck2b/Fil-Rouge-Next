"use server";

import { requireOnboardedViewer } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { certificationSchema, fieldErrors } from "@/lib/validation";
import { failure, success, type ActionState } from "@/lib/actions/types";
import { getRequestI18n, revalidateLocalized } from "@/lib/i18n/request";

export async function requestCertificationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const [viewer, { t }] = await Promise.all([requireOnboardedViewer(), getRequestI18n()]);

  const parsed = certificationSchema(t.validation).safeParse({
    category: formData.get("category"),
    motivation: formData.get("motivation"),
  });

  if (!parsed.success) {
    return failure(t.actions.checkFields, fieldErrors(parsed.error));
  }

  const supabase = await createSupabaseServerClient();

  // Une habilitation déjà validée ne doit pas repartir en examen.
  const { data: existing } = await supabase
    .from("certifications")
    .select("status")
    .eq("user_id", viewer.userId)
    .eq("category", parsed.data.category)
    .maybeSingle();

  if (existing?.status === "approved") return failure(t.actions.alreadyCertified);
  if (existing?.status === "pending") return failure(t.actions.certificationPending);

  const { error } = await supabase.from("certifications").upsert(
    {
      user_id: viewer.userId,
      category: parsed.data.category,
      motivation: parsed.data.motivation,
      status: "pending",
      review_note: null,
      reviewed_at: null,
      reviewed_by: null,
    },
    { onConflict: "user_id,category" },
  );

  if (error) return failure(t.actions.certificationFailed);

  revalidateLocalized("/habilitations");
  revalidateLocalized("/tableau-de-bord");

  return success(t.actions.certificationSent);
}
