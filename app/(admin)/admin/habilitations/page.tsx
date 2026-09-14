import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { AdminHeader, AdminPanel } from "@/components/admin/admin-panel";
import { CertificationReview } from "@/components/admin/certification-review";
import { getPendingCertifications, getReviewedCertifications } from "@/lib/data/admin";
import { CATEGORY_LABELS, CERTIFICATION_STATUS_LABELS } from "@/lib/types";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Habilitations · Back-office", robots: { index: false } };

export default async function AdminCertificationsPage() {
  const [pending, reviewed] = await Promise.all([
    getPendingCertifications(),
    getReviewedCertifications(),
  ]);

  return (
    <div className="space-y-10">
      <AdminHeader
        title="Habilitations"
        description="Chaque validation ouvre l'accès à une famille de machines. C'est la décision la plus sensible du produit."
      />

      <section aria-labelledby="file" className="space-y-4">
        <h2 id="file" className="text-xl uppercase">
          File d&apos;arbitrage ({pending.length})
        </h2>

        {pending.length === 0 ? (
          <AdminPanel>
            <p className="text-sm text-ink-soft">Aucune demande en attente. Tout est traité.</p>
          </AdminPanel>
        ) : (
          <ul className="space-y-6">
            {pending.map((certification) => (
              <li key={certification.id}>
                <AdminPanel>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg">
                        {certification.profile?.full_name || "Membre sans nom"}
                      </h3>
                      <p className="label-tech mt-1 text-kraft">
                        {CATEGORY_LABELS[certification.category]} · demandée le{" "}
                        {formatDateTime(certification.created_at)}
                      </p>
                    </div>
                    <Badge tone="amber">En attente</Badge>
                  </div>

                  <blockquote className="mt-4 border-l-2 border-rust bg-rust-wash px-4 py-3 text-sm text-ink-soft">
                    {certification.motivation}
                  </blockquote>

                  <div className="mt-5">
                    <CertificationReview certificationId={certification.id} />
                  </div>
                </AdminPanel>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="historique" className="space-y-4">
        <h2 id="historique" className="text-xl uppercase">
          Décisions récentes
        </h2>

        <AdminPanel>
          {reviewed.length === 0 ? (
            <p className="text-sm text-ink-soft">Aucune décision enregistrée.</p>
          ) : (
            <ul className="space-y-px bg-line">
              {reviewed.map((certification) => (
                <li
                  key={certification.id}
                  className="flex flex-wrap items-center justify-between gap-3 bg-paper py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {certification.profile?.full_name || "Membre"}
                    </p>
                    <p className="label-tech mt-1 text-kraft">
                      {CATEGORY_LABELS[certification.category]}
                      {certification.reviewed_at
                        ? ` · ${formatDateTime(certification.reviewed_at)}`
                        : ""}
                    </p>
                  </div>
                  <Badge tone={certification.status === "approved" ? "moss" : "brick"}>
                    {CERTIFICATION_STATUS_LABELS[certification.status]}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>
      </section>
    </div>
  );
}
