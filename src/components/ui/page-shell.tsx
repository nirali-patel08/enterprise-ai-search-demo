import { Box } from "@mui/material";
import { cn } from "@/lib/utils";

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
}

export const PageShell = ({ children, className }: PageShellProps) => (
  <Box component="div" className={cn("relative px-6 py-6 pt-2", className)}>
    {children}
  </Box>
);
