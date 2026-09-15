import { TIME_ZONE } from "@/lib/format";

/** Amplitude d'ouverture commune à tous les ateliers, en heures de Paris. */
export const OPENING_HOUR = 9;
export const CLOSING_HOUR = 20;
export const MAX_DURATION = 4;

export const SLOT_HOURS = Array.from(
  { length: CLOSING_HOUR - OPENING_HOUR },
  (_, index) => OPENING_HOUR + index,
);

/** Décalage de Paris par rapport à UTC à un instant donné, en minutes (heure d'été comprise). */
function parisOffsetMinutes(instant: Date) {
  const zone = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, timeZoneName: "longOffset" })
    .formatToParts(instant)
    .find((part) => part.type === "timeZoneName")?.value;

  const match = zone?.match(/GMT([+-])(\d{2}):(\d{2})/);
  if (!match) return 0;

  const minutes = Number(match[2]) * 60 + Number(match[3]);
  return match[1] === "-" ? -minutes : minutes;
}

/**
 * Instant correspondant à une heure pleine d'un jour "YYYY-MM-DD", à l'heure de
 * Paris. Indépendant du fuseau du serveur : « 14 h » désigne 14 h à l'atelier,
 * que le code tourne en local ou sur Vercel.
 */
export function slotDate(day: string, hour: number) {
  const [year, month, date] = day.split("-").map(Number);
  const asUtc = Date.UTC(year, month - 1, date, hour);
  return new Date(asUtc - parisOffsetMinutes(new Date(asUtc)) * 60_000);
}

/** Date du jour à Paris, au format "YYYY-MM-DD" des <input type="date">. */
export function parisDay(instant = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
}

export function addDays(day: string, days: number) {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, date + days)).toISOString().slice(0, 10);
}

export type SlotState = "free" | "busy" | "past" | "closed";

/**
 * Calcule l'état de chaque heure d'ouverture pour un jour donné.
 * Un créneau est « closed » quand la durée demandée déborderait la fermeture.
 */
export function computeSlots(
  day: string,
  busy: { starts_at: string; ends_at: string }[],
  duration: number,
  now = new Date(),
): { hour: number; state: SlotState }[] {
  const ranges = busy.map((slot) => [
    new Date(slot.starts_at).getTime(),
    new Date(slot.ends_at).getTime(),
  ]);

  return SLOT_HOURS.map((hour) => {
    const start = slotDate(day, hour);
    const end = slotDate(day, hour + duration);

    if (hour + duration > CLOSING_HOUR) return { hour, state: "closed" as const };
    if (start.getTime() <= now.getTime()) return { hour, state: "past" as const };

    const overlaps = ranges.some(([from, to]) => start.getTime() < to && end.getTime() > from);
    return { hour, state: overlaps ? ("busy" as const) : ("free" as const) };
  });
}

/**
 * Conditions d'annulation d'une réservation, du point de vue du membre.
 * Isolé ici plutôt que dans le composant : la lecture de l'heure courante est
 * impure et n'a pas sa place dans un rendu React.
 */
export function cancellationState(startsAtIso: string, status: string) {
  const now = Date.now();
  const startsAt = new Date(startsAtIso).getTime();

  return {
    refundable: startsAt - now > 2 * 3_600_000,
    cancellable: status === "confirmed" && startsAt > now,
  };
}
