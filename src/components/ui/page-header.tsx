import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const PageHeader = ({ title, description, action, icon, className }: PageHeaderProps) => {
  return (
    <div
      className={cn(
        "route-page-header mb-6 flex flex-col gap-4 mt-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {icon && <span className="route-page-header__icon">{icon}</span>}
        <div className="min-w-0">
          <h1 className="route-page-header__title">{title}</h1>
          {description && <p className="route-page-header__description">{description}</p>}
        </div>
      </div>
      {action && <div className="route-page-header__action">{action}</div>}
    </div>
  );
};
