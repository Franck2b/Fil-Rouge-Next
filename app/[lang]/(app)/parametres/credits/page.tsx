import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Link } from "@/components/ui/link";
import { requireOnboardedViewer } from "@/lib/auth";
import { getCreditHistory } from "@/lib/data/account";
import { localizeCreditReason } from "@/lib/i18n/content";
import { getI18n } from "@/lib/i18n/server";
import { formatCredits, formatDateTime } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.app.settings.tabCredits, robots: { index: false } };
}

export default async function CreditsSettingsPage() {
  const [viewer, { locale, t }] = await Promise.all([requireOnboardedViewer(), getI18n()]);
  const transactions = await getCreditHistory(viewer.userId, 30);
  const copy = t.app.settings;

  return (
    <div className="space-y-8">
      <div className="border border-line bg-paper p-6">
        <p className="label-tech text-kraft">{copy.balance}</p>
        <p className="mt-2 font-display text-5xl">{viewer.profile.credits_balance}</p>
        <p className="mt-2 text-sm text-ink-soft">
          {copy.balanceText}{" "}
          <Link href="/tarifs" className="text-rust underline underline-offset-4">
            {copy.pricingLink}
          </Link>
          .
        </p>
      </div>

      <section aria-labelledby="mouvements" className="space-y-4">
        <h2 id="mouvements" className="text-xl uppercase">
          {copy.movements}
        </h2>

        {transactions.length === 0 ? (
          <EmptyState
            title={copy.emptyTitle}
            description={copy.emptyText}
            action={<ButtonLink href="/equipements">{copy.browseFleet}</ButtonLink>}
          />
        ) : (
          <ul className="grid gap-px border border-line bg-line">
            {transactions.map((transaction) => (
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
        )}
      </section>
    </div>
  );
}
