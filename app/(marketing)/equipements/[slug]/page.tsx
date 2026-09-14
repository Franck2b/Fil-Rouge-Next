import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { getMachineBySlug, getMachines } from "@/lib/data/catalog";
import { CATEGORY_LABELS, MACHINE_STATUS_LABELS } from "@/lib/types";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const machines = await getMachines();
  return machines.map((machine) => ({ slug: machine.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const machine = await getMachineBySlug(slug);

  if (!machine) return { title: "Machine introuvable" };

  return {
    title: machine.name,
    description: `${machine.summary} Réservable ${machine.workshop ? `à ${machine.workshop.city}` : ""} pour ${machine.hourly_credits} crédits l'heure.`,
    alternates: { canonical: `/equipements/${machine.slug}` },
  };
}

export default async function MachinePage({ params }: Params) {
  const { slug } = await params;
  const machine = await getMachineBySlug(slug);

  if (!machine || machine.status === "retired") notFound();

  const available = machine.status === "available";

  return (
    <article className="mx-auto max-w-6xl px-5 py-16">
      <nav aria-label="Fil d'ariane" className="label-tech text-kraft">
        <Link href="/equipements" className="hover:text-rust">
          Équipements
        </Link>
        <span className="px-2">/</span>
        <span className="text-ink-soft">{CATEGORY_LABELS[machine.category]}</span>
      </nav>

      <div className="mt-6 grid gap-12 lg:grid-cols-[1fr_380px] lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="rust">{CATEGORY_LABELS[machine.category]}</Badge>
            <Badge tone={available ? "moss" : "amber"}>
              {MACHINE_STATUS_LABELS[machine.status]}
            </Badge>
          </div>

          <h1 className="mt-5 text-4xl uppercase sm:text-5xl">{machine.name}</h1>
          <p className="mt-4 text-lg text-ink-soft">{machine.summary}</p>

          <Image
            src={machine.image_url ?? "/img/hero.png"}
            alt={`Schéma technique — ${machine.name}`}
            width={1200}
            height={800}
            className="mt-10 w-full border border-line object-cover"
          />

          <div className="mt-10 max-w-2xl">
            <h2 className="text-xl uppercase">Ce que la machine permet</h2>
            <p className="mt-3 leading-relaxed text-ink-soft">{machine.description}</p>
          </div>

          <div className="mt-10 max-w-2xl border-l-2 border-rust bg-rust-wash px-5 py-4">
            <p className="label-tech text-rust-dark">Habilitation requise</p>
            <p className="mt-2 text-sm text-ink-soft">
              Cette machine appartient à la famille « {CATEGORY_LABELS[machine.category]} ». Une
              habilitation validée par un référent est nécessaire avant la première réservation.
              La demande se fait depuis votre espace, en une minute.
            </p>
          </div>
        </div>

        <aside className="border border-line bg-paper p-6 lg:sticky lg:top-24">
          <p className="label-tech text-kraft">Tarif</p>
          <p className="mt-2 font-display text-4xl">
            {machine.hourly_credits}
            <span className="ml-2 text-base font-normal text-ink-soft">crédits / heure</span>
          </p>

          <dl className="mt-6 space-y-3 border-t border-line pt-6 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-kraft">Atelier</dt>
              <dd className="text-right">{machine.workshop?.name ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-kraft">Ville</dt>
              <dd>{machine.workshop?.city ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-kraft">Famille</dt>
              <dd>{CATEGORY_LABELS[machine.category]}</dd>
            </div>
          </dl>

          <div className="mt-8 space-y-3">
            {/* Une machine en maintenance ne doit pas exposer un lien déguisé
                en bouton actif : on rend un bloc inerte, pas un <a>. */}
            {available ? (
              <ButtonLink href={`/reserver/${machine.slug}`} className="w-full">
                Réserver un créneau
              </ButtonLink>
            ) : (
              <p className="border border-line bg-bone px-5 py-2.5 text-center text-sm text-kraft">
                Indisponible à la réservation
              </p>
            )}
            {machine.workshop ? (
              <ButtonLink
                href={`/ateliers/${machine.workshop.slug}`}
                variant="secondary"
                className="w-full"
              >
                Voir l&apos;atelier
              </ButtonLink>
            ) : null}
          </div>

          <p className="mt-4 text-xs text-kraft">
            La connexion est demandée au moment de la réservation.
          </p>
        </aside>
      </div>
    </article>
  );
}
