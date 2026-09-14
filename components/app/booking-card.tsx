import Link from "next/link";
import { Badge, type Tone } from "@/components/ui/badge";
import { BOOKING_STATUS_LABELS, type BookingWithMachine } from "@/lib/types";
import { durationInHours, formatSlot } from "@/lib/format";

const STATUS_TONES: Record<BookingWithMachine["status"], Tone> = {
  pending: "amber",
  confirmed: "moss",
  cancelled: "brick",
  completed: "neutral",
};

export function BookingCard({ booking }: { booking: BookingWithMachine }) {
  return (
    <li className="bg-paper">
      <Link
        href={`/reservations/${booking.id}`}
        className="group flex flex-wrap items-start justify-between gap-4 p-5 transition-colors hover:bg-bone"
      >
        <div className="min-w-0">
          <p className="label-tech text-kraft">
            {booking.machine?.workshop?.name ?? "Atelier retiré"}
          </p>
          <h3 className="mt-2 truncate text-lg group-hover:text-rust">
            {booking.machine?.name ?? "Machine retirée"}
          </h3>
          <p className="mt-1 text-sm text-ink-soft">
            {formatSlot(booking.starts_at, booking.ends_at)}
          </p>
          {booking.project ? (
            <p className="mt-2 text-sm text-kraft">Projet : {booking.project}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <Badge tone={STATUS_TONES[booking.status]}>
            {BOOKING_STATUS_LABELS[booking.status]}
          </Badge>
          <span className="label-tech text-kraft">
            {durationInHours(booking.starts_at, booking.ends_at)} h · {booking.credits} cr
          </span>
        </div>
      </Link>
    </li>
  );
}
