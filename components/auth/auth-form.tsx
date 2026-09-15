"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { Field, Input } from "@/components/ui/field";
import { Link } from "@/components/ui/link";
import { SubmitButton } from "@/components/ui/submit-button";
import { signInAction, signUpAction } from "@/lib/actions/auth";
import { IDLE, type ActionState } from "@/lib/actions/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Client Component : useActionState a besoin du navigateur pour conserver le
 * retour de la Server Action et l'état « en cours d'envoi ». La logique de
 * connexion, elle, reste intégralement côté serveur.
 */
export function SignInForm({ suite, t }: { suite: string; t: Dictionary["auth"]["form"] }) {
  const [state, action] = useActionState<ActionState, FormData>(signInAction, IDLE);

  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="suite" value={suite} />

      {state.status === "error" && state.message ? (
        <Alert tone="error">{state.message}</Alert>
      ) : null}

      <Field label={t.email} htmlFor="email" error={state.fieldErrors?.email}>
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

      <Field label={t.password} htmlFor="password" error={state.fieldErrors?.password}>
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

      <SubmitButton className="w-full" pendingLabel={t.signingIn}>
        {t.signIn}
      </SubmitButton>

      <p className="text-center text-sm text-ink-soft">
        {t.noAccount}{" "}
        <Link href="/inscription" className="text-rust underline underline-offset-4">
          {t.createAccount}
        </Link>
      </p>
    </form>
  );
}

export function SignUpForm({ t }: { t: Dictionary["auth"]["form"] }) {
  const [state, action] = useActionState<ActionState, FormData>(signUpAction, IDLE);

  return (
    <form action={action} className="space-y-5" noValidate>
      {state.status === "error" && state.message ? (
        <Alert tone="error">{state.message}</Alert>
      ) : null}

      <Field label={t.fullName} htmlFor="fullName" error={state.fieldErrors?.fullName}>
        <Input
          id="fullName"
          name="fullName"
          autoComplete="name"
          required
          aria-invalid={Boolean(state.fieldErrors?.fullName)}
        />
      </Field>

      <Field label={t.email} htmlFor="email" error={state.fieldErrors?.email}>
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
        label={t.password}
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
          aria-invalid={Boolean(state.fieldErrors?.password)}
        />
      </Field>

      <SubmitButton className="w-full" pendingLabel={t.signingUp}>
        {t.signUp}
      </SubmitButton>

      <p className="text-center text-sm text-ink-soft">
        {t.alreadyMember}{" "}
        <Link href="/connexion" className="text-rust underline underline-offset-4">
          {t.signInLink}
        </Link>
      </p>
    </form>
  );
}
