import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import { Link } from "react-router-dom";
import { CHANNELS, MARKETPLACE_AGENTS, ORCHESTRATION_OPTIONS, getPipelineStages } from "@/data/sample";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { StatCard } from "@/components/ui/stat-card";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import { useBuilderStore } from "@/store/builder-store";

export default function DashboardPage() {
  const deploymentType = useBuilderStore((s) => s.deploymentType);
  const savedConnectors = useBuilderStore((s) => s.savedConnectors);
  const selectedAgentIds = useBuilderStore((s) => s.selectedAgentIds);
  const channels = useBuilderStore((s) => s.channels);
  const orchestrationId = useBuilderStore((s) => s.orchestrationId);
  const indexProgress = useBuilderStore((s) => s.indexProgress);

  const connectorNames = savedConnectors.map((c) => c.name);
  const agentNames = MARKETPLACE_AGENTS.filter((a) => selectedAgentIds.includes(a.id)).map((a) => a.name);
  const channelNames = CHANNELS.filter((c) => channels.includes(c.id)).map((c) => c.name);
  const orchestration = ORCHESTRATION_OPTIONS.find((o) => o.id === orchestrationId);
  const stages = getPipelineStages(deploymentType, connectorNames, agentNames, channelNames);

  return (
    <PageShell>
      <PageHeader
        icon={<DashboardRoundedIcon sx={{ fontSize: 20 }} />}
        title="Project Overview"
        description="Dashboard for your Enterprise AI Search project — pipeline status, connectors, agents, and deployment readiness."
        action={
          <Link to="/builder">
            <span className="inline-flex items-center gap-1 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600">
              Open Builder <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
            </span>
          </Link>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<HubRoundedIcon sx={{ fontSize: 18 }} />} value={savedConnectors.length} label="Saved connectors" iconClassName="bg-sky-100 text-sky-600" />
        <StatCard icon={<StorageRoundedIcon sx={{ fontSize: 18 }} />} value={`${indexProgress}%`} label="Indexing progress" iconClassName="bg-emerald-100 text-emerald-600" />
        <StatCard icon={<SmartToyRoundedIcon sx={{ fontSize: 18 }} />} value={selectedAgentIds.length} label="Active agents" iconClassName="bg-violet-100 text-violet-600" />
        <StatCard icon={<DashboardRoundedIcon sx={{ fontSize: 18 }} />} value={deploymentType === "cloud" ? "Azure" : "Open Source"} label="Deployment" iconClassName="bg-orange-100 text-orange-600" />
      </div>

      <div className="mb-6">
        <h2 className="mb-3 text-base font-semibold text-gray-900">Processing Pipeline</h2>
        <div className="flex flex-wrap items-stretch gap-2">
          {stages.map((stage, i) => (
            <div key={stage.title} className="flex items-center gap-2">
              <Card className="min-w-[160px] flex-1">
                <CardBody className="p-4">
                  <h3 className="text-sm font-semibold">{stage.title}</h3>
                  <p className="text-xs text-gray-500">{stage.sub}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {stage.pills.map((p) => (
                      <Badge key={p} variant={stage.tone} size="sm">{p}</Badge>
                    ))}
                  </div>
                </CardBody>
              </Card>
              {i < stages.length - 1 && <ChevronRightRoundedIcon className="hidden text-gray-300 sm:block" sx={{ fontSize: 18 }} />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardBody className="p-5">
            <h3 className="font-semibold text-gray-900">Orchestration</h3>
            <p className="mt-1 text-sm text-gray-500">{orchestration?.name ?? "Not configured"}</p>
            <p className="mt-2 text-xs text-gray-400">{orchestration?.description}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-5">
            <h3 className="font-semibold text-gray-900">Quick links</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                { label: "Connectors", href: "/connectors" },
                { label: "Agent Marketplace", href: "/agents" },
                { label: "AI Search Builder", href: "/builder" },
                { label: "AI Chat", href: "/chat" },
              ].map((l) => (
                <Link key={l.href} to={l.href} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200">
                  {l.label}
                </Link>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </PageShell>
  );
}
