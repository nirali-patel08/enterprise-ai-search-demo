import HubRoundedIcon from "@mui/icons-material/HubRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { Link } from "react-router-dom";
import { getConnectorById } from "@/data/sample";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { useBuilderStore } from "@/store/builder-store";

export default function ConnectorsPage() {
  const savedConnectors = useBuilderStore((s) => s.savedConnectors);
  const deploymentType = useBuilderStore((s) => s.deploymentType);

  return (
    <PageShell>
      <PageHeader
        icon={<HubRoundedIcon sx={{ fontSize: 20 }} />}
        title="Connectors"
        description="All configured data sources. Validate, test, and manage saved connectors here."
        action={
          <Link to="/builder">
            <Button variant="primary">Add connector</Button>
          </Link>
        }
      />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Deployment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Documents</th>
                <th className="px-4 py-3">Saved on</th>
                <th className="px-4 py-3">Validated</th>
              </tr>
            </thead>
            <tbody>
              {savedConnectors.map((c) => {
                const type = getConnectorById(c.connectorTypeId);
                return (
                  <tr key={c.id} className="border-b border-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                    <td className="px-4 py-3 text-gray-600">{type?.name ?? c.connectorTypeId}</td>
                    <td className="px-4 py-3"><Badge variant="outline">{c.deployment}</Badge></td>
                    <td className="px-4 py-3"><Badge variant={c.status === "indexed" ? "success" : "info"}>{c.status}</Badge></td>
                    <td className="px-4 py-3 text-gray-500">{c.documentCount?.toLocaleString() ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{c.savedAt}</td>
                    <td className="px-4 py-3">{c.validated ? <CheckCircleRoundedIcon className="text-emerald-600" sx={{ fontSize: 18 }} /> : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="mt-4 text-sm text-gray-500">
        Showing {savedConnectors.length} connector(s). Current builder deployment: <strong>{deploymentType}</strong>.
      </p>
    </PageShell>
  );
}
