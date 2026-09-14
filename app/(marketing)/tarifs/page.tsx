import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { getMachines } from "@/lib/data/catalog";
import { CATEGORY_LABELS, MACHINE_CATEGORIES } from "@/lib/types";

export const metadata: Metadata = {
  title: "Tarifs & crédits",
  description:
    "Pas d'abonnement : on achète des crédits, on les dépense à l'heure de machine. Grille tarifaire complète du réseau Gabarit.",
  alternates: { canonical: "/tarifs" },
};

const PACKS = [
  {
    name: "Découverte",
    credits: 10,
    price: "Offert",
    detail: "Crédités à l'ouverture du compte.",
    lines: ["3 h d'impression 3D", "Accès aux trois ateliers", "Une habilitation incluse"],
    highlight: false,
  },
  {
    name: "Projet",
    credits: 50,
    price: "90 €",
    detail: "1,80 € le crédit.",
    lines: ["Valable 12 mois", "Toutes les familles de machines", "Report des créneaux annulés"],
    highlight: true,
  },
  {
    name: "Atelier",
    credits: 200,
    price: "320 €",
    detail: "1,60 € le crédit.",
    lines: ["Valable 24 mois", "Réservations jusqu'à 8 h d'affilée", "Casier de stockage nominatif"],
    highlight: false,
  },
];

export default async function PricingPage() {
  const machines = await getMachines();

  return (
    <div>
      <header className="grid-plan border-b border-line bg-ink text-bone">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <p className="label-tech text-rust">Tarifs</p>
          <h1 className="mt-3 max-w-2xl text-4xl uppercase sm:text-5xl">
            On paie l&apos;heure de machine, pas le droit d&apos;entrée
          </h1>
          <p className="mt-5 max-w-xl text-bone/70">
            Aucun abonnement, aucun engagement. Vous achetez des crédits, vous les dépensez quand
            vous fabriquez. Une heure entamée est une heure due.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <ul className="grid gap-px border border-line bg-line lg:grid-cols-3">
          {PACKS.map((pack) => (
            <li
              key={pack.name}
              className={pack.highlight ? "bg-ink p-8 text-bone" : "bg-paper p-8"}
            >
              <p className={`label-tech ${pack.highlight ? "text-rust" : "text-kraft"}`}>
                {pack.name}
              </p>
              <p className="mt-4 font-display text-5xl">{pack.price}</p>
              <p className={`mt-2 text-sm ${pack.highlight ? "text-bone/60" : "text-ink-soft"}`}>
                {pack.credits} crédits · {pack.detail}
              </p>

              <ul className="mt-8 space-y-3 text-sm">
                {pack.lines.map((line) => (
                  <li key={line} className="flex gap-3">
                    <span aria-hidden className="text-rust">
                      —
                    </span>
                    <span className={pack.highlight ? "text-bone/80" : "text-ink-soft"}>{line}</span>
                  </li>
                ))}
              </ul>

              <ButtonLink
                href="/inscription"
                variant={pack.highlight ? "primary" : "secondary"}
                className="mt-10 w-full"
              >
                Commencer
              </ButtonLink>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-line bg-paper">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="text-2xl uppercase">Coût horaire par famille</h2>
          <p className="mt-3 max-w-xl text-sm text-ink-soft">
            Calculé sur le parc réellement disponible aujourd&apos;hui.
          </p>

          <div className="mt-8 overflow-x-auto border border-line">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <caption className="sr-only">Coût en crédits par famille de machines</caption>
              <thead>
                <tr className="border-b border-line bg-bone">
                  <th scope="col" className="label-tech px-4 py-3 text-left text-kraft">
                    Famille
                  </th>
                  <th scope="col" className="label-tech px-4 py-3 text-left text-kraft">
                    Machines
                  </th>
                  <th scope="col" className="label-tech px-4 py-3 text-left text-kraft">
                    Crédits / heure
                  </th>
                </tr>
              </thead>
              <tbody>
                {MACHINE_CATEGORIES.map((category) => {
                  const family = machines.filter((m) => m.category === category.value);
                  if (family.length === 0) return null;
                  const min = Math.min(...family.map((m) => m.hourly_credits));
                  const max = Math.max(...family.map((m) => m.hourly_credits));

                  return (
                    <tr key={category.value} className="border-b border-line last:border-0">
                      <th scope="row" className="px-4 py-3 text-left font-medium">
                        {CATEGORY_LABELS[category.value]}
                      </th>
                      <td className="px-4 py-3 text-ink-soft">{family.length}</td>
                      <td className="px-4 py-3 font-mono">
                        {min === max ? min : `${min} – ${max}`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
