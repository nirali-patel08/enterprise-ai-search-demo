import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense } from "react";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { PageLoader } from "@/components/ui/spinner";
import { ToastProvider } from "@/components/ui/toast-provider";
import { RouteMeta } from "@/components/ui/route-meta";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { routes } from "@/routes";
import { buildRoutes } from "@/types/router";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

function RootLayout() {
  return (
    <>
      <RouteMeta />
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </>
  );
}

const router = createBrowserRouter(
  [
    {
      element: <RootLayout />,
      children: buildRoutes(routes),
    },
  ],
  { basename: import.meta.env.BASE_URL },
);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ToastProvider />
    </QueryClientProvider>
  );
}
