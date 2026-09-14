import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="grid-plan flex min-h-[70vh] flex-col items-center justify-center bg-ink px-5 py-20 text-center text-bone">
      <Logo tone="paper" />
      <p className="label-tech mt-12 text-rust">Erreur 404</p>
      <h1 className="mt-4 max-w-lg text-4xl uppercase sm:text-5xl">
        Cette page n&apos;est pas au plan
      </h1>
      <p className="mt-5 max-w-md text-bone/70">
        La ressource demandée n&apos;existe pas, ou n&apos;est plus publiée. Les liens ci-dessous
        vous remettent sur les rails.
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/">Retour à l&apos;accueil</ButtonLink>
        <ButtonLink href="/equipements" variant="inverse">
          Voir le parc machines
        </ButtonLink>
      </div>
      <Link href="/tableau-de-bord" className="mt-8 text-sm text-bone/50 hover:text-rust">
        Accéder à mon espace
      </Link>
    </div>
  );
}
