import Link from "next/link";
import { cacheLife } from "next/cache";
import { Logo } from "@/components/logo";

const COLUMNS = [
  {
    title: "Produit",
    links: [
      { href: "/equipements", label: "Le parc machines" },
      { href: "/ateliers", label: "Nos ateliers" },
      { href: "/tarifs", label: "Tarifs & crédits" },
      { href: "/faq", label: "Questions fréquentes" },
    ],
  },
  {
    title: "Compte",
    links: [
      { href: "/inscription", label: "Créer un compte" },
      { href: "/connexion", label: "Se connecter" },
      { href: "/tableau-de-bord", label: "Mon espace" },
    ],
  },
];

/**
 * L'année courante est une valeur instable : sous Cache Components, la lire
 * pendant un pré-rendu est une erreur. On la met en cache pour la journée,
 * ce qui est très largement suffisant pour un pied de page.
 */
async function CurrentYear() {
  "use cache";
  cacheLife("days");

  return <>{new Date().getFullYear()}</>;
}

export function SiteFooter() {
  return (
    <footer className="grid-plan border-t border-ink/20 bg-ink text-bone">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <Logo tone="paper" />
          <p className="mt-4 max-w-xs text-sm text-bone/60">
            Un réseau d&apos;ateliers partagés où l&apos;on réserve une machine comme on réserve
            une salle : à l&apos;heure, sans abonnement, avec une habilitation encadrée.
          </p>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.title}>
            <p className="label-tech text-kraft">{column.title}</p>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-bone/70 hover:text-rust">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-bone/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-5 text-xs text-bone/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© <CurrentYear /> Établi — projet pédagogique M2 EEMI.</p>
          <p className="label-tech">Paris · Lyon · Nantes</p>
        </div>
      </div>
    </footer>
  );
}
