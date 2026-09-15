import type { Metadata } from "next";
import { ProfileForm } from "@/components/settings/settings-forms";
import { requireOnboardedViewer } from "@/lib/auth";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.app.settings.tabProfile, robots: { index: false } };
}

export default async function ProfileSettingsPage() {
  const [viewer, { t }] = await Promise.all([requireOnboardedViewer(), getI18n()]);

  return <ProfileForm profile={viewer.profile} email={viewer.email} t={t.app.settings.form} />;
}
