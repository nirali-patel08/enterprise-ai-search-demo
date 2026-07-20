import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "@/components/layout/header";
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

      <div id="scroll-container" className="weave-page-bg flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          showMenuButton
          onMenuToggle={() => setMobileSidebarOpen((o) => !o)}
        />
        <main id="main-content" className="relative z-0 flex min-h-0 flex-1 flex-col overflow-y-auto pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
