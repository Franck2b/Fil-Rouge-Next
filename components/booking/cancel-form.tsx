"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { cancelBookingAction } from "@/lib/actions/bookings";
import { IDLE, type ActionState } from "@/lib/actions/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function CancelBookingForm({
  bookingId,
  refundable,
  t,
}: {
  bookingId: string;
  refundable: boolean;
  t: Dictionary["app"]["booking"];
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
        {refundable ? t.cancelRefundable : t.cancelNonRefundable}
      </p>

      <SubmitButton variant="danger" pendingLabel={t.cancelPending}>
        {t.cancelSubmit}
      </SubmitButton>
    </form>
  );
}
