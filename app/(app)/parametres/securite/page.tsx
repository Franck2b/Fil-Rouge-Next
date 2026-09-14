import type { Metadata } from "next";
import { Alert } from "@/components/ui/alert";
import { PasswordForm } from "@/components/settings/settings-forms";
import { requireOnboardedViewer } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Sécurité", robots: { index: false } };

export default async function SecuritySettingsPage() {
  const viewer = await requireOnboardedViewer();

  return (
    <div className="space-y-8">
      <Alert tone="info">
        Compte ouvert le {formatDateTime(viewer.profile.created_at)} — rôle{" "}
        {viewer.profile.role === "admin" ? "administrateur" : "membre"}.
      </Alert>
      <PasswordForm />
    </div>
  );
}
