import { cn } from "@/lib/utils";
import { Card, CardBody } from "@/components/ui/card";

interface StatCardProps {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
  iconClassName?: string;
  variant?: "orange" | "blue" | "green";
  compact?: boolean;
  active?: boolean;
  onClick?: () => void;
}

const variantClasses = {
  orange: "bg-[#FCE8D6] text-accent-orange-dark",
  blue: "bg-[#DBEAFE] text-selected-pill",
  green: "bg-success-bg text-success-icon",
};

export const StatCard = ({
  icon,
  value,
  label,
  iconClassName,
  variant = "orange",
  compact = false,
  active = false,
  onClick,
}: StatCardProps) => {
  const body = (
    <CardBody className={cn("flex items-center gap-3", compact ? "p-2.5" : "p-4")}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-[12px] border border-black/[0.06]",
          compact ? "h-8 w-8 rounded-[10px]" : "h-10 w-10",
          variantClasses[variant],
          iconClassName,
        )}
      >
        {icon}
      </div>
      <div>
        <p className={cn("text-stat-value", compact && "text-[18px] leading-none")}>{value}</p>
        <p className={cn("text-stat-label", compact && "text-[11px]")}>{label}</p>
      </div>
    </CardBody>
  );

  if (onClick) {
    return (
      <Card
        className={cn(
          "dashboard-stat-card cursor-pointer hover:!translate-y-0 focus-visible:!translate-y-0",
          active && "dashboard-stat-card--active",
        )}
        onClick={onClick}
        role="button"
        tabIndex={0}
        aria-pressed={active}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
      >
        {body}
      </Card>
    );
  }

  return <Card>{body}</Card>;
};
