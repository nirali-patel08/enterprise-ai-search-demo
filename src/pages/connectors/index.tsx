import HubRoundedIcon from "@mui/icons-material/HubRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import { useNavigate } from "react-router-dom";
import { getConnectorById } from "@/data/sample";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { WizardPanel } from "@/pages/search-builder/components/wizard-ui";
import { useBuilderStore } from "@/store/builder-store";

export default function ConnectorsPage() {
  const savedConnectors = useBuilderStore((s) => s.savedConnectors);
  const deploymentType = useBuilderStore((s) => s.deploymentType);
  const setStep = useBuilderStore((s) => s.setStep);
  const navigate = useNavigate();

  const openConnectorSetup = () => {
    setStep(2);
    navigate("/builder");
  };

  return (
    <PageShell>
      <PageHeader
        icon={<HubRoundedIcon sx={{ fontSize: 20 }} />}
        title="Connectors"
        description="Add, edit, and validate data sources. Latest status is used by the Search Builder."
        action={
          <Button variant="primary" size="sm" onClick={openConnectorSetup}>
            <AddRoundedIcon sx={{ fontSize: 16 }} />
            Add connector
          </Button>
        }
      />

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-black/60">
          <strong className="text-black">{savedConnectors.length}</strong> connector(s) ·{" "}
          {deploymentType} deployment
        </p>
        <Button variant="secondary" size="sm" onClick={openConnectorSetup}>
          Manage in builder
          <ArrowForwardRoundedIcon sx={{ fontSize: 15 }} />
        </Button>
      </div>

      {savedConnectors.length > 0 ? (
        <WizardPanel className="overflow-hidden p-0" bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="ds-table ds-table--defined w-full min-w-[900px]">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Deployment</th>
                  <th>Status</th>
                  <th>Indexed scope</th>
                  <th>Documents</th>
                  <th>Last indexed</th>
                  <th>Validated</th>
                </tr>
              </thead>
              <tbody>
                {savedConnectors.map((c) => {
                  const type = getConnectorById(c.connectorTypeId);
                  return (
                    <tr key={c.id}>
                      <td className="font-medium text-black">{c.name}</td>
                      <td className="text-black/60">{type?.name ?? c.connectorTypeId}</td>
                      <td>
                        <Badge variant="outline">{c.deployment}</Badge>
                      </td>
                      <td>
                        <Badge variant={c.status === "indexed" ? "success" : "info"}>
                          {c.status}
                        </Badge>
                      </td>
                      <td className="max-w-[200px]">
                        {c.indexedPaths?.length ? (
                          <span className="text-[12px] text-black/60">
                            {c.indexedPaths.length} path(s)
                          </span>
                        ) : c.selectedPaths?.length ? (
                          <span className="text-[12px] text-amber-700">
                            {c.selectedPaths.length} selected, not indexed
                          </span>
                        ) : (
                          <span className="text-[12px] text-black/40">—</span>
                        )}
                      </td>
                      <td className="text-black/60">
                        {c.documentCount?.toLocaleString() ?? "—"}
                      </td>
                      <td className="text-black/60">{c.lastIndexedAt ?? "—"}</td>
                      <td>
                        {c.validated ? (
                          <CheckCircleRoundedIcon
                            className="text-success-icon"
                            sx={{ fontSize: 18 }}
                          />
                        ) : (
                          <span className="text-black/40">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </WizardPanel>
      ) : (
        <div className="route-section">
          <div className="route-empty">
            <span className="route-page-header__icon mb-3">
              <StorageRoundedIcon sx={{ fontSize: 20 }} />
            </span>
            <h3 className="text-sm font-semibold text-black">No connectors yet</h3>
            <p className="mt-1 max-w-md text-xs text-black/55">
              Add a source in the builder, validate its connection, then select content for indexing.
            </p>
            <Button variant="primary" size="sm" className="mt-4" onClick={openConnectorSetup}>
              Add your first connector
            </Button>
          </div>
        </div>
      )}
    </PageShell>
  );
}
