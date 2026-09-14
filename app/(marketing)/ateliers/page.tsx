import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getWorkshops } from "@/lib/data/catalog";

export const metadata: Metadata = {
  title: "Nos ateliers",
  description:
    "Les ateliers partagés Gabarit à Paris, Lyon et Nantes : adresses, horaires, surfaces et équipements disponibles sur place.",
  alternates: { canonical: "/ateliers" },
};

export default async function WorkshopsPage() {
  const workshops = await getWorkshops();

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <header className="max-w-2xl">
        <p className="label-tech text-kraft">Les lieux</p>
        <h1 className="mt-3 text-4xl uppercase sm:text-5xl">Nos ateliers</h1>
        <p className="mt-5 text-ink-soft">
          Chaque atelier a sa spécialité, mais un seul compte suffit : vos crédits et vos
          habilitations sont valables sur l&apos;ensemble du réseau.
        </p>
      </header>

      <ul className="mt-14 space-y-px border border-line bg-line">
        {workshops.map((workshop) => (
          <li key={workshop.id} className="bg-paper">
            <Link
              href={`/ateliers/${workshop.slug}`}
              className="group grid gap-6 p-6 transition-colors hover:bg-bone md:grid-cols-[280px_1fr] md:items-center"
            >
              <Image
                src={workshop.image_url ?? "/img/hero.png"}
                alt={`Plan de l'atelier ${workshop.name}`}
                width={1200}
                height={800}
                className="aspect-[3/2] w-full border border-line object-cover"
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
        ))}
      </ul>
    </div>
  );
}
