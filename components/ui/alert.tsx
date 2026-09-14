import type { ReactNode } from "react";

const TONES = {
  success: "border-moss/40 bg-moss-wash text-moss",
  error: "border-brick/40 bg-brick-wash text-brick",
  info: "border-line bg-paper text-ink-soft",
  warning: "border-amber/40 bg-amber-wash text-amber",
};

export function Alert({
  tone = "info",
  title,
  children,
}: {
  tone?: keyof typeof TONES;
  title?: string;
  children?: ReactNode;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`border px-4 py-3 text-sm ${TONES[tone]}`}
    >
      {title ? <p className="font-semibold">{title}</p> : null}
      {children ? <div className={title ? "mt-1" : ""}>{children}</div> : null}
    </div>
  );
}
