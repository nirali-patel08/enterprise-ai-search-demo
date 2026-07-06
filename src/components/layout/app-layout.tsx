import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { cn } from "@/lib/utils";

export const AppLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden lg:block">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((v) => !v)} />
      </div>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="absolute inset-0 bg-black/50" aria-hidden="true" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative z-50">
            <Sidebar collapsed={false} onToggle={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      <Box
        id="scroll-container"
        className="flex min-w-0 flex-1 flex-col overflow-y-auto"
        sx={{
          background: "linear-gradient(135deg, #ECE9DC 0%, #F2F2F2 45%, #EDEDED 100%)",
          backgroundSize: "cover",
        }}
      >
        <Header showMenuButton onMenuToggle={() => setMobileSidebarOpen((o) => !o)} />
        <main id="main-content" className={cn("flex-1")}>
          <Outlet />
        </main>
        <footer className="flex h-[52px] items-center justify-between bg-transparent px-8">
          <p className="font-['Inter',sans-serif] text-[10.5px] text-black">© 2026 Enterprise AI Search Demo</p>
          <p className="font-['Inter',sans-serif] text-[10.5px] text-black/50">Powered by RandomTrees design system</p>
        </footer>
      </Box>
    </div>
  );
};
