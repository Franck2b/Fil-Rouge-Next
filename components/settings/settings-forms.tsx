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
import type { Profile, Workshop } from "@/lib/types";

function Feedback({ state }: { state: ActionState }) {
  if (state.status === "success" && state.message) {
    return <Alert tone="success">{state.message}</Alert>;
  }
  if (state.status === "error" && state.message) {
    return <Alert tone="error">{state.message}</Alert>;
  }
  return null;
}

export function ProfileForm({ profile, email }: { profile: Profile; email: string }) {
  const [state, action] = useActionState<ActionState, FormData>(updateProfileAction, IDLE);

  return (
    <form action={action} className="space-y-6" noValidate>
      <Feedback state={state} />

      <Field label="Adresse e-mail" htmlFor="email" hint="L'e-mail de connexion n'est pas modifiable ici.">
        <Input id="email" defaultValue={email} disabled />
      </Field>

      <Field label="Nom complet" htmlFor="fullName" error={state.fieldErrors?.fullName}>
        <Input id="fullName" name="fullName" defaultValue={profile.full_name} required />
      </Field>

      <Field label="Téléphone" htmlFor="phone" error={state.fieldErrors?.phone}>
        <Input id="phone" name="phone" type="tel" defaultValue={profile.phone ?? ""} />
      </Field>

      <SubmitButton pendingLabel="Enregistrement…">Enregistrer</SubmitButton>
    </form>
  );
}

export function PreferencesForm({
  profile,
  workshops,
}: {
  profile: Profile;
  workshops: Workshop[];
}) {
  const [state, action] = useActionState<ActionState, FormData>(updatePreferencesAction, IDLE);

  return (
    <form action={action} className="space-y-6" noValidate>
      <Feedback state={state} />

      <Field
        label="Atelier de rattachement"
        htmlFor="homeWorkshopId"
        hint="Utilisé pour trier le parc et pré-remplir vos réservations."
        error={state.fieldErrors?.homeWorkshopId}
      >
        <Select
          id="homeWorkshopId"
          name="homeWorkshopId"
          defaultValue={profile.home_workshop_id ?? ""}
          required
        >
          <option value="" disabled>
            Choisir un atelier
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
          <span className="block text-sm font-medium">Alertes par e-mail</span>
          <span className="mt-1 block text-sm text-ink-soft">
            Rappel 24 h avant un créneau et information en cas de machine mise en maintenance.
          </span>
        </span>
      </label>

      <SubmitButton pendingLabel="Enregistrement…">Enregistrer</SubmitButton>
    </form>
  );
}

export function PasswordForm() {
  const [state, action] = useActionState<ActionState, FormData>(updatePasswordAction, IDLE);

  return (
    <form action={action} className="space-y-6" noValidate>
      <Feedback state={state} />

      <Field
        label="Nouveau mot de passe"
        htmlFor="password"
        hint="8 caractères minimum."
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

      <Field label="Confirmation" htmlFor="confirm" error={state.fieldErrors?.confirm}>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </Field>

      <SubmitButton pendingLabel="Modification…">Modifier le mot de passe</SubmitButton>
    </form>
  );
}
