import { Suspense } from "react";
import type { Metadata } from "next";
import { Badge, type Tone } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Link } from "@/components/ui/link";
import { AdminHeader, AdminPanel } from "@/components/admin/admin-panel";
import { BookingStatusForm } from "@/components/admin/booking-status-form";
import { getAdminBookings } from "@/lib/data/admin";
import { getWorkshops } from "@/lib/data/catalog";
import { localizeMachine } from "@/lib/i18n/content";
import { getI18n } from "@/lib/i18n/server";
import { fill } from "@/lib/i18n/text";
import { BOOKING_STATUS_VALUES, isBookingStatus, type BookingStatus } from "@/lib/types";
import { durationInHours, formatSlot } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.admin.bookings.metaTitle, robots: { index: false } };
}

const STATUS_TONES: Record<BookingStatus, Tone> = {
  pending: "amber",
  confirmed: "moss",
  cancelled: "brick",
  completed: "neutral",
};

type SearchParams = Promise<{ statut?: string; atelier?: string; page?: string }>;

export default async function AdminBookingsPage({ searchParams }: { searchParams: SearchParams }) {
  const { t } = await getI18n();

  return (
    <div className="space-y-8">
      <AdminHeader title={t.admin.bookings.title} description={t.admin.bookings.description} />

      <Suspense fallback={<div className="h-64 animate-pulse border border-bone/15 bg-ink/40" />}>
        <BookingTable searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function BookingTable({ searchParams }: { searchParams: SearchParams }) {
  const [{ statut = "", atelier = "", page: pageParam }, { locale, t }] = await Promise.all([
    searchParams,
    getI18n(),
  ]);
  const page = Math.max(Number(pageParam) || 1, 1);
  const status = isBookingStatus(statut) ? statut : "";
  const copy = t.admin.bookings;

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
          label={copy.status}
          options={[
            { value: "", label: copy.all },
            ...BOOKING_STATUS_VALUES.map((value) => ({ value, label: t.bookingStatus[value] })),
          ]}
          current={status}
          buildHref={(value) => href({ statut: value, page: 1 })}
        />

        <FilterRow
          label={copy.workshop}
          options={[
            { value: "", label: copy.all },
            ...workshops.map((workshop) => ({ value: workshop.slug, label: workshop.city })),
          ]}
          current={atelier}
          buildHref={(value) => href({ atelier: value, page: 1 })}
        />
      </div>

      {bookings.length === 0 ? (
        <AdminPanel>
          <EmptyState title={copy.emptyTitle} description={copy.emptyText} />
        </AdminPanel>
      ) : (
        <AdminPanel>
          <ul className="space-y-px bg-line">
            {bookings.map((booking) => {
              const machine = booking.machine ? localizeMachine(booking.machine, locale) : null;

              return (
                <li
                  key={booking.id}
                  className="flex flex-wrap items-start justify-between gap-4 bg-paper py-4"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={STATUS_TONES[booking.status]}>
                        {t.bookingStatus[booking.status]}
                      </Badge>
                      <span className="label-tech text-kraft">{machine?.workshop?.city ?? "—"}</span>
                    </div>
                    <h3 className="mt-2 text-base font-medium">
                      {machine?.name ?? t.common.removedMachine}
                    </h3>
                    <p className="mt-1 text-sm text-ink-soft">
                      {booking.profile?.full_name || t.common.member} ·{" "}
                      {formatSlot(locale, booking.starts_at, booking.ends_at)}
                    </p>
                    <p className="label-tech mt-1 text-kraft">
                      {fill(t.common.bookingMeta, {
                        hours: durationInHours(booking.starts_at, booking.ends_at),
                        credits: booking.credits,
                      })}
                      {booking.project ? ` · ${booking.project}` : ""}
                    </p>
                  </div>

                  <BookingStatusForm bookingId={booking.id} status={booking.status} t={copy} />
                </li>
              );
            })}
          </ul>

          {pageCount > 1 ? (
            <nav aria-label={t.common.pagination} className="mt-6 flex items-center justify-between gap-4">
              {page > 1 ? (
                <Link href={href({ page: page - 1 })} className="label-tech text-rust">
                  {t.common.previous}
                </Link>
              ) : (
                <span />
              )}
              <span className="label-tech text-kraft">
                {fill(t.common.pageOf, { page, total: pageCount })}
              </span>
              {page < pageCount ? (
                <Link href={href({ page: page + 1 })} className="label-tech text-rust">
                  {t.common.next}
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
