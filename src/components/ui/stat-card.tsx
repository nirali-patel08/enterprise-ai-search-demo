import { cn } from "@/lib/utils";
import { Card, CardBody } from "@/components/ui/card";

interface StatCardProps {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
  iconClassName?: string;
}

export const StatCard = ({ icon, value, label, iconClassName }: StatCardProps) => (
  <Card>
    <CardBody className="flex items-center gap-3 p-5">
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", iconClassName)}>{icon}</div>
      <div>
        <p className="text-xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </CardBody>
  </Card>
);
