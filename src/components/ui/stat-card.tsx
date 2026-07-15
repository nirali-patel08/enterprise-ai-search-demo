import { cn } from "@/lib/utils";
import { Card, CardBody } from "@/components/ui/card";

interface StatCardProps {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
  iconClassName?: string;
  variant?: "orange" | "blue" | "green";
  compact?: boolean;
}

const variantClasses = {
  orange: "bg-[#FCE8D6] text-accent-orange-dark",
  blue: "bg-[#DBEAFE] text-selected-pill",
  green: "bg-success-bg text-success-icon",
};

export const StatCard = ({ icon, value, label, iconClassName, variant = "orange", compact = false }: StatCardProps) => (
  <Card>
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
  </Card>
);
