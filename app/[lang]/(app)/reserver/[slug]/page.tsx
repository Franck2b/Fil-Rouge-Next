import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Link } from "@/components/ui/link";
import { PageHeader } from "@/components/app/page-header";
import { BookingConfirmForm } from "@/components/booking/confirm-form";
import { requireOnboardedViewer } from "@/lib/auth";
import { getMachineBySlug } from "@/lib/data/catalog";
import { getApprovedCategories, getMachineBusySlots } from "@/lib/data/account";
import { localizeMachine } from "@/lib/i18n/content";
import { getI18n } from "@/lib/i18n/server";
import { fill, plural } from "@/lib/i18n/text";
import type { MachineWithWorkshop } from "@/lib/types";
import { addDays, computeSlots, MAX_DURATION, parisDay, slotDate } from "@/lib/booking";
import { formatDay } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.app.reserve.metaTitle, robots: { index: false } };
}

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ jour?: string; debut?: string; duree?: string }>;
};

export default async function BookingPage({ params, searchParams }: Props) {
  const [{ slug }, { locale, t }] = await Promise.all([params, getI18n()]);
  const source = await getMachineBySlug(slug);

  if (!source || source.status === "retired") notFound();

  const machine = localizeMachine(source, locale);
  const copy = t.app.reserve;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={`${machine.workshop?.name ?? copy.workshopFallback} · ${t.categories[machine.category].label}`}
        title={machine.name}
        description={fill(copy.perHour, { summary: machine.summary, credits: machine.hourly_credits })}
        action={
          <ButtonLink href={`/equipements/${machine.slug}`} variant="secondary" size="sm">
            {copy.machineSheet}
          </ButtonLink>
        }
      />

      {machine.status !== "available" ? (
        <Alert tone="warning" title={copy.maintenanceTitle}>
          {copy.maintenanceText}
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
  machine: MachineWithWorkshop;
  searchParams: Props["searchParams"];
}) {
  const [viewer, { locale, t }, { jour, debut, duree }] = await Promise.all([
    requireOnboardedViewer(),
    getI18n(),
    searchParams,
  ]);

  const copy = t.app.reserve;
  const category = t.categories[machine.category].label;
  const approved = await getApprovedCategories(viewer.userId);

  if (!approved.includes(machine.category)) {
    return (
      <Alert tone="warning" title={copy.certificationTitle}>
        <p>{fill(copy.certificationText, { category })}</p>
        <ButtonLink href="/habilitations" size="sm" className="mt-4">
          {copy.requestCertification}
        </ButtonLink>
      </Alert>
    );
  }

  const today = parisDay();
  const day = jour && /^\d{4}-\d{2}-\d{2}$/.test(jour) ? jour : null;
  const duration = Math.min(Math.max(Number(duree) || 1, 1), MAX_DURATION);
  const startHour = debut === undefined ? null : Number(debut);

  /** Libellé d'un jour : midi à Paris, pour ne jamais basculer sur la veille ou le lendemain. */
  const dayLabel = (value: string) => formatDay(locale, slotDate(value, 12).toISOString());

  // Étape 1 — choix du jour
  if (!day) {
    const quickDays = Array.from({ length: 7 }, (_, index) => addDays(today, index));

    return (
      <Step title={copy.step1} index={1}>
        <form method="get" className="flex flex-wrap items-end gap-4">
          <div className="w-56">
            <Field label={copy.date} htmlFor="jour">
              <Input id="jour" name="jour" type="date" required min={today} defaultValue={today} />
            </Field>
          </div>
          <Button type="submit">{copy.showSlots}</Button>
        </form>

        <div className="mt-8">
          <p className="label-tech text-kraft">{copy.shortcuts}</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {quickDays.map((value) => (
              <li key={value}>
                <Link
                  href={`?jour=${value}`}
                  className="label-tech border border-line bg-paper px-3 py-2 text-ink-soft transition-colors hover:border-rust hover:text-rust"
                >
                  {dayLabel(value)}
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
        <Step title={copy.unavailableStep} index={2}>
          <Alert tone="error" title={copy.slotTakenTitle}>
            {copy.slotTakenText}
          </Alert>
          <ButtonLink href={`?jour=${day}&duree=${duration}`} variant="secondary" className="mt-6">
            {copy.reviewSlots}
          </ButtonLink>
        </Step>
      );
    }

    const cost = duration * machine.hourly_credits;
    const remaining = viewer.profile.credits_balance - cost;

    return (
      <Step title={copy.step3} index={3}>
        <dl className="grid gap-px border border-line bg-line sm:grid-cols-2">
          {[
            { k: copy.machine, v: machine.name },
            { k: copy.workshop, v: `${machine.workshop?.name} — ${machine.workshop?.city}` },
            {
              k: copy.slot,
              v: `${dayLabel(day)} · ${fill(copy.hourRange, { start: startHour, end: startHour + duration })}`,
            },
            { k: copy.duration, v: plural(locale, t.plural.hours, duration) },
            { k: copy.cost, v: plural(locale, t.plural.credits, cost) },
            { k: copy.balanceAfter, v: plural(locale, t.plural.credits, remaining) },
          ].map((row) => (
            <div key={row.k} className="bg-paper px-5 py-4">
              <dt className="label-tech text-kraft">{row.k}</dt>
              <dd className="mt-2 text-sm">{row.v}</dd>
            </div>
          ))}
        </dl>

        {remaining < 0 ? (
          <div className="mt-6">
            <Alert tone="error" title={copy.insufficientTitle}>
              {fill(copy.insufficientText, { count: Math.abs(remaining) })}
            </Alert>
          </div>
        ) : (
          <div className="mt-8">
            <BookingConfirmForm
              machineId={machine.id}
              date={day}
              startHour={startHour}
              duration={duration}
              t={copy}
            />
          </div>
        )}

        <Link
          href={`?jour=${day}&duree=${duration}`}
          className="mt-6 inline-block text-sm text-ink-soft underline underline-offset-4 hover:text-ink"
        >
          {copy.changeSlot}
        </Link>
      </Step>
    );
  }

  // Étape 2 — choix de l'heure et de la durée
  return (
    <Step title={copy.step2} index={2}>
      <form method="get" className="flex flex-wrap items-end gap-4 border-b border-line pb-6">
        <input type="hidden" name="jour" value={day} />
        <div className="w-40">
          <Field label={copy.duration} htmlFor="duree">
            <Select id="duree" name="duree" defaultValue={String(duration)}>
              {Array.from({ length: MAX_DURATION }, (_, index) => index + 1).map((value) => (
                <option key={value} value={value}>
                  {plural(locale, t.plural.hours, value)}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Button type="submit" variant="secondary">
          {copy.recalculate}
        </Button>
        <p className="ml-auto self-center text-sm text-ink-soft">
          {dayLabel(day)} · {plural(locale, t.plural.credits, duration * machine.hourly_credits)}
        </p>
      </form>

      <ul className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        {slots.map((slot) => {
          const label = fill(copy.hourRange, { start: slot.hour, end: slot.hour + duration });

          if (slot.state !== "free") {
            return (
              <li key={slot.hour} className="border border-line bg-bone px-3 py-4 text-center">
                <p className="font-mono text-sm text-kraft line-through">{label}</p>
                <p className="label-tech mt-1 text-kraft">{t.slotState[slot.state]}</p>
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
                <p className="label-tech mt-1 text-kraft">{t.slotState.free}</p>
              </Link>
            </li>
          );
        })}
      </ul>

      <Link
        href="?"
        className="mt-6 inline-block text-sm text-ink-soft underline underline-offset-4 hover:text-ink"
      >
        {copy.changeDay}
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
  return <div className="h-72 animate-pulse border border-line bg-paper" aria-busy />;
}
