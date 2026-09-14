import type { Metadata } from "next";
import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/app/page-header";
import { CertificationRequestForm } from "@/components/certifications/request-form";
import { requireOnboardedViewer } from "@/lib/auth";
import { getCertifications } from "@/lib/data/account";
import {
  CATEGORY_LABELS,
  CERTIFICATION_STATUS_LABELS,
  MACHINE_CATEGORIES,
  type MachineCategory,
} from "@/lib/types";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Mes habilitations", robots: { index: false } };

export default async function CertificationsPage() {
  const viewer = await requireOnboardedViewer();
  const certifications = await getCertifications(viewer.userId);

  // Une famille refusée peut faire l'objet d'une nouvelle demande ; une famille
  // validée ou en cours d'examen, non.
  const blocked = new Set(
    certifications.filter((c) => c.status !== "rejected").map((c) => c.category),
  );
  const available = MACHINE_CATEGORIES.map((c) => c.value).filter(
    (category) => !blocked.has(category),
  ) as MachineCategory[];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Sécurité"
        title="Mes habilitations"
        description="Chaque famille de machines demande une validation par un référent. Une fois obtenue, elle vaut sur les trois ateliers."
      />

      <section aria-labelledby="liste" className="space-y-4">
        <h2 id="liste" className="text-xl uppercase">
          Où j&apos;en suis
        </h2>

        {certifications.length === 0 ? (
          <Alert tone="info">Aucune demande enregistrée pour l&apos;instant.</Alert>
        ) : (
          <ul className="grid gap-px border border-line bg-line">
            {certifications.map((certification) => (
              <li key={certification.id} className="bg-paper px-5 py-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg">{CATEGORY_LABELS[certification.category]}</h3>
                    <p className="label-tech mt-1 text-kraft">
                      Demandée le {formatDateTime(certification.created_at)}
                    </p>
                  </div>
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
                </div>

                {certification.review_note ? (
                  <p className="mt-4 border-l-2 border-line pl-4 text-sm text-ink-soft">
                    <span className="label-tech block text-kraft">Note du référent</span>
                    {certification.review_note}
                  </p>
                ) : null}

                {certification.status === "approved" ? (
                  <Link
                    href={`/equipements?categorie=${certification.category}`}
                    className="mt-4 inline-block text-sm text-rust underline underline-offset-4"
                  >
                    Voir les machines débloquées
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="demande" className="space-y-4">
        <h2 id="demande" className="text-xl uppercase">
          Demander une habilitation
        </h2>
        <div className="border border-line bg-paper p-6 sm:p-8">
          <CertificationRequestForm availableCategories={available} />
        </div>
      </section>
    </div>
  );
}
