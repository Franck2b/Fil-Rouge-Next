"use server";

import { requireOnboardedViewer } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fieldErrors, passwordSchema, preferencesSchema, profileSchema } from "@/lib/validation";
import { failure, success, type ActionState } from "@/lib/actions/types";
import { getRequestI18n, revalidateLocalized } from "@/lib/i18n/request";

export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const [viewer, { t }] = await Promise.all([requireOnboardedViewer(), getRequestI18n()]);

  const parsed = profileSchema(t.validation).safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone") ?? "",
  });

  if (!parsed.success) {
    return failure(t.actions.checkFields, fieldErrors(parsed.error));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.fullName, phone: parsed.data.phone || null })
    .eq("id", viewer.userId);

  if (error) return failure(t.actions.saveFailed);

  // Le nom apparaît dans l'en-tête du layout : il faut revalider tout l'espace.
  revalidateLocalized("/parametres");
  revalidateLocalized("/tableau-de-bord");

  return success(t.actions.profileUpdated);
}

export async function updatePreferencesAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const [viewer, { t }] = await Promise.all([requireOnboardedViewer(), getRequestI18n()]);

  const parsed = preferencesSchema(t.validation).safeParse({
    homeWorkshopId: formData.get("homeWorkshopId"),
    emailNotifications: formData.get("emailNotifications") === "on",
  });

  if (!parsed.success) {
    return failure(t.actions.checkFields, fieldErrors(parsed.error));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      home_workshop_id: parsed.data.homeWorkshopId,
      email_notifications: parsed.data.emailNotifications,
    })
    .eq("id", viewer.userId);

  if (error) return failure(t.actions.saveFailed);

  revalidateLocalized("/parametres/preferences");

  return success(t.actions.preferencesSaved);
}

export async function updatePasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const [, { t }] = await Promise.all([requireOnboardedViewer(), getRequestI18n()]);

  const parsed = passwordSchema(t.validation).safeParse({
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });

  if (!parsed.success) {
    return failure(t.actions.checkFields, fieldErrors(parsed.error));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) return failure(t.actions.passwordFailed);

  return success(t.actions.passwordUpdated);
}
