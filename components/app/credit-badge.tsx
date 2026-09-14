import Link from "next/link";

export function CreditBadge({ credits }: { credits: number }) {
  const low = credits < 3;

  return (
    <Link
      href="/parametres/credits"
      className={`label-tech inline-flex items-center gap-2 border px-3 py-2 transition-colors ${
        low ? "border-brick/40 bg-brick-wash text-brick" : "border-line bg-paper text-ink-soft"
      }`}
    >
      <span className="text-kraft">Solde</span>
      <span className="text-sm font-medium text-ink">{credits}</span>
      <span>crédits</span>
    </Link>
  );
}
