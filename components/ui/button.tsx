import type { ComponentProps } from "react";
import { Link } from "@/components/ui/link";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "inverse" | "onRust" | "ghostInverse";
type Size = "sm" | "md";

const BASE =
  "inline-flex items-center justify-center gap-2 border font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";

/**
 * Les variantes « inverse » existent parce qu'un simple override de couleur via
 * className ne fonctionne pas : deux utilitaires Tailwind de même propriété
 * (border-ink et border-bone) sont départagés par l'ordre de la feuille de
 * style, pas par l'ordre des classes. Une variante dédiée lève l'ambiguïté.
 */
const VARIANTS: Record<Variant, string> = {
  primary: "border-rust bg-rust text-paper hover:bg-rust-dark hover:border-rust-dark",
  secondary: "border-ink bg-transparent text-ink hover:bg-ink hover:text-paper",
  ghost: "border-transparent bg-transparent text-ink-soft hover:text-ink hover:border-line",
  danger: "border-brick bg-transparent text-brick hover:bg-brick hover:text-paper",
  inverse: "border-bone bg-transparent text-bone hover:bg-bone hover:text-ink",
  onRust: "border-paper bg-transparent text-paper hover:bg-paper hover:text-rust",
  ghostInverse: "border-transparent bg-transparent text-bone/60 hover:border-bone/30 hover:text-bone",
};

const SIZES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${extra}`;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button className={buttonClasses(variant, size, className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClasses(variant, size, className)} {...props} />;
}
