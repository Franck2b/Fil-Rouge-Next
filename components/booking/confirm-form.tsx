"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { Field, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { createBookingAction } from "@/lib/actions/bookings";
import { IDLE, type ActionState } from "@/lib/actions/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function BookingConfirmForm({
  machineId,
  date,
  startHour,
  duration,
  t,
}: {
  machineId: string;
  date: string;
  startHour: number;
  duration: number;
  t: Dictionary["app"]["reserve"];
}) {
  const [state, action] = useActionState<ActionState, FormData>(createBookingAction, IDLE);

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="machineId" value={machineId} />
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="startHour" value={startHour} />
      <input type="hidden" name="duration" value={duration} />

      {state.status === "error" && state.message ? (
        <Alert tone="error">{state.message}</Alert>
      ) : null}

      <Field
        label={t.project}
        htmlFor="project"
        hint={t.projectHint}
        error={state.fieldErrors?.project}
      >
        <Input id="project" name="project" maxLength={140} placeholder={t.projectPlaceholder} />
      </Field>

      <SubmitButton pendingLabel={t.submitting}>{t.submit}</SubmitButton>
    </form>
  );
}
