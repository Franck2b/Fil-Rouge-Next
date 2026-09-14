import { Suspense } from "react";
import type { Metadata } from "next";
import { SignInForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Accédez à votre espace Établi pour gérer vos réservations et vos crédits.",
  robots: { index: false },
};

export default function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ suite?: string }>;
}) {
  return (
    <div>
      <p className="label-tech text-kraft">Votre espace</p>
      <h1 className="mt-3 text-3xl uppercase">Se connecter</h1>
      <p className="mt-3 text-sm text-ink-soft">
        Retrouvez vos créneaux, vos habilitations et le solde de vos crédits.
      </p>

      <div className="mt-10">
        <Suspense fallback={<FormSkeleton />}>
          <SignInFormWithRedirect searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

/** La destination après connexion vient de l'URL : lecture isolée dans un Suspense. */
async function SignInFormWithRedirect({
  searchParams,
}: {
  searchParams: Promise<{ suite?: string }>;
}) {
  const { suite = "" } = await searchParams;
  const safeSuite = suite.startsWith("/") && !suite.startsWith("//") ? suite : "";

  return <SignInForm suite={safeSuite} />;
}

function FormSkeleton() {
  return (
    <div className="space-y-5" aria-hidden>
      <div className="h-16 animate-pulse bg-paper" />
      <div className="h-16 animate-pulse bg-paper" />
      <div className="h-11 animate-pulse bg-paper" />
    </div>
  );
}
