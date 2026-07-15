import { useMemo } from "react";
import { MARKETPLACE_AGENTS, type MarketplaceAgent } from "@/data/sample";
import { useBuilderStore } from "@/store/builder-store";

export function useAgents() {
  const customAgents = useBuilderStore((s) => s.customAgents);
  return useMemo(() => [...MARKETPLACE_AGENTS, ...customAgents], [customAgents]);
}

export function useAgentById(agentId: string | undefined): MarketplaceAgent | undefined {
  const agents = useAgents();
  return agents.find((a) => a.id === agentId);
}
