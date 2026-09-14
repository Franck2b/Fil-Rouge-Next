import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { OnboardingSteps } from "@/components/onboarding/steps";
import { OnboardingProfileForm } from "@/components/onboarding/onboarding-forms";
import { requireViewer } from "@/lib/auth";
import { getWorkshops } from "@/lib/data/catalog";

export const metadata: Metadata = {
  title: "Bienvenue",
  robots: { index: false },
};

export default async function OnboardingPage() {
  const viewer = await requireViewer("/onboarding");

  // Un compte déjà finalisé n'a plus rien à faire ici.
  if (viewer.profile.onboarding_completed) redirect("/tableau-de-bord");

  const workshops = await getWorkshops();

  return (
    <div>
      <OnboardingSteps current={1} />

      <header className="mt-10">
        <p className="label-tech text-kraft">Étape 1 sur 2</p>
        <h1 className="mt-3 text-3xl uppercase">Qui fabrique ?</h1>
        <p className="mt-3 text-ink-soft">
          Ces informations servent à vous identifier à l&apos;accueil de l&apos;atelier et à
          pré-remplir vos réservations. Elles restent modifiables dans vos paramètres.
        </p>
      </header>

      <div className="mt-10">
        <OnboardingProfileForm profile={viewer.profile} workshops={workshops} />
      </div>
    </div>
  );
}
