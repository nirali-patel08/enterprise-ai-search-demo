import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import CloudOutlinedIcon from "@mui/icons-material/CloudOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAgentsForDeployment } from "@/hooks/useAgents";
import {
  getAgentDeploymentLabel,
  resolveAgentDeployment,
  type DeploymentType,
  type MarketplaceAgent,
} from "@/data/sample";
import { useBuilderStore } from "@/store/builder-store";
import { WizardPanel } from "../wizard-ui";

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

export const StepAgents = () => {
  const navigate = useNavigate();
  const deploymentType = useBuilderStore((s) => s.deploymentType);
  const agents = useAgentsForDeployment(deploymentType);
  const deploymentLabel = getAgentDeploymentLabel(deploymentType);

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Link to="/agents/new">
          <Button variant="primary" size="sm">
            <AddRoundedIcon sx={{ fontSize: 16 }} />
            New agent
          </Button>
        </Link>
      </div>

      <WizardPanel className="overflow-hidden !rounded-[14px] !p-0" bodyClassName="p-0">
        {agents.length === 0 ? (
          <div className="dashboard-agents-table__empty route-empty">
            <span className="dashboard-agents-table__empty-icon" aria-hidden>
              <SmartToyRoundedIcon sx={{ fontSize: 24 }} />
            </span>
            <p className="dashboard-agents-table__empty-title">No {deploymentLabel.toLowerCase()} agents</p>
            <p className="dashboard-agents-table__empty-copy">
              Create an agent with <strong>New agent</strong> to use in orchestration.
            </p>
            <Link to="/agents/new" className="dashboard-agents-table__footer-link mt-4">
              Create agent
            </Link>
          </div>
        ) : (
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
                  {agents.map((agent) => (
                    <AgentRow key={agent.id} agent={agent} onOpen={() => navigate(`/agents/${agent.id}`)} />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="dashboard-agents-table__footer">
              <span>
                Showing <strong>1–{agents.length}</strong> of <strong>{agents.length}</strong> agents
              </span>
            </div>
          </div>
        )}
      </WizardPanel>
    </section>
  );
};

function AgentRow({ agent, onOpen }: { agent: MarketplaceAgent; onOpen: () => void }) {
  const typeMeta = AGENT_TYPE_META[agent.type];
  const TypeIcon = typeMeta.icon;
  const deployment = resolveAgentDeployment(agent);

  return (
    <tr onClick={onOpen}>
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
        <p className="dashboard-agents-table__description truncate">{agent.description || "—"}</p>
      </td>
    </tr>
  );
}
