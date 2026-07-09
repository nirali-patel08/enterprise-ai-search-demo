import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import MessageRoundedIcon from "@mui/icons-material/MessageRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: SidebarItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <DashboardRoundedIcon sx={{ fontSize: 18 }} /> },
  { label: "AI Search Builder", href: "/builder", icon: <SearchRoundedIcon sx={{ fontSize: 18 }} /> },
  { label: "AI Chat", href: "/chat", icon: <MessageRoundedIcon sx={{ fontSize: 18 }} /> },
  { label: "Connectors", href: "/connectors", icon: <HubRoundedIcon sx={{ fontSize: 18 }} /> },
  { label: "Agent Marketplace", href: "/agents", icon: <SmartToyRoundedIcon sx={{ fontSize: 18 }} /> },
  { label: "Analytics", href: "/analytics", icon: <AnalyticsRoundedIcon sx={{ fontSize: 18 }} /> },
  { label: "Governance", href: "/governance", icon: <ShieldRoundedIcon sx={{ fontSize: 18 }} /> },
];

const BOTTOM_ITEMS: SidebarItem[] = [
  { label: "Admin", href: "/admin", icon: <SettingsRoundedIcon sx={{ fontSize: 18 }} /> },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ collapsed, onToggle }: SidebarProps) => (
  <nav
    aria-label="Main navigation"
    className={cn(
      "flex h-screen flex-col bg-sidebar-bg text-white transition-all duration-300 ease-in-out",
      collapsed ? "w-[4.5rem]" : "w-[16.25rem]",
    )}
  >
    <div className={cn("flex h-16 shrink-0 items-center border-b border-white/10", collapsed ? "justify-center px-0" : "px-5")}>
      <Link to="/dashboard" className={cn("flex items-center", collapsed ? "justify-center" : "gap-2.5")}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500">
          <span className="text-sm font-bold text-white">EA</span>
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-bold leading-none text-white">Enterprise AI</p>
            <p className="mt-0.5 text-xs text-white/50">Search Platform</p>
          </div>
        )}
      </Link>
    </div>

    <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
      {NAV_ITEMS.map((item) => (
        <NavItem key={item.href} item={item} collapsed={collapsed} />
      ))}
    </div>

    <div className="flex flex-col gap-1 border-t border-white/10 px-3 py-4">
      {BOTTOM_ITEMS.map((item) => (
        <NavItem key={item.href} item={item} collapsed={collapsed} />
      ))}
      {!collapsed && (
        <div className="mt-2 rounded-xl border border-amber-400/30 bg-amber-500/10 p-3">
          <p className="text-[11px] font-semibold uppercase text-amber-200">Demo mode</p>
          <p className="mt-1 text-[11px] leading-relaxed text-white/60">Sample data only.</p>
        </div>
      )}
    </div>

    <div className={cn("flex pb-4", collapsed ? "justify-center" : "px-3")}>
      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white"
      >
        {collapsed ? <ChevronRightRoundedIcon sx={{ fontSize: 16 }} /> : <ChevronLeftRoundedIcon sx={{ fontSize: 16 }} />}
      </button>
    </div>
  </nav>
);

const NavItem = ({ item, collapsed }: { item: SidebarItem; collapsed: boolean }) => {
  const { pathname } = useLocation();
  const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

  return (
    <Link
      to={item.href}
      aria-label={collapsed ? item.label : undefined}
      aria-current={active ? "page" : undefined}
      title={collapsed ? item.label : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400",
        active ? "bg-orange-500/15 text-orange-400" : "text-white/60 hover:bg-white/8 hover:text-white",
        collapsed && "mx-auto h-10 w-10 justify-center px-0",
      )}
    >
      <span className={cn("shrink-0", active && "text-orange-400")}>{item.icon}</span>
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
};
