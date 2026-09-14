import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Alert } from "@/components/ui/alert";
import { OnboardingSteps } from "@/components/onboarding/steps";
import { OnboardingCertificationForm } from "@/components/onboarding/onboarding-forms";
import { requireViewer } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Première habilitation",
  robots: { index: false },
};

export default async function OnboardingCertificationPage() {
  const viewer = await requireViewer("/onboarding");

  if (viewer.profile.onboarding_completed) redirect("/tableau-de-bord");

  // L'étape 2 n'a de sens qu'une fois l'étape 1 enregistrée en base.
  if (!viewer.profile.home_workshop_id) redirect("/onboarding");

  return (
    <div>
      <OnboardingSteps current={2} />

      <header className="mt-10">
        <p className="label-tech text-kraft">Étape 2 sur 2</p>
        <h1 className="mt-3 text-3xl uppercase">Sur quoi voulez-vous travailler ?</h1>
        <p className="mt-3 text-ink-soft">
          Chaque famille de machines demande une habilitation. Décrivez votre expérience : un
          référent valide, ou vous propose une prise en main sur place.
        </p>
      </header>

      <div className="mt-8">
        <Alert tone="info">
          Réponse sous 48 h ouvrées. En attendant, vous avez accès à votre espace et au planning.
        </Alert>
      </div>

      <div className="mt-8">
        <OnboardingCertificationForm />
      </div>
    </div>
  );
}
