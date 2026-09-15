import type { Metadata } from "next";
import { PreferencesForm } from "@/components/settings/settings-forms";
import { requireOnboardedViewer } from "@/lib/auth";
import { getWorkshops } from "@/lib/data/catalog";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.app.settings.tabPreferences, robots: { index: false } };
}

export default async function PreferencesSettingsPage() {
  const [viewer, workshops, { t }] = await Promise.all([
    requireOnboardedViewer(),
    getWorkshops(),
    getI18n(),
  ]);

  return <PreferencesForm profile={viewer.profile} workshops={workshops} t={t.app.settings.form} />;
}
