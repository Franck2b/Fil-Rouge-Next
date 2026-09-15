import type { Metadata } from "next";
import { Alert } from "@/components/ui/alert";
import { OnboardingSteps } from "@/components/onboarding/steps";
import { OnboardingCertificationForm } from "@/components/onboarding/onboarding-forms";
import { requireViewer } from "@/lib/auth";
import { redirectTo } from "@/lib/i18n/request";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.onboarding.certification.metaTitle, robots: { index: false } };
}

export default async function OnboardingCertificationPage() {
  const [viewer, { locale, t }] = await Promise.all([requireViewer("/onboarding"), getI18n()]);

  if (viewer.profile.onboarding_completed) redirectTo(locale, "/tableau-de-bord");

  // L'étape 2 n'a de sens qu'une fois l'étape 1 enregistrée en base.
  if (!viewer.profile.home_workshop_id) redirectTo(locale, "/onboarding");

  return (
    <div>
      <OnboardingSteps current={2} />

      <header className="mt-10">
        <p className="label-tech text-kraft">{t.onboarding.certification.eyebrow}</p>
        <h1 className="mt-3 text-3xl uppercase">{t.onboarding.certification.title}</h1>
        <p className="mt-3 text-ink-soft">{t.onboarding.certification.text}</p>
      </header>

      <div className="mt-8">
        <Alert tone="info">{t.onboarding.certification.notice}</Alert>
      </div>

      <div className="mt-8">
        <OnboardingCertificationForm
          t={t.onboarding.form}
          categories={t.categories}
          sendingLabel={t.common.sending}
        />
      </div>
    </div>
  );
}
