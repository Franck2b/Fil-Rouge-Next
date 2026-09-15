import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Alert } from "@/components/ui/alert";
import { Badge, type Tone } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { PageHeader } from "@/components/app/page-header";
import { CancelBookingForm } from "@/components/booking/cancel-form";
import { requireOnboardedViewer } from "@/lib/auth";
import { getBookingById } from "@/lib/data/account";
import { localizeMachine } from "@/lib/i18n/content";
import { getI18n } from "@/lib/i18n/server";
import { plural } from "@/lib/i18n/text";
import type { BookingStatus } from "@/lib/types";
import { durationInHours, formatDateTime, formatSlot } from "@/lib/format";
import { cancellationState } from "@/lib/booking";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.app.booking.metaTitle, robots: { index: false } };
}

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
  const [viewer, { id }, { locale, t }] = await Promise.all([
    requireOnboardedViewer(),
    params,
    getI18n(),
  ]);
  const booking = await getBookingById(id);

  // RLS ne renvoie que les réservations du visiteur : une réservation d'autrui
  // arrive ici comme `null`, donc en 404 — on ne révèle pas son existence.
  if (!booking || booking.user_id !== viewer.userId) notFound();

  const machine = booking.machine ? localizeMachine(booking.machine, locale) : null;
  const { refundable, cancellable } = cancellationState(booking.starts_at, booking.status);
  const copy = t.app.booking;

  return (
    <div className="space-y-8">
      <Suspense fallback={null}>
        <NewBookingNotice searchParams={searchParams} />
      </Suspense>

      <PageHeader
        eyebrow={
          machine?.workshop
            ? `${machine.workshop.name} · ${machine.workshop.city}`
            : t.common.removedWorkshop
        }
        title={machine?.name ?? t.common.removedMachine}
        description={formatSlot(locale, booking.starts_at, booking.ends_at)}
        action={
          <ButtonLink href="/reservations" variant="secondary" size="sm">
            {copy.backToList}
          </ButtonLink>
        }
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
        <section className="border border-line bg-paper">
          <h2 className="sr-only">{copy.detail}</h2>
          <dl className="grid gap-px bg-line sm:grid-cols-2">
            {[
              { k: copy.status, v: t.bookingStatus[booking.status] },
              {
                k: copy.duration,
                v: plural(locale, t.plural.hours, durationInHours(booking.starts_at, booking.ends_at)),
              },
              { k: copy.credits, v: plural(locale, t.plural.credits, booking.credits) },
              { k: copy.family, v: machine ? t.categories[machine.category].label : "—" },
              { k: copy.bookedOn, v: formatDateTime(locale, booking.created_at) },
              { k: copy.reference, v: booking.id.slice(0, 8).toUpperCase() },
            ].map((row) => (
              <div key={row.k} className="bg-paper px-5 py-4">
                <dt className="label-tech text-kraft">{row.k}</dt>
                <dd className="mt-2 text-sm">{row.v}</dd>
              </div>
            ))}
          </dl>

          {booking.project ? (
            <div className="border-t border-line px-5 py-4">
              <p className="label-tech text-kraft">{copy.project}</p>
              <p className="mt-2 text-sm">{booking.project}</p>
            </div>
          ) : null}
        </section>

        <aside className="space-y-6 border border-line bg-paper p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="label-tech text-kraft">{copy.state}</p>
            <Badge tone={STATUS_TONES[booking.status]}>{t.bookingStatus[booking.status]}</Badge>
          </div>

          {cancellable ? (
            <CancelBookingForm bookingId={booking.id} refundable={refundable} t={copy} />
          ) : (
            <p className="text-sm text-ink-soft">
              {booking.status === "cancelled" ? copy.cancelled : copy.locked}
            </p>
          )}

          {machine ? (
            <Link
              href={`/equipements/${machine.slug}`}
              className="block text-sm text-rust underline underline-offset-4"
            >
              {copy.seeMachine}
            </Link>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

async function NewBookingNotice({ searchParams }: { searchParams: Props["searchParams"] }) {
  const [{ nouveau }, { t }] = await Promise.all([searchParams, getI18n()]);
  if (!nouveau) return null;

  return (
    <Alert tone="success" title={t.app.booking.newTitle}>
      {t.app.booking.newText}
    </Alert>
  );
}
