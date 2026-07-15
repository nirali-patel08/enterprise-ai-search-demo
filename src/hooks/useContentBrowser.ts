import { useQuery } from "@tanstack/react-query";
import { contentBrowserApi } from "@/api/content-browser";

export function getContentBrowseQueryOptions(connectorTypeId: string, connectorInstanceId: string) {
  return {
    queryKey: ["content-browse", connectorTypeId, connectorInstanceId] as const,
    queryFn: () => contentBrowserApi.browse(connectorTypeId, connectorInstanceId),
    enabled: !!connectorTypeId && !!connectorInstanceId,
    staleTime: 60_000,
  };
}

export function useContentBrowse(connectorTypeId: string, connectorInstanceId: string) {
  return useQuery(getContentBrowseQueryOptions(connectorTypeId, connectorInstanceId));
}
