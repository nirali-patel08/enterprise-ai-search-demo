import { useState } from "react";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import CloudOutlinedIcon from "@mui/icons-material/CloudOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { Link, useNavigate } from "react-router-dom";
import { useAgents } from "@/hooks/useAgents";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { IndexListing } from "@/components/indexes/index-listing";
import { WizardPanel } from "@/pages/search-builder/components/wizard-ui";
import { useBuilderStore } from "@/store/builder-store";
import {
  getAgentDeploymentLabel,
  getConnectorById,
  resolveAgentDeployment,
  type DeploymentType,
  type MarketplaceAgent,
  type SavedConnector,
} from "@/data/sample";
import { cn } from "@/lib/utils";

const AGENT_TYPE_META = {
  prompt: {
    label: "Prompt",
    tagClass: "ds-tag--blue",
    icon: SmartToyRoundedIcon,
  },
  workflow: {
    label: "Workflow",
    tagClass: "ds-tag--purple",
    icon: AccountTreeRoundedIcon,
  },
  external: {
    label: "External",
    tagClass: "ds-tag--pink",
    icon: LinkRoundedIcon,
  },
} as const;

type DashboardPanel = "connectors" | "agents" | "indices";

const PANEL_META: Record<
  DashboardPanel,
  {
    title: string;
    description: string;
    viewAllHref: string;
    viewAllLabel: string;
  }
> = {
  connectors: {
    title: "Connectors",
    description: "Validated data sources configured for your enterprise search project.",
    viewAllHref: "/connectors",
    viewAllLabel: "View all",
  },
  agents: {
    title: "Agents",
    description: "Specialist and orchestration agents for your enterprise search project.",
    viewAllHref: "/agents",
    viewAllLabel: "View all",
  },
  indices: {
    title: "OpenSearch Indices",
    description: "Active vector databases and indexed data chunks from your connectors.",
    viewAllHref: "/indexes",
    viewAllLabel: "View all",
  },
};

function DeploymentTag({ deployment }: { deployment: DeploymentType }) {
  const Icon = deployment === "cloud" ? CloudOutlinedIcon : CodeOutlinedIcon;

  return (
    <span
      className={cn(
        "ds-tag dashboard-agents-table__deployment dashboard-agents-table__tag",
        deployment === "cloud"
          ? "dashboard-agents-table__tag--cloud"
          : "dashboard-agents-table__tag--opensource",
      )}
    >
      <Icon sx={{ fontSize: 13 }} />
      {getAgentDeploymentLabel(deployment)}
    </span>
  );
}

const CONNECTOR_STATUS_META: Record<
  SavedConnector["status"],
  { label: string; tagClass: string }
> = {
  indexed: { label: "Indexed", tagClass: "ds-tag--configured" },
  connected: { label: "Connected", tagClass: "ds-tag--blue" },
  indexing: { label: "Indexing", tagClass: "ds-tag--purple" },
  pending: { label: "Pending", tagClass: "ds-tag--muted" },
};

function ConnectorsTable({
  connectors,
  emptyLabel,
}: {
  connectors: SavedConnector[];
  emptyLabel: string;
}) {
  const navigate = useNavigate();
  const setStep = useBuilderStore((s) => s.setStep);

  const openConnectorSetup = () => {
    setStep(2);
    navigate("/builder");
  };

  if (connectors.length === 0) {
    return (
      <div className="dashboard-agents-table__empty route-empty">
        <span className="dashboard-agents-table__empty-icon" aria-hidden>
          <HubRoundedIcon sx={{ fontSize: 24 }} />
        </span>
        <p className="dashboard-agents-table__empty-title">No connectors yet</p>
        <p className="dashboard-agents-table__empty-copy">{emptyLabel}</p>
        <button type="button" className="dashboard-agents-table__footer-link mt-4" onClick={openConnectorSetup}>
          Add your first connector
          <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-agents-table">
      <div className="dashboard-agents-table__scroll">
        <table className="ds-table ds-table--defined dashboard-agents-table__table w-full">
          <thead>
            <tr>
              <th>Connector</th>
              <th>Type</th>
              <th>Deployment</th>
              <th>Status</th>
              <th>Documents</th>
            </tr>
          </thead>
          <tbody>
            {connectors.map((connector) => {
              const type = getConnectorById(connector.connectorTypeId);
              const statusMeta = CONNECTOR_STATUS_META[connector.status];

              return (
                <tr key={connector.id} onClick={() => navigate("/connectors")}>
                  <td>
                    <div className="dashboard-agents-table__agent">
                      <span className="dashboard-connectors-table__avatar" aria-hidden>
                        <HubRoundedIcon sx={{ fontSize: 18 }} />
                      </span>
                      <div className="dashboard-agents-table__agent-text">
                        <span className="dashboard-agents-table__name">{connector.name}</span>
                        <div className="dashboard-agents-table__meta">
                          {connector.validated && (
                            <span className="dashboard-connectors-table__validated">
                              <CheckCircleRoundedIcon sx={{ fontSize: 12 }} />
                              Validated
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRightRoundedIcon className="dashboard-agents-table__chevron" />
                    </div>
                  </td>
                  <td>
                    <span className="ds-tag ds-tag--muted">{type?.name ?? connector.connectorTypeId}</span>
                  </td>
                  <td>
                    <DeploymentTag deployment={connector.deployment} />
                  </td>
                  <td>
                    <span className={cn("ds-tag", statusMeta.tagClass)}>{statusMeta.label}</span>
                  </td>
                  <td>
                    <p className="dashboard-agents-table__description">
                      {connector.documentCount?.toLocaleString() ?? "—"}
                    </p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="dashboard-agents-table__footer">
        <span>
          Showing <strong>1–{connectors.length}</strong> of <strong>{connectors.length}</strong> connectors
        </span>
        <Link to="/connectors" className="dashboard-agents-table__footer-link">
          Open connectors
          <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
        </Link>
      </div>
    </div>
  );
}

function AgentsTable({
  agents,
  emptyLabel,
}: {
  agents: MarketplaceAgent[];
  emptyLabel: string;
}) {
  const navigate = useNavigate();

  if (agents.length === 0) {
    return (
      <div className="dashboard-agents-table__empty route-empty">
        <span className="dashboard-agents-table__empty-icon" aria-hidden>
          <SmartToyRoundedIcon sx={{ fontSize: 24 }} />
        </span>
        <p className="dashboard-agents-table__empty-title">No agents yet</p>
        <p className="dashboard-agents-table__empty-copy">{emptyLabel}</p>
        <Link to="/agents/new" className="dashboard-agents-table__footer-link mt-4">
          Create your first agent
          <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
        </Link>
      </div>
    );
  }

  return (
    <div className="dashboard-agents-table">
      <div className="dashboard-agents-table__scroll">
        <table className="ds-table ds-table--defined dashboard-agents-table__table w-full">
          <thead>
            <tr>
              <th>Agent</th>
              <th>Type</th>
              <th>Deployment</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => {
              const typeMeta = AGENT_TYPE_META[agent.type];
              const TypeIcon = typeMeta.icon;
              const deployment = resolveAgentDeployment(agent);

              return (
                <tr key={agent.id} onClick={() => navigate(`/agents/${agent.id}`)}>
                  <td>
                    <div className="dashboard-agents-table__agent">
                      <span
                        className={cn(
                          "dashboard-agents-table__avatar",
                          `dashboard-agents-table__avatar--${agent.type}`,
                        )}
                        aria-hidden
                      >
                        <TypeIcon sx={{ fontSize: 18 }} />
                      </span>
                      <div className="dashboard-agents-table__agent-text">
                        <span className="dashboard-agents-table__name">{agent.name}</span>
                        <div className="dashboard-agents-table__meta">
                          {agent.id.startsWith("custom-") && (
                            <Badge variant="info" size="sm">
                              Custom
                            </Badge>
                          )}
                        </div>
                      </div>
                      <ChevronRightRoundedIcon className="dashboard-agents-table__chevron" />
                    </div>
                  </td>
                  <td>
                    <span className={cn("ds-tag", typeMeta.tagClass)}>{typeMeta.label}</span>
                  </td>
                  <td>
                    <DeploymentTag deployment={deployment} />
                  </td>
                  <td>
                    <p className="dashboard-agents-table__description truncate">
                      {agent.description || "—"}
                    </p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="dashboard-agents-table__footer">
        <span>
          Showing <strong>1–{agents.length}</strong> of <strong>{agents.length}</strong> agents
        </span>
        <Link to="/agents" className="dashboard-agents-table__footer-link">
          Open marketplace
          <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
        </Link>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const savedConnectors = useBuilderStore((s) => s.savedConnectors);
  const selectedAgentIds = useBuilderStore((s) => s.selectedAgentIds);
  const searchIndexes = useBuilderStore((s) => s.searchIndexes);
  const step = useBuilderStore((s) => s.step);
  const deployed = useBuilderStore((s) => s.deployed);
  const agents = useAgents();
  const [activePanel, setActivePanel] = useState<DashboardPanel>("connectors");
  const panelMeta = PANEL_META[activePanel];

  return (
    <PageShell className="dashboard-page !pb-3 !pt-6">
      <PageHeader
        className="!mb-3 !mt-2 !gap-2"
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
          <StatCard
            compact
            variant="blue"
            icon={<HubRoundedIcon sx={{ fontSize: 16 }} />}
            value={savedConnectors.length}
            label="Saved connectors"
            active={activePanel === "connectors"}
            onClick={() => setActivePanel("connectors")}
          />
          <StatCard
            compact
            variant="blue"
            icon={<SmartToyRoundedIcon sx={{ fontSize: 16 }} />}
            value={selectedAgentIds.length}
            label="Active agents"
            active={activePanel === "agents"}
            onClick={() => setActivePanel("agents")}
          />
          <StatCard
            compact
            variant="green"
            icon={<StorageRoundedIcon sx={{ fontSize: 16 }} />}
            value={searchIndexes.length}
            label="OpenSearch indices"
            active={activePanel === "indices"}
            onClick={() => setActivePanel("indices")}
          />
        </div>

        <section className="route-section route-section--flush dashboard-page__agents !p-0">
          <div className="route-section__head !mb-0 !px-4 !py-3">
            <div>
              <h2 className="route-section__title">{panelMeta.title}</h2>
              <p className="route-section__description">{panelMeta.description}</p>
            </div>
            <Link to={panelMeta.viewAllHref} className="dashboard-agents-table__footer-link">
              {panelMeta.viewAllLabel}
              <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
            </Link>
          </div>
          <WizardPanel className="!rounded-none !border-0 !bg-transparent !p-0 !shadow-none" bodyClassName="p-0">
            {activePanel === "connectors" && (
              <ConnectorsTable
                connectors={savedConnectors}
                emptyLabel="Add a source in the search builder, validate its connection, then select content for indexing."
              />
            )}
            {activePanel === "agents" && (
              <AgentsTable agents={agents} emptyLabel="Create one from the agent marketplace or add agents in the search builder." />
            )}
            {activePanel === "indices" && <IndexListing variant="dashboard" showDelete={false} />}
          </WizardPanel>
        </section>

        <Card>
          <CardBody className="flex h-full flex-col !p-3.5">
            <h3 className="mb-2 text-[13px] font-semibold text-black">Continue your flow</h3>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "Connectors", href: "/connectors" },
                { label: "Agent Marketplace", href: "/agents" },
                { label: "OpenSearch Indices", href: "/indexes" },
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
