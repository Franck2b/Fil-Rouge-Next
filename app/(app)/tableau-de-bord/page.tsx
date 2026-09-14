import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { BookingCard } from "@/components/app/booking-card";
import { requireOnboardedViewer } from "@/lib/auth";
import { getCertifications, getCreditHistory, getUpcomingBookings } from "@/lib/data/account";
import { getMachines } from "@/lib/data/catalog";
import { CATEGORY_LABELS, CERTIFICATION_STATUS_LABELS } from "@/lib/types";
import { formatCredits, formatDateTime } from "@/lib/format";

export const metadata: Metadata = {
  title: "Tableau de bord",
  robots: { index: false },
};

export default function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ bienvenue?: string; erreur?: string }>;
}) {
  return (
    <div className="space-y-10">
      <Suspense fallback={null}>
        <DashboardNotice searchParams={searchParams} />
      </Suspense>

      <DashboardContent />
    </div>
  );
}

async function DashboardNotice({
  searchParams,
}: {
  searchParams: Promise<{ bienvenue?: string; erreur?: string }>;
}) {
  const { bienvenue, erreur } = await searchParams;

  if (erreur === "acces-refuse") {
    return (
      <Alert tone="error" title="Accès refusé">
        Cette section est réservée aux administrateurs de l&apos;atelier.
      </Alert>
    );
  }

  if (bienvenue) {
    return (
      <Alert tone="success" title="Compte prêt">
        Votre demande d&apos;habilitation est partie. En attendant la réponse, explorez le parc et
        repérez les créneaux qui vous arrangent.
      </Alert>
    );
  }

  return null;
}

async function DashboardContent() {
  const viewer = await requireOnboardedViewer();

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

  const firstName = viewer.profile.full_name.split(" ")[0] || "bienvenue";

  return (
    <>
      <PageHeader
        eyebrow="Votre espace"
        title={`Bonjour, ${firstName}`}
        description="Vos créneaux à venir, vos habilitations et le solde de vos crédits."
        action={<ButtonLink href="/equipements">Réserver une machine</ButtonLink>}
      />

      <section aria-labelledby="synthese">
        <h2 id="synthese" className="sr-only">
          Synthèse
        </h2>
        <dl className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Crédits disponibles", value: viewer.profile.credits_balance, hint: "1 crédit ≈ 1,80 €" },
            { label: "Créneaux à venir", value: bookings.length, hint: "Réservations confirmées" },
            { label: "Habilitations", value: approved.length, hint: `${pending.length} en attente` },
            { label: "Machines ouvertes", value: openMachines.length, hint: "Réservables aujourd'hui" },
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
            Prochains créneaux
          </h2>
          <Link href="/reservations" className="text-sm text-rust underline underline-offset-4">
            Tout l&apos;historique
          </Link>
        </div>

        {bookings.length === 0 ? (
          <EmptyState
            title="Aucun créneau réservé"
            description={
              approved.length === 0
                ? "Votre première habilitation est encore en cours d'examen. Dès qu'elle est validée, le planning s'ouvre."
                : "Choisissez une machine dans le parc et sélectionnez une plage horaire."
            }
            action={
              <ButtonLink href="/equipements">
                {approved.length === 0 ? "Découvrir le parc" : "Réserver un créneau"}
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
              Habilitations
            </h2>
            <Link href="/habilitations" className="text-sm text-rust underline underline-offset-4">
              Gérer
            </Link>
          </div>

          {certifications.length === 0 ? (
            <div className="border border-dashed border-line bg-paper p-6 text-sm text-ink-soft">
              Aucune demande pour le moment.
            </div>
          ) : (
            <ul className="space-y-px border border-line bg-line">
              {certifications.map((certification) => (
                <li
                  key={certification.id}
                  className="flex items-center justify-between gap-4 bg-paper px-5 py-4"
                >
                  <span className="text-sm font-medium">
                    {CATEGORY_LABELS[certification.category]}
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
                    {CERTIFICATION_STATUS_LABELS[certification.status]}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="credits" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 id="credits" className="text-xl uppercase">
              Mouvements de crédits
            </h2>
            <Link
              href="/parametres/credits"
              className="text-sm text-rust underline underline-offset-4"
            >
              Détail
            </Link>
          </div>

          <ul className="space-y-px border border-line bg-line">
            {credits.map((transaction) => (
              <li
                key={transaction.id}
                className="flex items-center justify-between gap-4 bg-paper px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm">{transaction.reason}</p>
                  <p className="label-tech mt-1 text-kraft">
                    {formatDateTime(transaction.created_at)}
                  </p>
                </div>
                <span
                  className={`font-mono text-sm ${
                    transaction.delta > 0 ? "text-moss" : "text-brick"
                  }`}
                >
                  {formatCredits(transaction.delta)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
