import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/components/ui/link";
import { AdminHeader, AdminPanel } from "@/components/admin/admin-panel";
import { getAdminOverview, getPendingCertifications, getAdminBookings } from "@/lib/data/admin";
import { localizeMachine } from "@/lib/i18n/content";
import { getI18n } from "@/lib/i18n/server";
import { fill, plural } from "@/lib/i18n/text";
import { formatDateTime, formatSlot } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.admin.overview.metaTitle, robots: { index: false } };
}

export default async function AdminOverviewPage() {
  const [{ locale, t }, overview, pending, recent] = await Promise.all([
    getI18n(),
    getAdminOverview(),
    getPendingCertifications(),
    getAdminBookings({ perPage: 6 }),
  ]);

  const copy = t.admin.overview;

  return (
    <div className="space-y-10">
      <AdminHeader title={copy.title} description={copy.description} />

      <section aria-labelledby="indicateurs">
        <h2 id="indicateurs" className="sr-only">
          {copy.indicators}
        </h2>
        <dl className="grid gap-px border border-bone/15 bg-bone/15 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: copy.members, value: overview.members, hint: copy.membersHint },
            {
              label: copy.pendingCertifications,
              value: overview.pendingCertifications,
              hint: copy.pendingHint,
            },
            { label: copy.upcoming, value: overview.upcomingBookings, hint: copy.upcomingHint },
            { label: copy.weekCredits, value: overview.creditsThisWeek, hint: copy.weekCreditsHint },
          ].map((stat) => (
            <div key={stat.label} className="bg-ink px-5 py-5">
              <dt className="label-tech text-kraft">{stat.label}</dt>
              <dd className="mt-3 font-display text-4xl">{stat.value}</dd>
              <p className="mt-1 text-xs text-bone/40">{stat.hint}</p>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <AdminPanel
          title={copy.queueTitle}
          description={plural(locale, copy.queueDescription, pending.length)}
        >
          {pending.length === 0 ? (
            <p className="text-sm text-ink-soft">{copy.nothingToProcess}</p>
          ) : (
            <ul className="space-y-px bg-line">
              {pending.slice(0, 5).map((certification) => (
                <li
                  key={certification.id}
                  className="flex items-center justify-between gap-4 bg-paper py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {certification.profile?.full_name || t.common.member}
                    </p>
                    <p className="label-tech mt-1 text-kraft">
                      {t.categories[certification.category].label} ·{" "}
                      {formatDateTime(locale, certification.created_at)}
                    </p>
                  </div>
                  <Badge tone="amber">{t.admin.pending}</Badge>
                </li>
              ))}
            </ul>
          )}

          <Link
            href="/admin/habilitations"
            className="mt-5 inline-block text-sm text-rust underline underline-offset-4"
          >
            {copy.openQueue}
          </Link>
        </AdminPanel>

        <AdminPanel
          title={copy.fleetTitle}
          description={fill(copy.fleetDescription, {
            total: overview.machinesTotal,
            maintenance: overview.machinesInMaintenance,
          })}
        >
          <ul className="space-y-px bg-line">
            {recent.bookings.slice(0, 5).map((booking) => (
              <li key={booking.id} className="bg-paper py-3">
                <p className="truncate text-sm font-medium">
                  {booking.machine
                    ? localizeMachine(booking.machine, locale).name
                    : t.common.removedMachine}
                </p>
                <p className="label-tech mt-1 text-kraft">
                  {booking.profile?.full_name || t.common.member} ·{" "}
                  {formatSlot(locale, booking.starts_at, booking.ends_at)}
                </p>
              </li>
            ))}
          </ul>

          <Link
            href="/admin/machines"
            className="mt-5 inline-block text-sm text-rust underline underline-offset-4"
          >
            {copy.manageFleet}
          </Link>
        </AdminPanel>
      </div>
    </div>
  );
}
