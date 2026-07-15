import Chip from "@mui/material/Chip";
import type { ChipProps } from "@mui/material/Chip";
import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "outline" | "demo" | "gold" | "selected" | "connected";
  size?: "sm" | "md";
  className?: string;
  children?: React.ReactNode;
}

const variantToColor: Record<string, ChipProps["color"]> = {
  default: "default",
  success: "success",
  warning: "warning",
  danger: "error",
  info: "info",
  outline: "default",
  demo: "default",
  gold: "default",
  selected: "default",
  connected: "default",
};

const variantSx: Record<string, object | undefined> = {
  demo: {
    backgroundColor: "#EFE9DD",
    border: "1px solid #DCD3BE",
    color: "#7A6A3E",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  gold: {
    backgroundColor: "#EFE9DD",
    border: "1px solid #DCD3BE",
    color: "#7A6A3E",
    fontWeight: 700,
  },
  selected: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #F2760A",
    color: "#EA580C",
    fontWeight: 600,
  },
  connected: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #D8D6D0",
    color: "#6B6D76",
    fontWeight: 600,
  },
};

export const Badge = ({ variant = "default", size = "sm", className, children }: BadgeProps) => (
  <Chip
    label={children}
    color={variantToColor[variant]}
    size="small"
    variant={variant === "outline" || variant === "connected" || variant === "selected" ? "outlined" : "filled"}
    className={cn(className)}
    sx={{
      height: size === "sm" ? 22 : 26,
      fontSize: size === "sm" ? "11px" : "12px",
      fontWeight: 700,
      borderRadius: "20px",
      ...(variantSx[variant] ?? {}),
    }}
  />
);
