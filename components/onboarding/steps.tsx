const STEPS = [
  { n: 1, label: "Votre profil" },
  { n: 2, label: "Habilitation" },
];

export function OnboardingSteps({ current }: { current: 1 | 2 }) {
  return (
    <ol className="flex items-center gap-px border border-line bg-line">
      {STEPS.map((step) => {
        const done = step.n < current;
        const active = step.n === current;

        return (
          <li
            key={step.n}
            aria-current={active ? "step" : undefined}
            className={`flex flex-1 items-center gap-3 px-4 py-3 ${
              active ? "bg-ink text-bone" : "bg-paper text-ink-soft"
            }`}
          >
            <span
              className={`label-tech flex h-6 w-6 shrink-0 items-center justify-center border ${
                active ? "border-rust bg-rust text-paper" : "border-line text-kraft"
              }`}
            >
              {done ? "✓" : step.n}
            </span>
            <span className="label-tech">{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
