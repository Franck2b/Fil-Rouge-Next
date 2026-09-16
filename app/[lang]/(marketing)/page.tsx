import Image from "next/image";
import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/components/ui/link";
import { CardPhoto } from "@/components/marketing/card-photo";
import { getMachines, getWorkshops } from "@/lib/data/catalog";
import { localizeMachine, localizeWorkshop } from "@/lib/i18n/content";
import { getI18n, localizedAlternates } from "@/lib/i18n/server";
import { fill, plural } from "@/lib/i18n/text";
import { MACHINE_CATEGORY_VALUES } from "@/lib/types";
import { CATEGORY_PHOTOS, PHOTOS, workshopImage } from "@/lib/images";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();

  return {
    title: t.home.metaTitle,
    description: t.home.metaDescription,
    alternates: await localizedAlternates("/"),
  };
}

export default async function HomePage() {
  const [{ locale, t }, workshops, machines] = await Promise.all([
    getI18n(),
    getWorkshops(),
    getMachines(),
  ]);

  const places = workshops.map((workshop) => localizeWorkshop(workshop, locale));
  const featured = machines.slice(0, 3).map((machine) => localizeMachine(machine, locale));

  return (
    <>
      {/* ------------------------------------------------------------ hero */}
      <section className="grid-plan relative overflow-hidden bg-ink text-bone">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
          <div>
            <p className="label-tech text-rust">{t.home.hero.eyebrow}</p>
            <h1 className="mt-5 text-5xl leading-[0.95] uppercase sm:text-6xl lg:text-7xl">
              {t.home.hero.titleLine1}
              <br />
              {t.home.hero.titleLine2}
              <br />
              <span className="text-rust">{t.home.hero.titleAccent}</span>
            </h1>
            <p className="mt-6 max-w-lg text-base text-bone/70">{t.home.hero.text}</p>

            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/inscription">{t.home.hero.primaryCta}</ButtonLink>
              <ButtonLink href="/equipements" variant="inverse">
                {t.home.hero.secondaryCta}
              </ButtonLink>
            </div>

            <dl className="mt-12 grid max-w-md grid-cols-3 gap-px border border-bone/15 bg-bone/15">
              {[
                { k: `${workshops.length}`, v: t.home.hero.statWorkshops },
                { k: `${machines.length}`, v: t.home.hero.statMachines },
                { k: "10", v: t.home.hero.statCredits },
              ].map((stat) => (
                <div key={stat.v} className="bg-ink px-4 py-4">
                  <dt className="font-display text-3xl text-bone">{stat.k}</dt>
                  <dd className="label-tech mt-1 text-kraft">{stat.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="absolute -inset-3 border border-bone/15" aria-hidden />
            <Image
              src={PHOTOS.hero.src}
              alt={t.home.hero.imageAlt}
              width={PHOTOS.hero.width}
              height={PHOTOS.hero.height}
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="relative aspect-[4/3] w-full border border-bone/25 object-cover"
            />
            <p className="label-tech absolute -bottom-3 right-3 bg-rust px-2 py-1 text-paper">
              {t.home.hero.imageCaption}
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------- proposition de valeur */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="max-w-2xl">
            <p className="label-tech text-kraft">{t.home.steps.eyebrow}</p>
            <h2 className="mt-3 text-3xl uppercase sm:text-4xl">{t.home.steps.title}</h2>
          </div>

          <ol className="mt-12 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {t.home.steps.items.map((step, index) => (
              <li key={step.title} className="bg-paper p-6">
                <span className="label-tech text-rust">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 text-lg">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.text}</p>
              </li>
            ))}
          </ol>

          <figure className="mt-12 border border-line bg-paper">
            <Image
              src={PHOTOS.communaute.src}
              alt={t.home.community.imageAlt}
              width={PHOTOS.communaute.width}
              height={PHOTOS.communaute.height}
              sizes="(min-width: 1152px) 1112px, 100vw"
              className="aspect-[21/9] w-full object-cover"
            />
            <figcaption className="border-t border-line px-5 py-4 text-sm text-ink-soft">
              {t.home.community.caption}
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ------------------------------------------------------- catégories */}
      <section className="border-b border-line bg-paper">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-xl">
              <p className="label-tech text-kraft">{t.home.fleet.eyebrow}</p>
              <h2 className="mt-3 text-3xl uppercase sm:text-4xl">{t.home.fleet.title}</h2>
            </div>
            <Link href="/equipements" className="text-sm text-rust underline underline-offset-4">
              {fill(t.home.fleet.browseAll, { count: machines.length })}
            </Link>
          </div>

          <ul className="mt-12 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {MACHINE_CATEGORY_VALUES.map((category) => {
              const count = machines.filter((m) => m.category === category).length;
              return (
                <li key={category} className="bg-paper">
                  <Link
                    href={`/equipements?categorie=${category}`}
                    className="group flex h-full flex-col transition-colors hover:bg-bone"
                  >
                    <CardPhoto
                      photo={CATEGORY_PHOTOS[category]}
                      alt={fill(t.machines.photoAlt, { category: t.categories[category].label })}
                    />
                    <div className="flex flex-1 flex-col justify-between p-6">
                      <div>
                        <h3 className="text-xl group-hover:text-rust">
                          {t.categories[category].label}
                        </h3>
                        <p className="mt-2 text-sm text-ink-soft">{t.categories[category].blurb}</p>
                      </div>
                      <p className="label-tech mt-8 text-kraft">
                        {plural(locale, t.plural.machines, count)}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ---------------------------------------------------------- ateliers */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="max-w-xl">
            <p className="label-tech text-kraft">{t.home.places.eyebrow}</p>
            <h2 className="mt-3 text-3xl uppercase sm:text-4xl">{t.home.places.title}</h2>
            <p className="mt-4 text-sm text-ink-soft">{t.home.places.text}</p>
          </div>

          <ul className="mt-12 grid gap-6 md:grid-cols-3">
            {places.map((workshop) => (
              <li key={workshop.id} className="border border-line bg-paper">
                <Link href={`/ateliers/${workshop.slug}`} className="group block">
                  <CardPhoto
                    photo={workshopImage(workshop)}
                    alt={fill(t.workshops.photoAlt, { name: workshop.name })}
                    className="border-b border-line"
                  />
                  <div className="p-5">
                    <p className="label-tech text-rust">{workshop.city}</p>
                    <h3 className="mt-2 text-xl group-hover:text-rust">{workshop.name}</h3>
                    <p className="mt-2 text-sm text-ink-soft">{workshop.address}</p>
                    <p className="label-tech mt-4 text-kraft">{workshop.opening}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------------- sélection */}
      <section className="border-b border-line bg-paper">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <p className="label-tech text-kraft">{t.home.featured.eyebrow}</p>
          <h2 className="mt-3 text-3xl uppercase sm:text-4xl">{t.home.featured.title}</h2>

          <ul className="mt-12 grid gap-px border border-line bg-line md:grid-cols-3">
            {featured.map((machine) => (
              <li key={machine.id} className="bg-paper">
                <Link href={`/equipements/${machine.slug}`} className="group block h-full">
                  <CardPhoto
                    photo={CATEGORY_PHOTOS[machine.category]}
                    alt={fill(t.machines.photoAlt, { category: t.categories[machine.category].label })}
                  />
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3">
                      <Badge tone="rust">{t.categories[machine.category].label}</Badge>
                      <span className="label-tech text-kraft">
                        {fill(t.common.creditsPerHourShort, { count: machine.hourly_credits })}
                      </span>
                    </div>
                    <h3 className="mt-5 text-lg group-hover:text-rust">{machine.name}</h3>
                    <p className="mt-2 text-sm text-ink-soft">{machine.summary}</p>
                    <p className="label-tech mt-6 text-kraft">{machine.workshop?.city}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* -------------------------------------------------------------- cta */}
      <section className="bg-rust text-paper">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 px-5 py-16 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl uppercase sm:text-4xl">{t.home.cta.title}</h2>
            <p className="mt-3 max-w-xl text-sm text-paper/80">{t.home.cta.text}</p>
          </div>
          <ButtonLink href="/inscription" variant="onRust" className="shrink-0">
            {t.home.cta.button}
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
