import CircularProgress from "@mui/material/CircularProgress";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const sizes = { sm: 16, md: 24, lg: 40 };

export const Spinner = ({ size = "md", className, label = "Loading..." }: SpinnerProps) => (
  <span role="status" aria-label={label} className={cn("inline-flex", className)}>
    <CircularProgress size={sizes[size]} aria-hidden="true" sx={{ color: "#F2760A" }} />
  </span>
);

export const PageLoader = ({ title = "Loading..." }: { title?: string }) => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <Spinner size="lg" />
      <p className="text-sm text-gray-500">{title}</p>
    </div>
  </div>
);
