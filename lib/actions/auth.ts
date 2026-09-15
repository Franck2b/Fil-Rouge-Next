"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signInSchema, signUpSchema, fieldErrors } from "@/lib/validation";
import { failure, type ActionState } from "@/lib/actions/types";
import { stripLocale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { getRequestI18n, redirectTo } from "@/lib/i18n/request";

/** Messages Supabase traduits : l'utilisateur ne doit pas lire de message technique. */
function translateAuthError(message: string, t: Dictionary["actions"]) {
  if (message.includes("Invalid login credentials")) return t.invalidCredentials;
  if (message.includes("already registered")) return t.alreadyRegistered;
  if (message.includes("Email not confirmed")) return t.emailNotConfirmed;
  return t.authFailed;
}

export async function signInAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { locale, t } = await getRequestI18n();

  const parsed = signInSchema(t.validation).safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return failure(t.actions.checkFields, fieldErrors(parsed.error));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) return failure(translateAuthError(error.message, t.actions));

  // La destination vient du formulaire, jamais d'une URL arbitraire : on n'accepte
  // qu'un chemin interne pour éviter une redirection ouverte.
  const raw = String(formData.get("suite") ?? "");
  const next = raw.startsWith("/") && !raw.startsWith("//") ? stripLocale(raw) : "/tableau-de-bord";

  redirectTo(locale, next);
}

export async function signUpAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { locale, t } = await getRequestI18n();

  const parsed = signUpSchema(t.validation).safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return failure(t.actions.checkFields, fieldErrors(parsed.error));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.fullName } },
  });

  if (error) return failure(translateAuthError(error.message, t.actions));

  // Le profil est créé par le trigger handle_new_user() : il ne reste qu'à
  // envoyer la personne sur l'onboarding, qui transforme le compte en membre.
  redirectTo(locale, "/onboarding");
}

export async function signOutAction() {
  const { locale } = await getRequestI18n();
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirectTo(locale, "/");
}
