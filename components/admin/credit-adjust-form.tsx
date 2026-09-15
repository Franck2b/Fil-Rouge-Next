"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { adjustCreditsAction } from "@/lib/actions/admin";
import { IDLE, type ActionState } from "@/lib/actions/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function CreditAdjustForm({
  memberId,
  t,
}: {
  memberId: string;
  t: Dictionary["admin"]["members"];
}) {
  const [state, action] = useActionState<ActionState, FormData>(adjustCreditsAction, IDLE);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="memberId" value={memberId} />

      <div className="flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="label-tech block text-kraft">{t.adjustment}</span>
          <Input name="delta" type="number" step={1} defaultValue={10} className="mt-1.5 w-24" />
        </label>

        <label className="block flex-1">
          <span className="label-tech block text-kraft">{t.reason}</span>
          <Input
            name="reason"
            defaultValue={t.reasonDefault}
            className="mt-1.5 min-w-48"
            required
          />
        </label>

        <SubmitButton variant="secondary" size="sm" pendingLabel="…">
          {t.apply}
        </SubmitButton>
      </div>

      {state.status === "success" && state.message ? (
        <Alert tone="success">{state.message}</Alert>
      ) : null}
      {state.status === "error" && state.message ? (
        <Alert tone="error">{state.message}</Alert>
      ) : null}
    </form>
  );
}
