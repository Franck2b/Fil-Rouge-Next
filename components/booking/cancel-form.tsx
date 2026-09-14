"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { cancelBookingAction } from "@/lib/actions/bookings";
import { IDLE, type ActionState } from "@/lib/actions/types";

export function CancelBookingForm({
  bookingId,
  refundable,
}: {
  bookingId: string;
  refundable: boolean;
}) {
  const [state, action] = useActionState<ActionState, FormData>(cancelBookingAction, IDLE);

  if (state.status === "success") {
    return <Alert tone="success">{state.message}</Alert>;
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="bookingId" value={bookingId} />

      {state.status === "error" && state.message ? (
        <Alert tone="error">{state.message}</Alert>
      ) : null}

      <p className="text-sm text-ink-soft">
        {refundable
          ? "Annulation gratuite : les crédits seront intégralement recrédités."
          : "Le créneau commence dans moins de deux heures : les crédits ne seront pas remboursés."}
      </p>

      <SubmitButton variant="danger" pendingLabel="Annulation…">
        Annuler la réservation
      </SubmitButton>
    </form>
  );
}
