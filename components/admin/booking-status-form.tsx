"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { IDLE, type ActionState } from "@/lib/actions/types";
import { updateBookingStatusAction } from "@/lib/actions/admin";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function BookingStatusForm({
  bookingId,
  status,
  t,
}: {
  bookingId: string;
  status: string;
  t: Dictionary["admin"]["bookings"];
}) {
  const [state, action] = useActionState<ActionState, FormData>(
    updateBookingStatusAction,
    IDLE,
  );

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="bookingId" value={bookingId} />

      {status !== "completed" ? (
        <Button type="submit" name="status" value="completed" variant="secondary" size="sm">
          {t.markCompleted}
        </Button>
      ) : null}

      {status !== "cancelled" ? (
        <Button type="submit" name="status" value="cancelled" variant="danger" size="sm">
          {t.cancel}
        </Button>
      ) : null}

      {state.status === "error" && state.message ? (
        <span className="text-xs text-brick">{state.message}</span>
      ) : null}
    </form>
  );
}
