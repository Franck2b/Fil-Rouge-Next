import type { Metadata, Viewport } from "next";
import { Archivo, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Établi · Réseau d'ateliers partagés",
    template: "%s · Établi",
  },
  description:
    "Réservez la découpeuse laser, la CNC ou le tour à métaux d'un atelier partagé près de chez vous. Habilitations encadrées, créneaux à l'heure, crédits prépayés.",
  keywords: ["fablab", "atelier partagé", "découpe laser", "impression 3D", "CNC", "réservation machine"],
  authors: [{ name: "Établi" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Établi",
    title: "Établi · Réseau d'ateliers partagés",
    description:
      "Réservez une machine dans un atelier partagé, à l'heure, avec une habilitation encadrée.",
  },
};

export const viewport: Viewport = {
  themeColor: "#15130f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${archivo.variable} ${inter.variable} ${plexMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
