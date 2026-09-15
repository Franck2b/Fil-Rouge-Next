import { Badge, type Tone } from "@/components/ui/badge";
import { Link } from "@/components/ui/link";
import { localizeMachine } from "@/lib/i18n/content";
import { getI18n } from "@/lib/i18n/server";
import { fill } from "@/lib/i18n/text";
import type { BookingWithMachine } from "@/lib/types";
import { durationInHours, formatSlot } from "@/lib/format";

const STATUS_TONES: Record<BookingWithMachine["status"], Tone> = {
  pending: "amber",
  confirmed: "moss",
  cancelled: "brick",
  completed: "neutral",
};

export async function BookingCard({ booking }: { booking: BookingWithMachine }) {
  const { locale, t } = await getI18n();
  const machine = booking.machine ? localizeMachine(booking.machine, locale) : null;

  return (
    <li className="bg-paper">
      <Link
        href={`/reservations/${booking.id}`}
        className="group flex flex-wrap items-start justify-between gap-4 p-5 transition-colors hover:bg-bone"
      >
        <div className="min-w-0">
          <p className="label-tech text-kraft">
            {machine?.workshop?.name ?? t.common.removedWorkshop}
          </p>
          <h3 className="mt-2 truncate text-lg group-hover:text-rust">
            {machine?.name ?? t.common.removedMachine}
          </h3>
          <p className="mt-1 text-sm text-ink-soft">
            {formatSlot(locale, booking.starts_at, booking.ends_at)}
          </p>
          {booking.project ? (
            <p className="mt-2 text-sm text-kraft">
              {fill(t.app.bookingCard.project, { project: booking.project })}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <Badge tone={STATUS_TONES[booking.status]}>{t.bookingStatus[booking.status]}</Badge>
          <span className="label-tech text-kraft">
            {fill(t.common.bookingMeta, {
              hours: durationInHours(booking.starts_at, booking.ends_at),
              credits: booking.credits,
            })}
          </span>
        </div>
      </Link>
    </li>
  );
}
