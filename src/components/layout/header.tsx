import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const headerTooltipSlotProps = {
  popper: { modifiers: [{ name: "offset", options: { offset: [0, -6] } }] },
  tooltip: {
    style: {
      fontSize: 12,
      fontFamily: "Inter, sans-serif",
      fontWeight: 500,
      background: "#333333",
      color: "#ffffff",
      boxShadow: "0 0 15px 0 rgba(0, 0, 0, 0.25)",
      borderRadius: "0 8px 8px 8px",
      padding: "6px 12px",
    },
  },
};

interface HeaderProps {
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
}

export const Header = ({ onMenuToggle, showMenuButton }: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 left-0 z-30 flex h-[60px] items-center justify-between border-b-[1.5px] border-b-white border-solid bg-[rgba(255,255,255,0.34)] px-[38px] py-[11px] shadow-[0_1px_5px_0_rgba(0,0,0,0.10)] backdrop-blur-[12px]">
      <div className="flex min-w-0 flex-1 items-center gap-5">
        {showMenuButton && (
          <button
            type="button"
            onClick={onMenuToggle}
            aria-label="Toggle menu"
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 lg:hidden"
          >
            <MenuRoundedIcon sx={{ fontSize: 20 }} />
          </button>
        )}
        <button type="button" onClick={() => navigate("/builder")} className="flex cursor-pointer items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#34300B] text-white">
            <SearchRoundedIcon sx={{ fontSize: 16 }} />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-[13px] font-semibold uppercase leading-[1.1] text-black">Enterprise AI Search</p>
            <p className="text-[11px] text-[#846C00]">Builder &amp; Chat Demo</p>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-4">
        <Badge variant="gold" size="sm">
          Demo
        </Badge>
        <div className="hidden h-6 w-px bg-black/15 sm:block" />
        <Tooltip title="Sample environment — shareable preview" placement="bottom" enterDelay={150} slotProps={headerTooltipSlotProps}>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#E2CD78] text-[11px] font-bold text-black">
            AD
          </span>
        </Tooltip>
      </div>
    </header>
  );
};
