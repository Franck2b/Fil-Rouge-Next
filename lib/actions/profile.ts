"use server";

import { revalidatePath } from "next/cache";
import { requireOnboardedViewer } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fieldErrors, passwordSchema, preferencesSchema, profileSchema } from "@/lib/validation";
import { failure, success, type ActionState } from "@/lib/actions/types";

export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const viewer = await requireOnboardedViewer();

  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone") ?? "",
  });

  if (!parsed.success) {
    return failure("Vérifiez les champs signalés.", fieldErrors(parsed.error));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.fullName, phone: parsed.data.phone || null })
    .eq("id", viewer.userId);

  if (error) return failure("Enregistrement impossible. Réessayez.");

  // Le nom apparaît dans l'en-tête du layout : il faut revalider tout l'espace.
  revalidatePath("/parametres");
  revalidatePath("/tableau-de-bord");

  return success("Profil mis à jour.");
}

export async function updatePreferencesAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const viewer = await requireOnboardedViewer();

  const parsed = preferencesSchema.safeParse({
    homeWorkshopId: formData.get("homeWorkshopId"),
    emailNotifications: formData.get("emailNotifications") === "on",
  });

  if (!parsed.success) {
    return failure("Vérifiez les champs signalés.", fieldErrors(parsed.error));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      home_workshop_id: parsed.data.homeWorkshopId,
      email_notifications: parsed.data.emailNotifications,
    })
    .eq("id", viewer.userId);

  if (error) return failure("Enregistrement impossible. Réessayez.");

  revalidatePath("/parametres/preferences");

  return success("Préférences enregistrées.");
}

export async function updatePasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireOnboardedViewer();

  const parsed = passwordSchema.safeParse({
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });

  if (!parsed.success) {
    return failure("Vérifiez les champs signalés.", fieldErrors(parsed.error));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) return failure("Le mot de passe n'a pas pu être modifié.");

  return success("Mot de passe modifié.");
}
