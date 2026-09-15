import { Logo } from "@/components/logo";
import { AppNav } from "@/components/app/app-nav";
import { CreditBadge } from "@/components/app/credit-badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { requireOnboardedViewer } from "@/lib/auth";
import { signOutAction } from "@/lib/actions/auth";
import { getI18n } from "@/lib/i18n/server";

/**
 * Aucune de ces pages ne peut être pré-rendue : toutes dépendent de la session
 * en cours. On le déclare explicitement plutôt que d'envelopper artificiellement
 * chaque lecture de cookie dans un <Suspense> qui n'afficherait rien d'utile.
 */
export const instant = false;

/**
 * Layout de l'espace authentifié.
 * La garde est ici, côté serveur : aucun enfant de ce layout ne peut être rendu
 * sans session valide et onboarding terminé. proxy.ts ne fait qu'éviter
 * l'aller-retour, il ne remplace pas cette vérification.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [viewer, { t }] = await Promise.all([requireOnboardedViewer(), getI18n()]);
  const isAdmin = viewer.profile.role === "admin";

  return (
    <div className="flex min-h-screen flex-col bg-bone">
      <header className="sticky top-0 z-30 border-b border-line bg-bone/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5">
          <Logo href="/tableau-de-bord" />

          <div className="flex items-center gap-3">
            <LocaleSwitcher />
            <CreditBadge credits={viewer.profile.credits_balance} />
            <Link
              href="/parametres"
              className="hidden text-sm text-ink-soft hover:text-ink sm:block"
            >
              {viewer.profile.full_name || viewer.email}
            </Link>
            <form action={signOutAction}>
              <Button type="submit" variant="ghost" size="sm">
                {t.common.signOut}
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-5 py-8 lg:flex-row lg:gap-12">
        <aside className="lg:w-56 lg:shrink-0">
          <div className="lg:sticky lg:top-24">
            <AppNav isAdmin={isAdmin} t={t.app.nav} />
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
