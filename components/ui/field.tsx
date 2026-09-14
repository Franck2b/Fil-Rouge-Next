import type { ComponentProps, ReactNode } from "react";

const CONTROL =
  "w-full border border-line bg-paper px-3 py-2.5 text-sm text-ink placeholder:text-kraft focus:border-rust focus:outline-none disabled:bg-bone disabled:text-kraft";

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="label-tech block text-ink-soft">
        {label}
      </label>
      {children}
      {hint && !error ? <p className="text-xs text-kraft">{hint}</p> : null}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-xs text-brick">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Input({ className = "", ...props }: ComponentProps<"input">) {
  return <input className={`${CONTROL} ${className}`} {...props} />;
}

export function Textarea({ className = "", ...props }: ComponentProps<"textarea">) {
  return <textarea className={`${CONTROL} ${className}`} {...props} />;
}

export function Select({ className = "", ...props }: ComponentProps<"select">) {
  return <select className={`${CONTROL} ${className}`} {...props} />;
}
