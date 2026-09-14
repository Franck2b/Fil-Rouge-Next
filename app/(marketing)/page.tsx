import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getMachines, getWorkshops } from "@/lib/data/catalog";
import { CATEGORY_LABELS, MACHINE_CATEGORIES } from "@/lib/types";

export const metadata: Metadata = {
  title: "Réservez une machine dans un atelier partagé",
  description:
    "Découpe laser, impression 3D, CNC, tour à métaux : réservez à l'heure dans un atelier Gabarit à Paris, Lyon ou Nantes. Habilitation encadrée, crédits prépayés, pas d'abonnement.",
  alternates: { canonical: "/" },
};

const STEPS = [
  {
    n: "01",
    title: "Passez votre habilitation",
    text: "Une demande par famille de machines, examinée par un référent de l'atelier. C'est ce qui garantit que personne ne lance une CNC sans savoir l'arrêter.",
  },
  {
    n: "02",
    title: "Choisissez un créneau",
    text: "Le planning affiche les heures réellement libres, machine par machine. Vous voyez le coût en crédits avant de confirmer.",
  },
  {
    n: "03",
    title: "Venez fabriquer",
    text: "Votre réservation fait office de laissez-passer. Un référent est présent sur le plateau pendant toute la plage d'ouverture.",
  },
  {
    n: "04",
    title: "Gardez la trace",
    text: "Chaque session reste dans votre historique avec le projet associé et les crédits consommés.",
  },
];

export default async function HomePage() {
  const [workshops, machines] = await Promise.all([getWorkshops(), getMachines()]);
  const featured = machines.slice(0, 3);

  return (
    <>
      {/* ------------------------------------------------------------ hero */}
      <section className="grid-plan relative overflow-hidden bg-ink text-bone">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
          <div>
            <p className="label-tech text-rust">Réseau d&apos;ateliers partagés · FR</p>
            <h1 className="mt-5 text-5xl leading-[0.95] uppercase sm:text-6xl lg:text-7xl">
              L&apos;atelier
              <br />
              que vous n&apos;avez
              <br />
              <span className="text-rust">pas chez vous.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base text-bone/70">
              Découpeuse laser, CNC bois, tour à métaux, brodeuse industrielle. Vous réservez
              l&apos;heure de machine dont vous avez besoin, dans l&apos;atelier le plus proche,
              sans abonnement et sans acheter un parc que vous utiliserez trois fois.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/inscription">Ouvrir un compte</ButtonLink>
              <ButtonLink href="/equipements" variant="inverse">
                Voir le parc machines
              </ButtonLink>
            </div>

            <dl className="mt-12 grid max-w-md grid-cols-3 gap-px border border-bone/15 bg-bone/15">
              {[
                { k: `${workshops.length}`, v: "ateliers" },
                { k: `${machines.length}`, v: "machines" },
                { k: "10", v: "crédits offerts" },
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
              src="/img/hero.png"
              alt="Vue schématique d'une découpeuse laser en cours de passe sur son plateau"
              width={1600}
              height={1000}
              priority
              className="relative w-full border border-bone/25 object-cover"
            />
            <p className="label-tech absolute -bottom-3 right-3 bg-rust px-2 py-1 text-paper">
              Trotec Speedy 400 · Paris 11
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------- proposition de valeur */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="max-w-2xl">
            <p className="label-tech text-kraft">Comment ça marche</p>
            <h2 className="mt-3 text-3xl uppercase sm:text-4xl">
              Quatre étapes, aucune surprise le jour J
            </h2>
          </div>

          <ol className="mt-12 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <li key={step.n} className="bg-paper p-6">
                <span className="label-tech text-rust">{step.n}</span>
                <h3 className="mt-4 text-lg">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------------- catégories */}
      <section className="border-b border-line bg-paper">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-xl">
              <p className="label-tech text-kraft">Le parc</p>
              <h2 className="mt-3 text-3xl uppercase sm:text-4xl">Six familles de machines</h2>
            </div>
            <Link href="/equipements" className="text-sm text-rust underline underline-offset-4">
              Parcourir les {machines.length} machines
            </Link>
          </div>

          <ul className="mt-12 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {MACHINE_CATEGORIES.map((category) => {
              const count = machines.filter((m) => m.category === category.value).length;
              return (
                <li key={category.value} className="bg-paper">
                  <Link
                    href={`/equipements?categorie=${category.value}`}
                    className="group flex h-full flex-col justify-between p-6 transition-colors hover:bg-bone"
                  >
                    <div>
                      <h3 className="text-xl group-hover:text-rust">{category.label}</h3>
                      <p className="mt-2 text-sm text-ink-soft">{category.blurb}</p>
                    </div>
                    <p className="label-tech mt-8 text-kraft">
                      {count} machine{count > 1 ? "s" : ""}
                    </p>
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
            <p className="label-tech text-kraft">Les lieux</p>
            <h2 className="mt-3 text-3xl uppercase sm:text-4xl">Trois ateliers, un seul compte</h2>
            <p className="mt-4 text-sm text-ink-soft">
              Vos crédits et vos habilitations vous suivent d&apos;un atelier à l&apos;autre.
            </p>
          </div>

          <ul className="mt-12 grid gap-6 md:grid-cols-3">
            {workshops.map((workshop) => (
              <li key={workshop.id} className="border border-line bg-paper">
                <Link href={`/ateliers/${workshop.slug}`} className="group block">
                  <Image
                    src={workshop.image_url ?? "/img/hero.png"}
                    alt={`Plan de l'atelier ${workshop.name}`}
                    width={1200}
                    height={800}
                    className="aspect-[3/2] w-full border-b border-line object-cover"
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
          <p className="label-tech text-kraft">Sélection</p>
          <h2 className="mt-3 text-3xl uppercase sm:text-4xl">Des machines qu&apos;on n&apos;achète pas seul</h2>

          <ul className="mt-12 grid gap-px border border-line bg-line md:grid-cols-3">
            {featured.map((machine) => (
              <li key={machine.id} className="bg-paper">
                <Link href={`/equipements/${machine.slug}`} className="group block h-full p-6">
                  <div className="flex items-start justify-between gap-3">
                    <Badge tone="rust">{CATEGORY_LABELS[machine.category]}</Badge>
                    <span className="label-tech text-kraft">
                      {machine.hourly_credits} cr/h
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg group-hover:text-rust">{machine.name}</h3>
                  <p className="mt-2 text-sm text-ink-soft">{machine.summary}</p>
                  <p className="label-tech mt-6 text-kraft">{machine.workshop?.city}</p>
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
            <h2 className="text-3xl uppercase sm:text-4xl">10 crédits pour votre premier projet</h2>
            <p className="mt-3 max-w-xl text-sm text-paper/80">
              L&apos;ouverture de compte est gratuite. Les crédits offerts couvrent trois heures
              d&apos;impression 3D ou une session de gravure laser.
            </p>
          </div>
          <ButtonLink href="/inscription" variant="onRust" className="shrink-0">
            Créer mon compte
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
