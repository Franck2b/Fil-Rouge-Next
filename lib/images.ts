import type { MachineCategory } from "@/lib/types";

/**
 * Photographies de la vitrine, toutes issues de Wikimedia Commons.
 *
 * Leurs licences (CC BY, CC BY-SA, domaine public) exigent ou autorisent un
 * crédit : la page /credits est générée à partir de ce fichier, qui reste donc
 * la seule source de vérité pour l'auteur, la licence et l'origine de chaque image.
 */

export type PhotoId = "hero" | "communaute" | "atelier-paris-11" | "atelier-lyon-7" | "atelier-nantes-centre" | "machine-laser" | "machine-impression-3d" | "machine-bois" | "machine-metal" | "machine-textile" | "machine-electronique";

export type Photo = {
  id: PhotoId;
  src: string;
  width: number;
  height: number;
  author: string | null;
  license: string;
  source: string;
};

export const PHOTOS: Record<PhotoId, Photo> = {
  "hero": {
    id: "hero",
    src: "/img/photos/hero.jpg",
    width: 1600,
    height: 900,
    author: "Ricardo Burnes / LABNL Lab Cultural Ciudadano (Citizen Cultural Lab Nuevo León, Mexico)",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Ciudadanos_en_FabLAB_de_LABNL.jpg",
  },
  "communaute": {
    id: "communaute",
    src: "/img/photos/communaute.jpg",
    width: 1600,
    height: 900,
    author: "Mitch Altman",
    license: "CC BY-SA 2.0",
    source: "https://commons.wikimedia.org/wiki/File:Chengdu_HTTC2019,_Oct-2019_-_49058365471.jpg",
  },
  "atelier-paris-11": {
    id: "atelier-paris-11",
    src: "/img/photos/atelier-paris-11.jpg",
    width: 1200,
    height: 800,
    author: "Vivigm47",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Fab_LAB_Newton.jpg",
  },
  "atelier-lyon-7": {
    id: "atelier-lyon-7",
    src: "/img/photos/atelier-lyon-7.jpg",
    width: 1200,
    height: 800,
    author: "Majabojarska",
    license: "CC BY 4.0",
    source: "https://commons.wikimedia.org/wiki/File:3D_printer_farm_at_Hackerspace_Wroc%C5%82aw.jpg",
  },
  "atelier-nantes-centre": {
    id: "atelier-nantes-centre",
    src: "/img/photos/atelier-nantes-centre.jpg",
    width: 1200,
    height: 800,
    author: "Forest Service Photography",
    license: "Public domain",
    source: "https://commons.wikimedia.org/wiki/File:20160719-FS-Wolf_Creek-Router-001_(46601849345).jpg",
  },
  "machine-laser": {
    id: "machine-laser",
    src: "/img/photos/machine-laser.jpg",
    width: 1200,
    height: 800,
    author: "Henrysz",
    license: "CC BY 4.0",
    source: "https://commons.wikimedia.org/wiki/File:CNC_Laser_Cutting_Machine_in_Operation_at_Martin_Guitar_Factory.jpg",
  },
  "machine-impression-3d": {
    id: "machine-impression-3d",
    src: "/img/photos/machine-impression-3d.jpg",
    width: 1200,
    height: 800,
    author: "Leonhard Lenz",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:3D_printer_at_35c3_02.jpg",
  },
  "machine-bois": {
    id: "machine-bois",
    src: "/img/photos/machine-bois.jpg",
    width: 1200,
    height: 800,
    author: "Forest Service Photography",
    license: "Public domain",
    source: "https://commons.wikimedia.org/wiki/File:20160719-FS-Wolf_Creek-Router-004_(46601848415).jpg",
  },
  "machine-metal": {
    id: "machine-metal",
    src: "/img/photos/machine-metal.jpg",
    width: 1200,
    height: 800,
    author: "Airman Eric S. Garst",
    license: "Public domain",
    source: "https://commons.wikimedia.org/wiki/File:Dreher_an_einer_Drehbank.jpg",
  },
  "machine-textile": {
    id: "machine-textile",
    src: "/img/photos/machine-textile.jpg",
    width: 1200,
    height: 800,
    author: "Haddybellz",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Industrial_sewing_machine.jpg",
  },
  "machine-electronique": {
    id: "machine-electronique",
    src: "/img/photos/machine-electronique.jpg",
    width: 1200,
    height: 800,
    author: "James Bastow",
    license: "CC BY-SA 2.0",
    source: "https://commons.wikimedia.org/wiki/File:Electronics_workbench.jpg",
  },
};

/** Photo de chaque famille de machines, utilisée par le catalogue et les fiches. */
export const CATEGORY_PHOTOS: Record<MachineCategory, Photo> = {
  laser: PHOTOS["machine-laser"],
  impression_3d: PHOTOS["machine-impression-3d"],
  bois: PHOTOS["machine-bois"],
  metal: PHOTOS["machine-metal"],
  textile: PHOTOS["machine-textile"],
  electronique: PHOTOS["machine-electronique"],
};

const WORKSHOP_PHOTOS: Record<string, Photo> = {
  "paris-11": PHOTOS["atelier-paris-11"],
  "lyon-7": PHOTOS["atelier-lyon-7"],
  "nantes-centre": PHOTOS["atelier-nantes-centre"],
};

/** Photo d'un atelier ; un atelier ajouté en base sans photo prévue garde son image enregistrée. */
export function workshopImage(workshop: { slug: string; image_url: string | null }) {
  return WORKSHOP_PHOTOS[workshop.slug] ?? {
    src: workshop.image_url ?? "/img/hero.png",
    width: 1200,
    height: 800,
  };
}

/** Tailles d'affichage des cartes en grille, pour que next/image serve la bonne résolution. */
export const CARD_SIZES = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";
