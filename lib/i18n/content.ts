import type { Locale } from "@/lib/i18n/config";
import type { Machine, Workshop } from "@/lib/types";

/**
 * Traduction du contenu stocké en base (catalogue et motifs de crédits), qui
 * est rédigé en français.
 *
 * Le catalogue est un jeu fixe, issu de supabase/seed.sql et non éditable
 * depuis l'application : le traduire côté front évite d'ajouter des colonnes
 * par langue. Une machine absente de cette table s'affiche simplement en
 * français. Un catalogue éditable imposerait de stocker les traductions en base.
 */

type MachineCopy = {
  /** Nom français tel qu'enregistré, pour retrouver la machine dans un motif de crédit. */
  sourceName: string;
  name: string;
  summary: string;
  description: string;
};

const MACHINES_EN: Record<string, MachineCopy> = {
  "trotec-speedy-400": {
    sourceName: "Découpeuse laser Trotec Speedy 400",
    name: "Trotec Speedy 400 laser cutter",
    summary: "120 W CO₂, 1000 × 610 mm bed.",
    description:
      "Cutting and engraving on wood, acrylic, leather and cardboard. Built-in filtered extraction. SVG, DXF and AI files accepted.",
  },
  "prusa-mk4-01": {
    sourceName: "Imprimante 3D Prusa MK4 · poste 01",
    name: "Prusa MK4 3D printer · station 01",
    summary: "FDM, 250 × 210 × 220 mm build volume.",
    description:
      "All-purpose PLA / PETG station. Automatic bed calibration, 0.4 mm nozzle fitted by default.",
  },
  "prusa-mk4-02": {
    sourceName: "Imprimante 3D Prusa MK4 · poste 02",
    name: "Prusa MK4 3D printer · station 02",
    summary: "FDM, 250 × 210 × 220 mm build volume.",
    description:
      "Identical to station 01, reserved first for long prints (over 6 hours).",
  },
  "festool-cs70": {
    sourceName: "Scie à format Festool CS 70",
    name: "Festool CS 70 panel saw",
    summary: "Cuts panels up to 70 mm thick.",
    description:
      "Table saw with rip fence and sliding carriage. Woodwork certification required, protective equipment checked at the door.",
  },
  "station-jbc-01": {
    sourceName: "Station de prototypage électronique",
    name: "Electronics prototyping station",
    summary: "JBC soldering iron, stereo microscope, bench power supply.",
    description:
      "A complete station for fine soldering and debugging: 100 MHz oscilloscope, multimeter, SMD kit.",
  },
  "bambu-x1c": {
    sourceName: "Imprimante 3D Bambu Lab X1C",
    name: "Bambu Lab X1C 3D printer",
    summary: "Enclosed CoreXY, multi-material.",
    description:
      "For ABS, ASA and fibre-filled materials. Four-spool AMS system for multicolour parts.",
  },
  "juki-ddl-8700": {
    sourceName: "Piqueuse industrielle Juki DDL-8700",
    name: "Juki DDL-8700 industrial sewing machine",
    summary: "Lockstitch, 5,500 stitches per minute.",
    description:
      "Production machine for light to medium fabrics. Bobbins and needles supplied by the workshop.",
  },
  "brother-pr680": {
    sourceName: "Brodeuse Brother PR680W",
    name: "Brother PR680W embroidery machine",
    summary: "Six needles, 360 × 200 mm hoop.",
    description:
      "Embroidery on textiles and soft leather. PES or DST files, on-site digitising available.",
  },
  "tour-optimum-d250": {
    sourceName: "Tour à métaux Optimum D250",
    name: "Optimum D250 metal lathe",
    summary: "550 mm between centres.",
    description:
      "Turning steel, brass and aluminium. Metalwork certification required, plus a skills check with a supervisor.",
  },
  "poste-tig-200": {
    sourceName: "Poste à souder TIG 200 A",
    name: "TIG 200 A welding station",
    summary: "Air-cooled AC/DC TIG.",
    description:
      "Welding steel, stainless steel and aluminium. Ventilated booth, auto-darkening helmet and gloves provided.",
  },
  "cnc-shopbot-96": {
    sourceName: "CNC bois ShopBot 96",
    name: "ShopBot 96 CNC router",
    summary: "2440 × 1220 mm working area.",
    description:
      "Large-format panel machining. Toolpaths must be supplied as G-code and are checked by a supervisor before running.",
  },
  "toupie-felder-700": {
    sourceName: "Toupie Felder F700",
    name: "Felder F700 spindle moulder",
    summary: "30 mm tilting spindle.",
    description:
      "Profiling and grooving. High-risk machine: woodwork certification and a supervisor's sign-off at every session.",
  },
  "laser-mira-9": {
    sourceName: "Découpeuse laser Mira 9",
    name: "Mira 9 laser cutter",
    summary: "60 W CO₂, 900 × 600 mm bed.",
    description:
      "Secondary station for engraving and short runs. Ideal for thin plywood and MDF.",
  },
  "prusa-xl": {
    sourceName: "Imprimante 3D Prusa XL",
    name: "Prusa XL 3D printer",
    summary: "360 × 360 × 360 mm build volume.",
    description:
      "Large volume for single-piece parts. Two print heads for printing with soluble supports.",
  },
};

const WORKSHOPS_EN: Record<string, Pick<Workshop, "description" | "opening">> = {
  "paris-11": {
    description:
      "Our original workshop: 420 m² split between the cutting area, the woodshop and an electronics prototyping space.",
    opening: "Mon–Sat · 9 am–8 pm",
  },
  "lyon-7": {
    description:
      "A single 300 m² floor designed for short runs: 3D printing, technical textiles and metalwork.",
    opening: "Mon–Fri · 9 am–8 pm · Sat 10 am–6 pm",
  },
  "nantes-centre": {
    description:
      "The newest addition, focused on wood and large volumes, with a loading bay and panel stock.",
    opening: "Tue–Sat · 10 am–7 pm",
  },
};

const CREDIT_REASONS_EN: Record<string, string> = {
  "Crédits de bienvenue": "Welcome credits",
  "Remboursement annulation": "Cancellation refund",
};

const BOOKING_REASON_PREFIX = "Réservation ";

export function localizeMachine<T extends Pick<Machine, "slug" | "name" | "summary" | "description">>(
  machine: T,
  locale: Locale,
): T {
  const copy = locale === "en" ? MACHINES_EN[machine.slug] : undefined;
  if (!copy) return machine;

  return { ...machine, name: copy.name, summary: copy.summary, description: copy.description };
}

export function localizeWorkshop<T extends Pick<Workshop, "slug" | "description" | "opening">>(
  workshop: T,
  locale: Locale,
): T {
  const copy = locale === "en" ? WORKSHOPS_EN[workshop.slug] : undefined;
  return copy ? { ...workshop, ...copy } : workshop;
}

/**
 * Les motifs de crédit sont écrits par les fonctions SQL au moment de
 * l'opération. Les motifs connus sont traduits ; un motif saisi à la main par
 * un administrateur s'affiche tel quel.
 */
export function localizeCreditReason(reason: string, locale: Locale) {
  if (locale !== "en") return reason;
  if (reason in CREDIT_REASONS_EN) return CREDIT_REASONS_EN[reason];

  if (reason.startsWith(BOOKING_REASON_PREFIX)) {
    const sourceName = reason.slice(BOOKING_REASON_PREFIX.length);
    const machine = Object.values(MACHINES_EN).find((copy) => copy.sourceName === sourceName);
    return `Booking — ${machine?.name ?? sourceName}`;
  }

  return reason;
}
