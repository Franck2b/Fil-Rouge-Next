import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { getMachines } from "@/lib/data/catalog";
import { getI18n, localizedAlternates } from "@/lib/i18n/server";
import { fill } from "@/lib/i18n/text";
import { MACHINE_CATEGORY_VALUES } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();

  return {
    title: t.pricing.metaTitle,
    description: t.pricing.metaDescription,
    alternates: await localizedAlternates("/tarifs"),
  };
}

/** Données chiffrées des packs ; leurs textes sont dans le dictionnaire, dans le même ordre. */
const PACKS = [
  { credits: 10, highlight: false },
  { credits: 50, highlight: true },
  { credits: 200, highlight: false },
];

export default async function PricingPage() {
  const [{ t }, machines] = await Promise.all([getI18n(), getMachines()]);

  return (
    <div>
      <header className="grid-plan border-b border-line bg-ink text-bone">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <p className="label-tech text-rust">{t.pricing.eyebrow}</p>
          <h1 className="mt-3 max-w-2xl text-4xl uppercase sm:text-5xl">{t.pricing.title}</h1>
          <p className="mt-5 max-w-xl text-bone/70">{t.pricing.text}</p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <ul className="grid gap-px border border-line bg-line lg:grid-cols-3">
          {PACKS.map((pack, index) => {
            const copy = t.pricing.packs[index];

            return (
              <li
                key={copy.name}
                className={pack.highlight ? "bg-ink p-8 text-bone" : "bg-paper p-8"}
              >
                <p className={`label-tech ${pack.highlight ? "text-rust" : "text-kraft"}`}>
                  {copy.name}
                </p>
                <p className="mt-4 font-display text-5xl">{copy.price}</p>
                <p className={`mt-2 text-sm ${pack.highlight ? "text-bone/60" : "text-ink-soft"}`}>
                  {fill(t.pricing.packCredits, { count: pack.credits, detail: copy.detail })}
                </p>

                <ul className="mt-8 space-y-3 text-sm">
                  {copy.lines.map((line) => (
                    <li key={line} className="flex gap-3">
                      <span aria-hidden className="text-rust">
                        —
                      </span>
                      <span className={pack.highlight ? "text-bone/80" : "text-ink-soft"}>
                        {line}
                      </span>
                    </li>
                  ))}
                </ul>

                <ButtonLink
                  href="/inscription"
                  variant={pack.highlight ? "primary" : "secondary"}
                  className="mt-10 w-full"
                >
                  {t.pricing.start}
                </ButtonLink>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="border-t border-line bg-paper">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="text-2xl uppercase">{t.pricing.tableTitle}</h2>
          <p className="mt-3 max-w-xl text-sm text-ink-soft">{t.pricing.tableText}</p>

          <div className="mt-8 overflow-x-auto border border-line">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <caption className="sr-only">{t.pricing.tableCaption}</caption>
              <thead>
                <tr className="border-b border-line bg-bone">
                  <th scope="col" className="label-tech px-4 py-3 text-left text-kraft">
                    {t.pricing.tableFamily}
                  </th>
                  <th scope="col" className="label-tech px-4 py-3 text-left text-kraft">
                    {t.pricing.tableMachines}
                  </th>
                  <th scope="col" className="label-tech px-4 py-3 text-left text-kraft">
                    {t.pricing.tableCredits}
                  </th>
                </tr>
              </thead>
              <tbody>
                {MACHINE_CATEGORY_VALUES.map((category) => {
                  const family = machines.filter((m) => m.category === category);
                  if (family.length === 0) return null;
                  const min = Math.min(...family.map((m) => m.hourly_credits));
                  const max = Math.max(...family.map((m) => m.hourly_credits));

                  return (
                    <tr key={category} className="border-b border-line last:border-0">
                      <th scope="row" className="px-4 py-3 text-left font-medium">
                        {t.categories[category].label}
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
