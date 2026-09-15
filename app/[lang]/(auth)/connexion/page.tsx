import { Suspense } from "react";
import type { Metadata } from "next";
import { SignInForm } from "@/components/auth/auth-form";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();

  return {
    title: t.auth.signIn.metaTitle,
    description: t.auth.signIn.metaDescription,
    robots: { index: false },
  };
}

type SearchParams = Promise<{ suite?: string }>;

export default async function SignInPage({ searchParams }: { searchParams: SearchParams }) {
  const { t } = await getI18n();

  return (
    <div>
      <p className="label-tech text-kraft">{t.auth.signIn.eyebrow}</p>
      <h1 className="mt-3 text-3xl uppercase">{t.auth.signIn.title}</h1>
      <p className="mt-3 text-sm text-ink-soft">{t.auth.signIn.intro}</p>

      <div className="mt-10">
        <Suspense fallback={<FormSkeleton />}>
          <SignInFormWithRedirect searchParams={searchParams} t={t.auth.form} />
        </Suspense>
      </div>
    </div>
  );
}

/** La destination après connexion vient de l'URL : lecture isolée dans un Suspense. */
async function SignInFormWithRedirect({
  searchParams,
  t,
}: {
  searchParams: SearchParams;
  t: Dictionary["auth"]["form"];
}) {
  const { suite = "" } = await searchParams;
  const safeSuite = suite.startsWith("/") && !suite.startsWith("//") ? suite : "";

  return <SignInForm suite={safeSuite} t={t} />;
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
