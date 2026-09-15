import { Link } from "@/components/ui/link";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { getI18n } from "@/lib/i18n/server";

export default async function NotFound() {
  const { t } = await getI18n();

  return (
    <div className="grid-plan flex min-h-[70vh] flex-col items-center justify-center bg-ink px-5 py-20 text-center text-bone">
      <Logo tone="paper" />
      <p className="label-tech mt-12 text-rust">{t.notFound.code}</p>
      <h1 className="mt-4 max-w-lg text-4xl uppercase sm:text-5xl">{t.notFound.title}</h1>
      <p className="mt-5 max-w-md text-bone/70">{t.notFound.text}</p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/">{t.notFound.home}</ButtonLink>
        <ButtonLink href="/equipements" variant="inverse">
          {t.notFound.machines}
        </ButtonLink>
      </div>
      <Link href="/tableau-de-bord" className="mt-8 text-sm text-bone/50 hover:text-rust">
        {t.notFound.mySpace}
      </Link>
    </div>
  );
}
