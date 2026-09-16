import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { CATEGORY_PHOTOS } from "@/lib/images";
import { getMachineBySlug, getMachines } from "@/lib/data/catalog";
import { localizeMachine } from "@/lib/i18n/content";
import { getI18n, localizedAlternates } from "@/lib/i18n/server";
import { fill } from "@/lib/i18n/text";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const machines = await getMachines();
  return machines.map((machine) => ({ slug: machine.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const [{ slug }, { locale, t }] = await Promise.all([params, getI18n()]);
  const source = await getMachineBySlug(slug);

  if (!source) return { title: t.machines.detail.notFound };

  const machine = localizeMachine(source, locale);

  return {
    title: machine.name,
    description: fill(t.machines.detail.metaDescription, {
      summary: machine.summary,
      city: machine.workshop?.city ?? "—",
      credits: machine.hourly_credits,
    }),
    alternates: await localizedAlternates(`/equipements/${machine.slug}`),
  };
}

export default async function MachinePage({ params }: Params) {
  const [{ slug }, { locale, t }] = await Promise.all([params, getI18n()]);
  const source = await getMachineBySlug(slug);

  if (!source || source.status === "retired") notFound();

  const machine = localizeMachine(source, locale);
  const category = t.categories[machine.category].label;
  const available = machine.status === "available";

  return (
    <article className="mx-auto max-w-6xl px-5 py-16">
      <nav aria-label={t.common.breadcrumb} className="label-tech text-kraft">
        <Link href="/equipements" className="hover:text-rust">
          {t.nav.machines}
        </Link>
        <span className="px-2">/</span>
        <span className="text-ink-soft">{category}</span>
      </nav>

      <div className="mt-6 grid gap-12 lg:grid-cols-[1fr_380px] lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="rust">{category}</Badge>
            <Badge tone={available ? "moss" : "amber"}>{t.machineStatus[machine.status]}</Badge>
          </div>

          <h1 className="mt-5 text-4xl uppercase sm:text-5xl">{machine.name}</h1>
          <p className="mt-4 text-lg text-ink-soft">{machine.summary}</p>

          <Image
            src={CATEGORY_PHOTOS[machine.category].src}
            alt={fill(t.machines.photoAlt, { category })}
            width={CATEGORY_PHOTOS[machine.category].width}
            height={CATEGORY_PHOTOS[machine.category].height}
            priority
            sizes="(min-width: 1024px) 700px, 100vw"
            className="mt-10 aspect-[3/2] w-full border border-line object-cover"
          />

          <div className="mt-10 max-w-2xl">
            <h2 className="text-xl uppercase">{t.machines.detail.capabilities}</h2>
            <p className="mt-3 leading-relaxed text-ink-soft">{machine.description}</p>
          </div>

          <div className="mt-10 max-w-2xl border-l-2 border-rust bg-rust-wash px-5 py-4">
            <p className="label-tech text-rust-dark">{t.machines.detail.certificationTitle}</p>
            <p className="mt-2 text-sm text-ink-soft">
              {fill(t.machines.detail.certificationText, { category })}
            </p>
          </div>
        </div>

        <aside className="border border-line bg-paper p-6 lg:sticky lg:top-24">
          <p className="label-tech text-kraft">{t.machines.detail.pricing}</p>
          <p className="mt-2 font-display text-4xl">
            {machine.hourly_credits}
            <span className="ml-2 text-base font-normal text-ink-soft">
              {t.machines.detail.creditsPerHour}
            </span>
          </p>

          <dl className="mt-6 space-y-3 border-t border-line pt-6 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-kraft">{t.machines.detail.workshop}</dt>
              <dd className="text-right">{machine.workshop?.name ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-kraft">{t.machines.detail.city}</dt>
              <dd>{machine.workshop?.city ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-kraft">{t.machines.detail.family}</dt>
              <dd>{category}</dd>
            </div>
          </dl>

          <div className="mt-8 space-y-3">
            {/* Une machine en maintenance ne doit pas exposer un lien déguisé
                en bouton actif : on rend un bloc inerte, pas un <a>. */}
            {available ? (
              <ButtonLink href={`/reserver/${machine.slug}`} className="w-full">
                {t.machines.detail.book}
              </ButtonLink>
            ) : (
              <p className="border border-line bg-bone px-5 py-2.5 text-center text-sm text-kraft">
                {t.machines.detail.unavailable}
              </p>
            )}
            {machine.workshop ? (
              <ButtonLink
                href={`/ateliers/${machine.workshop.slug}`}
                variant="secondary"
                className="w-full"
              >
                {t.machines.detail.seeWorkshop}
              </ButtonLink>
            ) : null}
          </div>

          <p className="mt-4 text-xs text-kraft">{t.machines.detail.signInNotice}</p>
        </aside>
      </div>
    </article>
  );
}
