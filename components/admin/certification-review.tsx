"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { reviewCertificationAction } from "@/lib/actions/admin";
import { IDLE, type ActionState } from "@/lib/actions/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function CertificationReview({
  certificationId,
  t,
}: {
  certificationId: string;
  t: Dictionary["admin"]["certifications"];
}) {
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
        label={t.note}
        htmlFor={`note-${certificationId}`}
        hint={t.noteHint}
        error={state.fieldErrors?.note}
      >
        <Input
          id={`note-${certificationId}`}
          name="note"
          maxLength={280}
          placeholder={t.notePlaceholder}
        />
      </Field>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" name="decision" value="approved" size="sm">
          {t.approve}
        </Button>
        <Button type="submit" name="decision" value="rejected" variant="danger" size="sm">
          {t.reject}
        </Button>
      </div>
    </form>
  );
}
