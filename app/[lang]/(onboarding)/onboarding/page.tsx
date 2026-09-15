import type { Metadata } from "next";
import { OnboardingSteps } from "@/components/onboarding/steps";
import { OnboardingProfileForm } from "@/components/onboarding/onboarding-forms";
import { requireViewer } from "@/lib/auth";
import { getWorkshops } from "@/lib/data/catalog";
import { redirectTo } from "@/lib/i18n/request";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.onboarding.profile.metaTitle, robots: { index: false } };
}

export default async function OnboardingPage() {
  const [viewer, { locale, t }] = await Promise.all([requireViewer("/onboarding"), getI18n()]);

  // Un compte déjà finalisé n'a plus rien à faire ici.
  if (viewer.profile.onboarding_completed) redirectTo(locale, "/tableau-de-bord");

  const workshops = await getWorkshops();

  return (
    <div>
      <OnboardingSteps current={1} />

      <header className="mt-10">
        <p className="label-tech text-kraft">{t.onboarding.profile.eyebrow}</p>
        <h1 className="mt-3 text-3xl uppercase">{t.onboarding.profile.title}</h1>
        <p className="mt-3 text-ink-soft">{t.onboarding.profile.text}</p>
      </header>

      <div className="mt-10">
        <OnboardingProfileForm
          profile={viewer.profile}
          workshops={workshops}
          t={t.onboarding.form}
          savingLabel={t.common.saving}
        />
      </div>
    </div>
  );
}
