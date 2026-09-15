import { Logo } from "@/components/logo";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { requireAdmin } from "@/lib/auth";
import { signOutAction } from "@/lib/actions/auth";
import { getI18n } from "@/lib/i18n/server";

/** Back-office entièrement dépendant de la session : jamais pré-rendu. */
export const instant = false;

/**
 * Back-office. Deuxième niveau d'autorisation : requireAdmin() relit le rôle en
 * base à chaque requête. Masquer le lien dans la navigation ne protège rien —
 * c'est cette garde, doublée des politiques RLS `is_admin()`, qui protège.
 *
 * L'identité visuelle est volontairement inversée (fond sombre) : on ne doit
 * jamais confondre l'espace membre et l'espace d'administration.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [admin, { t }] = await Promise.all([requireAdmin(), getI18n()]);

  return (
    <div className="grid-plan flex min-h-screen flex-col bg-ink text-bone">
      <header className="border-b border-bone/15">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5">
          <div className="flex items-center gap-4">
            <Logo href="/admin" tone="paper" />
            <span className="label-tech border border-rust px-2 py-1 text-rust">{t.admin.badge}</span>
          </div>

          <div className="flex items-center gap-4">
            <LocaleSwitcher tone="paper" />
            <span className="hidden text-sm text-bone/60 sm:block">{admin.profile.full_name}</span>
            <Link href="/tableau-de-bord" className="text-sm text-bone/60 hover:text-bone">
              {t.admin.memberSpace}
            </Link>
            <form action={signOutAction}>
              <Button type="submit" variant="ghostInverse" size="sm">
                {t.common.signOut}
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-5 py-8 lg:flex-row lg:gap-10">
        <aside className="lg:w-52 lg:shrink-0">
          <div className="lg:sticky lg:top-8">
            <AdminNav t={t.admin.nav} />
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
