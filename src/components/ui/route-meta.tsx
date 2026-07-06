import { useEffect } from "react";
import { useMatches } from "react-router-dom";
import type { UIMatch } from "react-router-dom";
import type { RouteMeta } from "@/types/router";

export function RouteMeta() {
  const matches = useMatches() as UIMatch<unknown, RouteMeta | undefined>[];
  const meta = [...matches].reverse().find((m) => m.handle?.title)?.handle;

  useEffect(() => {
    const pageTitle = meta?.title ?? "Home";
    document.title = `Enterprise AI Search | ${pageTitle}`;
  }, [meta?.title]);

  return null;
}
