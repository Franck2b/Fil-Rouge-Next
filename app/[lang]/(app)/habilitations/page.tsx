import type { Metadata } from "next";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/components/ui/link";
import { PageHeader } from "@/components/app/page-header";
import { CertificationRequestForm } from "@/components/certifications/request-form";
import { requireOnboardedViewer } from "@/lib/auth";
import { getCertifications } from "@/lib/data/account";
import { getI18n } from "@/lib/i18n/server";
import { fill } from "@/lib/i18n/text";
import { MACHINE_CATEGORY_VALUES } from "@/lib/types";
import { formatDateTime } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.app.certifications.metaTitle, robots: { index: false } };
}

export default async function CertificationsPage() {
  const [viewer, { locale, t }] = await Promise.all([requireOnboardedViewer(), getI18n()]);
  const certifications = await getCertifications(viewer.userId);
  const copy = t.app.certifications;

  // Une famille refusée peut faire l'objet d'une nouvelle demande ; une famille
  // validée ou en cours d'examen, non.
  const blocked = new Set(
    certifications.filter((c) => c.status !== "rejected").map((c) => c.category),
  );
  const available = MACHINE_CATEGORY_VALUES.filter((category) => !blocked.has(category));

  return (
    <div className="space-y-8">
      <PageHeader eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />

      <section aria-labelledby="liste" className="space-y-4">
        <h2 id="liste" className="text-xl uppercase">
          {copy.statusTitle}
        </h2>

        {certifications.length === 0 ? (
          <Alert tone="info">{copy.empty}</Alert>
        ) : (
          <ul className="grid gap-px border border-line bg-line">
            {certifications.map((certification) => (
              <li key={certification.id} className="bg-paper px-5 py-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg">{t.categories[certification.category].label}</h3>
                    <p className="label-tech mt-1 text-kraft">
                      {fill(copy.requestedOn, {
                        date: formatDateTime(locale, certification.created_at),
                      })}
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
                    {t.certificationStatus[certification.status]}
                  </Badge>
                </div>

                {certification.review_note ? (
                  <p className="mt-4 border-l-2 border-line pl-4 text-sm text-ink-soft">
                    <span className="label-tech block text-kraft">{copy.reviewNote}</span>
                    {certification.review_note}
                  </p>
                ) : null}

                {certification.status === "approved" ? (
                  <Link
                    href={`/equipements?categorie=${certification.category}`}
                    className="mt-4 inline-block text-sm text-rust underline underline-offset-4"
                  >
                    {copy.unlocked}
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="demande" className="space-y-4">
        <h2 id="demande" className="text-xl uppercase">
          {copy.requestTitle}
        </h2>
        <div className="border border-line bg-paper p-6 sm:p-8">
          <CertificationRequestForm
            availableCategories={available}
            t={copy}
            categories={t.categories}
            sendingLabel={t.common.sending}
          />
        </div>
      </section>
    </div>
  );
}
