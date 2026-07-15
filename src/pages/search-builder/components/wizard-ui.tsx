import * as React from "react";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { cn } from "@/lib/utils";

interface WizardHeaderProps {
  step: number;
  total: number;
  title: string;
  subtitle?: string;
}

export const WizardHeader = ({ step, total, title, subtitle }: WizardHeaderProps) => (
  <div className="flex flex-col items-center text-center">
    <p className="text-[13px] font-normal leading-[155%] text-black/70">
      Step {step} of {total}
    </p>
    <h1 className="mt-1 text-[25px] font-bold leading-[155%] text-black">{title}</h1>
    {subtitle && <p className="mt-0.5 max-w-xl text-[13px] font-normal leading-[155%] text-black">{subtitle}</p>}
  </div>
);

interface WizardPanelProps {
  title?: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export const WizardPanel = ({ title, trailing, children, className, bodyClassName }: WizardPanelProps) => (
  <div className={cn("ds-glass p-1", className)}>
    {(title || trailing) && (
      <div className="mb-4 flex items-center justify-between gap-3">
        {title && <h3 className="text-[15px] font-bold text-black">{title}</h3>}
        {trailing}
      </div>
    )}
    <div className={bodyClassName}>{children}</div>
  </div>
);

interface FieldProps {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}

export const Field = ({ label, hint, htmlFor, children, className }: FieldProps) => (
  <div className={cn("flex flex-col gap-2.5", className)}>
    <label htmlFor={htmlFor} className="ds-field-label">
      {label}
    </label>
    {children}
    {hint && <p className="text-[11px] text-black/50">{hint}</p>}
  </div>
);

export const TextInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn("ds-field", className)} {...props} />,
);
TextInput.displayName = "TextInput";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => <textarea ref={ref} className={cn("ds-field resize-none", className)} {...props} />,
);
Textarea.displayName = "Textarea";

interface SelectableCardProps {
  selected: boolean;
  onSelect: () => void;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  showRadio?: boolean;
}

export const SelectableCard = ({
  selected,
  onSelect,
  icon,
  title,
  description,
  children,
  className,
  showRadio = true,
}: SelectableCardProps) => (
  <button
    type="button"
    onClick={onSelect}
    aria-pressed={selected}
    className={cn(
      "ds-glass-option flex w-full cursor-pointer items-start gap-3 p-4 text-left",
      selected && "ds-glass-option--selected",
      className,
    )}
  >
    {showRadio && <span className={cn("ds-radio mt-0.5", selected && "ds-radio--checked")} aria-hidden />}
    <div className="min-w-0 flex-1">
      <div className="mb-1 flex items-center gap-2">
        {icon && <span className="text-black">{icon}</span>}
        <span className="text-[14px] font-medium leading-none text-black">{title}</span>
      </div>
      {description && (
        <p className="line-clamp-2 text-[12px] font-normal leading-[155%] text-black/70">{description}</p>
      )}
      {children}
    </div>
  </button>
);

const TAG_COLORS = ["blue", "purple", "pink"] as const;

interface ChipListProps {
  items: string[];
  onDelete?: (item: string) => void;
  className?: string;
  variant?: "chip" | "tags";
}

export const ChipList = ({ items, onDelete, className, variant = "tags" }: ChipListProps) => {
  if (!items.length) return null;

  if (variant === "tags") {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {items.map((item, i) => (
          <span key={item} className={cn("ds-tag", `ds-tag--${TAG_COLORS[i % TAG_COLORS.length]}`)}>
            {item}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {items.map((item) => (
        <span key={item} className="ds-chip">
          {item}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(item)}
              aria-label={`Remove ${item}`}
              className="flex cursor-pointer items-center text-black/60 hover:text-black"
            >
              <CloseRoundedIcon sx={{ fontSize: 14 }} />
            </button>
          )}
        </span>
      ))}
    </div>
  );
};
