import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Alert } from "@/components/ui/alert";
import { Badge, type Tone } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/app/page-header";
import { CancelBookingForm } from "@/components/booking/cancel-form";
import { requireOnboardedViewer } from "@/lib/auth";
import { getBookingById } from "@/lib/data/account";
import { BOOKING_STATUS_LABELS, CATEGORY_LABELS, type BookingStatus } from "@/lib/types";
import { durationInHours, formatDateTime, formatSlot } from "@/lib/format";
import { cancellationState } from "@/lib/booking";

export const metadata: Metadata = { title: "Détail de la réservation", robots: { index: false } };

const STATUS_TONES: Record<BookingStatus, Tone> = {
  pending: "amber",
  confirmed: "moss",
  cancelled: "brick",
  completed: "neutral",
};

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ nouveau?: string }>;
};

export default async function BookingDetailPage({ params, searchParams }: Props) {
  const viewer = await requireOnboardedViewer();
  const { id } = await params;
  const booking = await getBookingById(id);

  // RLS ne renvoie que les réservations du visiteur : une réservation d'autrui
  // arrive ici comme `null`, donc en 404 — on ne révèle pas son existence.
  if (!booking || booking.user_id !== viewer.userId) notFound();

  const { refundable, cancellable } = cancellationState(booking.starts_at, booking.status);

  return (
    <div className="space-y-8">
      <Suspense fallback={null}>
        <NewBookingNotice searchParams={searchParams} />
      </Suspense>

      <PageHeader
        eyebrow={
          booking.machine?.workshop
            ? `${booking.machine.workshop.name} · ${booking.machine.workshop.city}`
            : "Atelier retiré"
        }
        title={booking.machine?.name ?? "Machine retirée"}
        description={formatSlot(booking.starts_at, booking.ends_at)}
        action={
          <ButtonLink href="/reservations" variant="secondary" size="sm">
            Retour à la liste
          </ButtonLink>
        }
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
        <section className="border border-line bg-paper">
          <h2 className="sr-only">Détail</h2>
          <dl className="grid gap-px bg-line sm:grid-cols-2">
            {[
              { k: "Statut", v: BOOKING_STATUS_LABELS[booking.status] },
              { k: "Durée", v: `${durationInHours(booking.starts_at, booking.ends_at)} heure(s)` },
              { k: "Crédits", v: `${booking.credits} crédits` },
              {
                k: "Famille",
                v: booking.machine ? CATEGORY_LABELS[booking.machine.category] : "—",
              },
              { k: "Réservée le", v: formatDateTime(booking.created_at) },
              { k: "Référence", v: booking.id.slice(0, 8).toUpperCase() },
            ].map((row) => (
              <div key={row.k} className="bg-paper px-5 py-4">
                <dt className="label-tech text-kraft">{row.k}</dt>
                <dd className="mt-2 text-sm">{row.v}</dd>
              </div>
            ))}
          </dl>

          {booking.project ? (
            <div className="border-t border-line px-5 py-4">
              <p className="label-tech text-kraft">Projet</p>
              <p className="mt-2 text-sm">{booking.project}</p>
            </div>
          ) : null}
        </section>

        <aside className="space-y-6 border border-line bg-paper p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="label-tech text-kraft">État</p>
            <Badge tone={STATUS_TONES[booking.status]}>
              {BOOKING_STATUS_LABELS[booking.status]}
            </Badge>
          </div>

          {cancellable ? (
            <CancelBookingForm bookingId={booking.id} refundable={refundable} />
          ) : (
            <p className="text-sm text-ink-soft">
              {booking.status === "cancelled"
                ? "Cette réservation a été annulée."
                : "Ce créneau n'est plus modifiable."}
            </p>
          )}

          {booking.machine ? (
            <Link
              href={`/equipements/${booking.machine.slug}`}
              className="block text-sm text-rust underline underline-offset-4"
            >
              Voir la fiche machine
            </Link>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

async function NewBookingNotice({ searchParams }: { searchParams: Props["searchParams"] }) {
  const { nouveau } = await searchParams;
  if (!nouveau) return null;

  return (
    <Alert tone="success" title="Créneau réservé">
      Présentez-vous à l&apos;accueil dix minutes avant le début. Les crédits ont été débités.
    </Alert>
  );
}
