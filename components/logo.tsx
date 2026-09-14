import Link from "next/link";

/**
 * Marque : un gabarit — la plaque de traçage, sa découpe intérieure et les
 * équerres de repérage qui servent à le caler sur la pièce.
 */
export function Logo({ href = "/", tone = "ink" }: { href?: string; tone?: "ink" | "paper" }) {
  const color = tone === "paper" ? "text-paper" : "text-ink";

  return (
    <Link href={href} className={`group inline-flex items-center gap-2.5 ${color}`}>
      <svg viewBox="0 0 24 24" aria-hidden className="h-6 w-6" fill="none">
        <rect x="2" y="4" width="20" height="16" stroke="currentColor" strokeWidth="2" />
        <path d="M2 8h3M19 8h3M2 16h3M19 16h3" stroke="currentColor" strokeWidth="1.5" />
        <rect x="9" y="9" width="6" height="6" className="fill-rust" />
      </svg>
      <span className="font-display text-lg font-extrabold tracking-[0.14em] uppercase">
        Gabarit
      </span>
    </Link>
  );
}
