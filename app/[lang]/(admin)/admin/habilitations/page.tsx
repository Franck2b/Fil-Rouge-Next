import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { AdminHeader, AdminPanel } from "@/components/admin/admin-panel";
import { CertificationReview } from "@/components/admin/certification-review";
import { getPendingCertifications, getReviewedCertifications } from "@/lib/data/admin";
import { getI18n } from "@/lib/i18n/server";
import { fill } from "@/lib/i18n/text";
import { formatDateTime } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.admin.certifications.metaTitle, robots: { index: false } };
}

export default async function AdminCertificationsPage() {
  const [{ locale, t }, pending, reviewed] = await Promise.all([
    getI18n(),
    getPendingCertifications(),
    getReviewedCertifications(),
  ]);

  const copy = t.admin.certifications;

  return (
    <div className="space-y-10">
      <AdminHeader title={copy.title} description={copy.description} />

      <section aria-labelledby="file" className="space-y-4">
        <h2 id="file" className="text-xl uppercase">
          {fill(copy.queueTitle, { count: pending.length })}
        </h2>

        {pending.length === 0 ? (
          <AdminPanel>
            <p className="text-sm text-ink-soft">{copy.queueEmpty}</p>
          </AdminPanel>
        ) : (
          <ul className="space-y-6">
            {pending.map((certification) => (
              <li key={certification.id}>
                <AdminPanel>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg">
                        {certification.profile?.full_name || copy.unnamed}
                      </h3>
                      <p className="label-tech mt-1 text-kraft">
                        {fill(copy.requestedOn, {
                          category: t.categories[certification.category].label,
                          date: formatDateTime(locale, certification.created_at),
                        })}
                      </p>
                    </div>
                    <Badge tone="amber">{t.admin.pending}</Badge>
                  </div>

                  <blockquote className="mt-4 border-l-2 border-rust bg-rust-wash px-4 py-3 text-sm text-ink-soft">
                    {certification.motivation}
                  </blockquote>

                  <div className="mt-5">
                    <CertificationReview certificationId={certification.id} t={copy} />
                  </div>
                </AdminPanel>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="historique" className="space-y-4">
        <h2 id="historique" className="text-xl uppercase">
          {copy.recentTitle}
        </h2>

        <AdminPanel>
          {reviewed.length === 0 ? (
            <p className="text-sm text-ink-soft">{copy.recentEmpty}</p>
          ) : (
            <ul className="space-y-px bg-line">
              {reviewed.map((certification) => (
                <li
                  key={certification.id}
                  className="flex flex-wrap items-center justify-between gap-3 bg-paper py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {certification.profile?.full_name || t.common.member}
                    </p>
                    <p className="label-tech mt-1 text-kraft">
                      {t.categories[certification.category].label}
                      {certification.reviewed_at
                        ? ` · ${formatDateTime(locale, certification.reviewed_at)}`
                        : ""}
                    </p>
                  </div>
                  <Badge tone={certification.status === "approved" ? "moss" : "brick"}>
                    {t.certificationStatus[certification.status]}
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
