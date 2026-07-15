import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import ManageSearchOutlinedIcon from "@mui/icons-material/ManageSearchOutlined";
import RadioButtonCheckedRoundedIcon from "@mui/icons-material/RadioButtonCheckedRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import { Tooltip } from "@mui/material";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BrandMark } from "@/components/ui/brand-mark";
import { headerTooltipSlotProps } from "@/components/ui/header-tooltip";
import { cn } from "@/lib/utils";

export interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const ICON_SX = { fontSize: 20 } as const;

const NAV_ITEMS: SidebarItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <GridViewOutlinedIcon sx={ICON_SX} /> },
  { label: "AI Search Builder", href: "/builder", icon: <ManageSearchOutlinedIcon sx={ICON_SX} /> },
  { label: "AI Chat", href: "/chat", icon: <ForumOutlinedIcon sx={ICON_SX} /> },
  { label: "Connectors", href: "/connectors", icon: <HubOutlinedIcon sx={ICON_SX} /> },
  { label: "Agent Marketplace", href: "/agents", icon: <SmartToyOutlinedIcon sx={ICON_SX} /> },
  { label: "Analytics", href: "/analytics", icon: <InsightsOutlinedIcon sx={ICON_SX} /> },
  { label: "Governance", href: "/governance", icon: <ShieldOutlinedIcon sx={ICON_SX} /> },
];

const BOTTOM_ITEMS: SidebarItem[] = [
  { label: "Admin", href: "/admin", icon: <SettingsOutlinedIcon sx={ICON_SX} /> },
];

interface SidebarProps {
  /** Locked-open state controlled by the pin toggle. */
  pinned?: boolean;
  onTogglePin?: () => void;
  /** Mobile drawer: always expanded, static positioning, closes on navigate. */
  mobile?: boolean;
  /** Called after a nav item is clicked (mobile closes the drawer). */
  onNavigate?: () => void;
}

export const Sidebar = ({ pinned = false, onTogglePin, mobile = false, onNavigate }: SidebarProps) => {
  const [hovered, setHovered] = useState(false);

  // Expanded when pinned open, hovered (desktop auto-expand), or in the mobile drawer.
  const expanded = mobile || pinned || hovered;
  const floating = expanded && !pinned && !mobile;

  const handleItemClick = () => {
    // Auto-collapse the hover-expanded rail after a selection (Vuexy behavior).
    setHovered(false);
    onNavigate?.();
  };

  const handleTogglePin = () => {
    // Unlocking collapses the rail immediately, even while the cursor stays over it.
    if (pinned) setHovered(false);
    onTogglePin?.();
  };

  return (
    <nav
      aria-label="Main navigation"
      onMouseEnter={mobile ? undefined : () => setHovered(true)}
      onMouseLeave={mobile ? undefined : () => setHovered(false)}
      className={cn(
        "flex flex-col bg-sidebar-bg text-sidebar-text",
        "transition-[width] duration-300 ease-in-out",
        mobile ? "relative h-screen" : "absolute inset-y-0 left-0 z-40 h-screen",
        expanded ? "w-[260px]" : "w-[72px]",
        floating && "shadow-2xl",
      )}
      style={{ padding: "20px 12px" }}
    >
      {/* Logo + pin toggle */}
      <div className={cn("mb-6 flex h-9 shrink-0 items-center px-1.5", expanded ? "justify-between" : "justify-center")}>
        {expanded ? (
          <>
            <Link to="/dashboard" className="flex min-w-0 items-center gap-2.5" onClick={handleItemClick}>
              <BrandMark size={30} className="shrink-0" />
              <div className="min-w-0 whitespace-nowrap">
                <p className="truncate text-sm font-bold leading-none text-white">Enterprise AI</p>
                <p className="mt-0.5 truncate text-xs text-sidebar-text-dim">Search Platform</p>
              </div>
            </Link>
            {!mobile && onTogglePin && (
              <Tooltip
                title={pinned ? "Unlock sidebar (auto-collapse)" : "Lock sidebar open"}
                placement="right"
                slotProps={headerTooltipSlotProps}
              >
                <button
                  type="button"
                  onClick={handleTogglePin}
                  aria-label={pinned ? "Unlock sidebar" : "Lock sidebar open"}
                  aria-pressed={pinned}
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange",
                    pinned
                      ? "text-accent-orange hover:bg-sidebar-hover"
                      : "text-sidebar-text-dim hover:bg-sidebar-hover hover:text-sidebar-text",
                  )}
                >
                  {pinned ? (
                    <RadioButtonCheckedRoundedIcon sx={{ fontSize: 18 }} />
                  ) : (
                    <RadioButtonUncheckedRoundedIcon sx={{ fontSize: 18 }} />
                  )}
                </button>
              </Tooltip>
            )}
          </>
        ) : (
          <Link
            to="/dashboard"
            aria-label="Enterprise AI Search home"
            className="flex h-9 w-9 items-center justify-center"
            onClick={handleItemClick}
          >
            <BrandMark size={30} />
          </Link>
        )}
      </div>

      {/* Menu */}
      <div className="flex flex-1 flex-col overflow-y-auto no-scrollbar">
        <div className="flex flex-col">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.href} item={item} expanded={expanded} onNavigate={handleItemClick} />
          ))}
        </div>
      </div>

      {/* System */}
      <div className="mt-4 flex flex-col">
        {BOTTOM_ITEMS.map((item) => (
          <NavItem key={item.href} item={item} expanded={expanded} onNavigate={handleItemClick} />
        ))}
      </div>
    </nav>
  );
};

const NavItem = ({
  item,
  expanded,
  onNavigate,
}: {
  item: SidebarItem;
  expanded: boolean;
  onNavigate: () => void;
}) => {
  const { pathname } = useLocation();
  const active =
    pathname === item.href ||
    (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

  const link = (
    <Link
      to={item.href}
      onClick={onNavigate}
      aria-label={!expanded ? item.label : undefined}
      aria-current={active ? "page" : undefined}
      className={cn(
        "mb-0.5 flex cursor-pointer items-center gap-3 overflow-hidden rounded-[10px] px-3 py-3 text-[14px] font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange",
        active
          ? "bg-active-bg text-accent-orange"
          : "text-sidebar-text hover:bg-sidebar-hover",
      )}
    >
      <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center", active ? "text-accent-orange" : "text-sidebar-text")}>
        {item.icon}
      </span>
      {expanded && <span className="truncate whitespace-nowrap">{item.label}</span>}
    </Link>
  );

  if (!expanded) {
    return (
      <Tooltip title={item.label} placement="right" enterDelay={200} slotProps={headerTooltipSlotProps}>
        <span className="block">{link}</span>
      </Tooltip>
    );
  }

  return link;
};
