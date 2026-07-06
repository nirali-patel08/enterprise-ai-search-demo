import { Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { ProtectedRoute } from "@/components/layout/protected-route";
import type { AppRouteObject } from "@/types/router";
import SearchBuilderPage from "@/pages/search-builder";
import ChatPage from "@/pages/chat";

export const routes: AppRouteObject[] = [
  { path: "/", element: <Navigate to="/builder" replace /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/builder", element: <SearchBuilderPage />, meta: { title: "AI Search Builder" } },
          { path: "/chat", element: <ChatPage />, meta: { title: "AI Chat" } },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/builder" replace /> },
];
