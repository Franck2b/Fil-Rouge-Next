import { buttonClasses } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { getViewer } from "@/lib/auth";
import { fill } from "@/lib/i18n/text";
import { getI18n } from "@/lib/i18n/server";

/**
 * Zone « compte » de l'en-tête vitrine.
 *
 * Server Component isolé : il lit la session, donc les cookies, donc la requête.
 * Le reste de la vitrine doit rester pré-rendu — c'est pour cela qu'il est monté
 * dans un <Suspense> par le layout plutôt qu'appelé depuis SiteHeader, qui est
 * un Client Component et n'a de toute façon pas accès à la session.
 */
export async function HeaderAccount({ variant }: { variant: "desktop" | "mobile" }) {
  const [viewer, { t }] = await Promise.all([getViewer(), getI18n()]);
  const mobile = variant === "mobile";

  if (!viewer) {
    return (
      <>
        <Link
          href="/connexion"
          className={
            mobile ? buttonClasses("secondary", "md") : "text-sm text-ink-soft hover:text-ink"
          }
        >
          {t.nav.signIn}
        </Link>
        <Link href="/inscription" className={buttonClasses("primary", mobile ? "md" : "sm")}>
          {t.nav.signUp}
        </Link>
      </>
    );
  }

  const destination = viewer.profile.onboarding_completed ? "/tableau-de-bord" : "/onboarding";
  const firstName = viewer.profile.full_name.split(" ")[0];

  return (
    <>
      <span className={mobile ? "label-tech py-2 text-kraft" : "hidden text-sm text-kraft lg:block"}>
        {firstName ? fill(t.nav.hello, { name: firstName }) : viewer.email}
      </span>
      <Link href={destination} className={buttonClasses("primary", mobile ? "md" : "sm")}>
        {viewer.profile.onboarding_completed ? t.nav.mySpace : t.nav.finishSignUp}
      </Link>
    </>
  );
}

/** Réservation de place pendant le streaming : même gabarit, sans contenu trompeur. */
export function HeaderAccountFallback({ variant }: { variant: "desktop" | "mobile" }) {
  const size = variant === "mobile" ? "h-11 w-full" : "h-9 w-32";
  return <span aria-hidden className={`animate-pulse bg-line ${size}`} />;
}
