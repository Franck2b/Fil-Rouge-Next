"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { Field, Select, Textarea } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { requestCertificationAction } from "@/lib/actions/certifications";
import { IDLE, type ActionState } from "@/lib/actions/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { MachineCategory } from "@/lib/types";

export function CertificationRequestForm({
  availableCategories,
  t,
  categories,
  sendingLabel,
}: {
  availableCategories: MachineCategory[];
  t: Dictionary["app"]["certifications"];
  categories: Dictionary["categories"];
  sendingLabel: string;
}) {
  const [state, action] = useActionState<ActionState, FormData>(
    requestCertificationAction,
    IDLE,
  );

  if (availableCategories.length === 0) {
    return (
      <Alert tone="success" title={t.allUnlockedTitle}>
        {t.allUnlockedText}
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

      <Field label={t.family} htmlFor="category" error={state.fieldErrors?.category}>
        <Select id="category" name="category" defaultValue="" required>
          <option value="" disabled>
            {t.chooseFamily}
          </option>
          {availableCategories.map((category) => (
            <option key={category} value={category}>
              {categories[category].label}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label={t.experience}
        htmlFor="motivation"
        hint={t.experienceHint}
        error={state.fieldErrors?.motivation}
      >
        <Textarea id="motivation" name="motivation" rows={5} required minLength={20} />
      </Field>

      <SubmitButton pendingLabel={sendingLabel}>{t.submit}</SubmitButton>
    </form>
  );
}
