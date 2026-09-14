import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input, Select } from "@/components/ui/field";
import { getMachines, getWorkshops } from "@/lib/data/catalog";
import { CATEGORY_LABELS, MACHINE_CATEGORIES, MACHINE_STATUS_LABELS } from "@/lib/types";

export const metadata: Metadata = {
  title: "Le parc machines",
  description:
    "Toutes les machines réservables du réseau Établi : découpe laser, impression 3D, bois, métal, textile et électronique, avec leur coût horaire en crédits.",
  alternates: { canonical: "/equipements" },
};

type SearchParams = Promise<{ categorie?: string; atelier?: string; q?: string }>;

export default function MachinesPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <header className="max-w-2xl">
        <p className="label-tech text-kraft">Catalogue</p>
        <h1 className="mt-3 text-4xl uppercase sm:text-5xl">Le parc machines</h1>
        <p className="mt-5 text-ink-soft">
          Le coût est affiché en crédits par heure entamée. Les machines marquées
          « habilitation » demandent une validation avant la première réservation.
        </p>
      </header>

      {/* Le filtrage dépend de l'URL, donc de la requête : il est isolé dans un
          Suspense pour que l'enveloppe de la page reste pré-rendue. */}
      <Suspense fallback={<CatalogSkeleton />}>
        <MachineCatalog searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function MachineCatalog({ searchParams }: { searchParams: SearchParams }) {
  const { categorie = "", atelier = "", q = "" } = await searchParams;
  const [machines, workshops] = await Promise.all([getMachines(), getWorkshops()]);

  const needle = q.trim().toLowerCase();
  const results = machines.filter((machine) => {
    if (categorie && machine.category !== categorie) return false;
    if (atelier && machine.workshop?.slug !== atelier) return false;
    if (needle && !`${machine.name} ${machine.summary}`.toLowerCase().includes(needle)) return false;
    return true;
  });

  const hasFilters = Boolean(categorie || atelier || needle);

  return (
    <>
      {/* Formulaire GET : les filtres vivent dans l'URL, donc partageables et
          fonctionnels sans JavaScript. */}
      <form
        method="get"
        className="mt-10 grid gap-4 border border-line bg-paper p-5 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
      >
        <Field label="Recherche" htmlFor="q">
          <Input id="q" name="q" type="search" defaultValue={q} placeholder="Laser, tour, brodeuse…" />
        </Field>

        <Field label="Famille" htmlFor="categorie">
          <Select id="categorie" name="categorie" defaultValue={categorie}>
            <option value="">Toutes les familles</option>
            {MACHINE_CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Atelier" htmlFor="atelier">
          <Select id="atelier" name="atelier" defaultValue={atelier}>
            <option value="">Tous les ateliers</option>
            {workshops.map((workshop) => (
              <option key={workshop.id} value={workshop.slug}>
                {workshop.name} — {workshop.city}
              </option>
            ))}
          </Select>
        </Field>

        <div className="flex gap-2">
          <Button type="submit">Filtrer</Button>
          {hasFilters ? (
            <Link
              href="/equipements"
              className="self-center text-sm text-ink-soft underline underline-offset-4 hover:text-ink"
            >
              Réinitialiser
            </Link>
          ) : null}
        </div>
      </form>

      <p className="label-tech mt-6 text-kraft" aria-live="polite">
        {results.length} machine{results.length > 1 ? "s" : ""} sur {machines.length}
      </p>

      {results.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="Aucune machine ne correspond"
            description="Élargissez la recherche ou retirez un filtre : le parc évolue régulièrement."
          />
        </div>
      ) : (
        // Cartes bordées individuellement plutôt qu'une grille à gouttières : un
        // nombre de résultats non multiple du nombre de colonnes laisserait sinon
        // apparaître des cellules vides.
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((machine) => (
            <li key={machine.id} className="border border-line bg-paper">
              <Link href={`/equipements/${machine.slug}`} className="group flex h-full flex-col p-6">
                <div className="flex items-start justify-between gap-3">
                  <Badge tone="rust">{CATEGORY_LABELS[machine.category]}</Badge>
                  {machine.status !== "available" ? (
                    <Badge tone="amber">{MACHINE_STATUS_LABELS[machine.status]}</Badge>
                  ) : null}
                </div>
                <h2 className="mt-5 text-lg group-hover:text-rust">{machine.name}</h2>
                <p className="mt-2 flex-1 text-sm text-ink-soft">{machine.summary}</p>
                <div className="label-tech mt-6 flex items-center justify-between text-kraft">
                  <span>{machine.workshop?.city}</span>
                  <span className="text-ink">{machine.hourly_credits} cr/h</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function CatalogSkeleton() {
  return (
    <div className="mt-10 space-y-6" aria-hidden>
      <div className="h-28 border border-line bg-paper" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-48 animate-pulse border border-line bg-paper" />
        ))}
      </div>
    </div>
  );
}
