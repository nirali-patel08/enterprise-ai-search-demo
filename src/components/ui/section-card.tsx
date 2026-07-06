import { cn } from "@/lib/utils";
import { Card, CardBody } from "@/components/ui/card";

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  bodyClassName?: string;
  trailing?: React.ReactNode;
}

export const SectionCard = ({ title, children, bodyClassName, trailing }: SectionCardProps) => (
  <Card>
    <CardBody className={cn("p-6", bodyClassName)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        {trailing}
      </div>
      {children}
    </CardBody>
  </Card>
);
