import { Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { ProtectedRoute } from "@/components/layout/protected-route";
import type { AppRouteObject } from "@/types/router";
import DashboardPage from "@/pages/dashboard";
import SearchBuilderPage from "@/pages/search-builder";
import ChatPage from "@/pages/chat";
import ConnectorsPage from "@/pages/connectors";
import AgentsPage from "@/pages/agents";
import AgentDetailPage from "@/pages/agents/detail";
import AnalyticsPage from "@/pages/analytics";
import GovernancePage from "@/pages/governance";
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
          { path: "/chat", element: <ChatPage />, meta: { title: "AI Chat" } },
          { path: "/connectors", element: <ConnectorsPage />, meta: { title: "Connectors" } },
          { path: "/agents", element: <AgentsPage />, meta: { title: "Agent Marketplace" } },
          { path: "/agents/:agentId", element: <AgentDetailPage />, meta: { title: "Agent Details" } },
          { path: "/analytics", element: <AnalyticsPage />, meta: { title: "Analytics" } },
          { path: "/governance", element: <GovernancePage />, meta: { title: "Governance" } },
          { path: "/admin", element: <AdminPage />, meta: { title: "Admin" } },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/dashboard" replace /> },
];
