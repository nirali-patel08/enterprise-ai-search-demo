import { useMutation } from "@tanstack/react-query";
import { TextField } from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { searchBuilderApi } from "@/api/search-builder";
import { CONNECTOR_CONFIG, getConnectorsForDeployment, getConnectorById } from "@/data/sample";
import type { SavedConnector } from "@/data/sample";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { useBuilderStore } from "@/store/builder-store";
import { Link } from "react-router-dom";

export const StepConnectors = () => {
  const deploymentType = useBuilderStore((s) => s.deploymentType);
  const savedConnectors = useBuilderStore((s) => s.savedConnectors);
  const activeConnectorTypeId = useBuilderStore((s) => s.activeConnectorTypeId);
  const setActiveConnectorTypeId = useBuilderStore((s) => s.setActiveConnectorTypeId);
  const saveConnector = useBuilderStore((s) => s.saveConnector);

  const available = getConnectorsForDeployment(deploymentType);
  const connector = getConnectorById(activeConnectorTypeId) ?? available[0];
  const fields = CONNECTOR_CONFIG[connector?.id ?? ""] ?? [];
  const deploymentSaved = savedConnectors.filter((c) => c.deployment === deploymentType);

  const validateMutation = useMutation({
    mutationFn: () => searchBuilderApi.validateConnector(connector.id),
    onSuccess: () => {
      const saved: SavedConnector = {
        id: `conn-${Date.now()}`,
        connectorTypeId: connector.id,
        name: `${connector.name} — ${new Date().toLocaleDateString()}`,
        deployment: deploymentType,
        validated: true,
        savedAt: new Date().toLocaleString(),
        status: "connected",
      };
      saveConnector(saved);
      toast.success(`${connector.name} validated and saved to Connectors`);
    },
  });

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">2. Configure &amp; Save Connectors</h2>
        <p className="mt-1 text-sm text-gray-500">
          Select a data source, configure credentials, test connection, and save. Saved connectors appear below and in the{" "}
          <Link to="/connectors" className="font-medium text-orange-600 hover:underline">Connectors</Link> screen.
        </p>
      </div>

      {deploymentSaved.length > 0 && (
        <SectionCard title="Already configured" trailing={<Badge variant="success">{deploymentSaved.length} saved</Badge>}>
          <div className="space-y-2">
            {deploymentSaved.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm">
                <div>
                  <p className="font-medium text-gray-900">{c.name}</p>
                  <p className="text-xs text-gray-500">Saved {c.savedAt}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={c.status === "indexed" ? "success" : "info"}>{c.status}</Badge>
                  {c.validated && <CheckCircleRoundedIcon className="text-emerald-600" sx={{ fontSize: 18 }} />}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Add data source</p>
          {available.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveConnectorTypeId(c.id)}
              className={cn(
                "w-full rounded-xl border px-3 py-2.5 text-left text-sm transition",
                activeConnectorTypeId === c.id ? "border-orange-500 bg-orange-50" : "border-gray-200 bg-white hover:border-gray-300",
              )}
            >
              <span className="font-medium">{c.name}</span>
            </button>
          ))}
        </div>

        <SectionCard title={`Configure ${connector.name}`}>
          <p className="mb-4 text-sm text-gray-500">{connector.description} · Auth: {connector.auth}</p>
          <div className="space-y-3">
            {fields.map((f) => (
              <TextField key={f.label} label={f.label} defaultValue={f.value} variant="standard" fullWidth slotProps={{ inputLabel: { shrink: true } }} />
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="secondary" loading={validateMutation.isPending} onClick={() => validateMutation.mutate()}>
              Test Connection
            </Button>
            <Button variant="primary" loading={validateMutation.isPending} onClick={() => validateMutation.mutate()}>
              Validate &amp; Save to Connectors
            </Button>
          </div>
        </SectionCard>
      </div>
    </section>
  );
};
