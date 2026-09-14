import { PageHeader } from "@/components/app/page-header";
import { SettingsNav } from "@/components/settings/settings-nav";

/**
 * Layout imbriqué dans celui de l'espace membre : il ajoute l'en-tête et les
 * onglets communs, et n'est donc rendu qu'une fois lors d'une navigation entre
 * deux sections des paramètres.
 */
export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Compte"
        title="Paramètres"
        description="Vos informations, votre atelier de rattachement, votre mot de passe et vos crédits."
      />
      <SettingsNav />
      <div className="max-w-2xl">{children}</div>
    </div>
  );
}
