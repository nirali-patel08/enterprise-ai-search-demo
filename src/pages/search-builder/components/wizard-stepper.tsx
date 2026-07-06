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
              className={cn(
                "group flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition",
                active && "border-orange-500 bg-orange-50 text-orange-800",
                !active && done && "border-emerald-200 bg-emerald-50/70 text-emerald-800",
                !active && !done && "border-gray-200 bg-white text-gray-600 hover:border-gray-300",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  active && "bg-orange-500 text-white",
                  !active && done && "bg-emerald-600 text-white",
                  !active && !done && "bg-gray-100 text-gray-500 group-hover:bg-gray-200",
                )}
              >
                {done ? <CheckRoundedIcon sx={{ fontSize: 14 }} /> : s.id}
              </span>
              <span className="hidden md:block">
                <span className="block text-xs font-semibold">{s.label}</span>
                <span className="block text-[11px] opacity-70">{s.description}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
