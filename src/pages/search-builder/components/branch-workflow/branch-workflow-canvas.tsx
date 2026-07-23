import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import {
  Play,
  Bot,
  GitBranch,
  MessageSquare,
  HelpCircle,
  XCircle,
  Plus,
  MoreVertical,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  PencilLine,
  Network,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Field, Textarea, TextInput } from "../wizard-ui";
import { WorkflowStudioModal } from "../workflow-studio-modal";
import {
  BRANCH_CHAIN_OPTIONS,
  canShowPlus,
  createOrchestrationNode,
  deleteNodeById,
  edgePath,
  findNode,
  getAddOptionVisualMeta,
  getAddOptionsFor,
  getNodeVisualMeta,
  getNodeWidth,
  getNodeHeight,
  insertChild,
  isInOrchestrationBranch,
  isOrchestrationBranchRoot,
  layoutTree,
  makeNode,
  NODE_H,
  NODE_W,
  TYPE_META,
  updateNodeById,
  type BranchNodeType,
  type BranchTreeNode,
} from "./branch-workflow-utils";

export type NodeRunStatus = "idle" | "active" | "done";

export type BranchWorkflowCanvasProps = {
  tree: BranchTreeNode;
  onTreeChange: (tree: BranchTreeNode) => void;
  isBuild: boolean;
  nodeStatuses: Record<string, NodeRunStatus>;
  onSave: () => void;
  canSave: boolean;
  dirty: boolean;
  onRequestAgentPicker?: (parentId: string, mode: "parallel" | "linear") => void;
};

function AddOptionIcon({ type }: { type: BranchNodeType }) {
  const size = 12;
  if (type === "orchestration") return <Network size={size} />;
  if (type === "agent") return <Bot size={size} />;
  if (type === "condition") return <GitBranch size={size} />;
  if (type === "ask") return <HelpCircle size={size} />;
  if (type === "action") return <MessageSquare size={size} />;
  return <XCircle size={size} />;
}

function NodeMenu({
  parent,
  tree,
  options,
  onPick,
  onClose,
}: {
  parent: BranchTreeNode;
  tree: BranchTreeNode;
  options: Array<{ type: BranchNodeType; label: string }>;
  onPick: (type: BranchNodeType) => void;
  onClose: () => void;
}) {
  return (
    <div className="wf-branch__menu" onMouseLeave={onClose}>
      {options.map((opt) => {
        const meta = getAddOptionVisualMeta(opt.type, parent, tree);
        return (
          <button key={opt.type} type="button" className="wf-branch__menu-item" onClick={() => onPick(opt.type)}>
            <span className="wf-branch__menu-icon" style={{ background: meta.bg, color: meta.color }}>
              <AddOptionIcon type={opt.type} />
            </span>
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function NodeTypeIcon({
  node,
  tree,
}: {
  node: BranchTreeNode;
  tree: BranchTreeNode;
}) {
  const size = node.type === "start" || node.type === "end" ? 9 : 11;
  if (node.type === "start") return <Play size={size} />;
  if (node.type === "end") return <XCircle size={size} />;
  if (node.type === "orchestration") return <Network size={size} />;
  if (node.type === "condition" || node.type === "branch-if" || node.type === "branch-elseif" || node.type === "branch-else") {
    return <GitBranch size={size} />;
  }
  if (node.type === "action") return <MessageSquare size={size} />;
  if (node.type === "ask") return <HelpCircle size={size} />;
  if (node.type === "agent" && isOrchestrationBranchRoot(tree, node.id)) return <Share2 size={size} />;
  return <Bot size={size} />;
}

const DEFAULT_ORCHESTRATOR_NAME = "Main orchestrator";

function CreateOrchestratorModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, routingInstructions: string) => void;
}) {
  const [name, setName] = useState(DEFAULT_ORCHESTRATOR_NAME);
  const [routing, setRouting] = useState("");

  useEffect(() => {
    if (open) {
      setName(DEFAULT_ORCHESTRATOR_NAME);
      setRouting("");
    }
  }, [open]);

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed, routing.trim());
  };

  return (
    <WorkflowStudioModal
      open={open}
      onClose={onClose}
      eyebrow="Workflow builder"
      title="Create orchestrator"
      titleId="create-orchestrator-title"
      icon={<HubOutlinedIcon sx={{ fontSize: 20 }} />}
      footerClassName="justify-end"
      footer={
        <>
          <Button variant="secondary" size="sm" className="ds-modal-btn-cancel" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="ds-modal-btn-save"
            onClick={handleCreate}
            disabled={!name.trim()}
          >
            Create
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Name" className="gap-2">
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={DEFAULT_ORCHESTRATOR_NAME}
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleCreate()}
          />
        </Field>
        <Field label="Routing instructions (optional)" className="gap-2">
          <Textarea
            value={routing}
            onChange={(e) => setRouting(e.target.value)}
            placeholder="Rules on how to route to downstream agents..."
            rows={4}
          />
        </Field>
      </div>
    </WorkflowStudioModal>
  );
}

function PropertiesPanel({
  node,
  tree,
  onChange,
  onDelete,
  onClose,
}: {
  node: BranchTreeNode;
  tree: BranchTreeNode;
  onChange: (field: "label" | "subtitle", value: string) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const meta = getNodeVisualMeta(tree, node);
  return (
    <div className="wf-builder__panel">
      <div className="wf-builder__panel-head">
        <span className="wf-builder__panel-title">
          <PencilLine size={14} />
          Edit node
        </span>
        <button type="button" className="wf-builder__panel-close" onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>
      </div>
      <div className="wf-builder__panel-body">
        <div className="wf-builder__field">
          <span className="wf-builder__field-label">Node type</span>
          <span className="wf-builder__type-pill" style={{ background: meta.bg, color: meta.color }}>
            {meta.title}
          </span>
        </div>
        <label className="wf-builder__field">
          <span className="wf-builder__field-label">Label</span>
          <input
            className="wf-builder__input"
            value={node.label}
            onChange={(e) => onChange("label", e.target.value)}
            disabled={node.type === "start" || node.type === "end"}
          />
        </label>
        {meta.hasSubtitle && (
          <label className="wf-builder__field">
            <span className="wf-builder__field-label">
              {node.type === "orchestration" ? "Routing Instructions (Optional)" : meta.subtitleLabel}
            </span>
            <textarea
              className="wf-builder__textarea"
              value={node.subtitle ?? ""}
              onChange={(e) => onChange("subtitle", e.target.value)}
              placeholder={node.type === "orchestration" ? "Rules on how to route to downstream agents..." : undefined}
              rows={4}
            />
          </label>
        )}
        {node.type === "orchestration" && (
          <div className="wf-builder__field">
            <span className="wf-builder__field-label">Parallel branches</span>
            <p className="wf-builder__panel-empty">
              Use the + on the connector below this node to add parallel agent branches.
            </p>
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
          <Trash2 size={13} />
          Delete node
        </button>
      </div>
    </div>
  );
}

export function BranchWorkflowCanvas({
  tree,
  onTreeChange,
  isBuild,
  nodeStatuses,
  onSave: _onSave,
  canSave: _canSave,
  dirty: _dirty,
  onRequestAgentPicker,
}: BranchWorkflowCanvasProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openMenuFor, setOpenMenuFor] = useState<string | null>(null);
  const [scale, setScale] = useState(0.85);
  const [pan, setPan] = useState({ x: 60, y: 40 });
  const [panelMode, setPanelMode] = useState<"properties" | null>(null);
  const [orchestratorModalParentId, setOrchestratorModalParentId] = useState<string | null>(null);
  const [nodeOffsets, setNodeOffsets] = useState<Record<string, { x: number; y: number }>>({});
  const isPanning = useRef(false);
  const isDraggingNode = useRef(false);
  const dragNodeId = useRef<string | null>(null);
  const panStart = useRef({ x: 0, y: 0 });
  const panOrigin = useRef({ x: 0, y: 0 });
  const nodeDragOrigin = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });
  const pointerStart = useRef({ x: 0, y: 0 });
  const scaleRef = useRef(scale);
  const containerRef = useRef<HTMLDivElement>(null);

  scaleRef.current = scale;

  const { positions, edges, forks, bounds } = useMemo(() => layoutTree(tree), [tree]);

  const effectivePos = useCallback(
    (id: string) => {
      const base = positions[id];
      if (!base) return null;
      const offset = nodeOffsets[id] ?? { x: 0, y: 0 };
      return { x: base.x + offset.x, y: base.y + offset.y };
    },
    [nodeOffsets, positions],
  );

  const mutate = useCallback(
    (fn: (prev: BranchTreeNode) => BranchTreeNode) => {
      onTreeChange(fn(tree));
    },
    [onTreeChange, tree],
  );

  const fitView = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const startPos = effectivePos(tree.id);
    if (!startPos) return;

    const contentW = bounds.maxX - bounds.minX;
    const contentH = bounds.maxY - bounds.minY;
    if (contentW <= 0 || contentH <= 0) return;

    const topPadding = 40;
    const sidePadding = 40;
    const availW = Math.max(el.clientWidth - sidePadding * 2, 1);
    const availH = Math.max(el.clientHeight - topPadding - sidePadding, 1);
    const nextScale = Math.min(availW / contentW, availH / contentH, 1.1);
    const scaleClamped = Math.max(nextScale, 0.3);

    const startCenterX = startPos.x - bounds.minX + NODE_W / 2;
    const startTopY = startPos.y - bounds.minY;

    setScale(scaleClamped);
    setPan({
      x: el.clientWidth / 2 - startCenterX * scaleClamped,
      y: topPadding - startTopY * scaleClamped,
    });
  }, [bounds, effectivePos, tree.id]);

  const anchorStartView = useCallback(
    (currentScale: number) => {
      const el = containerRef.current;
      if (!el) return;
      const startPos = effectivePos(tree.id);
      if (!startPos) return;

      const topPadding = 40;
      const startCenterX = startPos.x - bounds.minX + NODE_W / 2;
      const startTopY = startPos.y - bounds.minY;

      setPan({
        x: el.clientWidth / 2 - startCenterX * currentScale,
        y: topPadding - startTopY * currentScale,
      });
    },
    [bounds, effectivePos, tree.id],
  );

  useEffect(() => {
    const timer = window.setTimeout(fitView, 60);
    return () => window.clearTimeout(timer);
  }, [tree, fitView]);

  const recenterView = anchorStartView;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      recenterView(scaleRef.current);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [recenterView]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();

      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const factor = e.deltaY > 0 ? 0.92 : 1.08;

      setScale((prevScale) => {
        const nextScale = Math.min(Math.max(prevScale * factor, 0.25), 1.8);
        const ratio = nextScale / prevScale;
        setPan((prevPan) => ({
          x: mouseX - (mouseX - prevPan.x) * ratio,
          y: mouseY - (mouseY - prevPan.y) * ratio,
        }));
        return nextScale;
      });
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    setNodeOffsets({});
  }, [tree]);

  const handleAddChild = (parentId: string, type: BranchNodeType) => {
    const parent = findNode(tree, parentId);
    if (!parent) return;

    if (type === "agent") {
      if (parent.type === "start") {
        onRequestAgentPicker?.(parentId, "linear");
        setOpenMenuFor(null);
        return;
      }
      if (parent.type === "agent" && !isInOrchestrationBranch(tree, parentId)) {
        onRequestAgentPicker?.(parentId, "linear");
        setOpenMenuFor(null);
        return;
      }
      mutate((prev) => insertChild(prev, parentId, makeNode("agent", { label: "Agent" })));
      setOpenMenuFor(null);
      return;
    }

    if (type === "orchestration") {
      setOrchestratorModalParentId(parentId);
      setOpenMenuFor(null);
      return;
    } else if (type === "condition") {
      const withCond = makeNode("condition", {
        children: [makeNode("branch-if", { subtitle: "" }), makeNode("branch-else")],
      });
      mutate((prev) => insertChild(prev, parentId, withCond));
    } else {
      mutate((prev) => insertChild(prev, parentId, makeNode(type)));
    }
    setOpenMenuFor(null);
  };

  const handleAddBranch = (parentId: string, kind: "condition" | "orchestration") => {
    if (kind === "orchestration") {
      onRequestAgentPicker?.(parentId, "parallel");
      return;
    }
    mutate((prev) => {
      const condNode = findNode(prev, parentId);
      if (!condNode) return prev;
      const elseIdx = condNode.children.findIndex((c) => c.type === "branch-else");
      const insertAt = elseIdx === -1 ? condNode.children.length : elseIdx;
      return insertChild(prev, parentId, makeNode("branch-elseif", { subtitle: "" }), insertAt);
    });
  };

  const handleCreateOrchestrator = (name: string, routingInstructions: string) => {
    const parentId = orchestratorModalParentId;
    if (!parentId) return;
    mutate((prev) =>
      insertChild(
        prev,
        parentId,
        createOrchestrationNode({ label: name, subtitle: routingInstructions }),
      ),
    );
    setOrchestratorModalParentId(null);
  };

  const handleDelete = (id: string) => {
    if (id === tree.id) return;
    mutate((prev) => deleteNodeById(prev, id));
    setSelectedId(null);
    setPanelMode(null);
  };

  const handleFieldChange = (id: string, field: "label" | "subtitle", value: string) => {
    mutate((prev) => updateNodeById(prev, id, (n) => ({ ...n, [field]: value })));
  };

  const onViewportPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("button, input, textarea, .wf-branch__menu")) return;

    pointerStart.current = { x: e.clientX, y: e.clientY };
    const nodeWrap = target.closest("[data-node-id]") as HTMLElement | null;
    const nodeId = nodeWrap?.dataset.nodeId;

    if (nodeId && !readOnly && e.button === 0) {
      isDraggingNode.current = true;
      dragNodeId.current = nodeId;
      const offset = nodeOffsets[nodeId] ?? { x: 0, y: 0 };
      nodeDragOrigin.current = {
        x: e.clientX,
        y: e.clientY,
        offsetX: offset.x,
        offsetY: offset.y,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
      return;
    }

    if (e.button === 0 || e.button === 1) {
      isPanning.current = true;
      panStart.current = { x: e.clientX, y: e.clientY };
      panOrigin.current = { ...pan };
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const onViewportPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingNode.current && dragNodeId.current) {
      const dx = (e.clientX - nodeDragOrigin.current.x) / scale;
      const dy = (e.clientY - nodeDragOrigin.current.y) / scale;
      const id = dragNodeId.current;
      setNodeOffsets((prev) => ({
        ...prev,
        [id]: {
          x: nodeDragOrigin.current.offsetX + dx,
          y: nodeDragOrigin.current.offsetY + dy,
        },
      }));
      return;
    }

    if (!isPanning.current) return;
    setPan({
      x: panOrigin.current.x + (e.clientX - panStart.current.x),
      y: panOrigin.current.y + (e.clientY - panStart.current.y),
    });
  };

  const onViewportPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const moved =
      Math.hypot(e.clientX - pointerStart.current.x, e.clientY - pointerStart.current.y) > 4;

    if (isDraggingNode.current && dragNodeId.current && !moved && !readOnly) {
      setSelectedId(dragNodeId.current);
      setPanelMode("properties");
    }

    isPanning.current = false;
    isDraggingNode.current = false;
    dragNodeId.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const zoomBy = (factor: number) => {
    const el = containerRef.current;
    if (!el) return;
    const centerX = el.clientWidth / 2;
    const centerY = el.clientHeight / 2;
    setScale((prevScale) => {
      const nextScale = Math.min(Math.max(prevScale * factor, 0.25), 1.8);
      const ratio = nextScale / prevScale;
      setPan((prevPan) => ({
        x: centerX - (centerX - prevPan.x) * ratio,
        y: centerY - (centerY - prevPan.y) * ratio,
      }));
      return nextScale;
    });
  };

  const selectedNode = selectedId ? findNode(tree, selectedId) : null;
  const readOnly = !isBuild;

  return (
    <div className="wf-builder wf-builder--branch">
      <div className="wf-builder__main wf-builder__main--flush">
        <div className="wf-builder__canvas-col">
          <div
            ref={containerRef}
            className="wf-builder__canvas wf-builder__canvas-viewport"
            onPointerDown={onViewportPointerDown}
            onPointerMove={onViewportPointerMove}
            onPointerUp={onViewportPointerUp}
            onPointerLeave={onViewportPointerUp}
          >
            {isBuild && (
              <p className="wf-builder__build-note">
                Start with orchestration or an agent → fan out parallel specialists → chain to End
              </p>
            )}
              <div
                className="wf-builder__canvas-layer"
                style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`, transformOrigin: "0 0" }}
              >
                <svg
                  width={bounds.maxX - bounds.minX + 400}
                  height={bounds.maxY - bounds.minY + 200}
                  className="wf-builder__edges"
                  style={{ left: 0, top: 0 }}
                >
                  {edges.map((e) => {
                    const from = effectivePos(e.from);
                    const to = effectivePos(e.to);
                    const fromNode = findNode(tree, e.from);
                    if (!from || !to || !fromNode) return null;
                    const fromLayer = { x: from.x - bounds.minX, y: from.y - bounds.minY };
                    const toLayer = { x: to.x - bounds.minX, y: to.y - bounds.minY };
                    return (
                      <path
                        key={`${e.from}-${e.to}`}
                        d={edgePath(fromLayer, toLayer, getNodeHeight(fromNode.type))}
                        className="wf-builder__edge"
                      />
                    );
                  })}
                </svg>

                {Object.entries(positions).map(([id, pos]) => {
                  const node = findNode(tree, id);
                  if (!node) return null;
                  const eff = effectivePos(id) ?? pos;
                  const meta = getNodeVisualMeta(tree, node);
                  const isParallelBranch = isOrchestrationBranchRoot(tree, id);
                  const isSelected = selectedId === id;
                  const status = nodeStatuses[id] ?? "idle";
                  const options = readOnly ? [] : getAddOptionsFor(node, tree);
                  const showExtendPlus = !readOnly && canShowPlus(node, tree);
                  const menuKey = id;
                  const nodeW = getNodeWidth(node.type);
                  const nodeLeft = eff.x - bounds.minX + (NODE_W - nodeW) / 2;
                  return (
                    <div
                      key={id}
                      data-node-id={id}
                      className="wf-branch__node-wrap"
                      style={{ left: nodeLeft, top: eff.y - bounds.minY, width: nodeW }}
                    >
                      <div
                        className={cn(
                          "wf-branch__node",
                          node.type === "start" && "wf-branch__node--start",
                          node.type === "end" && "wf-branch__node--end",
                          node.type === "orchestration" && "wf-branch__node--orch",
                          isParallelBranch && "wf-branch__node--parallel",
                          isSelected && "wf-branch__node--selected",
                          status === "active" && "wf-branch__node--running",
                          status === "done" && "wf-branch__node--done",
                          !readOnly && "wf-branch__node--draggable",
                        )}
                        style={{
                          borderColor: meta.border,
                          ...(isSelected && {
                            boxShadow: `0 4px 16px rgba(0, 0, 0, 0.16), 0 8px 28px rgba(0, 0, 0, 0.1), 0 0 0 3px ${meta.bg}`,
                          }),
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="wf-branch__node-head">
                          <span className="wf-branch__node-icon" style={{ background: meta.bg, color: meta.color }}>
                            <NodeTypeIcon node={node} tree={tree} />
                          </span>
                          <span className="wf-branch__node-label">{node.label}</span>
                          {!readOnly && node.type !== "start" && node.type !== "end" && (
                            <MoreVertical size={12} className="wf-branch__node-more" />
                          )}
                        </div>
                        {TYPE_META[node.type].hasSubtitle && node.subtitle ? (
                          <div className="wf-branch__node-sub">{node.subtitle}</div>
                        ) : null}
                      </div>

                      {showExtendPlus && (
                        <>
                          <button
                            type="button"
                            className="wf-branch__plus wf-branch__plus--edge"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuFor(openMenuFor === menuKey ? null : menuKey);
                            }}
                            aria-label="Add step"
                          >
                            <Plus size={11} />
                          </button>
                          {openMenuFor === menuKey && (
                            <div className="wf-branch__menu-anchor wf-branch__menu-anchor--edge">
                              <NodeMenu
                                parent={node}
                                tree={tree}
                                options={options.length ? options : BRANCH_CHAIN_OPTIONS}
                                onClose={() => setOpenMenuFor(null)}
                                onPick={(type) => handleAddChild(id, type)}
                              />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}

                {!readOnly &&
                  forks.map((f) => {
                    const parentPos = effectivePos(f.parentId) ?? positions[f.parentId];
                    if (!parentPos) return null;
                    return (
                    <button
                      key={`${f.kind}-${f.parentId}`}
                      type="button"
                      className="wf-branch__fork"
                      style={{
                        left: parentPos.x - bounds.minX + NODE_W / 2 - 9,
                        top: f.y - bounds.minY - 9 + (nodeOffsets[f.parentId]?.y ?? 0),
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddBranch(f.parentId, f.kind);
                      }}
                      title={f.kind === "orchestration" ? "Add parallel agent branch" : "Add branch"}
                      aria-label={f.kind === "orchestration" ? "Add parallel agent branch" : "Add branch"}
                    >
                      <Plus size={11} />
                    </button>
                    );
                  })}

                {!readOnly &&
                  Object.entries(positions)
                    .filter(([nodeId]) => {
                      const n = findNode(tree, nodeId);
                      return n?.type === "condition" && n.children.length === 0;
                    })
                    .map(([id, pos]) => {
                      const eff = effectivePos(id) ?? pos;
                      return (
                      <button
                        key={`init-${id}`}
                        type="button"
                        className="wf-branch__fork wf-branch__fork--init"
                        style={{
                          left: eff.x - bounds.minX + NODE_W / 2 - 9,
                          top: eff.y - bounds.minY + NODE_H + 14,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          mutate((prev) => {
                            let next = insertChild(prev, id, makeNode("branch-if", { subtitle: "" }));
                            next = insertChild(next, id, makeNode("branch-else"));
                            return next;
                          });
                        }}
                        aria-label="Initialize branches"
                      >
                        <Plus size={11} />
                      </button>
                      );
                    })}
              </div>

              <div className="wf-builder__zoom">
                <button type="button" onClick={() => zoomBy(1.12)} aria-label="Zoom in">
                  <ZoomIn size={14} />
                </button>
                <button type="button" onClick={() => zoomBy(1 / 1.12)} aria-label="Zoom out">
                  <ZoomOut size={14} />
                </button>
                <button type="button" onClick={fitView} aria-label="Fit view">
                  <Maximize2 size={14} />
                </button>
              </div>
            </div>
        </div>

        {panelMode === "properties" && selectedNode && (
          <div className="wf-builder__side">
            <PropertiesPanel
              node={selectedNode}
              tree={tree}
              onChange={(field, value) => handleFieldChange(selectedNode.id, field, value)}
              onDelete={() => handleDelete(selectedNode.id)}
              onClose={() => {
                setPanelMode(null);
                setSelectedId(null);
              }}
            />
          </div>
        )}
      </div>

      <CreateOrchestratorModal
        open={orchestratorModalParentId !== null}
        onClose={() => setOrchestratorModalParentId(null)}
        onCreate={handleCreateOrchestrator}
      />
    </div>
  );
}
