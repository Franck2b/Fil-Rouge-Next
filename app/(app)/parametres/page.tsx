import type { Metadata } from "next";
import { ProfileForm } from "@/components/settings/settings-forms";
import { requireOnboardedViewer } from "@/lib/auth";

export const metadata: Metadata = { title: "Profil", robots: { index: false } };

export default async function ProfileSettingsPage() {
  const viewer = await requireOnboardedViewer();

  return <ProfileForm profile={viewer.profile} email={viewer.email} />;
}
