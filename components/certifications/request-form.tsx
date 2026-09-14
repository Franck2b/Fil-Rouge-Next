"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { Field, Select, Textarea } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { requestCertificationAction } from "@/lib/actions/certifications";
import { IDLE, type ActionState } from "@/lib/actions/types";
import { CATEGORY_LABELS, type MachineCategory } from "@/lib/types";

export function CertificationRequestForm({
  availableCategories,
}: {
  availableCategories: MachineCategory[];
}) {
  const [state, action] = useActionState<ActionState, FormData>(
    requestCertificationAction,
    IDLE,
  );

  if (availableCategories.length === 0) {
    return (
      <Alert tone="success" title="Parc entièrement débloqué">
        Vous avez une demande ou une habilitation sur chacune des six familles de machines.
      </Alert>
    );
  }

  return (
    <form action={action} className="space-y-6" noValidate>
      {state.status === "error" && state.message ? (
        <Alert tone="error">{state.message}</Alert>
      ) : null}
      {state.status === "success" && state.message ? (
        <Alert tone="success">{state.message}</Alert>
      ) : null}

      <Field label="Famille de machines" htmlFor="category" error={state.fieldErrors?.category}>
        <Select id="category" name="category" defaultValue="" required>
          <option value="" disabled>
            Choisir une famille
          </option>
          {availableCategories.map((category) => (
            <option key={category} value={category}>
              {CATEGORY_LABELS[category]}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Votre expérience"
        htmlFor="motivation"
        hint="Machines déjà pratiquées, formation suivie, projet visé. 20 caractères minimum."
        error={state.fieldErrors?.motivation}
      >
        <Textarea id="motivation" name="motivation" rows={5} required minLength={20} />
      </Field>

      <SubmitButton pendingLabel="Envoi…">Envoyer la demande</SubmitButton>
    </form>
  );
}
