import type { ReactNode } from "react";
import { matchPath, useMatches } from "react-router-dom";
import type { RouteObject, UIMatch } from "react-router-dom";

export interface RouteMeta {
  title?: string;
  description?: string;
  backButtonConfig?: {
    enabled?: boolean;
    label?: string;
    link?: string;
    leadingIcon?: ReactNode;
  };
}

export type AppRouteObject = Omit<RouteObject, "handle" | "children"> & {
  meta?: RouteMeta;
  children?: AppRouteObject[];
};

export function buildRoutes(routes: AppRouteObject[]): RouteObject[] {
  return routes.map(({ meta, children, ...rest }) => ({
    ...rest,
    ...(meta !== undefined ? { handle: meta } : {}),
    ...(children !== undefined ? { children: buildRoutes(children) } : {}),
  })) as RouteObject[];
}

export function useRouteMeta(): RouteMeta | undefined {
  const matches = useMatches() as UIMatch<unknown, RouteMeta | undefined>[];
  return [...matches].reverse().find((m) => m.handle?.title)?.handle;
}

export function getRouteMeta(routes: AppRouteObject[], path: string): RouteMeta | undefined {
  for (const route of routes) {
    if (route.path && matchPath(route.path, path)) return route.meta;
    if (route.children) {
      const found = getRouteMeta(route.children, path);
      if (found) return found;
    }
  }
  return undefined;
}
