import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid-plan-light border border-dashed border-line bg-paper px-6 py-14 text-center">
      <p className="label-tech text-kraft">Rien à afficher</p>
      <h3 className="mt-3 text-xl">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">{description}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
