import { PageHeader } from "@/components/app/page-header";
import { SettingsNav } from "@/components/settings/settings-nav";
import { getI18n } from "@/lib/i18n/server";

/**
 * Layout imbriqué dans celui de l'espace membre : il ajoute l'en-tête et les
 * onglets communs, et n'est donc rendu qu'une fois lors d'une navigation entre
 * deux sections des paramètres.
 */
export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const { t } = await getI18n();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={t.app.settings.eyebrow}
        title={t.app.settings.title}
        description={t.app.settings.description}
      />
      <SettingsNav t={t.app.settings} />
      <div className="max-w-2xl">{children}</div>
    </div>
  );
}
