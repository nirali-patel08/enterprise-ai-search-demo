import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Position,
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import type { WorkflowAgentNode, WorkflowOrchestrator } from "@/data/sample";
import { cn } from "@/lib/utils";

export type NodeRunStatus = "idle" | "active" | "done";

type FoundryCanvasContextValue = {
  nodeStatuses: Record<string, NodeRunStatus>;
  isBuild: boolean;
  agentDescriptions: Map<string, string | undefined>;
  onEditOrchestrator: () => void;
  onRemoveOrchestrator: () => void;
  onAddAgent: () => void;
  onRemoveAgent: (id: string) => void;
  onAddOrchestrator: () => void;
};

const FoundryCanvasContext = createContext<FoundryCanvasContextValue | null>(null);

function useFoundryCanvas() {
  const ctx = useContext(FoundryCanvasContext);
  if (!ctx) throw new Error("Foundry canvas context missing");
  return ctx;
}

function StatusPill({ status }: { status: NodeRunStatus }) {
  if (status === "idle") return null;
  return (
    <span className={cn("foundry-canvas__pill", `foundry-canvas__pill--${status}`)}>
      {status === "active" ? "Running" : "Done"}
    </span>
  );
}

function StartNode({ data }: NodeProps<Node<{ status: NodeRunStatus }>>) {
  const status = data.status ?? "idle";
  return (
    <div
      className={cn(
        "foundry-canvas__terminal foundry-canvas__terminal--start",
        status === "active" && "foundry-canvas__terminal--active",
        status === "done" && "foundry-canvas__terminal--done",
      )}
    >
      <Handle type="source" position={Position.Bottom} className="foundry-canvas__handle" />
      <span className="foundry-canvas__terminal-icon">
        <PlayArrowRoundedIcon sx={{ fontSize: 14 }} />
      </span>
      <span className="foundry-canvas__terminal-label">Start</span>
      <StatusPill status={status} />
    </div>
  );
}

function EndNode({ data }: NodeProps<Node<{ status: NodeRunStatus }>>) {
  const status = data.status ?? "idle";
  return (
    <div
      className={cn(
        "foundry-canvas__terminal foundry-canvas__terminal--end",
        status === "active" && "foundry-canvas__terminal--active",
        status === "done" && "foundry-canvas__terminal--done",
      )}
    >
      <Handle type="target" position={Position.Top} className="foundry-canvas__handle" />
      <span className="foundry-canvas__terminal-icon">
        <StopRoundedIcon sx={{ fontSize: 14 }} />
      </span>
      <span className="foundry-canvas__terminal-label">End</span>
      <StatusPill status={status} />
    </div>
  );
}

type OrchestratorNodeData = {
  orchestrator: WorkflowOrchestrator;
  agents: WorkflowAgentNode[];
};

function OrchestratorNode({ data }: NodeProps<Node<OrchestratorNodeData>>) {
  const {
    nodeStatuses,
    isBuild,
    agentDescriptions,
    onEditOrchestrator,
    onRemoveOrchestrator,
    onAddAgent,
    onRemoveAgent,
  } = useFoundryCanvas();

  const { orchestrator, agents } = data;
  const orchStatus = nodeStatuses.orchestrator ?? "idle";

  return (
    <div
      className={cn(
        "foundry-canvas__orch",
        orchStatus === "active" && "foundry-canvas__orch--active",
        orchStatus === "done" && "foundry-canvas__orch--done",
      )}
    >
      <Handle type="target" position={Position.Top} className="foundry-canvas__handle" />
      <Handle type="source" position={Position.Bottom} className="foundry-canvas__handle" />

      <div className="foundry-canvas__orch-head">
        <span className="foundry-canvas__orch-icon">
          <HubRoundedIcon sx={{ fontSize: 18 }} />
        </span>
        <div className="foundry-canvas__orch-copy">
          <span className="foundry-canvas__orch-name">{orchestrator.name}</span>
          <span className="foundry-canvas__orch-kind">Orchestrator</span>
          {orchestrator.routingInstructions && (
            <span className="foundry-canvas__orch-routing">{orchestrator.routingInstructions}</span>
          )}
        </div>
        <StatusPill status={orchStatus} />
        {isBuild && (
          <div className="foundry-canvas__orch-menu">
            <button type="button" aria-label="Orchestrator actions" onClick={onEditOrchestrator}>
              <MoreHorizRoundedIcon sx={{ fontSize: 18 }} />
            </button>
            <button type="button" aria-label="Remove orchestrator" onClick={onRemoveOrchestrator}>
              <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
            </button>
          </div>
        )}
      </div>

      <div className="foundry-canvas__orch-body">
        <div className="foundry-canvas__orch-agents-label">
          Agents <span>({agents.length})</span>
        </div>

        {agents.length === 0 ? (
          <p className="foundry-canvas__orch-empty">Add one or more agents under this orchestration.</p>
        ) : (
          <ul className="foundry-canvas__agent-list">
            {agents.map((agent) => {
              const status = nodeStatuses[agent.id] ?? "idle";
              const description = agent.description ?? agentDescriptions.get(agent.agentId);
              return (
                <li
                  key={agent.id}
                  className={cn(
                    "foundry-canvas__agent",
                    status === "active" && "foundry-canvas__agent--active",
                    status === "done" && "foundry-canvas__agent--done",
                  )}
                >
                  <span className="foundry-canvas__agent-icon">
                    <SmartToyOutlinedIcon sx={{ fontSize: 16 }} />
                  </span>
                  <div className="foundry-canvas__agent-copy">
                    <span className="foundry-canvas__agent-name">{agent.name}</span>
                    <span className="foundry-canvas__agent-kind">Agent</span>
                    {description && <span className="foundry-canvas__agent-desc">{description}</span>}
                  </div>
                  <StatusPill status={status} />
                  {isBuild && (
                    <button
                      type="button"
                      className="foundry-canvas__agent-remove"
                      aria-label={`Remove ${agent.name}`}
                      onClick={() => onRemoveAgent(agent.id)}
                    >
                      <DeleteOutlineRoundedIcon sx={{ fontSize: 15 }} />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {isBuild && (
          <button type="button" className="foundry-canvas__add-agent" onClick={onAddAgent}>
            <AddRoundedIcon sx={{ fontSize: 16 }} />
            Add agent
          </button>
        )}
      </div>
    </div>
  );
}

function FoundryEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition }: EdgeProps) {
  const [path] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 8,
  });

  return <BaseEdge id={id} path={path} className="foundry-canvas__edge-path" />;
}

function FoundryAddEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}: EdgeProps) {
  const { isBuild, onAddOrchestrator } = useFoundryCanvas();
  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 8,
  });

  return (
    <>
      <BaseEdge id={id} path={path} className="foundry-canvas__edge-path foundry-canvas__edge-path--dashed" />
      {isBuild && (
        <EdgeLabelRenderer>
          <button
            type="button"
            className="foundry-canvas__edge-add"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
            onClick={onAddOrchestrator}
            aria-label="Add agent orchestration"
            title="Add agent orchestration"
          >
            <AddRoundedIcon sx={{ fontSize: 16 }} />
          </button>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

const nodeTypes = {
  foundryStart: StartNode,
  foundryEnd: EndNode,
  foundryOrchestrator: OrchestratorNode,
};

const edgeTypes = {
  foundryEdge: FoundryEdge,
  foundryAddEdge: FoundryAddEdge,
};

const ORCH_WIDTH = 300;
const ORCH_HEADER = 88;
const ORCH_AGENT_ROW = 72;
const ORCH_EMPTY = 48;
const ORCH_ADD = 44;
const ORCH_PADDING = 24;

function orchestratorHeight(agentCount: number) {
  const agentsBlock = agentCount === 0 ? ORCH_EMPTY : agentCount * ORCH_AGENT_ROW;
  return ORCH_HEADER + agentsBlock + ORCH_ADD + ORCH_PADDING;
}

function buildGraph(
  orchestrator: WorkflowOrchestrator | null,
  agents: WorkflowAgentNode[],
  nodeStatuses: Record<string, NodeRunStatus>,
): { nodes: Node[]; edges: Edge[] } {
  const centerX = 0;
  const startY = 0;
  const orchY = 90;
  const orchH = orchestrator ? orchestratorHeight(agents.length) : 0;
  const endY = orchestrator ? orchY + orchH + 90 : 220;

  const nodes: Node[] = [
    {
      id: "start",
      type: "foundryStart",
      position: { x: centerX, y: startY },
      data: { status: nodeStatuses.start ?? "idle" },
      draggable: false,
      selectable: false,
    },
    {
      id: "end",
      type: "foundryEnd",
      position: { x: centerX, y: endY },
      data: { status: nodeStatuses.end ?? "idle" },
      draggable: false,
      selectable: false,
    },
  ];

  const edges: Edge[] = [];

  if (orchestrator) {
    nodes.splice(1, 0, {
      id: "orchestrator",
      type: "foundryOrchestrator",
      position: { x: centerX - ORCH_WIDTH / 2, y: orchY },
      data: { orchestrator, agents },
      draggable: false,
      selectable: false,
    });
    edges.push(
      { id: "e-start-orch", source: "start", target: "orchestrator", type: "foundryEdge" },
      { id: "e-orch-end", source: "orchestrator", target: "end", type: "foundryEdge" },
    );
  } else {
    edges.push({ id: "e-start-end", source: "start", target: "end", type: "foundryAddEdge" });
  }

  return { nodes, edges };
}

type FoundryWorkflowCanvasProps = {
  orchestrator: WorkflowOrchestrator | null;
  agents: WorkflowAgentNode[];
  agentDescriptions: Map<string, string | undefined>;
  nodeStatuses: Record<string, NodeRunStatus>;
  isBuild: boolean;
  onEditOrchestrator: () => void;
  onRemoveOrchestrator: () => void;
  onAddAgent: () => void;
  onRemoveAgent: (id: string) => void;
  onAddOrchestrator: () => void;
};

function FoundryWorkflowCanvasInner({
  orchestrator,
  agents,
  agentDescriptions,
  nodeStatuses,
  isBuild,
  onEditOrchestrator,
  onRemoveOrchestrator,
  onAddAgent,
  onRemoveAgent,
  onAddOrchestrator,
}: FoundryWorkflowCanvasProps) {
  const { fitView } = useReactFlow();
  const canvasRef = useRef<HTMLDivElement>(null);

  const { nodes, edges } = useMemo(
    () => buildGraph(orchestrator, agents, nodeStatuses),
    [orchestrator, agents, nodeStatuses],
  );

  const reflow = useCallback(() => {
    requestAnimationFrame(() => {
      fitView({ padding: 0.28, duration: 240 });
    });
  }, [fitView]);

  useEffect(() => {
    const timer = window.setTimeout(reflow, 80);
    return () => window.clearTimeout(timer);
  }, [nodes, edges, reflow]);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => reflow());
    observer.observe(el);
    return () => observer.disconnect();
  }, [reflow]);

  const contextValue = useMemo<FoundryCanvasContextValue>(
    () => ({
      nodeStatuses,
      isBuild,
      agentDescriptions,
      onEditOrchestrator,
      onRemoveOrchestrator,
      onAddAgent,
      onRemoveAgent,
      onAddOrchestrator,
    }),
    [
      nodeStatuses,
      isBuild,
      agentDescriptions,
      onEditOrchestrator,
      onRemoveOrchestrator,
      onAddAgent,
      onRemoveAgent,
      onAddOrchestrator,
    ],
  );

  return (
    <FoundryCanvasContext.Provider value={contextValue}>
      <div className="foundry-canvas" ref={canvasRef}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag
          zoomOnScroll
          minZoom={0.45}
          maxZoom={1.4}
          proOptions={{ hideAttribution: true }}
          className="foundry-canvas__rf"
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1.2} color="rgba(255,255,255,0.14)" />
          <Controls showInteractive={false} position="bottom-left" className="foundry-canvas__controls" />
        </ReactFlow>
      </div>
    </FoundryCanvasContext.Provider>
  );
}

export function FoundryWorkflowCanvas(props: FoundryWorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <FoundryWorkflowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
