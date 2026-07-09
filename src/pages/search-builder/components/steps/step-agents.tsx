import { Link } from "react-router-dom";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { MARKETPLACE_AGENTS } from "@/data/sample";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useBuilderStore } from "@/store/builder-store";

export const StepAgents = () => {
  const selectedAgentIds = useBuilderStore((s) => s.selectedAgentIds);
  const toggleAgent = useBuilderStore((s) => s.toggleAgent);

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">4. Add AI Agents</h2>
          <p className="mt-1 text-sm text-gray-500">Select agents from the marketplace or create new ones. Inspired by Microsoft Foundry agent management.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">Browse templates</Button>
          <Button variant="primary" size="sm">
            <AddRoundedIcon sx={{ fontSize: 16 }} />
            New agent
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-white/80 px-4 py-3">
        <span className="text-xs font-medium text-gray-500">Create options:</span>
        {["Build an agent", "Code an agent", "Link external agent"].map((opt) => (
          <span key={opt} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">{opt}</span>
        ))}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Select</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Version</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Created on</th>
                <th className="px-4 py-3">Description</th>
              </tr>
            </thead>
            <tbody>
              {MARKETPLACE_AGENTS.map((agent) => {
                const selected = selectedAgentIds.includes(agent.id);
                return (
                  <tr key={agent.id} className={cn("border-b border-gray-50 transition", selected && "bg-orange-50/50")}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected} onChange={() => toggleAgent(agent.id)} aria-label={`Select ${agent.name}`} className="accent-orange-500" />
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/agents/${agent.id}`} className="font-medium text-sky-700 hover:underline">{agent.name}</Link>
                    </td>
                    <td className="px-4 py-3"><Badge variant="outline">{agent.version}</Badge></td>
                    <td className="px-4 py-3">{agent.type}</td>
                    <td className="px-4 py-3 text-gray-500">{agent.createdOn}</td>
                    <td className="max-w-xs truncate px-4 py-3 text-gray-500">{agent.description || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="text-sm text-gray-500">
        <strong className="text-gray-700">{selectedAgentIds.length}</strong> agent(s) selected. Open any agent to view Playground, Details, and tools configuration.
      </p>
    </section>
  );
};
