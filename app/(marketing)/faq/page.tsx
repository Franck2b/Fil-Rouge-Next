import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Questions fréquentes",
  description:
    "Habilitations, annulations, sécurité, matériaux, stockage : les réponses aux questions posées avant une première réservation chez Gabarit.",
  alternates: { canonical: "/faq" },
};

const FAQ = [
  {
    q: "Faut-il être un professionnel pour réserver ?",
    a: "Non. Les ateliers sont ouverts aux particuliers, aux indépendants et aux associations. La seule condition est d'avoir passé l'habilitation correspondant à la famille de machines visée.",
  },
  {
    q: "Comment se passe une habilitation ?",
    a: "Vous en faites la demande depuis votre espace en expliquant votre expérience. Un référent vous répond sous 48 h ouvrées, éventuellement après une session de prise en main sur place. Une habilitation validée reste acquise sur tout le réseau.",
  },
  {
    q: "Que se passe-t-il si j'annule ?",
    a: "Une annulation plus de deux heures avant le créneau rembourse la totalité des crédits. En deçà, le créneau reste dû : il n'a pas pu être proposé à quelqu'un d'autre.",
  },
  {
    q: "Les matériaux sont-ils fournis ?",
    a: "Les consommables courants (bobines PLA, colle, abrasifs) sont inclus. Les panneaux, le métal et les textiles sont à apporter ou à acheter au comptoir de l'atelier.",
  },
  {
    q: "Puis-je réserver plusieurs heures d'affilée ?",
    a: "Oui, jusqu'à quatre heures consécutives par défaut, huit heures avec un pack Atelier. Le planning bloque automatiquement tout chevauchement avec une autre réservation.",
  },
  {
    q: "Y a-t-il quelqu'un pour m'aider sur place ?",
    a: "Un référent est présent pendant toute la plage d'ouverture. Sur les machines classées à risque — toupie, tour, CNC — son accord est demandé avant chaque lancement.",
  },
  {
    q: "Mes crédits expirent-ils ?",
    a: "Les crédits offerts n'expirent pas. Les packs achetés sont valables 12 ou 24 mois selon la formule, la date est rappelée dans l'historique de votre compte.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-16">
      <header>
        <p className="label-tech text-kraft">Réassurance</p>
        <h1 className="mt-3 text-4xl uppercase sm:text-5xl">Questions fréquentes</h1>
        <p className="mt-5 text-ink-soft">
          Ce qu&apos;on nous demande le plus souvent avant une première réservation.
        </p>
      </header>

      <dl className="mt-14 border-t border-line">
        {FAQ.map((item) => (
          <div key={item.q} className="border-b border-line py-6">
            <dt className="text-lg font-semibold">{item.q}</dt>
            <dd className="mt-3 leading-relaxed text-ink-soft">{item.a}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-14 border border-line bg-paper p-8">
        <h2 className="text-xl uppercase">Une question qui n&apos;est pas là ?</h2>
        <p className="mt-3 text-sm text-ink-soft">
          Passez à l&apos;atelier pendant les heures d&apos;ouverture, ou parcourez{" "}
          <Link href="/equipements" className="text-rust underline underline-offset-4">
            la fiche de la machine
          </Link>{" "}
          qui vous intéresse : les contraintes propres à chaque poste y sont détaillées.
        </p>
        <ButtonLink href="/inscription" className="mt-6">
          Créer un compte
        </ButtonLink>
      </div>
    </div>
  );
}
