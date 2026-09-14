import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export type Viewer = {
  userId: string;
  email: string;
  profile: Profile;
};

/**
 * Lit la session côté serveur. `getUser()` et non `getSession()` : la première
 * revalide le JWT auprès de Supabase, la seconde se contente de lire un cookie
 * qui pourrait avoir été forgé.
 */
export async function getViewer(): Promise<Viewer | null> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  if (!profile) return null;

  return { userId: user.id, email: user.email ?? "", profile };
}

/** Garde des routes authentifiées. Renvoie vers la connexion en conservant la destination. */
export async function requireViewer(nextPath?: string): Promise<Viewer> {
  const viewer = await getViewer();

  if (!viewer) {
    redirect(nextPath ? `/connexion?suite=${encodeURIComponent(nextPath)}` : "/connexion");
  }

  return viewer;
}

/** Garde des routes du produit : un compte sans onboarding n'est pas encore un utilisateur. */
export async function requireOnboardedViewer(nextPath?: string): Promise<Viewer> {
  const viewer = await requireViewer(nextPath);

  if (!viewer.profile.onboarding_completed) {
    redirect("/onboarding");
  }

  return viewer;
}

/** Garde du back-office. Le rôle est relu en base à chaque requête, jamais depuis le client. */
export async function requireAdmin(): Promise<Viewer> {
  const viewer = await requireViewer("/admin");

  if (viewer.profile.role !== "admin") {
    redirect("/tableau-de-bord?erreur=acces-refuse");
  }

  return viewer;
}
