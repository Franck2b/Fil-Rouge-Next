import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { PageHeader } from "@/components/app/page-header";
import { BookingConfirmForm } from "@/components/booking/confirm-form";
import { requireOnboardedViewer } from "@/lib/auth";
import { getMachineBySlug } from "@/lib/data/catalog";
import { getApprovedCategories, getMachineBusySlots } from "@/lib/data/account";
import { CATEGORY_LABELS } from "@/lib/types";
import { computeSlots, MAX_DURATION, SLOT_LABELS } from "@/lib/booking";
import { formatDay, toDateInputValue } from "@/lib/format";

export const metadata: Metadata = { title: "Réserver un créneau", robots: { index: false } };

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ jour?: string; debut?: string; duree?: string }>;
};

export default async function BookingPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const machine = await getMachineBySlug(slug);

  if (!machine || machine.status === "retired") notFound();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={`${machine.workshop?.name ?? "Atelier"} · ${CATEGORY_LABELS[machine.category]}`}
        title={machine.name}
        description={`${machine.summary} — ${machine.hourly_credits} crédits par heure entamée.`}
        action={
          <ButtonLink href={`/equipements/${machine.slug}`} variant="secondary" size="sm">
            Fiche machine
          </ButtonLink>
        }
      />

      {machine.status !== "available" ? (
        <Alert tone="warning" title="Machine en maintenance">
          Ce poste est momentanément retiré du planning. Consultez le parc pour trouver une
          alternative.
        </Alert>
      ) : (
        <Suspense fallback={<PlannerSkeleton />}>
          <BookingPlanner machine={machine} searchParams={searchParams} />
        </Suspense>
      )}
    </div>
  );
}

/**
 * Le parcours tient en trois états lisibles dans l'URL :
 *   1. aucun paramètre        → choix du jour
 *   2. ?jour=                 → choix de l'heure et de la durée
 *   3. ?jour=&debut=&duree=   → récapitulatif puis confirmation
 * Chaque étape est donc partageable, rechargeable et compatible avec le retour
 * arrière du navigateur, sans état client à synchroniser.
 */
async function BookingPlanner({
  machine,
  searchParams,
}: {
  machine: NonNullable<Awaited<ReturnType<typeof getMachineBySlug>>>;
  searchParams: Props["searchParams"];
}) {
  const viewer = await requireOnboardedViewer();
  const { jour, debut, duree } = await searchParams;

  const approved = await getApprovedCategories(viewer.userId);
  const isCertified = approved.includes(machine.category);

  if (!isCertified) {
    return (
      <Alert tone="warning" title="Habilitation nécessaire">
        <p>
          La famille « {CATEGORY_LABELS[machine.category]} » demande une habilitation validée par
          un référent avant toute réservation.
        </p>
        <ButtonLink href="/habilitations" size="sm" className="mt-4">
          Demander l&apos;habilitation
        </ButtonLink>
      </Alert>
    );
  }

  const today = new Date();
  const day = jour && /^\d{4}-\d{2}-\d{2}$/.test(jour) ? jour : null;
  const duration = Math.min(Math.max(Number(duree) || 1, 1), MAX_DURATION);
  const startHour = debut === undefined ? null : Number(debut);

  // Étape 1 — choix du jour
  if (!day) {
    const quickDays = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(date.getDate() + index);
      return toDateInputValue(date);
    });

    return (
      <Step title="Étape 1 · Choisir un jour" index={1}>
        <form method="get" className="flex flex-wrap items-end gap-4">
          <div className="w-56">
            <Field label="Date" htmlFor="jour">
              <Input
                id="jour"
                name="jour"
                type="date"
                required
                min={toDateInputValue(today)}
                defaultValue={toDateInputValue(today)}
              />
            </Field>
          </div>
          <Button type="submit">Voir les créneaux</Button>
        </form>

        <div className="mt-8">
          <p className="label-tech text-kraft">Raccourcis</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {quickDays.map((value) => (
              <li key={value}>
                <Link
                  href={`?jour=${value}`}
                  className="label-tech border border-line bg-paper px-3 py-2 text-ink-soft transition-colors hover:border-rust hover:text-rust"
                >
                  {formatDay(`${value}T12:00:00`)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Step>
    );
  }

  const busy = await getMachineBusySlots(machine.id, day);
  const slots = computeSlots(day, busy, duration);

  // Étape 3 — récapitulatif et confirmation
  if (startHour !== null && Number.isFinite(startHour)) {
    const chosen = slots.find((slot) => slot.hour === startHour);

    if (!chosen || chosen.state !== "free") {
      return (
        <Step title="Étape 2 · Créneau indisponible" index={2}>
          <Alert tone="error" title="Ce créneau n'est plus libre">
            Quelqu&apos;un l&apos;a réservé entre-temps, ou il déborde de l&apos;horaire
            d&apos;ouverture.
          </Alert>
          <ButtonLink href={`?jour=${day}&duree=${duration}`} variant="secondary" className="mt-6">
            Revoir les créneaux
          </ButtonLink>
        </Step>
      );
    }

    const cost = duration * machine.hourly_credits;
    const remaining = viewer.profile.credits_balance - cost;

    return (
      <Step title="Étape 3 · Confirmer" index={3}>
        <dl className="grid gap-px border border-line bg-line sm:grid-cols-2">
          {[
            { k: "Machine", v: machine.name },
            { k: "Atelier", v: `${machine.workshop?.name} — ${machine.workshop?.city}` },
            { k: "Créneau", v: `${formatDay(`${day}T12:00:00`)} · ${startHour}h – ${startHour + duration}h` },
            { k: "Durée", v: `${duration} heure${duration > 1 ? "s" : ""}` },
            { k: "Coût", v: `${cost} crédits` },
            { k: "Solde après réservation", v: `${remaining} crédits` },
          ].map((row) => (
            <div key={row.k} className="bg-paper px-5 py-4">
              <dt className="label-tech text-kraft">{row.k}</dt>
              <dd className="mt-2 text-sm">{row.v}</dd>
            </div>
          ))}
        </dl>

        {remaining < 0 ? (
          <div className="mt-6">
            <Alert tone="error" title="Crédits insuffisants">
              Il vous manque {Math.abs(remaining)} crédits pour ce créneau. Réduisez la durée ou
              rechargez votre compte.
            </Alert>
          </div>
        ) : (
          <div className="mt-8">
            <BookingConfirmForm
              machineId={machine.id}
              date={day}
              startHour={startHour}
              duration={duration}
            />
          </div>
        )}

        <Link
          href={`?jour=${day}&duree=${duration}`}
          className="mt-6 inline-block text-sm text-ink-soft underline underline-offset-4 hover:text-ink"
        >
          ← Changer de créneau
        </Link>
      </Step>
    );
  }

  // Étape 2 — choix de l'heure et de la durée
  return (
    <Step title="Étape 2 · Choisir un créneau" index={2}>
      <form method="get" className="flex flex-wrap items-end gap-4 border-b border-line pb-6">
        <input type="hidden" name="jour" value={day} />
        <div className="w-40">
          <Field label="Durée" htmlFor="duree">
            <Select id="duree" name="duree" defaultValue={String(duration)}>
              {Array.from({ length: MAX_DURATION }, (_, index) => index + 1).map((value) => (
                <option key={value} value={value}>
                  {value} heure{value > 1 ? "s" : ""}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Button type="submit" variant="secondary">
          Recalculer
        </Button>
        <p className="ml-auto self-center text-sm text-ink-soft">
          {formatDay(`${day}T12:00:00`)} · {duration * machine.hourly_credits} crédits
        </p>
      </form>

      <ul className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        {slots.map((slot) => {
          const label = `${slot.hour}h – ${slot.hour + duration}h`;

          if (slot.state !== "free") {
            return (
              <li key={slot.hour} className="border border-line bg-bone px-3 py-4 text-center">
                <p className="font-mono text-sm text-kraft line-through">{label}</p>
                <p className="label-tech mt-1 text-kraft">{SLOT_LABELS[slot.state]}</p>
              </li>
            );
          }

          return (
            <li key={slot.hour} className="border border-line bg-paper">
              <Link
                href={`?jour=${day}&duree=${duration}&debut=${slot.hour}`}
                className="block px-3 py-4 text-center transition-colors hover:bg-rust hover:text-paper"
              >
                <p className="font-mono text-sm">{label}</p>
                <p className="label-tech mt-1 text-kraft">Libre</p>
              </Link>
            </li>
          );
        })}
      </ul>

      <Link
        href="?"
        className="mt-6 inline-block text-sm text-ink-soft underline underline-offset-4 hover:text-ink"
      >
        ← Changer de jour
      </Link>
    </Step>
  );
}

function Step({
  title,
  index,
  children,
}: {
  title: string;
  index: 1 | 2 | 3;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-line bg-paper p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <Badge tone="rust">{`0${index}`}</Badge>
        <h2 className="text-xl uppercase">{title}</h2>
      </div>
      <div className="mt-8">{children}</div>
    </section>
  );
}

function PlannerSkeleton() {
  return (
    <div className="h-72 animate-pulse border border-line bg-paper" aria-busy />
  );
}
