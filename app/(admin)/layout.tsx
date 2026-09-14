import Link from "next/link";
import { Logo } from "@/components/logo";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { signOutAction } from "@/lib/actions/auth";

/**
 * Back-office. Deuxième niveau d'autorisation : requireAdmin() relit le rôle en
 * base à chaque requête. Masquer le lien dans la navigation ne protège rien —
 * c'est cette garde, doublée des politiques RLS `is_admin()`, qui protège.
 *
 * L'identité visuelle est volontairement inversée (fond sombre) : on ne doit
 * jamais confondre l'espace membre et l'espace d'administration.
 */
/** Back-office entièrement dépendant de la session : jamais pré-rendu. */
export const instant = false;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="grid-plan flex min-h-screen flex-col bg-ink text-bone">
      <header className="border-b border-bone/15">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5">
          <div className="flex items-center gap-4">
            <Logo href="/admin" tone="paper" />
            <span className="label-tech border border-rust px-2 py-1 text-rust">Back-office</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-bone/60 sm:block">{admin.profile.full_name}</span>
            <Link href="/tableau-de-bord" className="text-sm text-bone/60 hover:text-bone">
              Espace membre
            </Link>
            <form action={signOutAction}>
              <Button type="submit" variant="ghostInverse" size="sm">
                Déconnexion
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-5 py-8 lg:flex-row lg:gap-10">
        <aside className="lg:w-52 lg:shrink-0">
          <div className="lg:sticky lg:top-8">
            <AdminNav />
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
