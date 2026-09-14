"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { finishOnboardingAction, saveOnboardingProfileAction } from "@/lib/actions/onboarding";
import { IDLE, type ActionState } from "@/lib/actions/types";
import { MACHINE_CATEGORIES, type Profile, type Workshop } from "@/lib/types";

export function OnboardingProfileForm({
  profile,
  workshops,
}: {
  profile: Profile;
  workshops: Workshop[];
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

      <Field label="Nom complet" htmlFor="fullName" error={state.fieldErrors?.fullName}>
        <Input
          id="fullName"
          name="fullName"
          defaultValue={profile.full_name}
          autoComplete="name"
          required
        />
      </Field>

      <Field
        label="Téléphone"
        htmlFor="phone"
        hint="Utilisé uniquement pour vous prévenir d'une machine indisponible."
        error={state.fieldErrors?.phone}
      >
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={profile.phone ?? ""}
          autoComplete="tel"
        />
      </Field>

      <Field
        label="Atelier de rattachement"
        htmlFor="homeWorkshopId"
        hint="Vos crédits restent valables partout, c'est seulement votre atelier par défaut."
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

      <SubmitButton pendingLabel="Enregistrement…">Continuer</SubmitButton>
    </form>
  );
}

export function OnboardingCertificationForm({ defaultCategory }: { defaultCategory?: string }) {
  const [state, action] = useActionState<ActionState, FormData>(finishOnboardingAction, IDLE);

  return (
    <form action={action} className="space-y-6" noValidate>
      {state.status === "error" && state.message ? (
        <Alert tone="error">{state.message}</Alert>
      ) : null}

      <Field
        label="Famille de machines"
        htmlFor="category"
        hint="Vous pourrez en demander d'autres à tout moment depuis votre espace."
        error={state.fieldErrors?.category}
      >
        <Select id="category" name="category" defaultValue={defaultCategory ?? ""} required>
          <option value="" disabled>
            Choisir une famille
          </option>
          {MACHINE_CATEGORIES.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label} — {category.blurb}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Votre expérience"
        htmlFor="motivation"
        hint="Quelques lignes suffisent : machines déjà pratiquées, formation suivie, projet visé."
        error={state.fieldErrors?.motivation}
      >
        <Textarea id="motivation" name="motivation" rows={5} required minLength={20} />
      </Field>

      <SubmitButton pendingLabel="Envoi…">Terminer l&apos;inscription</SubmitButton>
    </form>
  );
}
