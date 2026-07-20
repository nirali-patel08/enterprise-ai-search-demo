import { Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { ProtectedRoute } from "@/components/layout/protected-route";
import type { AppRouteObject } from "@/types/router";
import DashboardPage from "@/pages/dashboard";
import SearchBuilderPage from "@/pages/search-builder";
import ConnectorsPage from "@/pages/connectors";
import AgentsPage from "@/pages/agents";
import AgentDetailPage from "@/pages/agents/detail";
import NewAgentPage from "@/pages/agents/new";
import AdminPage from "@/pages/admin";

export const routes: AppRouteObject[] = [
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/dashboard", element: <DashboardPage />, meta: { title: "Dashboard" } },
          { path: "/builder", element: <SearchBuilderPage />, meta: { title: "AI Search Builder" } },
          { path: "/connectors", element: <ConnectorsPage />, meta: { title: "Connectors" } },
          { path: "/agents", element: <AgentsPage />, meta: { title: "Agent Marketplace" } },
          { path: "/agents/new", element: <NewAgentPage />, meta: { title: "New Agent" } },
          { path: "/agents/:agentId", element: <AgentDetailPage />, meta: { title: "Agent Details" } },
          { path: "/admin", element: <AdminPage />, meta: { title: "Admin" } },
          { path: "/chat", element: <Navigate to="/agents" replace /> },
          { path: "/analytics", element: <Navigate to="/dashboard" replace /> },
          { path: "/governance", element: <Navigate to="/dashboard" replace /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/dashboard" replace /> },
];
