import type { ReactNode } from "react";
import { getI18n } from "@/lib/i18n/server";

export async function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  const { t } = await getI18n();

  return (
    <div className="grid-plan-light border border-dashed border-line bg-paper px-6 py-14 text-center">
      <p className="label-tech text-kraft">{t.emptyState.eyebrow}</p>
      <h3 className="mt-3 text-xl">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">{description}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
