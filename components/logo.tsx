import Link from "next/link";

/** Marque : un établi vu de face — deux pieds, un plateau, une pièce en cours. */
export function Logo({ href = "/", tone = "ink" }: { href?: string; tone?: "ink" | "paper" }) {
  const color = tone === "paper" ? "text-paper" : "text-ink";

  return (
    <Link href={href} className={`group inline-flex items-center gap-2.5 ${color}`}>
      <svg viewBox="0 0 24 24" aria-hidden className="h-6 w-6" fill="none">
        <path d="M2 9h20" stroke="currentColor" strokeWidth="2.5" />
        <path d="M5 9v13M19 9v13" stroke="currentColor" strokeWidth="2.5" />
        <path d="M5 16h14" stroke="currentColor" strokeWidth="1.5" />
        <rect x="9" y="3" width="6" height="6" className="fill-rust" />
      </svg>
      <span className="font-display text-lg font-extrabold tracking-[0.14em] uppercase">
        Établi
      </span>
    </Link>
  );
}
