import { useMemo } from "react";
import { MARKETPLACE_AGENTS, resolveAgentDeployment, type DeploymentType, type MarketplaceAgent } from "@/data/sample";
import { useBuilderStore } from "@/store/builder-store";

export function useAgents() {
  const customAgents = useBuilderStore((s) => s.customAgents);
  return useMemo(() => [...MARKETPLACE_AGENTS, ...customAgents], [customAgents]);
}

export function useAgentsForDeployment(deploymentType?: DeploymentType) {
  const agents = useAgents();
  const storeDeployment = useBuilderStore((s) => s.deploymentType);
  const target = deploymentType ?? storeDeployment;
  return useMemo(
    () => agents.filter((agent) => resolveAgentDeployment(agent) === target),
    [agents, target],
  );
}

export function useAgentById(agentId: string | undefined): MarketplaceAgent | undefined {
  const agents = useAgents();
  return agents.find((a) => a.id === agentId);
}
