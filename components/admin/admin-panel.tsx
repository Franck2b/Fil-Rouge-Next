import type { ReactNode } from "react";

export function AdminHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-bone/15 pb-6">
      <div>
        <p className="label-tech text-rust">Administration</p>
        <h1 className="mt-2 text-3xl uppercase">{title}</h1>
        {description ? <p className="mt-3 max-w-2xl text-sm text-bone/60">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

/** Surface de travail claire posée sur le châssis sombre du back-office. */
export function AdminPanel({
  title,
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="border border-bone/15 bg-paper text-ink">
      {title ? (
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-lg uppercase">{title}</h2>
          {description ? <p className="mt-1 text-sm text-ink-soft">{description}</p> : null}
        </div>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  );
}
