import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { Link } from "react-router-dom";
import { CHANNELS, ORCHESTRATION_OPTIONS, getPipelineStages } from "@/data/sample";
import { useAgents } from "@/hooks/useAgents";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import { useBuilderStore } from "@/store/builder-store";

const PIPELINE_TONES = ["blue", "teal", "green", "orange", "violet"] as const;

export default function DashboardPage() {
  const deploymentType = useBuilderStore((s) => s.deploymentType);
  const savedConnectors = useBuilderStore((s) => s.savedConnectors);
  const selectedAgentIds = useBuilderStore((s) => s.selectedAgentIds);
  const channels = useBuilderStore((s) => s.channels);
  const orchestrationId = useBuilderStore((s) => s.orchestrationId);
  const indexProgress = useBuilderStore((s) => s.indexProgress);
  const step = useBuilderStore((s) => s.step);
  const deployed = useBuilderStore((s) => s.deployed);
  const agents = useAgents();

  const connectorNames = savedConnectors.map((c) => c.name);
  const agentNames = agents.filter((a) => selectedAgentIds.includes(a.id)).map((a) => a.name);
  const channelNames = CHANNELS.filter((c) => channels.includes(c.id)).map((c) => c.name);
  const orchestration = ORCHESTRATION_OPTIONS.find((o) => o.id === orchestrationId);
  const stages = getPipelineStages(deploymentType, connectorNames, agentNames, channelNames);

  return (
    <PageShell className="dashboard-page !py-3 !pt-1">
      <PageHeader
        className="!mb-3 !mt-1 !gap-2"
        icon={<DashboardRoundedIcon sx={{ fontSize: 18 }} />}
        title="Project Overview"
        description="Pipeline status, connectors, agents, and deployment readiness."
        action={
          <Link to={deployed ? "/chat" : "/builder"}>
            <Button variant="primary" size="sm">
              {deployed ? "Open AI Chat" : step > 1 ? `Resume setup · Step ${step}` : "Start setup"}
              <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
            </Button>
          </Link>
        }
      />

      <div className="dashboard-page__body">
        <div className="dashboard-page__stats grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard compact variant="blue" icon={<HubRoundedIcon sx={{ fontSize: 16 }} />} value={savedConnectors.length} label="Saved connectors" />
          <StatCard compact variant="green" icon={<StorageRoundedIcon sx={{ fontSize: 16 }} />} value={`${indexProgress}%`} label="Indexing progress" />
          <StatCard compact variant="blue" icon={<SmartToyRoundedIcon sx={{ fontSize: 16 }} />} value={selectedAgentIds.length} label="Active agents" />
          <StatCard compact variant="orange" icon={<DashboardRoundedIcon sx={{ fontSize: 16 }} />} value={deploymentType === "cloud" ? "Azure" : "Open Source"} label="Deployment" />
        </div>

        <section className="route-section dashboard-page__pipeline !p-3">
          <div className="route-section__head !mb-2.5">
            <div>
              <h2 className="route-section__title">Processing pipeline</h2>
              <p className="route-section__description">Live configuration from the AI Search Builder.</p>
            </div>
            <Badge variant={deployed ? "success" : "warning"}>
              {deployed ? "Published" : `Setup step ${step} of 7`}
            </Badge>
          </div>
          <div className="flex flex-wrap items-stretch gap-1.5">
            {stages.map((stage, i) => (
              <div key={stage.title} className="flex min-w-0 flex-1 items-center gap-1">
                <div className={`pipeline-tile pipeline-tile--${PIPELINE_TONES[i % PIPELINE_TONES.length]} min-w-0 flex-1`}>
                  <div className="flex items-start gap-2">
                    <span className="pipeline-tile__index">{i + 1}</span>
                    <div className="min-w-0">
                      <h3 className="pipeline-tile__title">{stage.title}</h3>
                      <p className="pipeline-tile__sub">{stage.sub}</p>
                    </div>
                  </div>
                  {stage.pills.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {stage.pills.slice(0, 2).map((p) => (
                        <Badge key={p} variant={stage.tone} size="sm">{p}</Badge>
                      ))}
                      {stage.pills.length > 2 && (
                        <Badge variant={stage.tone} size="sm">+{stage.pills.length - 2}</Badge>
                      )}
                    </div>
                  )}
                </div>
                {i < stages.length - 1 && (
                  <ChevronRightRoundedIcon className="hidden shrink-0 text-black/20 sm:block" sx={{ fontSize: 14 }} />
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="dashboard-page__cards grid gap-2.5 md:grid-cols-2">
          <Card hoverable>
            <CardBody className="flex h-full flex-col !p-3.5">
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <h3 className="text-[13px] font-semibold text-black">Orchestration</h3>
                <Badge variant={orchestration ? "success" : "warning"}>
                  {orchestration ? "Configured" : "Action needed"}
                </Badge>
              </div>
              <p className="text-[13px] text-black/60">{orchestration?.name ?? "Not configured"}</p>
              <p className="mt-0.5 line-clamp-2 text-[12px] text-black/45">{orchestration?.description}</p>
              <Link to="/builder" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-accent-orange-dark">
                Open orchestration studio <ChevronRightRoundedIcon sx={{ fontSize: 15 }} />
              </Link>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="flex h-full flex-col !p-3.5">
              <div className="mb-1.5 flex items-center gap-2">
                <CheckCircleRoundedIcon sx={{ fontSize: 16 }} className="text-success-icon" />
                <h3 className="text-[13px] font-semibold text-black">Continue your flow</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "Connectors", href: "/connectors" },
                  { label: "Agent Marketplace", href: "/agents" },
                  { label: "AI Search Builder", href: "/builder" },
                  { label: "AI Chat", href: "/chat" },
                ].map((l) => (
                  <Link key={l.href} to={l.href} className="test-step__chip">
                    {l.label}
                  </Link>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
