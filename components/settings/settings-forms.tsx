"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { Field, Input, Select } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  updatePasswordAction,
  updatePreferencesAction,
  updateProfileAction,
} from "@/lib/actions/profile";
import { IDLE, type ActionState } from "@/lib/actions/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Profile, Workshop } from "@/lib/types";

type FormCopy = Dictionary["app"]["settings"]["form"];

function Feedback({ state }: { state: ActionState }) {
  if (state.status === "success" && state.message) {
    return <Alert tone="success">{state.message}</Alert>;
  }
  if (state.status === "error" && state.message) {
    return <Alert tone="error">{state.message}</Alert>;
  }
  return null;
}

export function ProfileForm({
  profile,
  email,
  t,
}: {
  profile: Profile;
  email: string;
  t: FormCopy;
}) {
  const [state, action] = useActionState<ActionState, FormData>(updateProfileAction, IDLE);

  return (
    <form action={action} className="space-y-6" noValidate>
      <Feedback state={state} />

      <Field label={t.email} htmlFor="email" hint={t.emailHint}>
        <Input id="email" defaultValue={email} disabled />
      </Field>

      <Field label={t.fullName} htmlFor="fullName" error={state.fieldErrors?.fullName}>
        <Input id="fullName" name="fullName" defaultValue={profile.full_name} required />
      </Field>

      <Field label={t.phone} htmlFor="phone" error={state.fieldErrors?.phone}>
        <Input id="phone" name="phone" type="tel" defaultValue={profile.phone ?? ""} />
      </Field>

      <SubmitButton pendingLabel={t.saving}>{t.save}</SubmitButton>
    </form>
  );
}

export function PreferencesForm({
  profile,
  workshops,
  t,
}: {
  profile: Profile;
  workshops: Workshop[];
  t: FormCopy;
}) {
  const [state, action] = useActionState<ActionState, FormData>(updatePreferencesAction, IDLE);

  return (
    <form action={action} className="space-y-6" noValidate>
      <Feedback state={state} />

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

      <label className="flex items-start gap-3 border border-line bg-paper p-4">
        <input
          type="checkbox"
          name="emailNotifications"
          defaultChecked={profile.email_notifications}
          className="mt-1 h-4 w-4 accent-[var(--color-rust)]"
        />
        <span>
          <span className="block text-sm font-medium">{t.notifications}</span>
          <span className="mt-1 block text-sm text-ink-soft">{t.notificationsHint}</span>
        </span>
      </label>

      <SubmitButton pendingLabel={t.saving}>{t.save}</SubmitButton>
    </form>
  );
}

export function PasswordForm({ t }: { t: FormCopy }) {
  const [state, action] = useActionState<ActionState, FormData>(updatePasswordAction, IDLE);

  return (
    <form action={action} className="space-y-6" noValidate>
      <Feedback state={state} />

      <Field
        label={t.newPassword}
        htmlFor="password"
        hint={t.passwordHint}
        error={state.fieldErrors?.password}
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </Field>

      <Field label={t.confirm} htmlFor="confirm" error={state.fieldErrors?.confirm}>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </Field>

      <SubmitButton pendingLabel={t.updatingPassword}>{t.updatePassword}</SubmitButton>
    </form>
  );
}
