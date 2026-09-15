import { cacheLife } from "next/cache";
import { Logo } from "@/components/logo";
import { Link } from "@/components/ui/link";
import { getI18n } from "@/lib/i18n/server";

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

export async function SiteFooter() {
  const { t } = await getI18n();

  const columns = [
    {
      title: t.footer.product,
      links: [
        { href: "/equipements", label: t.footer.machines },
        { href: "/ateliers", label: t.footer.workshops },
        { href: "/tarifs", label: t.footer.pricing },
        { href: "/faq", label: t.footer.faq },
      ],
    },
    {
      title: t.footer.account,
      links: [
        { href: "/inscription", label: t.footer.signUp },
        { href: "/connexion", label: t.footer.signIn },
        { href: "/tableau-de-bord", label: t.footer.mySpace },
      ],
    },
  ];

  return (
    <footer className="grid-plan border-t border-ink/20 bg-ink text-bone">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <Logo tone="paper" />
          <p className="mt-4 max-w-xs text-sm text-bone/60">{t.footer.tagline}</p>
        </div>

        {columns.map((column) => (
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
          <p>
            © <CurrentYear /> {t.footer.copyright}
          </p>
          <p className="label-tech">{t.footer.cities}</p>
        </div>
      </div>
    </footer>
  );
}
