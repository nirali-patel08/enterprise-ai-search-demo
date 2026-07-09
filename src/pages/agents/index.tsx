import { Link } from "react-router-dom";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import { MARKETPLACE_AGENTS } from "@/data/sample";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";

export default function AgentsPage() {
  return (
    <PageShell>
      <PageHeader
        icon={<SmartToyRoundedIcon sx={{ fontSize: 20 }} />}
        title="Agents"
        description="Agent marketplace — build, code, or link external agents for your enterprise search project."
        action={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">Browse templates</Button>
            <Button variant="primary" size="sm"><AddRoundedIcon sx={{ fontSize: 16 }} /> New agent</Button>
          </div>
        }
      />

      <div className="mb-4 flex gap-4 border-b border-gray-200">
        {["Agents", "Routines (Preview)", "Workflows (Preview)"].map((tab, i) => (
          <button key={tab} type="button" className={`border-b-2 px-1 pb-2 text-sm font-medium ${i === 0 ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500"}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
        Ask AI: What are common use cases for an agent? · What RBAC roles do I need? · Is there support for multi-agent flows?
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Version</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Created on</th>
                <th className="px-4 py-3">Description</th>
              </tr>
            </thead>
            <tbody>
              {MARKETPLACE_AGENTS.map((agent) => (
                <tr key={agent.id} className="border-b border-gray-50 hover:bg-gray-50/80">
                  <td className="px-4 py-3">
                    <Link to={`/agents/${agent.id}`} className="font-medium text-sky-700 hover:underline">{agent.name}</Link>
                  </td>
                  <td className="px-4 py-3"><Badge variant="outline">{agent.version}</Badge></td>
                  <td className="px-4 py-3">{agent.type}</td>
                  <td className="px-4 py-3 text-gray-500">{agent.createdOn}</td>
                  <td className="max-w-md truncate px-4 py-3 text-gray-500">{agent.description || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <p className="mt-3 text-xs text-gray-500">1–{MARKETPLACE_AGENTS.length} of {MARKETPLACE_AGENTS.length}</p>
    </PageShell>
  );
}
