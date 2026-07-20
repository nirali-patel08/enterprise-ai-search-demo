import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { PageShell } from "@/components/ui/page-shell";
import {
  AgentPlaygroundLayout,
  type AgentPlaygroundMode,
  type AgentPlaygroundValues,
} from "@/components/agents/agent-playground-layout";
import { useAgentById } from "@/hooks/useAgents";
import { toast } from "@/lib/toast";

function modeFromType(type: string): AgentPlaygroundMode {
  if (type === "workflow") return "code";
  if (type === "external") return "external";
  return "build";
}

export default function AgentDetailPage() {
  const { agentId } = useParams<{ agentId: string }>();
  const agent = useAgentById(agentId);

  const values = useMemo<AgentPlaygroundValues | null>(() => {
    if (!agent) return null;
    return {
      name: agent.name,
      description: agent.description ?? "",
      instructions: agent.instructions ?? agent.description ?? "",
      searchIndex: agent.searchIndex ?? "byod-index",
      externalUrl: "",
      mode: modeFromType(agent.type),
    };
  }, [agent]);

  if (!agent || !values) {
    return (
      <PageShell>
        <p className="text-sm text-gray-600">Agent not found.</p>
        <Link to="/agents" className="mt-2 inline-block text-sm text-sky-700 hover:underline">
          Back to agents
        </Link>
      </PageShell>
    );
  }

  return (
    <AgentPlaygroundLayout
      variant="detail"
      agentId={agent.id}
      values={values}
      onChange={() => {}}
      onSave={() => toast.success("Agent saved")}
      onPublish={() => toast.success("Agent published")}
    />
  );
}
