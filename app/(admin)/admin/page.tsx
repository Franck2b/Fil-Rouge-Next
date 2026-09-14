import Link from "next/link";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { AdminHeader, AdminPanel } from "@/components/admin/admin-panel";
import { getAdminOverview, getPendingCertifications, getAdminBookings } from "@/lib/data/admin";
import { CATEGORY_LABELS } from "@/lib/types";
import { formatDateTime, formatSlot } from "@/lib/format";

export const metadata: Metadata = { title: "Back-office", robots: { index: false } };

export default async function AdminOverviewPage() {
  const [overview, pending, recent] = await Promise.all([
    getAdminOverview(),
    getPendingCertifications(),
    getAdminBookings({ perPage: 6 }),
  ]);

  return (
    <div className="space-y-10">
      <AdminHeader
        title="Vue d'ensemble"
        description="L'état du réseau : demandes à arbitrer, charge des ateliers et consommation de crédits."
      />

      <section aria-labelledby="indicateurs">
        <h2 id="indicateurs" className="sr-only">
          Indicateurs
        </h2>
        <dl className="grid gap-px border border-bone/15 bg-bone/15 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Membres", value: overview.members, hint: "Comptes créés" },
            {
              label: "Habilitations en attente",
              value: overview.pendingCertifications,
              hint: "À arbitrer",
            },
            { label: "Créneaux à venir", value: overview.upcomingBookings, hint: "Confirmés" },
            {
              label: "Crédits sur 7 jours",
              value: overview.creditsThisWeek,
              hint: "Consommés par les réservations",
            },
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
          title="À arbitrer"
          description={`${pending.length} demande(s) d'habilitation en attente.`}
        >
          {pending.length === 0 ? (
            <p className="text-sm text-ink-soft">Rien à traiter pour le moment.</p>
          ) : (
            <ul className="space-y-px bg-line">
              {pending.slice(0, 5).map((certification) => (
                <li
                  key={certification.id}
                  className="flex items-center justify-between gap-4 bg-paper py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {certification.profile?.full_name || "Membre"}
                    </p>
                    <p className="label-tech mt-1 text-kraft">
                      {CATEGORY_LABELS[certification.category]} ·{" "}
                      {formatDateTime(certification.created_at)}
                    </p>
                  </div>
                  <Badge tone="amber">En attente</Badge>
                </li>
              ))}
            </ul>
          )}

          <Link
            href="/admin/habilitations"
            className="mt-5 inline-block text-sm text-rust underline underline-offset-4"
          >
            Ouvrir la file d&apos;arbitrage
          </Link>
        </AdminPanel>

        <AdminPanel
          title="Parc"
          description={`${overview.machinesTotal} machines, dont ${overview.machinesInMaintenance} en maintenance.`}
        >
          <ul className="space-y-px bg-line">
            {recent.bookings.slice(0, 5).map((booking) => (
              <li key={booking.id} className="bg-paper py-3">
                <p className="truncate text-sm font-medium">
                  {booking.machine?.name ?? "Machine retirée"}
                </p>
                <p className="label-tech mt-1 text-kraft">
                  {booking.profile?.full_name || "Membre"} ·{" "}
                  {formatSlot(booking.starts_at, booking.ends_at)}
                </p>
              </li>
            ))}
          </ul>

          <Link
            href="/admin/machines"
            className="mt-5 inline-block text-sm text-rust underline underline-offset-4"
          >
            Gérer le parc
          </Link>
        </AdminPanel>
      </div>
    </div>
  );
}
