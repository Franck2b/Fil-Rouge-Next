import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import { Archivo, Inter, IBM_Plex_Mono } from "next/font/google";
import { hasLocale, LOCALES } from "@/lib/i18n/config";
import { getI18n } from "@/lib/i18n/server";
import "../globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

/**
 * Layout racine, placé sous [lang] : la langue est le premier segment de toute
 * URL. Les deux langues étant connues au build, chacune est pré-rendue — la
 * traduction ne coûte aucune performance à la vitrine.
 */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ lang: locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: {
      default: t.meta.title,
      template: "%s · Gabarit",
    },
    description: t.meta.description,
    keywords: t.meta.keywords,
    authors: [{ name: "Gabarit" }],
    openGraph: {
      type: "website",
      locale: t.meta.ogLocale,
      siteName: "Gabarit",
      title: t.meta.title,
      description: t.meta.ogDescription,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#15130f",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await lang();

  if (!hasLocale(locale)) notFound();

  return (
    <html lang={locale}>
      <body className={`${archivo.variable} ${inter.variable} ${plexMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
