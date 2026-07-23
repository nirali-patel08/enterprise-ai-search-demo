import { useEffect, useState } from "react";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/sidebar";
import { cn } from "@/lib/utils";

const SIDEBAR_STORAGE_KEY = "enterprise-sidebar-pinned";

function readPinnedPreference(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export const AppLayout = () => {
  const [sidebarPinned, setSidebarPinned] = useState(readPinnedPreference);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarPinned));
    } catch {
      /* ignore */
    }
  }, [sidebarPinned]);

  const togglePin = () => setSidebarPinned((v) => !v);

  return (
    <div className="flex h-screen overflow-hidden bg-page-bg">
      <div
        className={cn(
          "relative hidden shrink-0 transition-[width] duration-300 ease-in-out lg:block",
          sidebarPinned ? "w-[260px]" : "w-[72px]",
        )}
      >
        <Sidebar pinned={sidebarPinned} onTogglePin={togglePin} />
      </div>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="absolute inset-0 cursor-pointer bg-black/50" aria-hidden="true" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative z-50">
            <Sidebar mobile onNavigate={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div id="scroll-container" className="weave-page-bg relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {!mobileSidebarOpen && (
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open navigation menu"
            className="fixed left-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/80 bg-[rgba(255,255,255,0.72)] text-text-secondary shadow-[0_2px_10px_rgba(0,0,0,0.08)] backdrop-blur-md transition-colors hover:bg-white hover:text-text-primary lg:hidden"
          >
            <MenuRoundedIcon sx={{ fontSize: 20 }} />
          </button>
        )}

        <main id="main-content" className="relative z-0 flex min-h-0 flex-1 flex-col overflow-y-auto pb-6 pt-14 lg:pt-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
