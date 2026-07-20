import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Handle,
  Position,
  type Edge,
  type Node,
  type Connection,
  type NodeProps,
  type NodeChange,
  type EdgeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import CallSplitRoundedIcon from "@mui/icons-material/CallSplitRounded";
import PanToolAltRoundedIcon from "@mui/icons-material/PanToolAltRounded";
import DataObjectRoundedIcon from "@mui/icons-material/DataObjectRounded";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import InputRoundedIcon from "@mui/icons-material/InputRounded";
import TerminalRoundedIcon from "@mui/icons-material/TerminalRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {
  getOrchestrationPresets,
  resolveDemoReply,
  type DemoCitation,
} from "@/data/playground-demo";
import {
  DEFAULT_ORCH_GRAPH,
  ORCH_SCOPES,
  ORCHESTRATION_OPTIONS,
  type OrchScope,
} from "@/data/sample";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { useAgents } from "@/hooks/useAgents";
import { useBuilderStore } from "@/store/builder-store";
import { Field, Textarea } from "../wizard-ui";

// ─── Types ───────────────────────────────────────────────────────

type NodeKind = "query" | "orchestrator" | "agent" | "condition" | "human" | "variable";

type FlowData = {
  label: string;
  sub?: string;
  kind: NodeKind;
  instructions?: string;
  scopes?: OrchScope[];
  agentId?: string;
  active?: boolean;
  [key: string]: unknown;
};

type FlowNode = Node<FlowData>;

type ChatMsg = {
  id: string;
  role: "user" | "agent";
  text: string;
  time: string;
  trace?: string;
  meta?: string;
  sources?: DemoCitation[];
  followUps?: string[];
};

type TraceEntry = {
  id: string;
  time: string;
  kind: "prompt" | "route" | "payload" | "response" | "info";
  label: string;
  detail?: string;
};

// ─── Custom nodes ────────────────────────────────────────────────

const KIND_ICONS: Record<NodeKind, React.ReactNode> = {
  query: <InputRoundedIcon sx={{ fontSize: 14 }} />,
  orchestrator: <HubRoundedIcon sx={{ fontSize: 14 }} />,
  agent: <SmartToyOutlinedIcon sx={{ fontSize: 14 }} />,
  condition: <CallSplitRoundedIcon sx={{ fontSize: 14 }} />,
  human: <PanToolAltRoundedIcon sx={{ fontSize: 14 }} />,
  variable: <DataObjectRoundedIcon sx={{ fontSize: 14 }} />,
};

const KIND_TAGS: Record<NodeKind, string> = {
  query: "Input",
  orchestrator: "Orchestrator",
  agent: "Agent",
  condition: "If / Else",
  human: "Human approval",
  variable: "Set variable",
};

function FlowNodeCard({ data, selected }: NodeProps<FlowNode>) {
  const kind = data.kind;
  return (
    <div
      className={cn(
        "orch-flow__node",
        `orch-flow__node--${kind}`,
        selected && "orch-flow__node--selected",
        data.active && "orch-flow__node--active",
      )}
    >
      {kind !== "query" && <Handle type="target" position={Position.Top} className="orch-flow__handle" />}
      <div className="orch-flow__node-head">
        <span className="orch-flow__node-icon">{KIND_ICONS[kind]}</span>
        <span className="orch-flow__node-tag">{KIND_TAGS[kind]}</span>
      </div>
      <div className="orch-flow__node-name">{data.label}</div>
      {data.sub && <div className="orch-flow__node-sub">{data.sub}</div>}
      <Handle type="source" position={Position.Bottom} className="orch-flow__handle" />
    </div>
  );
}

const nodeTypes = {
  flowNode: FlowNodeCard,
};

// ─── Initial graph from sample data ──────────────────────────────

function buildInitialGraph(): { nodes: FlowNode[]; edges: Edge[] } {
  const nodes: FlowNode[] = [];
  const edges: Edge[] = [];

  const query = DEFAULT_ORCH_GRAPH.find((n) => n.kind === "query");
  const supervisor = DEFAULT_ORCH_GRAPH.find((n) => n.kind === "supervisor");
  const workers = DEFAULT_ORCH_GRAPH.filter((n) => n.kind === "worker");

  if (query) {
    nodes.push({
      id: query.id,
      type: "flowNode",
      position: { x: 320, y: 10 },
      data: { label: query.label, kind: "query" },
    });
  }
  if (supervisor) {
    nodes.push({
      id: supervisor.id,
      type: "flowNode",
      position: { x: 300, y: 130 },
      data: {
        label: supervisor.label,
        kind: "orchestrator",
        instructions: supervisor.instructions,
        scopes: supervisor.scopes,
        agentId: supervisor.agentId,
      },
    });
    if (query) {
      edges.push({ id: `${query.id}->${supervisor.id}`, source: query.id, target: supervisor.id });
    }
  }
  workers.forEach((w, i) => {
    nodes.push({
      id: w.id,
      type: "flowNode",
      position: { x: 40 + (i % 4) * 200, y: 290 + Math.floor(i / 4) * 130 },
      data: {
        label: w.label,
        sub: w.sub,
        kind: "agent",
        instructions: w.instructions,
        scopes: w.scopes,
        agentId: w.agentId,
      },
    });
    if (supervisor) {
      edges.push({ id: `${supervisor.id}->${w.id}`, source: supervisor.id, target: w.id });
    }
  });

  return { nodes, edges };
}

const INITIAL = buildInitialGraph();

const CONTROL_ITEMS: { kind: NodeKind; label: string; sub: string }[] = [
  { kind: "condition", label: "If / Else", sub: "Branch on a field in the agent output" },
  { kind: "human", label: "Human approval", sub: "Pause until a person approves" },
  { kind: "variable", label: "Set variable", sub: "Store a value for later nodes" },
];

type OrchPhase = "build" | "test";

type AddPanel = "agent" | "logic" | null;

const WORKFLOW_STEPS = [
  {
    id: 1,
    title: "Add agents",
    description: "Click Add agent to place specialists on the canvas.",
  },
  {
    id: 2,
    title: "Configure agents",
    description: "Click a node to set its instructions and delegated sub-tasks.",
  },
  {
    id: 3,
    title: "Add logic (optional)",
    description: "Click Add logic for if/else, human approval, or variables.",
  },
  {
    id: 4,
    title: "Save & test",
    description: "Save the workflow, then check it in the playground.",
  },
] as const;

function nowLabel() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

// ─── Studio ──────────────────────────────────────────────────────

function OrchestrationStudio() {
  const deploymentType = useBuilderStore((s) => s.deploymentType);
  const orchestrationId = useBuilderStore((s) => s.orchestrationId);
  const selectedAgentIds = useBuilderStore((s) => s.selectedAgentIds);
  const setOrchestrationId = useBuilderStore((s) => s.setOrchestrationId);
  const setOrchestrationSaved = useBuilderStore((s) => s.setOrchestrationSaved);
  const setTestRan = useBuilderStore((s) => s.setTestRan);

  const marketplace = useAgents();
  const patterns = ORCHESTRATION_OPTIONS.filter(
    (o) => o.deployment === deploymentType || o.deployment === "both",
  );

  const [nodes, setNodes, onNodesChangeInternal] = useNodesState<FlowNode>(INITIAL.nodes);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState<Edge>(INITIAL.edges);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [phase, setPhase] = useState<OrchPhase>("build");
  const [addPanel, setAddPanel] = useState<AddPanel>(null);
  const [agentSearch, setAgentSearch] = useState("");

  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [traces, setTraces] = useState<TraceEntry[]>([]);
  const [tracesOpen, setTracesOpen] = useState(false);

  const { screenToFlowPosition, fitView } = useReactFlow();
  const canvasRef = useRef<HTMLDivElement>(null);
  const chatLogRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  const reflowCanvas = useCallback(() => {
    requestAnimationFrame(() => {
      fitView({ padding: 0.15, duration: 220 });
    });
  }, [fitView]);

  useEffect(() => {
    const timer = window.setTimeout(reflowCanvas, 320);
    return () => window.clearTimeout(timer);
  }, [phase, reflowCanvas]);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => reflowCanvas());
    observer.observe(el);
    return () => observer.disconnect();
  }, [reflowCanvas]);

  const markUnsaved = useCallback(() => {
    setOrchestrationSaved(false);
    setTestRan(false);
    setPhase("build");
  }, [setOrchestrationSaved, setTestRan]);

  const onNodesChange = useCallback(
    (changes: NodeChange<FlowNode>[]) => {
      const hasWorkflowChange = changes.some((change) => change.type !== "select");
      if (hasWorkflowChange) markUnsaved();
      onNodesChangeInternal(changes);
    },
    [markUnsaved, onNodesChangeInternal],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const hasWorkflowChange = changes.some((change) => change.type !== "select");
      if (hasWorkflowChange) markUnsaved();
      onEdgesChangeInternal(changes);
    },
    [markUnsaved, onEdgesChangeInternal],
  );

  useEffect(() => {
    const valid = patterns.some((p) => p.id === orchestrationId);
    if ((!orchestrationId || !valid) && patterns[0]) setOrchestrationId(patterns[0].id);
  }, [orchestrationId, patterns, setOrchestrationId]);

  useEffect(() => {
    const el = chatLogRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chat, sending]);

  useEffect(() => {
    return () => timers.current.forEach((t) => window.clearTimeout(t));
  }, []);

  const selectedNode = nodes.find((n) => n.id === selectedId) ?? null;
  const agentNodesOnCanvas = useMemo(
    () => new Set(nodes.filter((n) => n.data.agentId).map((n) => n.data.agentId as string)),
    [nodes],
  );
  // ── Canvas interactions ──
  const onConnect = useCallback(
    (conn: Connection) => {
      setEdges((eds) => addEdge(conn, eds));
      markUnsaved();
    },
    [setEdges, markUnsaved],
  );

  const nextNodePosition = useCallback(() => {
    return screenToFlowPosition({
      x: window.innerWidth / 2 + (Math.random() * 80 - 40),
      y: window.innerHeight / 2 + (Math.random() * 80 - 40),
    });
  }, [screenToFlowPosition]);

  const closeAddPanel = useCallback(() => {
    setAddPanel(null);
    setAgentSearch("");
  }, []);

  const openAddPanel = useCallback(
    (panel: Exclude<AddPanel, null>) => {
      setAddPanel((prev) => (prev === panel ? null : panel));
      setAgentSearch("");
      setSelectedId(null);
    },
    [],
  );

  const addAgentNode = useCallback(
    (agentId: string) => {
      const agent = marketplace.find((a) => a.id === agentId);
      if (!agent) return;
      const position = nextNodePosition();
      const node: FlowNode = {
        id: `${agent.id}-${Date.now()}`,
        type: "flowNode",
        position,
        data: {
          label: agent.name,
          sub: agent.description.slice(0, 42),
          kind: "agent",
          agentId: agent.id,
          instructions: agent.instructions ?? agent.description,
          scopes: ["Policies"],
        },
      };
      setNodes((nds) => [...nds, node]);
      const orch = nodes.find((n) => n.data.kind === "orchestrator");
      if (orch) {
        setEdges((eds) =>
          addEdge({ source: orch.id, target: node.id, sourceHandle: null, targetHandle: null }, eds),
        );
      }
      setSelectedId(node.id);
      closeAddPanel();
      markUnsaved();
      toast.success(`Added ${agent.name}`);
    },
    [marketplace, nextNodePosition, nodes, setNodes, setEdges, closeAddPanel, markUnsaved],
  );

  const addControlNode = useCallback(
    (kind: NodeKind) => {
      const item = CONTROL_ITEMS.find((c) => c.kind === kind);
      const id = `${kind}-${Date.now()}`;
      const node: FlowNode = {
        id,
        type: "flowNode",
        position: nextNodePosition(),
        data: { label: item?.label ?? kind, sub: item?.sub, kind },
      };
      setNodes((nds) => [...nds, node]);
      setSelectedId(id);
      closeAddPanel();
      markUnsaved();
    },
    [nextNodePosition, setNodes, closeAddPanel, markUnsaved],
  );

  const updateNodeData = (id: string, patch: Partial<FlowData>) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)),
    );
    markUnsaved();
  };

  const removeNode = (id: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    if (selectedId === id) setSelectedId(null);
    markUnsaved();
  };

  const toggleScope = (id: string, scope: OrchScope) => {
    const node = nodes.find((n) => n.id === id);
    if (!node) return;
    const scopes = node.data.scopes ?? [];
    updateNodeData(id, {
      scopes: scopes.includes(scope) ? scopes.filter((s) => s !== scope) : [...scopes, scope],
    });
  };

  const saveOrchestration = () => {
    if (patterns[0]) setOrchestrationId(patterns[0].id);
    setOrchestrationSaved(true);
    setSelectedId(null);
    toast.success("Workflow saved. Select Test in playground to check it.");
  };

  const runWorkflow = () => {
    setPhase("test");
    setChat([]);
    setTraces([]);
    setTracesOpen(false);
    closeAddPanel();
    if (!useBuilderStore.getState().orchestrationSaved) {
      saveOrchestration();
    }
  };

  const editWorkflow = () => {
    setPhase("build");
    setSelectedId(null);
    closeAddPanel();
  };

  const isBuildPhase = phase === "build";
  const activeStep =
    phase === "test"
      ? 4
      : selectedNode && selectedNode.data.kind !== "query"
        ? 2
        : nodes.some((n) => n.data.kind === "condition" || n.data.kind === "human" || n.data.kind === "variable")
          ? 3
          : agentNodesOnCanvas.size > 0
            ? 2
            : 1;

  // ── Execution simulation with visual tracing ──
  const setActive = useCallback(
    (ids: string[]) => {
      setNodes((nds) =>
        nds.map((n) => ({ ...n, data: { ...n.data, active: ids.includes(n.id) } })),
      );
      setEdges((eds) =>
        eds.map((e) => ({
          ...e,
          animated: ids.includes(e.source) && ids.includes(e.target),
        })),
      );
    },
    [setNodes, setEdges],
  );

  const pushTrace = (entry: Omit<TraceEntry, "id" | "time">) => {
    setTraces((prev) => [...prev, { ...entry, id: `t-${Date.now()}-${prev.length}`, time: nowLabel() }]);
  };

  const orchPresets = useMemo(() => getOrchestrationPresets(), []);

  const sendQuery = (query: string) => {
    const q = query.trim();
    if (!q || sending || phase !== "test") return;

    setChat((prev) => [...prev, { id: `u-${Date.now()}`, role: "user", text: q, time: nowLabel() }]);
    setInput("");
    setSending(true);

    const reply = resolveDemoReply(q, { orchestrated: true });
    const preset = orchPresets.find((p) => p.query.toLowerCase() === q.toLowerCase());

    const queryNode = nodes.find((n) => n.data.kind === "query");
    const orchNode = nodes.find((n) => n.data.kind === "orchestrator");
    const agentNodes = nodes.filter((n) => n.data.kind === "agent");
    const targetNode =
      agentNodes.find((n) => preset && n.data.agentId === preset.agentId) ??
      agentNodes.find((n) => reply.trace?.toLowerCase().includes(n.data.label.toLowerCase())) ??
      agentNodes[0];

    const schedule = (fn: () => void, ms: number) => {
      timers.current.push(window.setTimeout(fn, ms));
    };

    // Visual tracing sequence: query → orchestrator → routed agent
    if (queryNode) {
      setActive([queryNode.id]);
      pushTrace({ kind: "prompt", label: "User prompt received", detail: q });
    }
    schedule(() => {
      if (orchNode) {
        setActive([queryNode?.id ?? "", orchNode.id]);
        pushTrace({
          kind: "prompt",
          label: `Prompt → ${orchNode.data.label}`,
          detail: "system: classify intent, pick specialist, preserve citations",
        });
      }
    }, 250);
    schedule(() => {
      if (targetNode) {
        pushTrace({
          kind: "route",
          label: "Routing decision",
          detail: `{ "intent": "${preset?.domain ?? "enterprise-search"}", "target": "${targetNode.data.label}" }`,
        });
      }
    }, 550);
    schedule(() => {
      if (targetNode && orchNode) {
        setActive([orchNode.id, targetNode.id]);
        pushTrace({
          kind: "payload",
          label: `Payload → ${targetNode.data.label}`,
          detail: `{ "query": "${q.slice(0, 60)}${q.length > 60 ? "…" : ""}", "scopes": ${JSON.stringify(targetNode.data.scopes ?? [])} }`,
        });
      }
    }, 850);
    schedule(() => {
      setActive([]);
      setChat((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "agent",
          text: preset?.answer ?? reply.answer,
          time: nowLabel(),
          trace: reply.trace,
          meta: reply.meta,
          sources: preset?.cites ?? reply.sources,
          followUps: (preset?.followUps ?? reply.followUps).slice(0, 2),
        },
      ]);
      pushTrace({
        kind: "response",
        label: `${targetNode?.data.label ?? "Agent"} responded`,
        detail: `${(preset?.cites ?? reply.sources)?.length ?? 0} sources · answer streamed to playground`,
      });
      setSending(false);
      setTestRan(true);
      if (!orchestrationId && patterns[0]) setOrchestrationId(patterns[0].id);
    }, 1450);
  };

  const sendCustom = () => sendQuery(input);

  return (
    <section className="orch-flow">
      <div className="orch-flow__bar">
        <div>
          <h2 className="orch-flow__title">
            {isBuildPhase ? "Build workflow" : "Test in playground"}
          </h2>
          <p className="orch-flow__hint">
            {isBuildPhase
              ? "Add agents for the work, then optionally Add logic for rules. Click a node to configure it, then save & test."
              : "Check your workflow in the playground. Nodes highlight on the canvas as each step executes."}
          </p>
        </div>
        <div className="orch-flow__bar-actions">
          {isBuildPhase ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                className={cn(
                  "orch-flow__btn-add orch-flow__btn-add--agent",
                  addPanel === "agent" && "orch-flow__btn-add--active",
                )}
                onClick={() => openAddPanel("agent")}
              >
                <SmartToyOutlinedIcon sx={{ fontSize: 16 }} />
                Add agent
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className={cn(
                  "orch-flow__btn-add orch-flow__btn-add--logic",
                  addPanel === "logic" && "orch-flow__btn-add--active",
                )}
                onClick={() => openAddPanel("logic")}
              >
                <CallSplitRoundedIcon sx={{ fontSize: 16 }} />
                Add logic
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="orch-flow__btn-add orch-flow__btn-add--save"
                onClick={saveOrchestration}
              >
                <SaveOutlinedIcon sx={{ fontSize: 16 }} />
                Save
              </Button>
              <Button variant="primary" size="sm" onClick={runWorkflow}>
                <PlayArrowRoundedIcon sx={{ fontSize: 16 }} />
                Save & test
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                size="sm"
                className="orch-flow__btn-add orch-flow__btn-add--edit"
                onClick={editWorkflow}
              >
                <EditOutlinedIcon sx={{ fontSize: 16 }} />
                Edit workflow
              </Button>
              <Button variant="primary" size="sm" onClick={() => { setChat([]); setTraces([]); }}>
                <PlayArrowRoundedIcon sx={{ fontSize: 16 }} />
                Test in playground
              </Button>
              {chat.length > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="orch-flow__btn-add orch-flow__btn-add--new"
                  onClick={() => { setChat([]); setTraces([]); }}
                >
                  New run
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <ol className="orch-flow__steps" aria-label="Orchestration workflow steps">
        {WORKFLOW_STEPS.map((step) => {
          const done = step.id < activeStep || (step.id === 4 && phase === "test");
          const active = step.id === activeStep;
          return (
            <li
              key={step.id}
              className={cn(
                "orch-flow__step",
                done && "orch-flow__step--done",
                active && "orch-flow__step--active",
              )}
            >
              <span className="orch-flow__step-num">{step.id}</span>
              <div className="min-w-0">
                <div className="orch-flow__step-title">{step.title}</div>
                <div className="orch-flow__step-desc">{step.description}</div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className={cn("orch-flow__layout", isBuildPhase ? "orch-flow__layout--build" : "orch-flow__layout--test")}>
        <div className="orch-flow__canvas ds-glass" ref={canvasRef}>
          {!isBuildPhase && (
            <div className="orch-flow__canvas-badge">
              <PlayArrowRoundedIcon sx={{ fontSize: 14 }} />
              Live playground
            </div>
          )}
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, n) => {
              if (!isBuildPhase) return;
              closeAddPanel();
              setSelectedId(n.id);
            }}
            onPaneClick={() => {
              setSelectedId(null);
              closeAddPanel();
            }}
            nodesDraggable={isBuildPhase}
            nodesConnectable={isBuildPhase}
            elementsSelectable={isBuildPhase}
            fitView
            fitViewOptions={{ padding: 0.15 }}
            deleteKeyCode={isBuildPhase ? ["Backspace", "Delete"] : null}
            className="orch-flow__rf"
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1.2} color="rgba(0,0,0,0.14)" />
            <Controls showInteractive={false} position="bottom-left" />
          </ReactFlow>

          {isBuildPhase && addPanel === "agent" && (
            <div className="orch-flow__add-menu orch-flow__add-menu--agent">
              <div className="orch-flow__add-menu-head">
                <div>
                  <h4>Add agent</h4>
                  <p className="orch-flow__add-menu-help">Pick an AI agent from your project.</p>
                </div>
                <button type="button" className="orch-flow__drawer-close" onClick={closeAddPanel}>
                  <CloseRoundedIcon sx={{ fontSize: 15 }} />
                </button>
              </div>

              <div className="orch-flow__add-search">
                <SearchRoundedIcon sx={{ fontSize: 14 }} />
                <input
                  className="orch-flow__add-search-input"
                  placeholder="Search agents…"
                  value={agentSearch}
                  onChange={(e) => setAgentSearch(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="orch-flow__add-menu-list">
                {marketplace
                  .filter((a) => selectedAgentIds.includes(a.id))
                  .filter((a) => !agentSearch || a.name.toLowerCase().includes(agentSearch.toLowerCase()))
                  .map((a) => (
                    <button key={a.id} type="button" className="orch-flow__add-menu-item" onClick={() => addAgentNode(a.id)}>
                      <SmartToyOutlinedIcon sx={{ fontSize: 14 }} />
                      <div className="min-w-0">
                        <div className="orch-flow__add-menu-name">{a.name}</div>
                        <div className="orch-flow__add-menu-desc">{a.description.slice(0, 50)}</div>
                      </div>
                    </button>
                  ))}
                {marketplace.filter((a) => selectedAgentIds.includes(a.id)).length === 0 && (
                  <p className="orch-flow__add-menu-empty">No agents selected yet. Go back to Step 4 to pick agents.</p>
                )}
              </div>
            </div>
          )}

          {isBuildPhase && addPanel === "logic" && (
            <div className="orch-flow__add-menu orch-flow__add-menu--logic">
              <div className="orch-flow__add-menu-head">
                <div>
                  <h4>Add logic</h4>
                  <p className="orch-flow__add-menu-help">Rules that run after an agent responds.</p>
                </div>
                <button type="button" className="orch-flow__drawer-close" onClick={closeAddPanel}>
                  <CloseRoundedIcon sx={{ fontSize: 15 }} />
                </button>
              </div>

              <div className="orch-flow__add-menu-list">
                {CONTROL_ITEMS.map((c) => (
                  <button key={c.kind} type="button" className="orch-flow__add-menu-item" onClick={() => addControlNode(c.kind)}>
                    <span className={`orch-flow__dir-icon orch-flow__dir-icon--${c.kind}`}>
                      {KIND_ICONS[c.kind]}
                    </span>
                    <div className="min-w-0">
                      <div className="orch-flow__add-menu-name">{c.label}</div>
                      <div className="orch-flow__add-menu-desc">{c.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {isBuildPhase && !addPanel && selectedNode && selectedNode.data.kind !== "query" && (
            <div className="orch-flow__drawer">
              <div className="orch-flow__drawer-head">
                <span className="orch-flow__drawer-kind">{KIND_TAGS[selectedNode.data.kind]}</span>
                <button
                  type="button"
                  className="orch-flow__drawer-close"
                  aria-label="Close"
                  onClick={() => setSelectedId(null)}
                >
                  <CloseRoundedIcon sx={{ fontSize: 15 }} />
                </button>
              </div>

              <Field label="Name" className="orch-flow__field">
                <input
                  className="ds-field orch-flow__input"
                  value={selectedNode.data.label}
                  onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                />
              </Field>

              {(selectedNode.data.kind === "agent" || selectedNode.data.kind === "orchestrator") && (
                <>
                  <Field label="Instructions" className="orch-flow__field">
                    <Textarea
                      rows={4}
                      className="orch-flow__textarea"
                      value={selectedNode.data.instructions ?? ""}
                      onChange={(e) => updateNodeData(selectedNode.id, { instructions: e.target.value })}
                      placeholder="Describe what this agent should do and which sub-tasks it owns."
                    />
                  </Field>
                  <Field label="Delegated scope" className="orch-flow__field">
                    <div className="orch-flow__scope-tags">
                      {ORCH_SCOPES.map((scope) => (
                        <button
                          key={scope}
                          type="button"
                          className={cn(
                            "orch-flow__scope-tag",
                            (selectedNode.data.scopes ?? []).includes(scope) &&
                              "orch-flow__scope-tag--on",
                          )}
                          onClick={() => toggleScope(selectedNode.id, scope)}
                        >
                          {scope}
                        </button>
                      ))}
                    </div>
                  </Field>
                </>
              )}

              {selectedNode.data.kind === "condition" && (
                <Field label="Condition expression" className="orch-flow__field">
                  <input
                    className="ds-field orch-flow__input"
                    placeholder='e.g. output.confidence > 0.8'
                    defaultValue="output.confidence > 0.8"
                  />
                </Field>
              )}

              {selectedNode.data.kind === "human" && (
                <p className="orch-flow__drawer-hint">
                  Execution pauses here until a reviewer approves in the UI.
                </p>
              )}

              {selectedNode.data.kind !== "orchestrator" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="!text-red-600"
                  onClick={() => removeNode(selectedNode.id)}
                >
                  Remove node
                </Button>
              )}
            </div>
          )}
        </div>

        <div
          className={cn("orch-flow__visualizer ds-glass", isBuildPhase && "orch-flow__visualizer--collapsed")}
          aria-hidden={isBuildPhase}
        >
          <div className="orch-flow__chat-head">
            <div>
              <h3>Playground</h3>
              <p>Check your workflow here</p>
            </div>
          </div>

          <div className="orch-flow__playground-body">
            <div className="orch-flow__chat-log" ref={chatLogRef}>
              {chat.length === 0 && !sending && (
                <div className="orch-flow__chat-empty">
                  <span className="orch-flow__chat-empty-icon" aria-hidden>
                    <AutoAwesomeRoundedIcon sx={{ fontSize: 20 }} />
                  </span>
                  <h4>Try a test query</h4>
                  <p>Send a prompt to check the workflow in the playground.</p>
                  <div className="orch-flow__sample-chips">
                    {orchPresets.slice(0, 3).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className="orch-flow__sample-chip"
                        onClick={() => sendQuery(p.query)}
                      >
                        <span className="orch-flow__sample-domain">{p.domain}</span>
                        {p.query}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {chat.map((m) =>
                m.role === "user" ? (
                  <div key={m.id} className="orch-flow__row orch-flow__row--user">
                    <div className="orch-flow__bubble orch-flow__bubble--user">{m.text}</div>
                    <span className="orch-flow__avatar" aria-hidden>
                      <PersonRoundedIcon sx={{ fontSize: 14 }} />
                    </span>
                  </div>
                ) : (
                  <div key={m.id} className="orch-flow__row orch-flow__row--agent">
                    <span className="orch-flow__avatar orch-flow__avatar--agent" aria-hidden>
                      <AutoAwesomeRoundedIcon sx={{ fontSize: 14 }} />
                    </span>
                    <div className="orch-flow__bubble orch-flow__bubble--agent">
                      {m.trace && <div className="orch-flow__route">{m.trace}</div>}
                      <div>{m.text}</div>
                      {m.sources && m.sources.length > 0 && (
                        <div className="orch-flow__sources">
                          {m.sources.map((s) => (
                            <span
                              key={`${m.id}-${s.label}`}
                              className="orch-flow__source"
                              title={[s.connector, s.detail].filter(Boolean).join(" — ")}
                            >
                              <DescriptionOutlinedIcon sx={{ fontSize: 11 }} />
                              {s.label}
                            </span>
                          ))}
                        </div>
                      )}
                      {m.followUps && m.followUps.length > 0 && (
                        <div className="orch-flow__followups">
                          {m.followUps.map((f) => (
                            <button
                              key={f}
                              type="button"
                              className="orch-flow__followup"
                              onClick={() => sendQuery(f)}
                              disabled={sending}
                            >
                              {f}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ),
              )}

              {sending && (
                <div className="orch-flow__row orch-flow__row--agent">
                  <span className="orch-flow__avatar orch-flow__avatar--agent" aria-hidden>
                    <AutoAwesomeRoundedIcon sx={{ fontSize: 14 }} />
                  </span>
                  <div className="orch-flow__bubble orch-flow__bubble--agent">
                    <span className="orch-flow__typing" aria-label="Running workflow">
                      <span />
                      <span />
                      <span />
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="orch-flow__composer">
              <input
                className="ds-field orch-flow__composer-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendCustom()}
                placeholder="Type a test prompt…"
                disabled={sending}
              />
              <Button
                variant="primary"
                size="sm"
                onClick={sendCustom}
                disabled={sending || !input.trim()}
              >
                <SendRoundedIcon sx={{ fontSize: 15 }} />
              </Button>
            </div>

            <div className={cn("orch-flow__traces", tracesOpen && "orch-flow__traces--open")}>
              <button
                type="button"
                className="orch-flow__traces-toggle"
                onClick={() => setTracesOpen((v) => !v)}
              >
                <TerminalRoundedIcon sx={{ fontSize: 14 }} />
                Execution traces ({traces.length})
                {tracesOpen ? (
                  <ExpandMoreRoundedIcon sx={{ fontSize: 16 }} />
                ) : (
                  <ExpandLessRoundedIcon sx={{ fontSize: 16 }} />
                )}
              </button>
              {tracesOpen && (
                <div className="orch-flow__traces-log">
                  {traces.length === 0 && (
                    <p className="orch-flow__traces-empty">Run a prompt to see execution traces.</p>
                  )}
                  {traces.map((t) => (
                    <div key={t.id} className={`orch-flow__trace orch-flow__trace--${t.kind}`}>
                      <span className="orch-flow__trace-time">{t.time}</span>
                      <div className="min-w-0">
                        <div className="orch-flow__trace-label">{t.label}</div>
                        {t.detail && <div className="orch-flow__trace-detail">{t.detail}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isBuildPhase && (
        <p className="orch-flow__footer-hint">
          <ChevronLeftRoundedIcon sx={{ fontSize: 14, transform: "rotate(180deg)" }} />
          Use <strong>Add agent</strong> for work, <strong>Add logic</strong> for rules. Then <strong>Save & test</strong> to check in the playground.
        </p>
      )}
    </section>
  );
}

export const StepOrchestration = () => (
  <ReactFlowProvider>
    <OrchestrationStudio />
  </ReactFlowProvider>
);
