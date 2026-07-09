import { useEffect, useRef } from "react";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { useBuilderStore } from "@/store/builder-store";

export const StepIndexing = () => {
  const savedConnectors = useBuilderStore((s) => s.savedConnectors);
  const deploymentType = useBuilderStore((s) => s.deploymentType);
  const indexingSelection = useBuilderStore((s) => s.indexingSelection);
  const indexing = useBuilderStore((s) => s.indexing);
  const indexProgress = useBuilderStore((s) => s.indexProgress);
  const toggleIndexingSelection = useBuilderStore((s) => s.toggleIndexingSelection);
  const setIndexing = useBuilderStore((s) => s.setIndexing);
  const setIndexProgress = useBuilderStore((s) => s.setIndexProgress);
  const updateConnectorStatus = useBuilderStore((s) => s.updateConnectorStatus);

  const intervalRef = useRef<number | null>(null);
  const ready = savedConnectors.filter((c) => c.deployment === deploymentType && c.validated);
  const selected = ready.filter((c) => indexingSelection.includes(c.id));
  const indexedCount = ready.filter((c) => c.status === "indexed").length;

  useEffect(() => {
    if (!indexing) return;
    setIndexProgress(10);
    intervalRef.current = window.setInterval(() => {
      const current = useBuilderStore.getState().indexProgress;
      if (current >= 100) {
        if (intervalRef.current) window.clearInterval(intervalRef.current);
        setIndexing(false);
        indexingSelection.forEach((id) => updateConnectorStatus(id, "indexed", 4200 + Math.floor(Math.random() * 2000)));
        toast.success("Indexing complete for selected sources");
        return;
      }
      setIndexProgress(current + 10);
    }, 450);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [indexing, indexingSelection, setIndexProgress, setIndexing, updateConnectorStatus]);

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">3. Select Sources &amp; Start Indexing</h2>
        <p className="mt-1 text-sm text-gray-500">Choose from saved connectors, then start indexing. Monitor progress below.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard icon={<StorageRoundedIcon sx={{ fontSize: 18 }} />} value={ready.length} label="Ready to index" iconClassName="bg-orange-100 text-orange-600" />
        <StatCard icon={<PlayArrowRoundedIcon sx={{ fontSize: 18 }} />} value={selected.length} label="Selected" iconClassName="bg-sky-100 text-sky-600" />
        <StatCard icon={<StorageRoundedIcon sx={{ fontSize: 18 }} />} value={indexedCount} label="Already indexed" iconClassName="bg-emerald-100 text-emerald-600" />
      </div>

      <SectionCard title="Configured data sources">
        {ready.length === 0 ? (
          <p className="text-sm text-gray-500">No validated connectors yet. Go back to step 2 to configure and save sources.</p>
        ) : (
          <div className="space-y-2">
            {ready.map((c) => {
              const on = indexingSelection.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleIndexingSelection(c.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition",
                    on ? "border-orange-500 bg-orange-50" : "border-gray-200 bg-white hover:border-gray-300",
                  )}
                >
                  <div>
                    <p className="font-medium text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-500">Saved {c.savedAt}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.documentCount && <span className="text-xs text-gray-500">{c.documentCount.toLocaleString()} docs</span>}
                    <Badge variant={c.status === "indexed" ? "success" : on ? "info" : "outline"}>{on ? "Selected" : c.status}</Badge>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Indexing monitor" trailing={<Badge variant={indexing ? "info" : "success"}>{indexing ? "Running" : "Ready"}</Badge>}>
        <div className="mb-4 flex gap-2">
          <Button variant="primary" disabled={selected.length === 0 || indexing} onClick={() => { setIndexing(true); selected.forEach((c) => updateConnectorStatus(c.id, "indexing")); toast.info("Indexing started"); }}>
            Start Indexing
          </Button>
          <Button variant="secondary" onClick={() => setIndexing(false)}>Pause</Button>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-orange-500 transition-all" style={{ width: `${indexProgress}%` }} />
        </div>
        <p className="mt-2 text-xs text-gray-500">
          {indexing ? `Processing ${selected.length} source(s) — OCR, chunking, embeddings` : indexProgress === 100 ? "Indexing complete" : "Select sources and click Start Indexing"}
        </p>
      </SectionCard>
    </section>
  );
};
