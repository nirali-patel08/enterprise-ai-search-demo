import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { MARKETPLACE_AGENTS } from "@/data/sample";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { PageShell } from "@/components/ui/page-shell";
import { Select, MenuItem, TextField, FormControl, InputLabel } from "@mui/material";

export default function AgentDetailPage() {
  const { agentId } = useParams<{ agentId: string }>();
  const agent = MARKETPLACE_AGENTS.find((a) => a.id === agentId) ?? MARKETPLACE_AGENTS[4];
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<"playground" | "details">("playground");

  return (
    <PageShell className="!px-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/agents" className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900">
            <ChevronLeftRoundedIcon sx={{ fontSize: 18 }} /> Agents
          </Link>
          <h1 className="text-xl font-bold text-gray-900">{agent.name}</h1>
          <Badge variant="success">Saved</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">Save</Button>
          <Button variant="primary" size="sm">Publish</Button>
        </div>
      </div>

      <div className="mb-4 flex gap-4 border-b border-gray-200">
        {(["playground", "details"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={`border-b-2 px-1 pb-2 text-sm font-medium capitalize ${tab === t ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500"}`}>
            {t}
          </button>
        ))}
        {["Preview", "Traces", "Monitor", "Evaluation"].map((t) => (
          <span key={t} className="pb-2 text-sm text-gray-400">{t}</span>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit">
          <CardBody className="space-y-4 p-4">
            <FormControl fullWidth size="small">
              <InputLabel>Model</InputLabel>
              <Select label="Model" defaultValue={agent.model ?? "gpt-4o-mini"}>
                <MenuItem value="gpt-4o-mini">gpt-4o-mini</MenuItem>
                <MenuItem value="gpt-4o">gpt-4o</MenuItem>
              </Select>
            </FormControl>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase text-gray-500">Instructions</p>
              <TextField multiline rows={6} fullWidth size="small" defaultValue={agent.instructions ?? agent.description} />
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase text-gray-500">Tools</p>
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-sm font-medium">Azure AI Search</p>
                <Select fullWidth size="small" defaultValue={agent.searchIndex ?? "byod-index"} sx={{ mt: 1 }}>
                  <MenuItem value="byod-index">byod-index</MenuItem>
                  <MenuItem value="sharepoint-index">sharepoint-index</MenuItem>
                </Select>
                <div className="mt-2 flex gap-2">
                  <Button variant="secondary" size="sm">Add</Button>
                  <Button variant="ghost" size="sm">Upload files</Button>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="flex min-h-[480px] flex-col">
          <CardBody className="flex flex-1 flex-col p-0">
            <div className="flex-1 p-6">
              {tab === "playground" ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <h2 className="text-2xl font-semibold text-gray-400">{agent.name}</h2>
                  <p className="mt-2 max-w-lg text-sm text-gray-500">{agent.description}</p>
                </div>
              ) : (
                <div className="space-y-3 text-sm text-gray-600">
                  <p><strong>Version:</strong> {agent.version}</p>
                  <p><strong>Type:</strong> {agent.type}</p>
                  <p><strong>Created:</strong> {agent.createdOn}</p>
                  <p><strong>Search index:</strong> {agent.searchIndex ?? "—"}</p>
                </div>
              )}
            </div>
            <div className="border-t border-gray-100 p-4">
              <div className="flex gap-2">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Message the agent..."
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none ring-orange-500 focus:ring-2"
                />
                <Button variant="primary" size="icon"><SendRoundedIcon sx={{ fontSize: 18 }} /></Button>
              </div>
              <p className="mt-2 text-center text-[11px] text-gray-400">AI-generated content may be incorrect</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </PageShell>
  );
}
