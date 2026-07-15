import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { MarketplaceAgent } from "@/data/sample";
import {
  AgentPlaygroundLayout,
  type AgentPlaygroundMode,
  type AgentPlaygroundValues,
} from "@/components/agents/agent-playground-layout";
import { toast } from "@/lib/toast";
import { useBuilderStore } from "@/store/builder-store";

function slugify(name: string) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const MODE_MAP: Record<AgentPlaygroundMode, MarketplaceAgent["type"]> = {
  build: "prompt",
  code: "workflow",
  external: "external",
};

export default function NewAgentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const addCustomAgent = useBuilderStore((s) => s.addCustomAgent);

  const initialMode = (searchParams.get("mode") as AgentPlaygroundMode | null) ?? "build";

  const [values, setValues] = useState<AgentPlaygroundValues>({
    name: "",
    description: "",
    model: "gpt-4o-mini",
    instructions: "",
    searchIndex: "byod-index",
    externalUrl: "",
    mode: ["build", "code", "external"].includes(initialMode) ? initialMode : "build",
  });

  const handleChange = <K extends keyof AgentPlaygroundValues>(key: K, value: AgentPlaygroundValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const createAgent = () => {
    const trimmedName = values.name.trim();
    if (!trimmedName) {
      toast.error("Agent name is required");
      return false;
    }
    if (values.mode === "external" && !values.externalUrl.trim()) {
      toast.error("External agent URL is required");
      return false;
    }

    const type = MODE_MAP[values.mode];
    const id = `custom-${slugify(trimmedName)}-${Date.now()}`;
    const agent: MarketplaceAgent = {
      id,
      name: trimmedName,
      version: 1,
      type,
      createdOn: new Date().toLocaleString(),
      description: values.description.trim() || `Custom ${values.mode} agent.`,
      model: type !== "external" ? values.model : undefined,
      instructions: values.instructions.trim() || undefined,
      searchIndex: type === "prompt" ? values.searchIndex : undefined,
    };

    addCustomAgent(agent);
    toast.success(`Agent "${trimmedName}" created`);
    navigate(`/agents/${id}`);
    return true;
  };

  return (
    <AgentPlaygroundLayout
      variant="create"
      values={values}
      onChange={handleChange}
      onSave={() => {
        if (!values.name.trim()) {
          toast.error("Agent name is required to save");
          return;
        }
        toast.success("Draft saved");
      }}
      onPublish={createAgent}
    />
  );
}
