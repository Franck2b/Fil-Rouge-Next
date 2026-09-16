import Image from "next/image";
import type { Metadata } from "next";
import { PHOTOS } from "@/lib/images";
import { getI18n, localizedAlternates } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();

  return {
    title: t.credits.metaTitle,
    description: t.credits.metaDescription,
    alternates: await localizedAlternates("/credits"),
  };
}

/**
 * Les licences CC BY et CC BY-SA imposent de citer l'auteur, la licence et la
 * source. Cette page est générée depuis lib/images.ts : ajouter une photo
 * là-bas l'ajoute automatiquement ici.
 */
export default async function CreditsPage() {
  const { t } = await getI18n();

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <header className="max-w-2xl">
        <p className="label-tech text-kraft">{t.credits.eyebrow}</p>
        <h1 className="mt-3 text-4xl uppercase sm:text-5xl">{t.credits.title}</h1>
        <p className="mt-5 text-ink-soft">{t.credits.intro}</p>
      </header>

      <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.values(PHOTOS).map((photo) => (
          <li key={photo.id} className="border border-line bg-paper">
            <Image
              src={photo.src}
              alt=""
              width={photo.width}
              height={photo.height}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="aspect-[3/2] w-full border-b border-line object-cover"
            />
            <div className="p-5">
              <p className="text-sm font-medium">{t.credits.usage[photo.id]}</p>
              <dl className="mt-3 space-y-1 text-sm">
                <div className="flex gap-2">
                  <dt className="text-kraft">{t.credits.author} :</dt>
                  <dd className="text-ink-soft">{photo.author ?? t.credits.unknownAuthor}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-kraft">{t.credits.license} :</dt>
                  <dd className="text-ink-soft">{photo.license}</dd>
                </div>
              </dl>
              <a
                href={photo.source}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-sm text-rust underline underline-offset-4"
              >
                {t.credits.source}
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
