/** Amplitude d'ouverture commune à tous les ateliers, en heures locales. */
export const OPENING_HOUR = 9;
export const CLOSING_HOUR = 20;
export const MAX_DURATION = 4;

export const SLOT_HOURS = Array.from(
  { length: CLOSING_HOUR - OPENING_HOUR },
  (_, index) => OPENING_HOUR + index,
);

/** Construit une Date locale à partir d'un jour "YYYY-MM-DD" et d'une heure pleine. */
export function slotDate(day: string, hour: number) {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(year, month - 1, date, hour, 0, 0, 0);
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

export const SLOT_LABELS: Record<SlotState, string> = {
  free: "Libre",
  busy: "Occupé",
  past: "Passé",
  closed: "Ferme trop tôt",
};

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
