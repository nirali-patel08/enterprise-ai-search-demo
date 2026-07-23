import { useEffect, useMemo, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
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
import { ConnectorSourceChip } from "../connector-source-chip";
import { WizardPanel } from "../wizard-ui";

const INDEXING_STAGES = [
  { short: "Extract", label: "Extracting documents" },
  { short: "OCR", label: "OCR & text extraction" },
  { short: "Chunk", label: "Chunking content" },
  { short: "Embed", label: "Generating embeddings" },
  { short: "Completed", label: "Completed" },
] as const;

type StepIndexingProps = {
  stepNumber: number;
  totalSteps: number;
  canContinue: boolean;
  onPrevious: () => void;
  onContinue: () => void;
};

function defaultPathsForConnector(connectorTypeId: string): string[] {
  const nodes = getBrowseTree(connectorTypeId);
  const firstFolder = nodes.flatMap((n) => n.children ?? []).find((c) => c.type !== "file");
  if (firstFolder) return [firstFolder.path];
  const firstFile = nodes.flatMap((n) => n.children ?? []).find((c) => c.type === "file");
  return firstFile ? [firstFile.path] : [];
}

export const StepIndexing = ({
  stepNumber,
  totalSteps,
  canContinue,
  onPrevious,
  onContinue,
}: StepIndexingProps) => {
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
  const upsertSearchIndexesFromIndexing = useBuilderStore((s) => s.upsertSearchIndexesFromIndexing);

  const intervalRef = useRef<number | null>(null);

  const ready = savedConnectors.filter((c) => c.deployment === deploymentType && c.validated);
  const selected = ready.filter((c) => indexingSelection.includes(c.id));
  const browseConnector = selected.find((c) => c.id === activeBrowseConnectorId) ?? selected[0];
  const activeId = browseConnector?.id ?? activeBrowseConnectorId;

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
        upsertSearchIndexesFromIndexing(
          selection.map((c) => {
            const paths = state.contentSelections[c.id]?.length
              ? state.contentSelections[c.id]
              : defaultPathsForConnector(c.connectorTypeId);
            const nodes = getBrowseTree(c.connectorTypeId);
            const est = estimateSelection(nodes, paths).fileCount;
            return {
              connectorId: c.id,
              connectorName: c.name,
              connectorTypeId: c.connectorTypeId,
              deployment: c.deployment,
              documentCount: est,
            };
          }),
        );
        toast.success("Indexing complete — documents are searchable");
        return;
      }
      setIndexProgress(Math.min(100, current + 20));
    }, 300);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [indexing, setIndexProgress, setIndexing, setIndexingComplete, updateConnectorStatus, upsertSearchIndexesFromIndexing]);

  const handleTogglePath = (path: string, _node: ContentNode) => {
    if (!browseConnector) return;
    toggleContentPath(browseConnector.id, path);
  };

  const handleActivateConnector = (connectorId: string) => {
    const included = indexingSelection.includes(connectorId);
    if (!included) {
      toggleIndexingSelection(connectorId);
      setActiveBrowseConnectorId(connectorId);
      return;
    }
    setActiveBrowseConnectorId(connectorId);
    refetch();
  };

  const handleToggleInclude = (connectorId: string) => {
    const wasIncluded = indexingSelection.includes(connectorId);
    toggleIndexingSelection(connectorId);
    if (wasIncluded && activeId === connectorId) {
      const remaining = indexingSelection.filter((id) => id !== connectorId);
      if (remaining[0]) setActiveBrowseConnectorId(remaining[0]);
    }
    if (!wasIncluded) {
      setActiveBrowseConnectorId(connectorId);
    }
  };

  return (
    <section className="ds-index-step">
      {indexingComplete && (
        <div className="ds-index-success shrink-0">
          <CheckCircleRoundedIcon sx={{ fontSize: 16 }} />
          <span>
            Indexing complete — <strong>{totalEstFiles}</strong> document{totalEstFiles === 1 ? "" : "s"} searchable.
          </span>
        </div>
      )}

      <div className="ds-source-chip-row shrink-0" role="tablist" aria-label="Data sources">
        <div className="ds-source-chip-row__chips">
        {ready.map((c) => {
          const included = indexingSelection.includes(c.id);
          const pathCount = contentSelections[c.id]?.length ?? 0;
          return (
            <ConnectorSourceChip
              key={c.id}
              name={c.name}
              included={included}
              active={activeId === c.id}
              pathCount={pathCount}
              error={c.status === "pending"}
              onActivate={() => handleActivateConnector(c.id)}
              onToggleInclude={() => handleToggleInclude(c.id)}
            />
          );
        })}
        {ready.length === 0 && (
          <p className="ds-source-chip-row__empty">No connected sources — finish Step 2 first.</p>
        )}
        </div>
        {ready.length > 0 && (
          <div className="ds-source-chip-row__meta">
            <span className="ds-source-chip-row__summary">
              {ready.length} connector{ready.length === 1 ? "" : "s"} · {selected.length} selected
            </span>
            <span className="ds-source-chip-row__status">
              <span className="ds-source-chip-row__status-dot" aria-hidden />
              Ready
            </span>
          </div>
        )}
      </div>

      {browseConnector ? (
        <WizardPanel className="ds-index-step__panel !p-3" bodyClassName="flex min-h-0 flex-1 flex-col overflow-hidden">
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

          {(jobRunning || indexingComplete) && (
            <div className="ds-index-progress shrink-0">
              <div
                className={cn(
                  "ds-index-progress__bar",
                  indexingComplete ? "ds-index-progress__bar--done" : "ds-index-progress__bar--running",
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
              : "Click a source chip to include it and browse folders. Click the active chip again to deselect."}
          </p>
          {ready.length > 0 && (
            <Button variant="secondary" size="sm" onClick={() => handleActivateConnector(ready[0].id)}>
              Select {ready[0].name}
            </Button>
          )}
        </div>
      )}

      <footer className="ds-index-footer shrink-0">
        <div className="ds-index-footer__actions">
          <Button variant="secondary" size="sm" onClick={onPrevious}>
            <ChevronLeftRoundedIcon sx={{ fontSize: 16 }} />
            Previous
          </Button>
          {browseConnector && (
            <>
              <Button
                variant="primary"
                size="sm"
                disabled={selected.length === 0 || jobRunning}
                loading={indexMutation.isPending}
                onClick={handleStartIndexing}
              >
                <PlayArrowRoundedIcon sx={{ fontSize: 16 }} />
                {jobRunning ? "Indexing…" : indexingComplete ? "Re-run" : "Start indexing"}
              </Button>
              {jobRunning && (
                <Button variant="secondary" size="sm" onClick={() => setIndexing(false)}>
                  Pause
                </Button>
              )}
            </>
          )}
        </div>

        <ol className="ds-pipeline ds-pipeline--compact ds-index-footer__pipeline" aria-label="Indexing pipeline">
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

        <div className="ds-index-footer__end">
          <span className="ds-index-footer__totals">
            ~{totalEstFiles} docs · ~{totalEstMb} MB
          </span>
          <span className="ds-index-footer__step">
            Step {stepNumber} of {totalSteps}
          </span>
          <Button variant="primary" size="sm" disabled={!canContinue} onClick={onContinue}>
            Continue
            <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
          </Button>
        </div>
      </footer>
    </section>
  );
};
