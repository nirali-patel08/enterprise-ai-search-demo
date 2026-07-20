import type { TooltipProps } from "@mui/material/Tooltip";

/** Shared MUI Tooltip styling — Weave header pattern */
export const headerTooltipSlotProps: TooltipProps["slotProps"] = {
  popper: {
    modifiers: [{ name: "offset", options: { offset: [0, -6] } }],
    style: { zIndex: 2100 },
  },
  tooltip: {
    style: {
      fontSize: 12,
      fontFamily:
        '"Public Sans", -apple-system, blinkmacsystemfont, "Segoe UI", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
      fontWeight: 500,
      background: "#333333",
      color: "#ffffff",
      boxShadow: "0 0 15px 0 rgba(0, 0, 0, 0.25)",
      borderRadius: "0 8px 8px 8px",
      padding: "6px 12px",
    },
  },
};
