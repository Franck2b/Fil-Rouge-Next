import { Logo } from "@/components/logo";
import { requireViewer } from "@/lib/auth";

/**
 * Layout d'onboarding : protégé côté serveur, mais volontairement sans la
 * navigation du produit. Tant que le parcours n'est pas terminé, il n'y a
 * qu'une seule chose à faire.
 */
/** Parcours lié au compte en cours : jamais pré-rendu. */
export const instant = false;

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  await requireViewer("/onboarding");

  return (
    <div className="flex min-h-screen flex-col bg-bone">
      <header className="border-b border-line px-5 py-5">
        <div className="mx-auto max-w-2xl">
          <Logo />
        </div>
      </header>
      <main className="flex-1 px-5 py-14">
        <div className="mx-auto max-w-2xl">{children}</div>
      </main>
    </div>
  );
}
