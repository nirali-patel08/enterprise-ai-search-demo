import { useMutation } from "@tanstack/react-query";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import CloudSyncRoundedIcon from "@mui/icons-material/CloudSyncRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import { TextField } from "@mui/material";
import { searchBuilderApi } from "@/api/search-builder";
import { CONNECTOR_CONFIG, CONNECTORS } from "@/data/sample";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { useBuilderStore } from "@/store/builder-store";
import { useEffect, useRef } from "react";

export const StepConfigureIndex = () => {
  const connectors = useBuilderStore((s) => s.connectors);
  const activeConnector = useBuilderStore((s) => s.activeConnector);
  const validated = useBuilderStore((s) => s.validated);
  const indexing = useBuilderStore((s) => s.indexing);
  const indexProgress = useBuilderStore((s) => s.indexProgress);
  const setActiveConnector = useBuilderStore((s) => s.setActiveConnector);
  const setValidated = useBuilderStore((s) => s.setValidated);
  const setIndexing = useBuilderStore((s) => s.setIndexing);
  const setIndexProgress = useBuilderStore((s) => s.setIndexProgress);

  const intervalRef = useRef<number | null>(null);
  const selected = CONNECTORS.filter((c) => connectors.includes(c.id));
  const validatedCount = connectors.filter((id) => validated[id]).length;
  const connector = CONNECTORS.find((c) => c.id === activeConnector)!;
  const fields = CONNECTOR_CONFIG[activeConnector] ?? [];

  const validateMutation = useMutation({
    mutationFn: () => searchBuilderApi.validateConnector(activeConnector),
    onSuccess: () => {
      setValidated(activeConnector, true);
      toast.success(`${connector.name} connection validated`);
    },
  });

  useEffect(() => {
    if (!indexing) return;
    setIndexProgress(12);
    intervalRef.current = window.setInterval(() => {
      const current = useBuilderStore.getState().indexProgress;
      if (current >= 100) {
        if (intervalRef.current) window.clearInterval(intervalRef.current);
        setIndexing(false);
        toast.success("Indexing complete — 12,438 documents indexed");
        return;
      }
      setIndexProgress(current + 8);
    }, 400);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [indexing, setIndexProgress, setIndexing]);

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">2. Connection &amp; Indexing</h2>
        <p className="mt-1 text-sm text-gray-500">Configure credentials, validate connections, then start and monitor indexing.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<StorageRoundedIcon sx={{ fontSize: 18 }} />} value={connectors.length} label="Sources selected" iconClassName="bg-orange-100 text-orange-600" />
        <StatCard icon={<VerifiedRoundedIcon sx={{ fontSize: 18 }} />} value={validatedCount} label="Validated" iconClassName="bg-emerald-100 text-emerald-600" />
        <StatCard icon={<CloudSyncRoundedIcon sx={{ fontSize: 18 }} />} value={indexing ? "Running" : indexProgress === 100 ? "Complete" : "Ready"} label="Indexing status" iconClassName="bg-sky-100 text-sky-600" />
        <StatCard icon={<DescriptionRoundedIcon sx={{ fontSize: 18 }} />} value={indexProgress === 100 ? "12,438" : "—"} label="Documents indexed" iconClassName="bg-violet-100 text-violet-600" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Connectors</p>
          {selected.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveConnector(c.id)}
              className={cn(
                "flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm transition",
                activeConnector === c.id ? "border-orange-500 bg-orange-50" : "border-gray-200 bg-white/80 hover:border-gray-300",
              )}
            >
              <span className="font-medium">{c.name}</span>
              <Badge variant={validated[c.id] ? "success" : "warning"}>{validated[c.id] ? "Validated" : "Pending"}</Badge>
            </button>
          ))}
        </div>

        <SectionCard title={`${connector.name} configuration`}>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <p className="text-sm text-gray-500"><span className="font-medium text-gray-800">Authentication:</span> {connector.auth}</p>
              <p className="text-sm text-gray-500"><span className="font-medium text-gray-800">Supported:</span> {connector.description}</p>
              <p className="rounded-lg bg-gray-50 p-3 text-xs text-gray-500">Credentials are encrypted at rest. RBAC/ACL sync runs after validation.</p>
            </div>
            <div className="space-y-3">
              {fields.map((f) => (
                <TextField
                  key={f.label}
                  label={f.label}
                  defaultValue={f.value}
                  variant="standard"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              ))}
              <div className="flex flex-wrap gap-2 pt-2">
                <Button variant="secondary" loading={validateMutation.isPending} onClick={() => validateMutation.mutate()}>
                  Test Connection
                </Button>
                <Button variant="primary" loading={validateMutation.isPending} onClick={() => validateMutation.mutate()}>
                  Save Configuration
                </Button>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Indexing monitor"
        trailing={<Badge variant={indexing ? "info" : "success"}>{indexing ? "Indexing" : "Ready"}</Badge>}
      >
        <p className="mb-4 text-sm text-gray-500">
          {indexing ? "Processing batch 14/20 — OCR and chunking in progress" : indexProgress === 100 ? "All validated sources indexed successfully" : "Ready to start indexing"}
        </p>
        <div className="mb-4 flex flex-wrap gap-2">
          <Button variant="primary" disabled={validatedCount < connectors.length || indexing} onClick={() => { setIndexing(true); toast.info("Indexing started"); }}>
            Start Indexing
          </Button>
          <Button variant="secondary" onClick={() => setIndexing(false)}>Pause</Button>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-orange-500 transition-all duration-300" style={{ width: `${indexProgress}%` }} />
        </div>
      </SectionCard>
    </section>
  );
};
