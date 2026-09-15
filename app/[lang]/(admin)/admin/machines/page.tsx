import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/components/ui/link";
import { AdminHeader, AdminPanel } from "@/components/admin/admin-panel";
import { MachineRowForm } from "@/components/admin/machine-row-form";
import { getAdminMachines } from "@/lib/data/admin";
import { localizeMachine } from "@/lib/i18n/content";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.admin.machines.metaTitle, robots: { index: false } };
}

export default async function AdminMachinesPage() {
  const [{ locale, t }, machines] = await Promise.all([getI18n(), getAdminMachines()]);
  const copy = t.admin.machines;

  return (
    <div className="space-y-8">
      <AdminHeader title={copy.title} description={copy.description} />

      <ul className="space-y-6">
        {machines.map((source) => {
          const machine = localizeMachine(source, locale);

          return (
            <li key={machine.id}>
              <AdminPanel>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="rust">{t.categories[machine.category].label}</Badge>
                      <Badge
                        tone={
                          machine.status === "available"
                            ? "moss"
                            : machine.status === "maintenance"
                              ? "amber"
                              : "brick"
                        }
                      >
                        {t.machineStatus[machine.status]}
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
                      {copy.publicSheet}
                    </Link>
                  </div>

                  <MachineRowForm
                    machineId={machine.id}
                    status={machine.status}
                    hourlyCredits={machine.hourly_credits}
                    t={copy}
                    statusLabels={t.machineStatus}
                  />
                </div>
              </AdminPanel>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
