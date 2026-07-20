import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import { Tooltip } from "@mui/material";
import { headerTooltipSlotProps } from "@/components/ui/header-tooltip";

interface HeaderProps {
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
}

export const Header = ({ onMenuToggle, showMenuButton }: HeaderProps) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileHover, setProfileHover] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const profileRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (profileRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    if (!menuOpen || !profileRef.current) return;
    const updatePos = () => {
      const rect = profileRef.current!.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 8,
        right: Math.max(12, window.innerWidth - rect.right),
      });
    };
    updatePos();
    window.addEventListener("resize", updatePos);
    window.addEventListener("scroll", updatePos, true);
    return () => {
      window.removeEventListener("resize", updatePos);
      window.removeEventListener("scroll", updatePos, true);
    };
  }, [menuOpen]);

  return (
    <header className="relative sticky top-0 left-0 z-50 flex h-[60px] shrink-0 items-center justify-between overflow-visible border-b-[1.5px] border-white bg-[rgba(255,255,255,0.34)] px-4 shadow-[0_1px_5px_0_rgba(0,0,0,0.10)] backdrop-blur-[12px] sm:px-[38px]">
      <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-5">
        {showMenuButton && (
          <button
            type="button"
            onClick={onMenuToggle}
            aria-label="Open navigation menu"
            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-black/5 lg:hidden"
          >
            <MenuRoundedIcon sx={{ fontSize: 20 }} />
          </button>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 sm:gap-5">
        <Tooltip title="Help & Support" placement="bottom" enterDelay={150} slotProps={headerTooltipSlotProps}>
          <button
            type="button"
            aria-label="Help and support"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-[8px] text-text-secondary transition-colors hover:bg-black/[0.08] hover:text-text-primary"
          >
            <HelpOutlineRoundedIcon sx={{ fontSize: 20 }} />
          </button>
        </Tooltip>

        <div className="h-6 w-px bg-black/15" />

        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <Tooltip
            title="My Profile"
            placement="bottom"
            enterDelay={150}
            open={profileHover && !menuOpen}
            disableInteractive
            slotProps={headerTooltipSlotProps}
          >
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              onMouseEnter={() => setProfileHover(true)}
              onMouseLeave={() => setProfileHover(false)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="User menu"
              className="flex cursor-pointer items-center rounded-full p-0.5 transition-colors hover:bg-black/[0.04]"
            >
              <span className="relative inline-flex h-9 w-9 items-center justify-center">
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute h-9 w-9 rounded-full transition-all duration-300 ${
                    profileHover || menuOpen ? "scale-100 bg-black/[0.06] opacity-100" : "scale-95 opacity-0"
                  }`}
                />
                <span className="relative z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-gold text-[11px] font-bold text-white">
                  AD
                </span>
              </span>
            </button>
          </Tooltip>
        </div>
      </div>

      {createPortal(
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              ref={menuRef}
              role="menu"
              aria-label="User menu"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="fixed z-[2000] w-[280px] max-w-[calc(100vw-20px)] overflow-hidden rounded-[14px] border border-[rgba(255,255,255,0.9)] shadow-[0px_6px_15px_0px_rgba(0,0,0,0.22)]"
              style={{
                top: menuPos.top,
                right: menuPos.right,
                backgroundImage:
                  "linear-gradient(90deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.2) 100%), linear-gradient(330.45deg, #EDEDED 52.87%, #F3E7C4 97.2%)",
              }}
            >
              <div className="relative px-3.5 pt-3.5 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gold text-[11px] font-bold text-white">
                    AD
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold uppercase leading-[20px] text-text-primary">Admin</p>
                    <p className="truncate text-[12.5px] font-bold text-accent-orange-dark">Administrator</p>
                  </div>
                </div>
              </div>

              <div className="relative pb-2">
                <MenuOption
                  icon={<SettingsRoundedIcon sx={{ fontSize: 18 }} />}
                  label="Admin Console"
                  onClick={() => {
                    navigate("/admin");
                    setMenuOpen(false);
                  }}
                />
                <MenuOption
                  icon={<LogoutRoundedIcon sx={{ fontSize: 18 }} />}
                  label="Log out"
                  onClick={() => {
                    navigate("/dashboard");
                    setMenuOpen(false);
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </header>
  );
};

const MenuOption = ({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) => (
  <button
    type="button"
    role="menuitem"
    onClick={onClick}
    className="group mb-1 flex h-9 w-full cursor-pointer items-center justify-between px-3.5 transition-colors hover:bg-black/[0.05]"
  >
    <span className="flex h-full items-center gap-2.5 text-text-primary">
      <span className="shrink-0 text-text-secondary">{icon}</span>
      <span className="text-[12.5px] font-semibold uppercase leading-none">{label}</span>
    </span>
    <ChevronRightRoundedIcon
      className="shrink-0 text-text-secondary transition-transform duration-200 group-hover:translate-x-0.5"
      sx={{ fontSize: 16 }}
    />
  </button>
);
