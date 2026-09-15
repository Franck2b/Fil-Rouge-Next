import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { getI18n, localizedAlternates } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();

  return {
    title: t.faq.metaTitle,
    description: t.faq.metaDescription,
    alternates: await localizedAlternates("/faq"),
  };
}

export default async function FaqPage() {
  const { t } = await getI18n();

  return (
    <div className="mx-auto max-w-4xl px-5 py-16">
      <header>
        <p className="label-tech text-kraft">{t.faq.eyebrow}</p>
        <h1 className="mt-3 text-4xl uppercase sm:text-5xl">{t.faq.title}</h1>
        <p className="mt-5 text-ink-soft">{t.faq.intro}</p>
      </header>

      <dl className="mt-14 border-t border-line">
        {t.faq.items.map((item) => (
          <div key={item.q} className="border-b border-line py-6">
            <dt className="text-lg font-semibold">{item.q}</dt>
            <dd className="mt-3 leading-relaxed text-ink-soft">{item.a}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-14 border border-line bg-paper p-8">
        <h2 className="text-xl uppercase">{t.faq.moreTitle}</h2>
        <p className="mt-3 text-sm text-ink-soft">
          {t.faq.moreTextBefore}{" "}
          <Link href="/equipements" className="text-rust underline underline-offset-4">
            {t.faq.moreLink}
          </Link>{" "}
          {t.faq.moreTextAfter}
        </p>
        <ButtonLink href="/inscription" className="mt-6">
          {t.faq.cta}
        </ButtonLink>
      </div>
    </div>
  );
}
