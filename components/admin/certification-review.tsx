"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { reviewCertificationAction } from "@/lib/actions/admin";
import { IDLE, type ActionState } from "@/lib/actions/types";

export function CertificationReview({ certificationId }: { certificationId: string }) {
  const [state, action] = useActionState<ActionState, FormData>(
    reviewCertificationAction,
    IDLE,
  );

  if (state.status === "success") {
    return <Alert tone="success">{state.message}</Alert>;
  }

  return (
    <form action={action} className="space-y-4 border-t border-line pt-4">
      <input type="hidden" name="certificationId" value={certificationId} />

      {state.status === "error" && state.message ? (
        <Alert tone="error">{state.message}</Alert>
      ) : null}

      <Field
        label="Note au membre"
        htmlFor={`note-${certificationId}`}
        hint="Visible par le membre : rappel de sécurité, créneau de prise en main, motif du refus."
        error={state.fieldErrors?.note}
      >
        <Input
          id={`note-${certificationId}`}
          name="note"
          maxLength={280}
          placeholder="Prise en main prévue samedi 10 h avec Salomé."
        />
      </Field>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" name="decision" value="approved" size="sm">
          Valider l&apos;habilitation
        </Button>
        <Button type="submit" name="decision" value="rejected" variant="danger" size="sm">
          Refuser
        </Button>
      </div>
    </form>
  );
}
