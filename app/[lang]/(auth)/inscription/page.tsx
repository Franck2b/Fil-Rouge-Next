import type { Metadata } from "next";
import { SignUpForm } from "@/components/auth/auth-form";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();

  return {
    title: t.auth.signUp.metaTitle,
    description: t.auth.signUp.metaDescription,
    robots: { index: false },
  };
}

export default async function SignUpPage() {
  const { t } = await getI18n();

  return (
    <div>
      <p className="label-tech text-kraft">{t.auth.signUp.eyebrow}</p>
      <h1 className="mt-3 text-3xl uppercase">{t.auth.signUp.title}</h1>
      <p className="mt-3 text-sm text-ink-soft">{t.auth.signUp.intro}</p>

      <div className="mt-10">
        <SignUpForm t={t.auth.form} />
      </div>

      <p className="mt-8 border-t border-line pt-6 text-xs text-kraft">{t.auth.signUp.terms}</p>
    </div>
  );
}
