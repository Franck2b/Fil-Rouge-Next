import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { BookingCard } from "@/components/app/booking-card";
import { requireOnboardedViewer } from "@/lib/auth";
import { getBookings } from "@/lib/data/account";
import { BOOKING_STATUS_LABELS, type BookingStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Mes réservations", robots: { index: false } };

const FILTERS: { value: string; label: string }[] = [
  { value: "", label: "Toutes" },
  ...(Object.keys(BOOKING_STATUS_LABELS) as BookingStatus[]).map((status) => ({
    value: status,
    label: BOOKING_STATUS_LABELS[status],
  })),
];

type SearchParams = Promise<{ statut?: string; page?: string }>;

export default function BookingsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Historique"
        title="Mes réservations"
        description="Toutes vos sessions, passées comme à venir, avec les crédits consommés."
        action={<ButtonLink href="/equipements">Nouvelle réservation</ButtonLink>}
      />

      <Suspense fallback={<ListSkeleton />}>
        <BookingList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function BookingList({ searchParams }: { searchParams: SearchParams }) {
  const viewer = await requireOnboardedViewer();
  const { statut = "", page: pageParam } = await searchParams;

  const page = Math.max(Number(pageParam) || 1, 1);
  const status = statut in BOOKING_STATUS_LABELS ? statut : "";

  const { bookings, total, perPage } = await getBookings(viewer.userId, { status, page });
  const pageCount = Math.max(Math.ceil(total / perPage), 1);

  const buildHref = (next: { statut?: string; page?: number }) => {
    const query = new URLSearchParams();
    const nextStatus = next.statut ?? status;
    const nextPage = next.page ?? page;
    if (nextStatus) query.set("statut", nextStatus);
    if (nextPage > 1) query.set("page", String(nextPage));
    const search = query.toString();
    return search ? `/reservations?${search}` : "/reservations";
  };

  return (
    <>
      <nav aria-label="Filtrer par statut">
        <ul className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => {
            const active = filter.value === status;
            return (
              <li key={filter.value || "all"}>
                <Link
                  href={buildHref({ statut: filter.value, page: 1 })}
                  aria-current={active ? "true" : undefined}
                  className={`label-tech border px-3 py-2 transition-colors ${
                    active
                      ? "border-rust bg-rust text-paper"
                      : "border-line bg-paper text-ink-soft hover:border-rust hover:text-rust"
                  }`}
                >
                  {filter.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {bookings.length === 0 ? (
        <EmptyState
          title={status ? "Aucune réservation avec ce statut" : "Pas encore de réservation"}
          description={
            status
              ? "Changez de filtre pour retrouver vos autres sessions."
              : "Votre première session apparaîtra ici, avec le détail des crédits consommés."
          }
          action={<ButtonLink href="/equipements">Parcourir le parc</ButtonLink>}
        />
      ) : (
        <>
          <p className="label-tech text-kraft" aria-live="polite">
            {total} réservation{total > 1 ? "s" : ""}
          </p>

          <ul className="grid gap-px border border-line bg-line">
            {bookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </ul>

          {pageCount > 1 ? (
            <nav aria-label="Pagination" className="flex items-center justify-between gap-4">
              {page > 1 ? (
                <Link
                  href={buildHref({ page: page - 1 })}
                  className="label-tech border border-line bg-paper px-3 py-2 hover:border-rust hover:text-rust"
                >
                  ← Précédent
                </Link>
              ) : (
                <span />
              )}

              <span className="label-tech text-kraft">
                Page {page} sur {pageCount}
              </span>

              {page < pageCount ? (
                <Link
                  href={buildHref({ page: page + 1 })}
                  className="label-tech border border-line bg-paper px-3 py-2 hover:border-rust hover:text-rust"
                >
                  Suivant →
                </Link>
              ) : (
                <span />
              )}
            </nav>
          ) : null}
        </>
      )}
    </>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-4" aria-busy>
      <div className="h-10 w-72 animate-pulse bg-paper" />
      <div className="grid gap-px border border-line bg-line">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse bg-paper" />
        ))}
      </div>
    </div>
  );
}
