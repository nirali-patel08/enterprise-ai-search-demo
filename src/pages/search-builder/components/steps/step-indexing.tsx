import { useEffect, useMemo, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import { searchBuilderApi } from "@/api/search-builder";
import { getBrowseTree } from "@/api/content-browser";
import { ContentBrowser } from "@/components/content/content-browser";
import { useContentBrowse } from "@/hooks/useContentBrowser";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { useBuilderStore } from "@/store/builder-store";
import { estimateSelection } from "@/types/content";
import type { IndexingScopeSummary } from "@/types/content";
import type { ContentNode } from "@/types/content";
import { WizardPanel } from "../wizard-ui";

const INDEXING_STAGES = [
  { short: "Extract", label: "Extracting documents" },
  { short: "OCR", label: "OCR & text extraction" },
  { short: "Chunk", label: "Chunking content" },
  { short: "Embed", label: "Generating embeddings" },
  { short: "Write", label: "Writing to search index" },
] as const;

function defaultPathsForConnector(connectorTypeId: string): string[] {
  const nodes = getBrowseTree(connectorTypeId);
  const firstFolder = nodes.flatMap((n) => n.children ?? []).find((c) => c.type !== "file");
  if (firstFolder) return [firstFolder.path];
  const firstFile = nodes.flatMap((n) => n.children ?? []).find((c) => c.type === "file");
  return firstFile ? [firstFile.path] : [];
}

export const StepIndexing = () => {
  const savedConnectors = useBuilderStore((s) => s.savedConnectors);
  const deploymentType = useBuilderStore((s) => s.deploymentType);
  const indexingSelection = useBuilderStore((s) => s.indexingSelection);
  const activeBrowseConnectorId = useBuilderStore((s) => s.activeBrowseConnectorId);
  const contentSelections = useBuilderStore((s) => s.contentSelections);
  const includeSubfolders = useBuilderStore((s) => s.includeSubfolders);
  const indexingComplete = useBuilderStore((s) => s.indexingComplete);
  const indexing = useBuilderStore((s) => s.indexing);
  const indexProgress = useBuilderStore((s) => s.indexProgress);
  const toggleIndexingSelection = useBuilderStore((s) => s.toggleIndexingSelection);
  const setActiveBrowseConnectorId = useBuilderStore((s) => s.setActiveBrowseConnectorId);
  const toggleContentPath = useBuilderStore((s) => s.toggleContentPath);
  const setContentSelections = useBuilderStore((s) => s.setContentSelections);
  const setIncludeSubfolders = useBuilderStore((s) => s.setIncludeSubfolders);
  const setIndexingComplete = useBuilderStore((s) => s.setIndexingComplete);
  const setIndexing = useBuilderStore((s) => s.setIndexing);
  const setIndexProgress = useBuilderStore((s) => s.setIndexProgress);
  const updateConnectorStatus = useBuilderStore((s) => s.updateConnectorStatus);

  const intervalRef = useRef<number | null>(null);

  const ready = savedConnectors.filter((c) => c.deployment === deploymentType && c.validated);
  const selected = ready.filter((c) => indexingSelection.includes(c.id));
  const browseConnector = selected.find((c) => c.id === activeBrowseConnectorId) ?? selected[0];

  const { data: browseData, isLoading: browseLoading, refetch } = useContentBrowse(
    browseConnector?.connectorTypeId ?? "",
    browseConnector?.id ?? "",
  );

  const selectedPaths = browseConnector ? (contentSelections[browseConnector.id] ?? []) : [];

  const scopeSummaries = useMemo((): IndexingScopeSummary[] => {
    return selected.map((conn) => {
      const paths = contentSelections[conn.id]?.length
        ? contentSelections[conn.id]
        : defaultPathsForConnector(conn.connectorTypeId);
      const nodes = getBrowseTree(conn.connectorTypeId);
      const est = estimateSelection(nodes, paths);
      return {
        connectorId: conn.id,
        connectorName: conn.name,
        selectedPaths: paths,
        estimatedFiles: est.fileCount,
        estimatedSizeMb: est.sizeMb,
      };
    });
  }, [selected, contentSelections]);

  const totalEstFiles = scopeSummaries.reduce((s, x) => s + x.estimatedFiles, 0);
  const totalEstMb = Math.round(scopeSummaries.reduce((s, x) => s + x.estimatedSizeMb, 0) * 10) / 10;

  const indexMutation = useMutation({
    mutationFn: () => searchBuilderApi.startIndexing(scopeSummaries),
    onSuccess: (data) => {
      setIndexingComplete(false);
      setIndexProgress(0);
      setIndexing(true);
      toast.info(`Indexing job ${data.jobId} started — ${data.documentCount} documents queued`);
    },
  });

  const jobRunning = indexing || indexMutation.isPending;
  const activeStageIndex = Math.min(
    INDEXING_STAGES.length - 1,
    Math.floor((indexProgress / 100) * INDEXING_STAGES.length),
  );

  const handleStartIndexing = () => {
    if (selected.length === 0) {
      toast.error("Select at least one data source");
      return;
    }

    selected.forEach((conn) => {
      if ((contentSelections[conn.id]?.length ?? 0) === 0) {
        setContentSelections(conn.id, defaultPathsForConnector(conn.connectorTypeId));
      }
    });

    indexMutation.mutate();
  };

  useEffect(() => {
    if (!indexing) return;

    setIndexProgress(0);
    intervalRef.current = window.setInterval(() => {
      const state = useBuilderStore.getState();
      const current = state.indexProgress;
      if (current >= 100) {
        if (intervalRef.current) window.clearInterval(intervalRef.current);
        setIndexing(false);
        setIndexingComplete(true);
        setIndexProgress(100);

        const selection = state.savedConnectors.filter(
          (c) => c.deployment === state.deploymentType && c.validated && state.indexingSelection.includes(c.id),
        );
        selection.forEach((c) => {
          const paths = state.contentSelections[c.id]?.length
            ? state.contentSelections[c.id]
            : defaultPathsForConnector(c.connectorTypeId);
          const nodes = getBrowseTree(c.connectorTypeId);
          const est = estimateSelection(nodes, paths).fileCount;
          updateConnectorStatus(c.id, "indexed", est, paths);
        });
        toast.success("Indexing complete — documents are searchable");
        return;
      }
      setIndexProgress(Math.min(100, current + 20));
    }, 300);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [indexing, setIndexProgress, setIndexing, setIndexingComplete, updateConnectorStatus]);

  const handleTogglePath = (path: string, _node: ContentNode) => {
    if (!browseConnector) return;
    toggleContentPath(browseConnector.id, path);
  };

  const statusLabel = indexingComplete ? "Complete" : jobRunning ? "Running" : "Ready";

  return (
    <section className="ds-index-step">
      {indexingComplete && (
        <div className="ds-success-banner !py-3 shrink-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success-icon text-white">
            <CheckCircleRoundedIcon sx={{ fontSize: 16 }} />
          </div>
          <div>
            <p className="ds-success-banner__title !text-[14px]">Indexing completed successfully</p>
            <p className="ds-success-banner__body !mt-0.5 !text-[12px]">
              {totalEstFiles} document{totalEstFiles === 1 ? "" : "s"} indexed. Use <strong>Continue</strong> for
              AI Agents.
            </p>
          </div>
        </div>
      )}

      <div className="ds-index-strip shrink-0">
        <div className="ds-index-chip-list" role="group" aria-label="Data sources">
          {ready.map((c) => {
            const on = indexingSelection.includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={on}
                title={on ? "Deselect source" : "Select source"}
                onClick={() => toggleIndexingSelection(c.id)}
                className={cn("ds-index-chip", on && "ds-index-chip--selected")}
              >
                <span className="ds-index-chip__check" aria-hidden>
                  {on && <CheckRoundedIcon sx={{ fontSize: 14 }} />}
                </span>
                <span className="ds-index-chip__label">{c.name}</span>
              </button>
            );
          })}
        </div>
        <div className="ds-index-strip__meta">
          <span className="font-semibold text-black/70">{ready.length} connectors</span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-black/70">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                selected.length > 0 ? "bg-success-icon" : "bg-black/25",
              )}
              aria-hidden
            />
            {selected.length === 0 ? "None selected" : `${selected.length} selected`}
          </span>
          <span
            className={cn(
              "font-bold",
              indexingComplete || statusLabel === "Ready" ? "text-success-title" : "text-accent-orange",
            )}
          >
            {statusLabel}
          </span>
        </div>
      </div>

      {browseConnector ? (
        <WizardPanel
          className="ds-index-step__panel !p-4"
          bodyClassName="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          {selected.length > 1 && (
            <div className="ds-cat-tabs ds-cat-tabs--pill mb-3 shrink-0" role="tablist" aria-label="Browse source">
              {selected.map((c) => {
                const pathCount = contentSelections[c.id]?.length ?? 0;
                const isActive = c.id === (activeBrowseConnectorId ?? browseConnector.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={cn("ds-cat-tab", isActive && "ds-cat-tab--active")}
                    onClick={() => {
                      setActiveBrowseConnectorId(c.id);
                      refetch();
                    }}
                  >
                    {c.name}
                    <span
                      className={cn(
                        "ds-cat-tab__count",
                        pathCount > 0 && "ds-cat-tab__count--done",
                      )}
                    >
                      {pathCount}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          <div className="ds-index-step__browser">
            <ContentBrowser
              nodes={browseData?.nodes ?? []}
              selectedPaths={selectedPaths}
              onTogglePath={handleTogglePath}
              loading={browseLoading}
              includeSubfolders={includeSubfolders}
              onIncludeSubfoldersChange={setIncludeSubfolders}
            />
          </div>

          <div className="ds-index-action-bar mt-3 shrink-0">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="primary"
                size="md"
                disabled={selected.length === 0 || jobRunning}
                loading={indexMutation.isPending}
                onClick={handleStartIndexing}
              >
                <PlayArrowRoundedIcon sx={{ fontSize: 18 }} />
                {jobRunning ? "Indexing…" : indexingComplete ? "Re-run indexing" : "Start indexing job"}
              </Button>
              {jobRunning && (
                <Button variant="secondary" size="sm" onClick={() => setIndexing(false)}>
                  Pause
                </Button>
              )}
            </div>

            <ol className="ds-pipeline ds-pipeline--compact min-w-0 flex-1" aria-label="Indexing pipeline">
              {INDEXING_STAGES.map((stage, i) => {
                const done = indexingComplete || (jobRunning && i < activeStageIndex);
                const active = jobRunning && i === activeStageIndex && !indexingComplete;
                return (
                  <li
                    key={stage.short}
                    className={cn(
                      "ds-pipeline__step",
                      done && "ds-pipeline__step--done",
                      active && "ds-pipeline__step--active",
                    )}
                  >
                    <span className="ds-pipeline__node" aria-hidden>
                      {done ? <CheckRoundedIcon sx={{ fontSize: 12 }} /> : i + 1}
                    </span>
                    <span className="ds-pipeline__label">{stage.short}</span>
                  </li>
                );
              })}
            </ol>

            <span className="shrink-0 text-[12px] font-medium text-black/50">
              ~{totalEstFiles} docs · ~{totalEstMb} MB
            </span>
          </div>

          {(jobRunning || indexingComplete) && (
            <div className="mt-2 h-1.5 shrink-0 overflow-hidden rounded-full bg-[#E1E0DB]">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  indexingComplete ? "bg-success-icon" : "bg-accent-orange",
                )}
                style={{ width: `${indexProgress}%` }}
              />
            </div>
          )}
        </WizardPanel>
      ) : (
        <div className="ds-index-empty min-h-0 flex-1">
          <span className="ds-index-empty__icon" aria-hidden>
            {ready.length === 0 ? (
              <Inventory2OutlinedIcon sx={{ fontSize: 28 }} />
            ) : (
              <FolderOpenOutlinedIcon sx={{ fontSize: 28 }} />
            )}
          </span>
          <h3 className="ds-index-empty__title">
            {ready.length === 0 ? "No connected sources yet" : "Pick a source to browse"}
          </h3>
          <p className="ds-index-empty__desc">
            {ready.length === 0
              ? "Go back to Connectors, finish Test & connect, then return here to index content."
              : "Select one or more connectors above. You’ll then browse folders and choose paths to index."}
          </p>
          {ready.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => toggleIndexingSelection(ready[0].id)}
            >
              Select {ready[0].name}
            </Button>
          )}
        </div>
      )}
    </section>
  );
};
