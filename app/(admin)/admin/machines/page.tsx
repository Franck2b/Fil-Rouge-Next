import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AdminHeader, AdminPanel } from "@/components/admin/admin-panel";
import { MachineRowForm } from "@/components/admin/machine-row-form";
import { getAdminMachines } from "@/lib/data/admin";
import { CATEGORY_LABELS, MACHINE_STATUS_LABELS } from "@/lib/types";

export const metadata: Metadata = { title: "Parc machines · Back-office", robots: { index: false } };

export default async function AdminMachinesPage() {
  const machines = await getAdminMachines();

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Parc machines"
        description="Passer une machine en maintenance la retire immédiatement du planning et du catalogue public — le cache de la vitrine est invalidé par tag à l'enregistrement."
      />

      <ul className="space-y-6">
        {machines.map((machine) => (
          <li key={machine.id}>
            <AdminPanel>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="rust">{CATEGORY_LABELS[machine.category]}</Badge>
                    <Badge
                      tone={
                        machine.status === "available"
                          ? "moss"
                          : machine.status === "maintenance"
                            ? "amber"
                            : "brick"
                      }
                    >
                      {MACHINE_STATUS_LABELS[machine.status]}
                    </Badge>
                  </div>
                  <h2 className="mt-3 text-lg">{machine.name}</h2>
                  <p className="label-tech mt-1 text-kraft">
                    {machine.workshop?.name} — {machine.workshop?.city}
                  </p>
                  <Link
                    href={`/equipements/${machine.slug}`}
                    className="mt-2 inline-block text-sm text-rust underline underline-offset-4"
                  >
                    Voir la fiche publique
                  </Link>
                </div>

                <MachineRowForm
                  machineId={machine.id}
                  status={machine.status}
                  hourlyCredits={machine.hourly_credits}
                />
              </div>
            </AdminPanel>
          </li>
        ))}
      </ul>
    </div>
  );
}
