import type { Metadata } from "next";
import { Alert } from "@/components/ui/alert";
import { PasswordForm } from "@/components/settings/settings-forms";
import { requireOnboardedViewer } from "@/lib/auth";
import { getI18n } from "@/lib/i18n/server";
import { fill } from "@/lib/i18n/text";
import { formatDateTime } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.app.settings.tabSecurity, robots: { index: false } };
}

export default async function SecuritySettingsPage() {
  const [viewer, { locale, t }] = await Promise.all([requireOnboardedViewer(), getI18n()]);
  const copy = t.app.settings;

  return (
    <div className="space-y-8">
      <Alert tone="info">
        {fill(copy.accountOpened, {
          date: formatDateTime(locale, viewer.profile.created_at),
          role: viewer.profile.role === "admin" ? copy.roleAdmin : copy.roleMember,
        })}
      </Alert>
      <PasswordForm t={copy.form} />
    </div>
  );
}
