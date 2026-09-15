import { Link } from "@/components/ui/link";
import { getI18n } from "@/lib/i18n/server";

export async function CreditBadge({ credits }: { credits: number }) {
  const { t } = await getI18n();
  const low = credits < 3;

  return (
    <Link
      href="/parametres/credits"
      className={`label-tech inline-flex items-center gap-2 border px-3 py-2 transition-colors ${
        low ? "border-brick/40 bg-brick-wash text-brick" : "border-line bg-paper text-ink-soft"
      }`}
    >
      <span className="text-kraft">{t.app.creditBadge.balance}</span>
      <span className="text-sm font-medium text-ink">{credits}</span>
      <span>{t.app.creditBadge.credits}</span>
    </Link>
  );
}
