import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { getMachinesByWorkshop, getWorkshopBySlug, getWorkshops } from "@/lib/data/catalog";
import { localizeMachine, localizeWorkshop } from "@/lib/i18n/content";
import { getI18n, localizedAlternates } from "@/lib/i18n/server";
import { fill, plural } from "@/lib/i18n/text";

type Params = { params: Promise<{ slug: string }> };

/** Les trois ateliers sont connus au build : autant les pré-rendre, dans chaque langue. */
export async function generateStaticParams() {
  const workshops = await getWorkshops();
  return workshops.map((workshop) => ({ slug: workshop.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const [{ slug }, { locale, t }] = await Promise.all([params, getI18n()]);
  const source = await getWorkshopBySlug(slug);

  if (!source) return { title: t.workshops.notFound };

  const workshop = localizeWorkshop(source, locale);

  return {
    title: `${workshop.name} · ${workshop.city}`,
    description: workshop.description,
    alternates: await localizedAlternates(`/ateliers/${workshop.slug}`),
    openGraph: { title: workshop.name, description: workshop.description },
  };
}

export default async function WorkshopPage({ params }: Params) {
  const [{ slug }, { locale, t }] = await Promise.all([params, getI18n()]);
  const source = await getWorkshopBySlug(slug);

  // Un slug inconnu doit rendre un vrai 404, pas une page vide.
  if (!source) notFound();

  const workshop = localizeWorkshop(source, locale);
  const machines = (await getMachinesByWorkshop(workshop.id)).map((machine) =>
    localizeMachine(machine, locale),
  );

  return (
    <article>
      <header className="grid-plan border-b border-line bg-ink text-bone">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-[1fr_420px] lg:items-center">
          <div>
            <nav aria-label={t.common.breadcrumb} className="label-tech text-kraft">
              <Link href="/ateliers" className="hover:text-rust">
                {t.nav.workshops}
              </Link>
              <span className="px-2">/</span>
              <span className="text-bone/70">{workshop.city}</span>
            </nav>
            <h1 className="mt-4 text-4xl uppercase sm:text-5xl">{workshop.name}</h1>
            <p className="mt-5 max-w-xl text-bone/70">{workshop.description}</p>

            <dl className="mt-9 grid gap-px border border-bone/15 bg-bone/15 sm:grid-cols-3">
              <div className="bg-ink px-4 py-4">
                <dt className="label-tech text-kraft">{t.workshops.address}</dt>
                <dd className="mt-2 text-sm text-bone/80">{workshop.address}</dd>
              </div>
              <div className="bg-ink px-4 py-4">
                <dt className="label-tech text-kraft">{t.workshops.opening}</dt>
                <dd className="mt-2 text-sm text-bone/80">{workshop.opening}</dd>
              </div>
              <div className="bg-ink px-4 py-4">
                <dt className="label-tech text-kraft">{t.workshops.machines}</dt>
                <dd className="mt-2 text-sm text-bone/80">
                  {plural(locale, t.workshops.bookable, machines.length)}
                </dd>
              </div>
            </dl>
          </div>

          <Image
            src={workshop.image_url ?? "/img/hero.png"}
            alt={fill(t.workshops.planAlt, { name: workshop.name })}
            width={1200}
            height={800}
            className="w-full border border-bone/25 object-cover"
          />
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-2xl uppercase">{t.workshops.fleetTitle}</h2>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {machines.map((machine) => (
            <li key={machine.id} className="border border-line bg-paper">
              <Link href={`/equipements/${machine.slug}`} className="group block h-full p-6">
                <div className="flex items-start justify-between gap-3">
                  <Badge tone="rust">{t.categories[machine.category].label}</Badge>
                  {machine.status !== "available" ? (
                    <Badge tone="amber">{t.machineStatus[machine.status]}</Badge>
                  ) : null}
                </div>
                <h3 className="mt-5 text-lg group-hover:text-rust">{machine.name}</h3>
                <p className="mt-2 text-sm text-ink-soft">{machine.summary}</p>
                <p className="label-tech mt-6 text-kraft">
                  {plural(locale, t.plural.creditsPerHour, machine.hourly_credits)}
                </p>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-12 flex flex-wrap gap-3">
          <ButtonLink href="/inscription">{t.workshops.bookHere}</ButtonLink>
          <ButtonLink href="/ateliers" variant="secondary">
            {t.workshops.seeOthers}
          </ButtonLink>
        </div>
      </section>
    </article>
  );
}
