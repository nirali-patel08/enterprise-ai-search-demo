import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const PageHeader = ({ title, description, action, icon, className }: PageHeaderProps) => {
  if (icon) {
    return (
      <div className={cn("mb-6 flex items-center gap-3", className)}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white">{icon}</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("mb-6", action && "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && <p className="mt-1 text-gray-500">{description}</p>}
      </div>
      {action}
    </div>
  );
};
