import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { STEPS } from "@/data/sample";
import { cn } from "@/lib/utils";
import { useBuilderStore } from "@/store/builder-store";

export const WizardStepper = () => {
  const step = useBuilderStore((s) => s.step);
  const setStep = useBuilderStore((s) => s.setStep);

  return (
    <div className="no-scrollbar overflow-x-auto pb-1">
      <div className="flex min-w-max gap-2">
        {STEPS.map((s) => {
          const done = s.id < step;
          const active = s.id === step;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setStep(s.id)}
              aria-current={active ? "step" : undefined}
              className={cn(
                "group flex items-center gap-2 rounded-[12px] border px-3 py-2 text-left transition",
                "shadow-[var(--shadow-card)]",
                active && "border-accent-orange bg-white text-accent-orange",
                !active && done && "border-success-border bg-success-bg text-success-title",
                !active && !done && "border-neutral-border bg-card-bg text-text-secondary hover:border-[rgba(242,118,10,0.35)]",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  active && "bg-accent-orange text-white",
                  !active && done && "bg-success-icon text-white",
                  !active && !done && "bg-step-upcoming-circle text-text-secondary group-hover:bg-[#d8d6d0]",
                )}
              >
                {done ? <CheckRoundedIcon sx={{ fontSize: 14 }} /> : s.id}
              </span>
              <span className="hidden md:block">
                <span className="block text-xs font-semibold text-text-primary">{s.label}</span>
                <span className="block text-[11px] text-text-secondary">{s.description}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
