import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ZoomInRoundedIcon from "@mui/icons-material/ZoomInRounded";
import ZoomOutRoundedIcon from "@mui/icons-material/ZoomOutRounded";
import FitScreenRoundedIcon from "@mui/icons-material/FitScreenRounded";
import { cn } from "@/lib/utils";
import {
  cloneTree,
  deleteNodeById,
  edgePath,
  findNode,
  getOrchestrationNode,
  insertChild,
  layoutLinearWorkflow,
  makeNode,
  sampleWorkflowTree,
  serializeYaml,
  treeToWorkflow,
  uid,
  updateNodeById,
  type WfNodeType,
  type WfTreeNode,
} from "./workflow-tree-utils";

export type NodeRunStatus = "idle" | "active" | "done";

const TYPE_META: Record<
  WfNodeType,
  { color: string; bg: string; border: string; title: string; hasSubtitle: boolean; subtitleLabel?: string }
> = {
  start: { color: "#15803D", bg: "#DCFCE7", border: "#86EFAC", title: "Start", hasSubtitle: false },
  orchestration: {
    color: "#C2410C",
    bg: "#FFEDD5",
    border: "#FDBA74",
    title: "Agent orchestration",
    hasSubtitle: true,
    subtitleLabel: "Routing instructions",
  },
  agent: { color: "#1D4ED8", bg: "#DBEAFE", border: "#93C5FD", title: "Agent", hasSubtitle: true, subtitleLabel: "Instructions" },
  end: { color: "#B91C1C", bg: "#FEE2E2", border: "#FCA5A5", title: "End", hasSubtitle: false },
};

type AddOption = { type: WfNodeType; label: string };

function addOptionsFor(parent: WfTreeNode): AddOption[] {
  if (parent.type === "start") {
    return [{ type: "orchestration", label: "Agent orchestration" }];
  }
  if (parent.type === "orchestration") {
    const opts: AddOption[] = [{ type: "agent", label: "Agent" }];
    const hasEnd = parent.children.some((c) => c.type === "end");
    if ((parent.agents?.length ?? 0) > 0 && !hasEnd) opts.push({ type: "end", label: "End" });
    return opts;
  }
  return [];
}

/** Match example: show + below node when it can be extended */
function canShowPlus(node: WfTreeNode): boolean {
  if (node.type === "end") return false;
  if (node.type === "start") return !node.children.some((c) => c.type === "orchestration");
  if (node.type === "orchestration") return true;
  return false;
}

function NodeIcon({ type }: { type: WfNodeType }) {
  const sx = { fontSize: 14 };
  if (type === "start") return <PlayArrowRoundedIcon sx={sx} />;
  if (type === "end") return <StopRoundedIcon sx={sx} />;
  if (type === "orchestration") return <HubRoundedIcon sx={sx} />;
  return <SmartToyOutlinedIcon sx={sx} />;
}

function NodeMenu({
  options,
  onPick,
  onClose,
}: {
  options: AddOption[];
  onPick: (type: WfNodeType) => void;
  onClose: () => void;
}) {
  return (
    <div className="wf-builder__menu" onMouseLeave={onClose}>
      {options.map((opt) => {
        const meta = TYPE_META[opt.type];
        return (
          <button key={opt.type} type="button" className="wf-builder__menu-item" onClick={() => onPick(opt.type)}>
            <span className="wf-builder__menu-icon" style={{ background: meta.bg, color: meta.color }}>
              <NodeIcon type={opt.type} />
            </span>
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

type WorkflowVersion = { id: string; label: string; savedAt: Date; snapshot: WfTreeNode };

export type WorkflowTreeCanvasProps = {
  tree: WfTreeNode;
  onTreeChange: (tree: WfTreeNode) => void;
  isBuild: boolean;
  nodeStatuses: Record<string, NodeRunStatus>;
  workflowName: string;
  onWorkflowNameChange: (name: string) => void;
  onSave: () => void;
  canSave: boolean;
  dirty: boolean;
  onRequestAgentPicker: (orchId: string) => void;
};

function PropertiesPanel({
  node,
  onChange,
  onDelete,
  onClose,
  onRemoveAgent,
}: {
  node: WfTreeNode;
  onChange: (field: "label" | "subtitle", value: string) => void;
  onDelete: () => void;
  onClose: () => void;
  onRemoveAgent: (agentId: string) => void;
}) {
  const meta = TYPE_META[node.type];
  return (
    <div className="wf-builder__panel">
      <div className="wf-builder__panel-head">
        <span className="wf-builder__panel-title">
          <EditOutlinedIcon sx={{ fontSize: 14 }} />
          Edit node
        </span>
        <button type="button" className="wf-builder__panel-close" onClick={onClose} aria-label="Close">
          <CloseRoundedIcon sx={{ fontSize: 16 }} />
        </button>
      </div>
      <div className="wf-builder__panel-body">
        <div className="wf-builder__field">
          <span className="wf-builder__field-label">Node type</span>
          <span className="wf-builder__type-pill" style={{ background: meta.bg, color: meta.color }}>
            {meta.title}
          </span>
        </div>
        {node.type !== "agent" && (
          <label className="wf-builder__field">
            <span className="wf-builder__field-label">Label</span>
            <input
              className="wf-builder__input"
              value={node.label}
              onChange={(e) => onChange("label", e.target.value)}
              disabled={node.type === "start" || node.type === "end"}
            />
          </label>
        )}
        {meta.hasSubtitle && (
          <label className="wf-builder__field">
            <span className="wf-builder__field-label">{meta.subtitleLabel}</span>
            <textarea
              className="wf-builder__textarea"
              value={node.subtitle ?? ""}
              onChange={(e) => onChange("subtitle", e.target.value)}
              rows={4}
            />
          </label>
        )}
        {node.type === "orchestration" && (
          <div className="wf-builder__field">
            <span className="wf-builder__field-label">Agents ({node.agents?.length ?? 0})</span>
            {(node.agents?.length ?? 0) === 0 ? (
              <p className="wf-builder__panel-empty">No agents yet. Use + on the canvas to add specialists.</p>
            ) : (
              <ul className="wf-builder__panel-agents">
                {node.agents?.map((agent) => (
                  <li key={agent.id} className="wf-builder__panel-agent">
                    <div>
                      <div className="wf-builder__panel-agent-name">{agent.name}</div>
                      {agent.description && <div className="wf-builder__panel-agent-desc">{agent.description}</div>}
                    </div>
                    <button type="button" onClick={() => onRemoveAgent(agent.id)} aria-label={`Remove ${agent.name}`}>
                      <DeleteOutlineRoundedIcon sx={{ fontSize: 15 }} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      <div className="wf-builder__panel-foot">
        <button
          type="button"
          className="wf-builder__delete-btn"
          onClick={onDelete}
          disabled={node.type === "start"}
        >
          <DeleteOutlineRoundedIcon sx={{ fontSize: 14 }} />
          Delete node
        </button>
      </div>
    </div>
  );
}

function HistoryPanel({
  versions,
  onRestore,
  onClose,
}: {
  versions: WorkflowVersion[];
  onRestore: (v: WorkflowVersion) => void;
  onClose: () => void;
}) {
  return (
    <div className="wf-builder__panel">
      <div className="wf-builder__panel-head">
        <span className="wf-builder__panel-title">Version history</span>
        <button type="button" className="wf-builder__panel-close" onClick={onClose} aria-label="Close">
          <CloseRoundedIcon sx={{ fontSize: 16 }} />
        </button>
      </div>
      <div className="wf-builder__panel-body wf-builder__panel-body--list">
        {versions.length === 0 ? (
          <p className="wf-builder__panel-empty">No saved versions yet. Click Save to snapshot the workflow.</p>
        ) : (
          versions.map((v) => (
            <button key={v.id} type="button" className="wf-builder__version-row" onClick={() => onRestore(v)}>
              <div>
                <div className="wf-builder__version-label">{v.label}</div>
                <div className="wf-builder__version-time">
                  {v.savedAt.toLocaleDateString()}{" "}
                  {v.savedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export function WorkflowTreeCanvas({
  tree,
  onTreeChange,
  isBuild,
  nodeStatuses,
  workflowName,
  onWorkflowNameChange,
  onSave,
  canSave,
  dirty,
  onRequestAgentPicker,
}: WorkflowTreeCanvasProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openMenuFor, setOpenMenuFor] = useState<string | null>(null);
  const [scale, setScale] = useState(0.9);
  const [pan, setPan] = useState({ x: 48, y: 32 });
  const [panelMode, setPanelMode] = useState<"properties" | "history" | null>(null);
  const [versions, setVersions] = useState<WorkflowVersion[]>([]);
  const [tab, setTab] = useState<"visualizer" | "yaml" | "json">("visualizer");
  const [previewMode, setPreviewMode] = useState(false);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const panOrigin = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const { positions, edges, bounds, orchHeights } = useMemo(() => layoutLinearWorkflow(tree), [tree]);

  const mutate = useCallback(
    (fn: (prev: WfTreeNode) => WfTreeNode) => {
      onTreeChange(fn(tree));
    },
    [onTreeChange, tree],
  );

  const fitView = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const w = bounds.maxX - bounds.minX;
    const h = bounds.maxY - bounds.minY;
    const availW = el.clientWidth - 80;
    const availH = el.clientHeight - 80;
    const s = Math.min(availW / w, availH / h, 1.1);
    setScale(Math.max(s, 0.35));
    setPan({ x: -bounds.minX * Math.max(s, 0.35) + 40, y: -bounds.minY * Math.max(s, 0.35) + 40 });
  }, [bounds]);

  useEffect(() => {
    const timer = window.setTimeout(fitView, 60);
    return () => window.clearTimeout(timer);
  }, [tree, fitView]);

  const handleAddChild = (parentId: string, type: WfNodeType) => {
    if (type === "agent") {
      onRequestAgentPicker(parentId);
      setOpenMenuFor(null);
      return;
    }
    if (type === "orchestration") {
      mutate((prev) =>
        insertChild(prev, parentId, makeNode("orchestration", { label: "Main_orchestrator", agents: [] })),
      );
    } else if (type === "end") {
      mutate((prev) => insertChild(prev, parentId, makeNode("end")));
    }
    setOpenMenuFor(null);
  };

  const handleDelete = (id: string) => {
    if (id === tree.id) return;
    const target = findNode(tree, id);
    if (target?.type === "orchestration") {
      mutate((prev) => ({
        ...prev,
        children: prev.children.filter((c) => c.id !== id),
      }));
    } else {
      mutate((prev) => deleteNodeById(prev, id));
    }
    setSelectedId(null);
    setPanelMode(null);
  };

  const handleFieldChange = (id: string, field: "label" | "subtitle", value: string) => {
    mutate((prev) => updateNodeById(prev, id, (n) => ({ ...n, [field]: value })));
  };

  const removeAgentFromOrch = (orchId: string, agentRowId: string) => {
    mutate((prev) =>
      updateNodeById(prev, orchId, (n) => {
        if (n.type !== "orchestration") return n;
        const agents = (n.agents ?? []).filter((a) => a.id !== agentRowId);
        const children = agents.length === 0 ? n.children.filter((c) => c.type !== "end") : n.children;
        return { ...n, agents, children };
      }),
    );
  };

  const saveVersion = () => {
    onSave();
    const v: WorkflowVersion = {
      id: uid("v"),
      label: `v${versions.length + 1}`,
      savedAt: new Date(),
      snapshot: cloneTree(tree),
    };
    setVersions((prev) => [v, ...prev]);
  };

  const restoreVersion = (v: WorkflowVersion) => {
    onTreeChange(cloneTree(v.snapshot));
    setSelectedId(null);
  };

  const onCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget && !(e.target as HTMLElement).classList.contains("wf-builder__canvas-bg")) return;
    isPanning.current = true;
    panStart.current = { x: e.clientX, y: e.clientY };
    panOrigin.current = { ...pan };
  };
  const onCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isPanning.current) return;
    setPan({
      x: panOrigin.current.x + (e.clientX - panStart.current.x),
      y: panOrigin.current.y + (e.clientY - panStart.current.y),
    });
  };
  const stopPan = () => {
    isPanning.current = false;
  };

  const selectedNode = selectedId ? findNode(tree, selectedId) : null;
  const latestVersion = versions[0];
  const readOnly = previewMode || !isBuild;

  return (
    <div className="wf-builder">
      <div className="wf-builder__topbar">
        <input
          className="wf-builder__name"
          value={workflowName}
          onChange={(e) => onWorkflowNameChange(e.target.value)}
          aria-label="Workflow name"
        />
        <div className="wf-builder__topbar-actions">
          <span className="wf-builder__status">
            {latestVersion
              ? `${latestVersion.label} saved ${latestVersion.savedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
              : dirty
                ? "Unsaved changes"
                : "No versions yet"}
          </span>
          <button type="button" className="wf-builder__btn wf-builder__btn--ghost" onClick={saveVersion} disabled={!canSave || !dirty}>
            <SaveOutlinedIcon sx={{ fontSize: 14 }} />
            Save
          </button>
          <button
            type="button"
            className={cn("wf-builder__btn", previewMode && "wf-builder__btn--dark")}
            onClick={() => setPreviewMode((p) => !p)}
          >
            <VisibilityOutlinedIcon sx={{ fontSize: 14 }} />
            {previewMode ? "Editing off" : "Preview"}
          </button>
          <button
            type="button"
            className={cn("wf-builder__icon-btn", panelMode === "history" && "wf-builder__icon-btn--active")}
            onClick={() => setPanelMode((m) => (m === "history" ? null : "history"))}
            aria-label="Version history"
          >
            <HistoryRoundedIcon sx={{ fontSize: 16 }} />
          </button>
        </div>
      </div>

      <div className="wf-builder__main">
        <div className="wf-builder__canvas-col">
          <div className="wf-builder__subbar">
            <span className="wf-builder__subbar-hint">
              {readOnly
                ? "Read-only preview"
                : "Click a node to edit it. Use + to add orchestration, agents, or end."}
            </span>
            <div className="wf-builder__tabs">
              {(["visualizer", "yaml", "json"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={cn("wf-builder__tab", tab === t && "wf-builder__tab--active")}
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {tab === "visualizer" ? (
            <div
              ref={containerRef}
              className="wf-builder__canvas wf-builder__canvas-bg"
              onMouseDown={onCanvasMouseDown}
              onMouseMove={onCanvasMouseMove}
              onMouseUp={stopPan}
              onMouseLeave={stopPan}
            >
              <div
                className="wf-builder__canvas-bg wf-builder__canvas-layer"
                style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`, transformOrigin: "0 0" }}
              >
                <svg
                  width={bounds.maxX - bounds.minX + 400}
                  height={bounds.maxY - bounds.minY + 200}
                  className="wf-builder__edges"
                  style={{ left: -bounds.minX, top: -bounds.minY }}
                >
                  {edges.map((e) => {
                    const fromH = orchHeights[e.from] ?? (TYPE_META[findNode(tree, e.from)?.type ?? "start"] ? 64 : 64);
                    return (
                      <path
                        key={`${e.from}-${e.to}`}
                        d={edgePath(positions[e.from], positions[e.to], fromH)}
                        className="wf-builder__edge"
                      />
                    );
                  })}
                </svg>

                {Object.entries(positions).map(([id, pos]) => {
                  const node = findNode(tree, id);
                  if (!node) return null;
                  const meta = TYPE_META[node.type];
                  const isSelected = selectedId === id;
                  const status = nodeStatuses[node.type === "orchestration" ? "orchestrator" : node.id] ?? "idle";
                  const options = readOnly ? [] : addOptionsFor(node);
                  const showPlus = !readOnly && canShowPlus(node);
                  const cardH = orchHeights[id] ?? undefined;

                  if (node.type === "orchestration") {
                    return (
                      <div
                        key={id}
                        className="wf-builder__node-wrap"
                        style={{ left: pos.x - bounds.minX, top: pos.y - bounds.minY, width: 240 }}
                      >
                        <div
                          className={cn(
                            "wf-builder__node wf-builder__node--orch",
                            isSelected && "wf-builder__node--selected",
                            status === "active" && "wf-builder__node--running",
                            status === "done" && "wf-builder__node--done",
                          )}
                          style={{ minHeight: cardH, borderColor: isSelected ? meta.color : meta.border }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!readOnly) {
                              setSelectedId(id);
                              setPanelMode("properties");
                            }
                          }}
                        >
                          <div className="wf-builder__node-head">
                            <span className="wf-builder__node-icon" style={{ background: meta.bg, color: meta.color }}>
                              <NodeIcon type={node.type} />
                            </span>
                            <div className="wf-builder__node-copy">
                              <span className="wf-builder__node-label">{node.label}</span>
                              <span className="wf-builder__node-kind">{meta.title}</span>
                            </div>
                            {!readOnly && <MoreHorizRoundedIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />}
                          </div>
                          {node.subtitle && (
                            <div className="wf-builder__node-sub-wrap">
                              <p className="wf-builder__node-sub">{node.subtitle}</p>
                            </div>
                          )}
                          {(node.agents?.length ?? 0) > 0 && (
                            <>
                              <div className="wf-builder__orch-agents-label">Agents ({node.agents?.length ?? 0})</div>
                              <ul className="wf-builder__orch-agents">
                            {(node.agents ?? []).map((agent) => {
                              const agentStatus = nodeStatuses[agent.id] ?? "idle";
                              return (
                                <li
                                  key={agent.id}
                                  className={cn(
                                    "wf-builder__orch-agent",
                                    agentStatus === "active" && "wf-builder__orch-agent--active",
                                    agentStatus === "done" && "wf-builder__orch-agent--done",
                                  )}
                                >
                                  <SmartToyOutlinedIcon sx={{ fontSize: 15 }} />
                                  <div>
                                    <div className="wf-builder__orch-agent-name">{agent.name}</div>
                                    <div className="wf-builder__orch-agent-kind">Agent</div>
                                  </div>
                                  {!readOnly && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeAgentFromOrch(id, agent.id);
                                      }}
                                      aria-label={`Remove ${agent.name}`}
                                    >
                                      <DeleteOutlineRoundedIcon sx={{ fontSize: 14 }} />
                                    </button>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                            </>
                          )}
                        </div>
                        {showPlus && (
                          <div className="wf-builder__plus-wrap">
                            <button
                              type="button"
                              className="wf-builder__plus"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuFor(openMenuFor === id ? null : id);
                              }}
                              aria-label="Add step"
                            >
                              <AddRoundedIcon sx={{ fontSize: 14 }} />
                            </button>
                            {openMenuFor === id && (
                              <div className="wf-builder__menu-anchor">
                                <NodeMenu
                                  options={options}
                                  onClose={() => setOpenMenuFor(null)}
                                  onPick={(type) => handleAddChild(id, type)}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={id}
                      className="wf-builder__node-wrap"
                      style={{ left: pos.x - bounds.minX, top: pos.y - bounds.minY, width: 240 }}
                    >
                      <div
                        className={cn(
                          "wf-builder__node",
                          isSelected && "wf-builder__node--selected",
                          status === "active" && "wf-builder__node--running",
                          status === "done" && "wf-builder__node--done",
                        )}
                        style={{ borderColor: isSelected ? meta.color : "#E5E7EB" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!readOnly && node.type !== "end") {
                            setSelectedId(id);
                            setPanelMode("properties");
                          }
                        }}
                      >
                        <div className="wf-builder__node-head">
                          <span className="wf-builder__node-icon" style={{ background: meta.bg, color: meta.color }}>
                            <NodeIcon type={node.type} />
                          </span>
                          <span className="wf-builder__node-label">{node.label}</span>
                          {!readOnly && node.type !== "end" && (
                            <MoreHorizRoundedIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
                          )}
                        </div>
                        {meta.hasSubtitle && node.subtitle && (
                          <div className="wf-builder__node-sub-wrap">
                            <p className="wf-builder__node-sub">{node.subtitle}</p>
                          </div>
                        )}
                      </div>
                      {showPlus && (
                        <div className="wf-builder__plus-wrap">
                          <button
                            type="button"
                            className="wf-builder__plus"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuFor(openMenuFor === id ? null : id);
                            }}
                            aria-label="Add step"
                          >
                            <AddRoundedIcon sx={{ fontSize: 14 }} />
                          </button>
                          {openMenuFor === id && (
                            <div className="wf-builder__menu-anchor">
                              <NodeMenu
                                options={options}
                                onClose={() => setOpenMenuFor(null)}
                                onPick={(type) => handleAddChild(id, type)}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="wf-builder__zoom">
                <button type="button" onClick={() => setScale((s) => Math.min(s + 0.1, 1.6))} aria-label="Zoom in">
                  <ZoomInRoundedIcon sx={{ fontSize: 14 }} />
                </button>
                <button type="button" onClick={() => setScale((s) => Math.max(s - 0.1, 0.3))} aria-label="Zoom out">
                  <ZoomOutRoundedIcon sx={{ fontSize: 14 }} />
                </button>
                <button type="button" onClick={fitView} aria-label="Fit view">
                  <FitScreenRoundedIcon sx={{ fontSize: 14 }} />
                </button>
              </div>
            </div>
          ) : (
            <pre className="wf-builder__code">
              {tab === "yaml"
                ? `workflow: ${workflowName}\nsteps:\n${serializeYaml(tree, 1)}`
                : JSON.stringify({ workflow: workflowName, ...treeToWorkflow(tree), tree }, null, 2)}
            </pre>
          )}
        </div>

        {panelMode && (
          <div className="wf-builder__side">
            {panelMode === "properties" && selectedNode ? (
              <PropertiesPanel
                node={selectedNode}
                onChange={(field, value) => handleFieldChange(selectedNode.id, field, value)}
                onDelete={() => handleDelete(selectedNode.id)}
                onClose={() => {
                  setPanelMode(null);
                  setSelectedId(null);
                }}
                onRemoveAgent={(agentRowId) => {
                  if (selectedNode.type === "orchestration") removeAgentFromOrch(selectedNode.id, agentRowId);
                }}
              />
            ) : (
              <HistoryPanel versions={versions} onRestore={restoreVersion} onClose={() => setPanelMode(null)} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export { sampleWorkflowTree, treeToWorkflow, getOrchestrationNode };
