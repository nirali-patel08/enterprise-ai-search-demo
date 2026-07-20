import { Link, useNavigate } from "react-router-dom";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { WizardPanel } from "@/pages/search-builder/components/wizard-ui";
import { useAgents } from "@/hooks/useAgents";
import { useBuilderStore } from "@/store/builder-store";

export default function AgentsPage() {
  const agents = useAgents();
  const setStep = useBuilderStore((s) => s.setStep);
  const navigate = useNavigate();

  const openBuilderAgents = () => {
    setStep(4);
    navigate("/builder");
  };

  return (
    <PageShell>
      <PageHeader
        icon={<SmartToyRoundedIcon sx={{ fontSize: 20 }} />}
        title="Agents"
        description="Agent marketplace — build, code, or link external agents for your enterprise search project."
        action={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={openBuilderAgents}>
              Use in builder
              <ArrowForwardRoundedIcon sx={{ fontSize: 15 }} />
            </Button>
            <Link to="/agents/new">
              <Button variant="primary" size="sm">
                <AddRoundedIcon sx={{ fontSize: 16 }} /> New agent
              </Button>
            </Link>
          </div>
        }
      />

      <WizardPanel className="overflow-hidden p-0" bodyClassName="p-0">
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
                  <td className="max-w-md truncate text-black/60">
                    {agent.description || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </WizardPanel>
      <p className="mt-3 text-[13px] text-black/60">
        1–{agents.length} of {agents.length}
      </p>
    </PageShell>
  );
}
