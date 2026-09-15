import { Logo } from "@/components/logo";
import { Link } from "@/components/ui/link";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { getI18n } from "@/lib/i18n/server";

/**
 * Layout d'entrée dans le produit : volontairement dépouillé, sans navigation
 * marketing, pour ne laisser qu'une seule action possible à l'écran.
 */
export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const { t } = await getI18n();

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <aside className="grid-plan hidden flex-col justify-between bg-ink p-10 text-bone lg:flex">
        <Logo tone="paper" />

        <div>
          <p className="label-tech text-rust">{t.auth.aside.eyebrow}</p>
          <p className="mt-6 max-w-sm font-display text-3xl leading-tight uppercase">
            {t.auth.aside.quote}
          </p>
          <p className="mt-6 max-w-sm text-sm text-bone/60">{t.auth.aside.text}</p>
        </div>

        <dl className="grid grid-cols-3 gap-px border border-bone/15 bg-bone/15">
          {[
            { k: "3", v: t.auth.aside.statWorkshops },
            { k: "14", v: t.auth.aside.statMachines },
            { k: "10", v: t.auth.aside.statCredits },
          ].map((stat) => (
            <div key={stat.v} className="bg-ink px-4 py-4">
              <dt className="font-display text-2xl">{stat.k}</dt>
              <dd className="label-tech mt-1 text-kraft">{stat.v}</dd>
            </div>
          ))}
        </dl>
      </aside>

      <main className="flex flex-col bg-bone">
        <div className="flex items-center justify-between border-b border-line px-5 py-5 lg:justify-end">
          <span className="lg:hidden">
            <Logo />
          </span>
          <div className="flex items-center gap-4">
            <LocaleSwitcher />
            <Link href="/" className="text-sm text-ink-soft hover:text-ink">
              {t.common.backToSite}
            </Link>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-12">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </main>
    </div>
  );
}
