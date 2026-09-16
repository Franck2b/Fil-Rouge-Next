import type { Metadata } from "next";
import { Link } from "@/components/ui/link";
import { CardPhoto } from "@/components/marketing/card-photo";
import { workshopImage } from "@/lib/images";
import { getWorkshops } from "@/lib/data/catalog";
import { localizeWorkshop } from "@/lib/i18n/content";
import { getI18n, localizedAlternates } from "@/lib/i18n/server";
import { fill } from "@/lib/i18n/text";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();

  return {
    title: t.workshops.metaTitle,
    description: t.workshops.metaDescription,
    alternates: await localizedAlternates("/ateliers"),
  };
}

export default async function WorkshopsPage() {
  const [{ locale, t }, workshops] = await Promise.all([getI18n(), getWorkshops()]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <header className="max-w-2xl">
        <p className="label-tech text-kraft">{t.workshops.eyebrow}</p>
        <h1 className="mt-3 text-4xl uppercase sm:text-5xl">{t.workshops.title}</h1>
        <p className="mt-5 text-ink-soft">{t.workshops.intro}</p>
      </header>

      <ul className="mt-14 space-y-px border border-line bg-line">
        {workshops.map((source) => {
          const workshop = localizeWorkshop(source, locale);

          return (
            <li key={workshop.id} className="bg-paper">
              <Link
                href={`/ateliers/${workshop.slug}`}
                className="group grid gap-6 p-6 transition-colors hover:bg-bone md:grid-cols-[280px_1fr] md:items-center"
              >
                <CardPhoto
                  photo={workshopImage(workshop)}
                  alt={fill(t.workshops.photoAlt, { name: workshop.name })}
                  className="border border-line"
                />
                <div>
                  <p className="label-tech text-rust">{workshop.city}</p>
                  <h2 className="mt-2 text-2xl group-hover:text-rust">{workshop.name}</h2>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
                    {workshop.description}
                  </p>
                  <div className="label-tech mt-5 flex flex-wrap gap-x-6 gap-y-2 text-kraft">
                    <span>{workshop.address}</span>
                    <span>{workshop.opening}</span>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
