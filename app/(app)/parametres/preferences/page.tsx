import type { Metadata } from "next";
import { PreferencesForm } from "@/components/settings/settings-forms";
import { requireOnboardedViewer } from "@/lib/auth";
import { getWorkshops } from "@/lib/data/catalog";

export const metadata: Metadata = { title: "Préférences", robots: { index: false } };

export default async function PreferencesSettingsPage() {
  const [viewer, workshops] = await Promise.all([requireOnboardedViewer(), getWorkshops()]);

  return <PreferencesForm profile={viewer.profile} workshops={workshops} />;
}
