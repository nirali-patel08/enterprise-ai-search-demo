import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import ManageSearchOutlinedIcon from "@mui/icons-material/ManageSearchOutlined";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import RadioButtonCheckedRoundedIcon from "@mui/icons-material/RadioButtonCheckedRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import { Tooltip } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  { label: "Connectors", href: "/connectors", icon: <HubOutlinedIcon sx={ICON_SX} /> },
  { label: "OpenSearch", href: "/indexes", icon: <StorageRoundedIcon sx={ICON_SX} /> },
  { label: "Agent Marketplace", href: "/agents", icon: <SmartToyOutlinedIcon sx={ICON_SX} /> },
];

const USER = {
  initials: "AD",
  name: "Admin",
  role: "Administrator",
} as const;

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
              <BrandMark size={38} className="shrink-0" />
              <div className="min-w-0 whitespace-nowrap">
                <p className="truncate text-[14px] font-bold leading-tight text-white">Enterprise AI</p>
                <p className="mt-0.5 truncate text-[12px] font-semibold text-accent-orange">Search Platform</p>
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
            <BrandMark size={38} />
          </Link>
        )}
      </div>

      {/* Menu */}
      <div className="flex flex-1 flex-col overflow-y-auto no-scrollbar">
        <div className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.href} item={item} expanded={expanded} onNavigate={handleItemClick} />
          ))}
        </div>
      </div>

      {/* User */}
      <SidebarUserMenu expanded={expanded} onNavigate={handleItemClick} />
    </nav>
  );
};

function SidebarUserMenu({
  expanded,
  onNavigate,
}: {
  expanded: boolean;
  onNavigate?: () => void;
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const rootRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    if (!open || expanded || !rootRef.current) return;

    const updatePos = () => {
      const rect = rootRef.current!.getBoundingClientRect();
      setMenuPos({
        top: rect.top,
        left: rect.right + 8,
      });
    };

    updatePos();
    window.addEventListener("resize", updatePos);
    window.addEventListener("scroll", updatePos, true);
    return () => {
      window.removeEventListener("resize", updatePos);
      window.removeEventListener("scroll", updatePos, true);
    };
  }, [open, expanded]);

  const closeMenu = () => setOpen(false);

  const runAction = (action: () => void) => {
    action();
    closeMenu();
    onNavigate?.();
  };

  const menuItems = [
    {
      icon: <SettingsRoundedIcon sx={{ fontSize: 18 }} />,
      label: "Admin Console",
      onClick: () => runAction(() => navigate("/admin")),
    },
    {
      icon: <HelpOutlineRoundedIcon sx={{ fontSize: 18 }} />,
      label: "Help & Support",
      onClick: () => closeMenu(),
    },
    {
      icon: <LogoutRoundedIcon sx={{ fontSize: 18 }} />,
      label: "Log out",
      onClick: () => runAction(() => navigate("/dashboard")),
    },
  ] as const;

  const profileButton = (
    <button
      type="button"
      onClick={() => setOpen((value) => !value)}
      aria-haspopup="menu"
      aria-expanded={open}
      aria-label="Account menu"
      className={cn(
        "flex w-full cursor-pointer items-center gap-3 rounded-[10px] px-2 py-2 text-left transition-colors",
        "hover:bg-sidebar-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange",
        open && "bg-sidebar-hover",
        !expanded && "justify-center px-0",
      )}
    >
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold text-[11px] font-bold text-white">
        {USER.initials}
      </span>
      {expanded && (
        <>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-semibold text-white">{USER.name}</span>
            <span className="block truncate text-[11px] font-medium text-accent-orange">{USER.role}</span>
          </span>
          <ExpandMoreRoundedIcon
            sx={{ fontSize: 18 }}
            className={cn("shrink-0 text-sidebar-text transition-transform", open && "rotate-180")}
          />
        </>
      )}
    </button>
  );

  return (
    <div ref={rootRef} className="mt-4 shrink-0 border-t border-white/10 pt-4">
      {!expanded ? (
        <Tooltip title={`${USER.name} · ${USER.role}`} placement="right" enterDelay={200} slotProps={headerTooltipSlotProps}>
          <span className="block">{profileButton}</span>
        </Tooltip>
      ) : (
        profileButton
      )}

      {expanded && open && (
        <div className="mt-2 flex flex-col gap-1 rounded-[10px] bg-sidebar-panel p-1.5" role="menu" aria-label="Account menu">
          {menuItems.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={item.onClick}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-left text-[13px] font-medium text-sidebar-text transition-colors hover:bg-sidebar-hover hover:text-white"
            >
              <span className="text-sidebar-text-dim">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}

      {!expanded &&
        open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label="Account menu"
            className="fixed z-[2000] w-[220px] overflow-hidden rounded-[12px] border border-white/10 bg-sidebar-panel p-1.5 shadow-2xl"
            style={{ top: menuPos.top, left: menuPos.left }}
          >
            <div className="border-b border-white/10 px-3 py-2.5">
              <p className="truncate text-[13px] font-semibold text-white">{USER.name}</p>
              <p className="truncate text-[11px] font-medium text-accent-orange">{USER.role}</p>
            </div>
            <div className="py-1">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  onClick={item.onClick}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-left text-[13px] font-medium text-sidebar-text transition-colors hover:bg-sidebar-hover hover:text-white"
                >
                  <span className="text-sidebar-text-dim">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

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
        "flex cursor-pointer items-center gap-3 overflow-hidden rounded-[10px] px-3 py-2.5 text-[14px] font-medium transition-colors",
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
