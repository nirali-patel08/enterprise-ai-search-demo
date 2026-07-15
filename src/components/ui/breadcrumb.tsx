import { Link, useLocation, useMatches } from "react-router-dom";
import type { RouteMeta } from "@/types/router";
import { cn } from "@/lib/utils";

const ROUTE_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/builder": "AI Search Builder",
  "/chat": "AI Chat",
  "/connectors": "Connectors",
  "/agents": "Agents",
  "/agents/new": "New Agent",
  "/analytics": "Analytics",
  "/governance": "Governance",
  "/admin": "Admin",
};

function Separator() {
  return <span className="select-none text-[11px] text-[#9CA3AF]">/</span>;
}

export function Breadcrumb() {
  const location = useLocation();
  const matches = useMatches();

  const meta = [...matches].reverse().find((m) => (m.handle as RouteMeta | undefined)?.title)?.handle as RouteMeta | undefined;
  const segments = location.pathname.split("/").filter(Boolean);

  if (location.pathname === "/dashboard" || segments.length === 0) return null;

  const items: { label: string; href?: string }[] = [{ label: "Dashboard", href: "/dashboard" }];

  if (location.pathname.startsWith("/agents/") && location.pathname !== "/agents/new") {
    items.push({ label: "Agents", href: "/agents" });
    items.push({ label: meta?.title ?? "Agent Details" });
  } else {
    const label = ROUTE_LABELS[location.pathname] ?? meta?.title ?? segments[segments.length - 1];
    items.push({ label });
  }

  if (items.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 bg-page-bg px-8 pb-0 pt-3">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={`${item.label}-${i}`} className="flex items-center gap-1.5">
            {i > 0 && <Separator />}
            {!isLast && item.href ? (
              <Link to={item.href} className="text-[11.5px] font-medium text-text-secondary transition-colors hover:text-text-primary">
                {item.label}
              </Link>
            ) : (
              <span className={cn("text-[11.5px]", isLast ? "font-semibold text-text-primary" : "font-medium text-text-secondary")} aria-current={isLast ? "page" : undefined}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
