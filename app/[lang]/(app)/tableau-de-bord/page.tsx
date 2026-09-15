import { Suspense } from "react";
import type { Metadata } from "next";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Link } from "@/components/ui/link";
import { PageHeader } from "@/components/app/page-header";
import { BookingCard } from "@/components/app/booking-card";
import { requireOnboardedViewer } from "@/lib/auth";
import { getCertifications, getCreditHistory, getUpcomingBookings } from "@/lib/data/account";
import { getMachines } from "@/lib/data/catalog";
import { localizeCreditReason } from "@/lib/i18n/content";
import { getI18n } from "@/lib/i18n/server";
import { fill } from "@/lib/i18n/text";
import { formatCredits, formatDateTime } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.app.dashboard.metaTitle, robots: { index: false } };
}

type SearchParams = Promise<{ bienvenue?: string; erreur?: string }>;

export default function DashboardPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="space-y-10">
      <Suspense fallback={null}>
        <DashboardNotice searchParams={searchParams} />
      </Suspense>

      <DashboardContent />
    </div>
  );
}

async function DashboardNotice({ searchParams }: { searchParams: SearchParams }) {
  const [{ bienvenue, erreur }, { t }] = await Promise.all([searchParams, getI18n()]);

  if (erreur === "acces-refuse") {
    return (
      <Alert tone="error" title={t.app.dashboard.accessDeniedTitle}>
        {t.app.dashboard.accessDeniedText}
      </Alert>
    );
  }

  if (bienvenue) {
    return (
      <Alert tone="success" title={t.app.dashboard.welcomeTitle}>
        {t.app.dashboard.welcomeText}
      </Alert>
    );
  }

  return null;
}

async function DashboardContent() {
  const [viewer, { locale, t }] = await Promise.all([requireOnboardedViewer(), getI18n()]);

  const [bookings, certifications, credits, machines] = await Promise.all([
    getUpcomingBookings(viewer.userId),
    getCertifications(viewer.userId),
    getCreditHistory(viewer.userId, 5),
    getMachines(),
  ]);

  const approved = certifications.filter((c) => c.status === "approved");
  const pending = certifications.filter((c) => c.status === "pending");
  const openMachines = machines.filter(
    (machine) => machine.status === "available" && approved.some((c) => c.category === machine.category),
  );

  const firstName = viewer.profile.full_name.split(" ")[0];
  const copy = t.app.dashboard;

  return (
    <>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={firstName ? fill(copy.hello, { name: firstName }) : copy.helloFallback}
        description={copy.description}
        action={<ButtonLink href="/equipements">{copy.book}</ButtonLink>}
      />

      <section aria-labelledby="synthese">
        <h2 id="synthese" className="sr-only">
          {copy.summary}
        </h2>
        <dl className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: copy.statCredits, value: viewer.profile.credits_balance, hint: copy.statCreditsHint },
            { label: copy.statUpcoming, value: bookings.length, hint: copy.statUpcomingHint },
            {
              label: copy.statCertifications,
              value: approved.length,
              hint: fill(copy.statCertificationsHint, { count: pending.length }),
            },
            { label: copy.statMachines, value: openMachines.length, hint: copy.statMachinesHint },
          ].map((stat) => (
            <div key={stat.label} className="bg-paper px-5 py-5">
              <dt className="label-tech text-kraft">{stat.label}</dt>
              <dd className="mt-3 font-display text-4xl">{stat.value}</dd>
              <p className="mt-1 text-xs text-kraft">{stat.hint}</p>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="prochains" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 id="prochains" className="text-xl uppercase">
            {copy.upcomingTitle}
          </h2>
          <Link href="/reservations" className="text-sm text-rust underline underline-offset-4">
            {copy.fullHistory}
          </Link>
        </div>

        {bookings.length === 0 ? (
          <EmptyState
            title={copy.emptyTitle}
            description={approved.length === 0 ? copy.emptyPending : copy.emptyReady}
            action={
              <ButtonLink href="/equipements">
                {approved.length === 0 ? copy.discoverFleet : copy.bookSlot}
              </ButtonLink>
            }
          />
        ) : (
          <ul className="grid gap-px border border-line bg-line">
            {bookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="habilitations" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 id="habilitations" className="text-xl uppercase">
              {copy.certificationsTitle}
            </h2>
            <Link href="/habilitations" className="text-sm text-rust underline underline-offset-4">
              {copy.manage}
            </Link>
          </div>

          {certifications.length === 0 ? (
            <div className="border border-dashed border-line bg-paper p-6 text-sm text-ink-soft">
              {copy.noRequests}
            </div>
          ) : (
            <ul className="space-y-px border border-line bg-line">
              {certifications.map((certification) => (
                <li
                  key={certification.id}
                  className="flex items-center justify-between gap-4 bg-paper px-5 py-4"
                >
                  <span className="text-sm font-medium">
                    {t.categories[certification.category].label}
                  </span>
                  <Badge
                    tone={
                      certification.status === "approved"
                        ? "moss"
                        : certification.status === "pending"
                          ? "amber"
                          : "brick"
                    }
                  >
                    {t.certificationStatus[certification.status]}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="credits" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 id="credits" className="text-xl uppercase">
              {copy.creditsTitle}
            </h2>
            <Link
              href="/parametres/credits"
              className="text-sm text-rust underline underline-offset-4"
            >
              {copy.details}
            </Link>
          </div>

          <ul className="space-y-px border border-line bg-line">
            {credits.map((transaction) => (
              <li
                key={transaction.id}
                className="flex items-center justify-between gap-4 bg-paper px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm">
                    {localizeCreditReason(transaction.reason, locale)}
                  </p>
                  <p className="label-tech mt-1 text-kraft">
                    {formatDateTime(locale, transaction.created_at)}
                  </p>
                </div>
                <span
                  className={`font-mono text-sm ${
                    transaction.delta > 0 ? "text-moss" : "text-brick"
                  }`}
                >
                  {formatCredits(locale, t.plural.credits, transaction.delta)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
