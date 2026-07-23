import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { STEPS } from "@/data/sample";
import { cn } from "@/lib/utils";
import { useBuilderStore } from "@/store/builder-store";

export const WizardStepper = () => {
  const step = useBuilderStore((s) => s.step);
  const setStep = useBuilderStore((s) => s.setStep);

  return (
    <nav className="ds-wizard-stepper" aria-label="Builder steps">
      <ol className="ds-wizard-stepper__list">
        {STEPS.map((s, index) => {
          const done = s.id < step;
          const active = s.id === step;

          return (
            <li key={s.id} className="ds-wizard-stepper__item-wrap">
              {index > 0 && <span className="ds-wizard-stepper__sep" aria-hidden />}
              <button
                type="button"
                onClick={() => setStep(s.id)}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "ds-wizard-stepper__item",
                  active && "ds-wizard-stepper__item--active",
                  !active && done && "ds-wizard-stepper__item--done",
                )}
              >
                <span className="ds-wizard-stepper__marker" aria-hidden>
                  {done ? <CheckRoundedIcon sx={{ fontSize: 12 }} /> : s.id}
                </span>
                <span className="ds-wizard-stepper__label">{s.label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
