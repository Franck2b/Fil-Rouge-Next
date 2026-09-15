"use server";

import { requireViewer } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { certificationSchema, fieldErrors, onboardingProfileSchema } from "@/lib/validation";
import { failure, type ActionState } from "@/lib/actions/types";
import { getRequestI18n, redirectTo } from "@/lib/i18n/request";

/**
 * Étape 1 — identité et atelier de rattachement.
 * Persistée immédiatement : si la personne ferme l'onglet, elle reprendra ici
 * avec ses réponses déjà enregistrées.
 */
export async function saveOnboardingProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const [viewer, { locale, t }] = await Promise.all([
    requireViewer("/onboarding"),
    getRequestI18n(),
  ]);

  const parsed = onboardingProfileSchema(t.validation).safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone") ?? "",
    homeWorkshopId: formData.get("homeWorkshopId"),
  });

  if (!parsed.success) {
    return failure(t.actions.checkFields, fieldErrors(parsed.error));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone || null,
      home_workshop_id: parsed.data.homeWorkshopId,
    })
    .eq("id", viewer.userId);

  if (error) return failure(t.actions.saveFailed);

  redirectTo(locale, "/onboarding/habilitation");
}

/**
 * Étape 2 — première demande d'habilitation, puis fin de l'onboarding.
 * C'est cette étape qui bascule `onboarding_completed`, donc qui transforme
 * réellement un compte en membre du produit.
 */
export async function finishOnboardingAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const [viewer, { locale, t }] = await Promise.all([
    requireViewer("/onboarding"),
    getRequestI18n(),
  ]);

  const parsed = certificationSchema(t.validation).safeParse({
    category: formData.get("category"),
    motivation: formData.get("motivation"),
  });

  if (!parsed.success) {
    return failure(t.actions.checkFields, fieldErrors(parsed.error));
  }

  const supabase = await createSupabaseServerClient();

  const { error: certificationError } = await supabase.from("certifications").upsert(
    {
      user_id: viewer.userId,
      category: parsed.data.category,
      motivation: parsed.data.motivation,
      status: "pending",
    },
    { onConflict: "user_id,category" },
  );

  if (certificationError) return failure(t.actions.certificationSaveFailed);

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ onboarding_completed: true })
    .eq("id", viewer.userId);

  if (profileError) return failure(t.actions.onboardingFailed);

  redirectTo(locale, "/tableau-de-bord?bienvenue=1");
}
