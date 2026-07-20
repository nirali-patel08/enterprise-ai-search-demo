import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import { Link, useNavigate } from "react-router-dom";
import { useAgents } from "@/hooks/useAgents";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { WizardPanel } from "@/pages/search-builder/components/wizard-ui";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import { useBuilderStore } from "@/store/builder-store";
import type { MarketplaceAgent } from "@/data/sample";

function AgentsTable({
  agents,
  emptyLabel,
}: {
  agents: MarketplaceAgent[];
  emptyLabel: string;
}) {
  const navigate = useNavigate();

  if (agents.length === 0) {
    return <p className="px-4 py-6 text-[13px] text-black/60">{emptyLabel}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="ds-table ds-table--defined w-full min-w-[720px]">
        <thead>
          <tr>
            <th>Name</th>
            <th>Version</th>
            <th>Type</th>
            <th>Created on</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {agents.map((agent) => (
            <tr
              key={agent.id}
              className="cursor-pointer hover:bg-black/[0.02]"
              onClick={() => navigate(`/agents/${agent.id}`)}
            >
              <td>
                <span className="font-medium text-black">{agent.name}</span>
                {agent.id.startsWith("custom-") && (
                  <Badge variant="info" className="ml-2">
                    Custom
                  </Badge>
                )}
              </td>
              <td>
                <Badge variant="outline">{agent.version}</Badge>
              </td>
              <td>{agent.type}</td>
              <td className="text-black/60">{agent.createdOn}</td>
              <td className="max-w-md truncate text-black/60">{agent.description || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DashboardPage() {
  const savedConnectors = useBuilderStore((s) => s.savedConnectors);
  const selectedAgentIds = useBuilderStore((s) => s.selectedAgentIds);
  const indexProgress = useBuilderStore((s) => s.indexProgress);
  const step = useBuilderStore((s) => s.step);
  const deployed = useBuilderStore((s) => s.deployed);
  const agents = useAgents();

  const orchestrationAgents = agents.filter((a) => a.type === "workflow");
  const singleAgents = agents.filter((a) => a.type !== "workflow");

  return (
    <PageShell className="dashboard-page !py-3 !pt-1">
      <PageHeader
        className="!mb-3 !mt-1 !gap-2"
        icon={<DashboardRoundedIcon sx={{ fontSize: 18 }} />}
        title="Project Overview"
        description="Connectors, agents, and deployment readiness for your enterprise search project."
        action={
          <Link to="/builder">
            <Button variant="primary" size="sm">
              {deployed ? "Open builder" : step > 1 ? `Resume setup · Step ${step}` : "Start setup"}
              <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
            </Button>
          </Link>
        }
      />

      <div className="dashboard-page__body">
        <div className="dashboard-page__stats grid gap-2.5 sm:grid-cols-3">
          <StatCard compact variant="blue" icon={<HubRoundedIcon sx={{ fontSize: 16 }} />} value={savedConnectors.length} label="Saved connectors" />
          <StatCard compact variant="green" icon={<StorageRoundedIcon sx={{ fontSize: 16 }} />} value={`${indexProgress}%`} label="Indexing progress" />
          <StatCard compact variant="blue" icon={<SmartToyRoundedIcon sx={{ fontSize: 16 }} />} value={selectedAgentIds.length} label="Active agents" />
        </div>

        <section className="route-section dashboard-page__agents !p-3">
          <div className="route-section__head !mb-2.5">
            <div>
              <h2 className="route-section__title">Orchestration agents</h2>
              <p className="route-section__description">Multi-agent routing and supervisor workflows.</p>
            </div>
            <Badge variant={orchestrationAgents.length > 0 ? "success" : "warning"}>
              {orchestrationAgents.length} configured
            </Badge>
          </div>
          <WizardPanel className="overflow-hidden p-0" bodyClassName="p-0">
            <AgentsTable agents={orchestrationAgents} emptyLabel="No orchestration agents yet. Add one from the builder or agent marketplace." />
          </WizardPanel>
        </section>

        <section className="route-section dashboard-page__agents !p-3">
          <div className="route-section__head !mb-2.5">
            <div>
              <h2 className="route-section__title">Agents</h2>
              <p className="route-section__description">Specialist agents for search, documents, and domain queries.</p>
            </div>
            <Link to="/agents" className="text-xs font-semibold text-accent-orange-dark hover:underline">
              View all
            </Link>
          </div>
          <WizardPanel className="overflow-hidden p-0" bodyClassName="p-0">
            <AgentsTable agents={singleAgents} emptyLabel="No agents yet. Create one from the agent marketplace." />
          </WizardPanel>
        </section>

        <Card>
          <CardBody className="flex h-full flex-col !p-3.5">
            <h3 className="mb-2 text-[13px] font-semibold text-black">Continue your flow</h3>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "Connectors", href: "/connectors" },
                { label: "Agent Marketplace", href: "/agents" },
                { label: "AI Search Builder", href: "/builder" },
              ].map((l) => (
                <Link key={l.href} to={l.href} className="test-step__chip">
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
