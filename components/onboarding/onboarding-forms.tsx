"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { finishOnboardingAction, saveOnboardingProfileAction } from "@/lib/actions/onboarding";
import { IDLE, type ActionState } from "@/lib/actions/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { MACHINE_CATEGORY_VALUES, type Profile, type Workshop } from "@/lib/types";

export function OnboardingProfileForm({
  profile,
  workshops,
  t,
  savingLabel,
}: {
  profile: Profile;
  workshops: Workshop[];
  t: Dictionary["onboarding"]["form"];
  savingLabel: string;
}) {
  const [state, action] = useActionState<ActionState, FormData>(
    saveOnboardingProfileAction,
    IDLE,
  );

  return (
    <form action={action} className="space-y-6" noValidate>
      {state.status === "error" && state.message ? (
        <Alert tone="error">{state.message}</Alert>
      ) : null}

      <Field label={t.fullName} htmlFor="fullName" error={state.fieldErrors?.fullName}>
        <Input
          id="fullName"
          name="fullName"
          defaultValue={profile.full_name}
          autoComplete="name"
          required
        />
      </Field>

      <Field label={t.phone} htmlFor="phone" hint={t.phoneHint} error={state.fieldErrors?.phone}>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={profile.phone ?? ""}
          autoComplete="tel"
        />
      </Field>

      <Field
        label={t.homeWorkshop}
        htmlFor="homeWorkshopId"
        hint={t.homeWorkshopHint}
        error={state.fieldErrors?.homeWorkshopId}
      >
        <Select
          id="homeWorkshopId"
          name="homeWorkshopId"
          defaultValue={profile.home_workshop_id ?? ""}
          required
        >
          <option value="" disabled>
            {t.chooseWorkshop}
          </option>
          {workshops.map((workshop) => (
            <option key={workshop.id} value={workshop.id}>
              {workshop.name} — {workshop.city}
            </option>
          ))}
        </Select>
      </Field>

      <SubmitButton pendingLabel={savingLabel}>{t.continue}</SubmitButton>
    </form>
  );
}

export function OnboardingCertificationForm({
  t,
  categories,
  sendingLabel,
}: {
  t: Dictionary["onboarding"]["form"];
  categories: Dictionary["categories"];
  sendingLabel: string;
}) {
  const [state, action] = useActionState<ActionState, FormData>(finishOnboardingAction, IDLE);

  return (
    <form action={action} className="space-y-6" noValidate>
      {state.status === "error" && state.message ? (
        <Alert tone="error">{state.message}</Alert>
      ) : null}

      <Field
        label={t.family}
        htmlFor="category"
        hint={t.familyHint}
        error={state.fieldErrors?.category}
      >
        <Select id="category" name="category" defaultValue="" required>
          <option value="" disabled>
            {t.chooseFamily}
          </option>
          {MACHINE_CATEGORY_VALUES.map((category) => (
            <option key={category} value={category}>
              {categories[category].label} — {categories[category].blurb}
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

      <SubmitButton pendingLabel={sendingLabel}>{t.finish}</SubmitButton>
    </form>
  );
}
