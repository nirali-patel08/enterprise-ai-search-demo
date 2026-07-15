import { Link } from "react-router-dom";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAgents } from "@/hooks/useAgents";
import { useBuilderStore } from "@/store/builder-store";
import { WizardPanel } from "../wizard-ui";

const CREATE_OPTIONS = [
  { id: "build", label: "Build an agent" },
  { id: "code", label: "Code an agent" },
  { id: "external", label: "Link external agent" },
] as const;

export const StepAgents = () => {
  const agents = useAgents();
  const selectedAgentIds = useBuilderStore((s) => s.selectedAgentIds);
  const toggleAgent = useBuilderStore((s) => s.toggleAgent);

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="ds-field-label">Create options:</span>
          {CREATE_OPTIONS.map((opt, i) => {
            const tone = (["blue", "purple", "pink"] as const)[i % 3];
            return (
              <Link key={opt.id} to={`/agents/new?mode=${opt.id}`}>
                <span className={cn("ds-tag cursor-pointer transition hover:opacity-80", `ds-tag--${tone}`)}>
                  {opt.label}
                </span>
              </Link>
            );
          })}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">Browse templates</Button>
          <Link to="/agents/new">
            <Button variant="primary" size="sm">
              <AddRoundedIcon sx={{ fontSize: 16 }} />
              New agent
            </Button>
          </Link>
        </div>
      </div>

      <WizardPanel className="overflow-hidden p-0" bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="ds-table ds-table--defined w-full min-w-[640px]">
            <thead>
              <tr>
                <th>Select</th>
                <th>Name</th>
                <th>Version</th>
                <th>Type</th>
                <th>Created on</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => {
                const selected = selectedAgentIds.includes(agent.id);
                return (
                  <tr key={agent.id} className={selected ? "ds-selected-row" : undefined}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleAgent(agent.id)}
                        aria-label={`Select ${agent.name}`}
                        className="ds-checkbox"
                      />
                    </td>
                    <td>
                      <Link to={`/agents/${agent.id}`} className="font-medium text-black hover:underline">
                        {agent.name}
                      </Link>
                      {agent.id.startsWith("custom-") && (
                        <Badge variant="info" className="ml-2">Custom</Badge>
                      )}
                    </td>
                    <td><Badge variant="outline">{agent.version}</Badge></td>
                    <td>{agent.type}</td>
                    <td className="text-black/60">{agent.createdOn}</td>
                    <td className="max-w-xs truncate text-black/60">{agent.description || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </WizardPanel>

      <p className="text-[13px] text-black/60">
        <strong className="text-black">{selectedAgentIds.length}</strong> agent(s) selected.
      </p>
    </section>
  );
};
