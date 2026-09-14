"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signInSchema, signUpSchema, fieldErrors } from "@/lib/validation";
import { failure, type ActionState } from "@/lib/actions/types";

/** Messages Supabase traduits : l'utilisateur ne doit pas lire d'anglais technique. */
function translateAuthError(message: string) {
  if (message.includes("Invalid login credentials")) return "E-mail ou mot de passe incorrect.";
  if (message.includes("already registered")) return "Un compte existe déjà avec cet e-mail.";
  if (message.includes("Email not confirmed")) return "Confirmez votre e-mail avant de vous connecter.";
  return "La demande a échoué. Réessayez dans un instant.";
}

export async function signInAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return failure("Vérifiez les champs signalés.", fieldErrors(parsed.error));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) return failure(translateAuthError(error.message));

  // La destination vient du formulaire, jamais d'une URL arbitraire : on n'accepte
  // qu'un chemin interne pour éviter une redirection ouverte.
  const raw = String(formData.get("suite") ?? "");
  const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/tableau-de-bord";

  redirect(next);
}

export async function signUpAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return failure("Vérifiez les champs signalés.", fieldErrors(parsed.error));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.fullName } },
  });

  if (error) return failure(translateAuthError(error.message));

  // Le profil est créé par le trigger handle_new_user() : il ne reste qu'à
  // envoyer la personne sur l'onboarding, qui transforme le compte en membre.
  redirect("/onboarding");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
