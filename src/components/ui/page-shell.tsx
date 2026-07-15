import Intersect from "@/assets/module/market-place/Intersect.svg";
import { cn } from "@/lib/utils";

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
}

export const PageShell = ({ children, className }: PageShellProps) => (
  <div className={cn("route-page relative px-4 py-6 pt-2 sm:px-6 lg:px-8", className)}>
    <img
      src={Intersect}
      alt=""
      aria-hidden="true"
      className="pointer-events-none absolute top-0 right-1/2 -translate-x-1/2 select-none opacity-70"
    />
    {children}
  </div>
);
