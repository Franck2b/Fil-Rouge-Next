import { Suspense } from "react";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input, Select } from "@/components/ui/field";
import { Link } from "@/components/ui/link";
import { getMachines, getWorkshops } from "@/lib/data/catalog";
import { localizeMachine } from "@/lib/i18n/content";
import { getI18n, localizedAlternates } from "@/lib/i18n/server";
import { fill, plural } from "@/lib/i18n/text";
import { MACHINE_CATEGORY_VALUES } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();

  return {
    title: t.machines.metaTitle,
    description: t.machines.metaDescription,
    alternates: await localizedAlternates("/equipements"),
  };
}

type SearchParams = Promise<{ categorie?: string; atelier?: string; q?: string }>;

export default async function MachinesPage({ searchParams }: { searchParams: SearchParams }) {
  const { t } = await getI18n();

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <header className="max-w-2xl">
        <p className="label-tech text-kraft">{t.machines.eyebrow}</p>
        <h1 className="mt-3 text-4xl uppercase sm:text-5xl">{t.machines.title}</h1>
        <p className="mt-5 text-ink-soft">{t.machines.intro}</p>
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
  const [{ categorie = "", atelier = "", q = "" }, { locale, t }, machines, workshops] =
    await Promise.all([searchParams, getI18n(), getMachines(), getWorkshops()]);

  // La recherche porte sur le texte affiché, donc sur la version traduite.
  const needle = q.trim().toLowerCase();
  const results = machines
    .map((machine) => localizeMachine(machine, locale))
    .filter((machine) => {
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
        <Field label={t.machines.search} htmlFor="q">
          <Input
            id="q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder={t.machines.searchPlaceholder}
          />
        </Field>

        <Field label={t.machines.family} htmlFor="categorie">
          <Select id="categorie" name="categorie" defaultValue={categorie}>
            <option value="">{t.machines.allFamilies}</option>
            {MACHINE_CATEGORY_VALUES.map((category) => (
              <option key={category} value={category}>
                {t.categories[category].label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={t.machines.workshop} htmlFor="atelier">
          <Select id="atelier" name="atelier" defaultValue={atelier}>
            <option value="">{t.machines.allWorkshops}</option>
            {workshops.map((workshop) => (
              <option key={workshop.id} value={workshop.slug}>
                {workshop.name} — {workshop.city}
              </option>
            ))}
          </Select>
        </Field>

        <div className="flex gap-2">
          <Button type="submit">{t.machines.filter}</Button>
          {hasFilters ? (
            <Link
              href="/equipements"
              className="self-center text-sm text-ink-soft underline underline-offset-4 hover:text-ink"
            >
              {t.machines.reset}
            </Link>
          ) : null}
        </div>
      </form>

      <p className="label-tech mt-6 text-kraft" aria-live="polite">
        {plural(locale, t.machines.countOf, results.length, { total: machines.length })}
      </p>

      {results.length === 0 ? (
        <div className="mt-6">
          <EmptyState title={t.machines.emptyTitle} description={t.machines.emptyText} />
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
                  <Badge tone="rust">{t.categories[machine.category].label}</Badge>
                  {machine.status !== "available" ? (
                    <Badge tone="amber">{t.machineStatus[machine.status]}</Badge>
                  ) : null}
                </div>
                <h2 className="mt-5 text-lg group-hover:text-rust">{machine.name}</h2>
                <p className="mt-2 flex-1 text-sm text-ink-soft">{machine.summary}</p>
                <div className="label-tech mt-6 flex items-center justify-between text-kraft">
                  <span>{machine.workshop?.city}</span>
                  <span className="text-ink">
                    {fill(t.common.creditsPerHourShort, { count: machine.hourly_credits })}
                  </span>
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
