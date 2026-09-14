"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { Field, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { createBookingAction } from "@/lib/actions/bookings";
import { IDLE, type ActionState } from "@/lib/actions/types";

export function BookingConfirmForm({
  machineId,
  date,
  startHour,
  duration,
}: {
  machineId: string;
  date: string;
  startHour: number;
  duration: number;
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
        label="Projet (facultatif)"
        htmlFor="project"
        hint="Apparaîtra sur votre historique et aide le référent à préparer le poste."
        error={state.fieldErrors?.project}
      >
        <Input id="project" name="project" maxLength={140} placeholder="Gravure d'une série de 20 plaques" />
      </Field>

      <SubmitButton pendingLabel="Réservation…">Confirmer la réservation</SubmitButton>
    </form>
  );
}
