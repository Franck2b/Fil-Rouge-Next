"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { Input, Select } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { updateMachineAction } from "@/lib/actions/admin";
import { IDLE, type ActionState } from "@/lib/actions/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { MACHINE_STATUS_VALUES, type MachineStatus } from "@/lib/types";

export function MachineRowForm({
  machineId,
  status,
  hourlyCredits,
  t,
  statusLabels,
}: {
  machineId: string;
  status: MachineStatus;
  hourlyCredits: number;
  t: Dictionary["admin"]["machines"];
  statusLabels: Dictionary["machineStatus"];
}) {
  const [state, action] = useActionState<ActionState, FormData>(updateMachineAction, IDLE);

  // Les champs sont non contrôlés : sans `key`, ils garderaient l'ancienne
  // valeur après le re-rendu déclenché par la Server Action, et afficheraient
  // autre chose que l'état réellement enregistré.
  return (
    <form key={`${status}-${hourlyCredits}`} action={action} className="space-y-3">
      <input type="hidden" name="machineId" value={machineId} />

      <div className="flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="label-tech block text-kraft">{t.status}</span>
          <Select name="status" defaultValue={status} className="mt-1.5 w-44">
            {MACHINE_STATUS_VALUES.map((value) => (
              <option key={value} value={value}>
                {statusLabels[value]}
              </option>
            ))}
          </Select>
        </label>

        <label className="block">
          <span className="label-tech block text-kraft">{t.creditsPerHour}</span>
          <Input
            name="hourlyCredits"
            type="number"
            min={1}
            max={20}
            defaultValue={hourlyCredits}
            className="mt-1.5 w-24"
          />
        </label>

        <SubmitButton variant="secondary" size="sm" pendingLabel="…">
          {t.save}
        </SubmitButton>
      </div>

      {state.status === "success" && state.message ? (
        <Alert tone="success">{state.message}</Alert>
      ) : null}
      {state.status === "error" && state.message ? (
        <Alert tone="error">{state.message}</Alert>
      ) : null}
    </form>
  );
}
