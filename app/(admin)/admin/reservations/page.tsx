import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Badge, type Tone } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { AdminHeader, AdminPanel } from "@/components/admin/admin-panel";
import { BookingStatusForm } from "@/components/admin/booking-status-form";
import { getAdminBookings } from "@/lib/data/admin";
import { getWorkshops } from "@/lib/data/catalog";
import { BOOKING_STATUS_LABELS, type BookingStatus } from "@/lib/types";
import { durationInHours, formatSlot } from "@/lib/format";

export const metadata: Metadata = { title: "Réservations · Back-office", robots: { index: false } };

const STATUS_TONES: Record<BookingStatus, Tone> = {
  pending: "amber",
  confirmed: "moss",
  cancelled: "brick",
  completed: "neutral",
};

type SearchParams = Promise<{ statut?: string; atelier?: string; page?: string }>;

export default function AdminBookingsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="space-y-8">
      <AdminHeader
        title="Réservations"
        description="Toutes les sessions du réseau, filtrables par statut et par atelier."
      />

      <Suspense fallback={<div className="h-64 animate-pulse border border-bone/15 bg-ink/40" />}>
        <BookingTable searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function BookingTable({ searchParams }: { searchParams: SearchParams }) {
  const { statut = "", atelier = "", page: pageParam } = await searchParams;
  const page = Math.max(Number(pageParam) || 1, 1);
  const status = statut in BOOKING_STATUS_LABELS ? statut : "";

  const [{ bookings, total, perPage }, workshops] = await Promise.all([
    getAdminBookings({ status, workshop: atelier, page }),
    getWorkshops(),
  ]);

  const pageCount = Math.max(Math.ceil(total / perPage), 1);

  const href = (next: { statut?: string; atelier?: string; page?: number }) => {
    const query = new URLSearchParams();
    const nextStatus = next.statut ?? status;
    const nextWorkshop = next.atelier ?? atelier;
    const nextPage = next.page ?? page;
    if (nextStatus) query.set("statut", nextStatus);
    if (nextWorkshop) query.set("atelier", nextWorkshop);
    if (nextPage > 1) query.set("page", String(nextPage));
    const search = query.toString();
    return search ? `/admin/reservations?${search}` : "/admin/reservations";
  };

  return (
    <>
      <div className="space-y-4">
        <FilterRow
          label="Statut"
          options={[
            { value: "", label: "Tous" },
            ...(Object.keys(BOOKING_STATUS_LABELS) as BookingStatus[]).map((value) => ({
              value,
              label: BOOKING_STATUS_LABELS[value],
            })),
          ]}
          current={status}
          buildHref={(value) => href({ statut: value, page: 1 })}
        />

        <FilterRow
          label="Atelier"
          options={[
            { value: "", label: "Tous" },
            ...workshops.map((workshop) => ({ value: workshop.slug, label: workshop.city })),
          ]}
          current={atelier}
          buildHref={(value) => href({ atelier: value, page: 1 })}
        />
      </div>

      {bookings.length === 0 ? (
        <AdminPanel>
          <EmptyState
            title="Aucune réservation"
            description="Aucune session ne correspond à ces filtres."
          />
        </AdminPanel>
      ) : (
        <AdminPanel>
          <ul className="space-y-px bg-line">
            {bookings.map((booking) => (
              <li
                key={booking.id}
                className="flex flex-wrap items-start justify-between gap-4 bg-paper py-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={STATUS_TONES[booking.status]}>
                      {BOOKING_STATUS_LABELS[booking.status]}
                    </Badge>
                    <span className="label-tech text-kraft">
                      {booking.machine?.workshop?.city ?? "—"}
                    </span>
                  </div>
                  <h3 className="mt-2 text-base font-medium">
                    {booking.machine?.name ?? "Machine retirée"}
                  </h3>
                  <p className="mt-1 text-sm text-ink-soft">
                    {booking.profile?.full_name || "Membre"} ·{" "}
                    {formatSlot(booking.starts_at, booking.ends_at)}
                  </p>
                  <p className="label-tech mt-1 text-kraft">
                    {durationInHours(booking.starts_at, booking.ends_at)} h · {booking.credits}{" "}
                    crédits
                    {booking.project ? ` · ${booking.project}` : ""}
                  </p>
                </div>

                <BookingStatusForm bookingId={booking.id} status={booking.status} />
              </li>
            ))}
          </ul>

          {pageCount > 1 ? (
            <nav aria-label="Pagination" className="mt-6 flex items-center justify-between gap-4">
              {page > 1 ? (
                <Link href={href({ page: page - 1 })} className="label-tech text-rust">
                  ← Précédent
                </Link>
              ) : (
                <span />
              )}
              <span className="label-tech text-kraft">
                Page {page} sur {pageCount}
              </span>
              {page < pageCount ? (
                <Link href={href({ page: page + 1 })} className="label-tech text-rust">
                  Suivant →
                </Link>
              ) : (
                <span />
              )}
            </nav>
          ) : null}
        </AdminPanel>
      )}
    </>
  );
}

function FilterRow({
  label,
  options,
  current,
  buildHref,
}: {
  label: string;
  options: { value: string; label: string }[];
  current: string;
  buildHref: (value: string) => string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="label-tech w-16 text-kraft">{label}</span>
      <ul className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = option.value === current;
          return (
            <li key={option.value || "all"}>
              <Link
                href={buildHref(option.value)}
                aria-current={active ? "true" : undefined}
                className={`label-tech border px-3 py-1.5 transition-colors ${
                  active
                    ? "border-rust bg-rust text-paper"
                    : "border-bone/20 text-bone/60 hover:border-rust hover:text-rust"
                }`}
              >
                {option.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
