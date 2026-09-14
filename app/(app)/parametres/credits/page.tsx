import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";
import { requireOnboardedViewer } from "@/lib/auth";
import { getCreditHistory } from "@/lib/data/account";
import { formatCredits, formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Crédits", robots: { index: false } };

export default async function CreditsSettingsPage() {
  const viewer = await requireOnboardedViewer();
  const transactions = await getCreditHistory(viewer.userId, 30);

  return (
    <div className="space-y-8">
      <div className="border border-line bg-paper p-6">
        <p className="label-tech text-kraft">Solde actuel</p>
        <p className="mt-2 font-display text-5xl">{viewer.profile.credits_balance}</p>
        <p className="mt-2 text-sm text-ink-soft">
          Les crédits se dépensent à l&apos;heure entamée.{" "}
          <Link href="/tarifs" className="text-rust underline underline-offset-4">
            Voir la grille tarifaire
          </Link>
          .
        </p>
      </div>

      <section aria-labelledby="mouvements" className="space-y-4">
        <h2 id="mouvements" className="text-xl uppercase">
          Mouvements
        </h2>

        {transactions.length === 0 ? (
          <EmptyState
            title="Aucun mouvement"
            description="Vos débits et remboursements apparaîtront ici après votre première réservation."
            action={<ButtonLink href="/equipements">Parcourir le parc</ButtonLink>}
          />
        ) : (
          <ul className="grid gap-px border border-line bg-line">
            {transactions.map((transaction) => (
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
        )}
      </section>
    </div>
  );
}
