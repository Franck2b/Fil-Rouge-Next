"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { Field, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { signInAction, signUpAction } from "@/lib/actions/auth";
import { IDLE, type ActionState } from "@/lib/actions/types";

/**
 * Client Component : useActionState a besoin du navigateur pour conserver le
 * retour de la Server Action et l'état « en cours d'envoi ». La logique de
 * connexion, elle, reste intégralement côté serveur.
 */
export function SignInForm({ suite }: { suite: string }) {
  const [state, action] = useActionState<ActionState, FormData>(signInAction, IDLE);

  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="suite" value={suite} />

      {state.status === "error" && state.message ? (
        <Alert tone="error">{state.message}</Alert>
      ) : null}

      <Field label="Adresse e-mail" htmlFor="email" error={state.fieldErrors?.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
        />
      </Field>

      <Field label="Mot de passe" htmlFor="password" error={state.fieldErrors?.password}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={Boolean(state.fieldErrors?.password)}
          aria-describedby={state.fieldErrors?.password ? "password-error" : undefined}
        />
      </Field>

      <SubmitButton className="w-full" pendingLabel="Connexion…">
        Se connecter
      </SubmitButton>

      <p className="text-center text-sm text-ink-soft">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="text-rust underline underline-offset-4">
          Créer un compte
        </Link>
      </p>
    </form>
  );
}

export function SignUpForm() {
  const [state, action] = useActionState<ActionState, FormData>(signUpAction, IDLE);

  return (
    <form action={action} className="space-y-5" noValidate>
      {state.status === "error" && state.message ? (
        <Alert tone="error">{state.message}</Alert>
      ) : null}

      <Field label="Nom complet" htmlFor="fullName" error={state.fieldErrors?.fullName}>
        <Input
          id="fullName"
          name="fullName"
          autoComplete="name"
          required
          aria-invalid={Boolean(state.fieldErrors?.fullName)}
        />
      </Field>

      <Field label="Adresse e-mail" htmlFor="email" error={state.fieldErrors?.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={Boolean(state.fieldErrors?.email)}
        />
      </Field>

      <Field
        label="Mot de passe"
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
          aria-invalid={Boolean(state.fieldErrors?.password)}
        />
      </Field>

      <SubmitButton className="w-full" pendingLabel="Création…">
        Créer mon compte
      </SubmitButton>

      <p className="text-center text-sm text-ink-soft">
        Déjà membre ?{" "}
        <Link href="/connexion" className="text-rust underline underline-offset-4">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
