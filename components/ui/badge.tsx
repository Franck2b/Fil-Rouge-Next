import type { ReactNode } from "react";

export type Tone = "neutral" | "rust" | "moss" | "amber" | "brick";

const TONES: Record<Tone, string> = {
  neutral: "border-line bg-paper text-ink-soft",
  rust: "border-rust/40 bg-rust-wash text-rust-dark",
  moss: "border-moss/30 bg-moss-wash text-moss",
  amber: "border-amber/30 bg-amber-wash text-amber",
  brick: "border-brick/30 bg-brick-wash text-brick",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`label-tech inline-flex items-center border px-2 py-1 ${TONES[tone]}`}>
      {children}
    </span>
  );
}
