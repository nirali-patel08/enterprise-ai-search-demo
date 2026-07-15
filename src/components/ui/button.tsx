import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger" | "accent";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-accent-orange text-white hover:brightness-105 active:brightness-95",
  secondary: "bg-card-bg text-text-primary border border-neutral-border hover:bg-topbar-bg",
  ghost: "text-text-secondary hover:bg-black/5",
  outline: "border border-neutral-border bg-card-bg text-text-primary hover:bg-topbar-bg",
  danger: "bg-red-600 text-white hover:bg-red-700",
  accent: "bg-accent-orange text-white hover:brightness-105",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-8 px-3 text-xs font-semibold rounded-[10px] gap-1.5",
  md: "h-10 px-4 text-sm font-semibold rounded-[10px] gap-2",
  lg: "h-11 px-6 text-base font-bold rounded-[10px] gap-2",
  icon: "h-9 w-9 rounded-[10px]",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      className={cn(
        "inline-flex cursor-pointer select-none items-center justify-center font-medium transition-all shadow-[var(--shadow-card)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <svg className="h-4 w-4 shrink-0 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  ),
);
Button.displayName = "Button";
