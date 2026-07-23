import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import {
  getOrchestrationPresets,
  resolveDemoReply,
  type DemoCitation,
} from "@/data/playground-demo";
import { resolveAgentDeployment, EMPTY_WORKFLOW, type MarketplaceAgent } from "@/data/sample";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { useAgents } from "@/hooks/useAgents";
import { useBuilderStore } from "@/store/builder-store";
import { BranchWorkflowCanvas, type NodeRunStatus } from "../branch-workflow/branch-workflow-canvas";
import { WorkflowStudioModal } from "../workflow-studio-modal";
import { TextInput } from "../wizard-ui";
import {
  addAgentToOrchestration,
  addLinearAgent,
  collectAgentNodes,
  defaultWorkflowTree,
  getOrchestrationNode,
  getParallelAgents,
  hasEndNode,
  resolveExecutionPath,
  treeToWorkflowDefinition,
  type BranchTreeNode,
} from "../branch-workflow/branch-workflow-utils";

type OrchPhase = "build" | "test";

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

function nowLabel() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function AgentPickerModal({
  open,
  agents,
  mode,
  onClose,
  onPick,
}: {
  open: boolean;
  agents: MarketplaceAgent[];
  mode: "parallel" | "linear";
  onClose: () => void;
  onPick: (agentId: string) => void;
}) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) setSearch("");
  }, [open]);

  if (!open) return null;

  const filtered = agents.filter(
    (a) => !search || a.name.toLowerCase().includes(search.toLowerCase()),
  );

  const title = mode === "parallel" ? "Add parallel agent" : "Add agent to chain";

  return (
    <WorkflowStudioModal
      open={open}
      onClose={onClose}
      wide
      eyebrow="Workflow builder"
      title={title}
      titleId="agent-modal-title"
      icon={
        mode === "parallel" ? (
          <AccountTreeOutlinedIcon sx={{ fontSize: 20 }} />
        ) : (
          <SmartToyOutlinedIcon sx={{ fontSize: 20 }} />
        )
      }
    >
      <div className="space-y-3">
        <TextInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search agents…"
          aria-label="Search agents"
        />
        <div className="linear-flow__picker-list">
          {filtered.map((agent) => (
            <button
              key={agent.id}
              type="button"
              className={cn(
                "linear-flow__picker-item",
                mode === "parallel" && "linear-flow__picker-item--parallel",
              )}
              onClick={() => onPick(agent.id)}
            >
              <span
                className={cn(
                  "linear-flow__picker-item-icon",
                  mode === "parallel"
                    ? "linear-flow__picker-item-icon--parallel"
                    : "linear-flow__picker-item-icon--agent",
                )}
                aria-hidden
              >
                {mode === "parallel" ? (
                  <AccountTreeOutlinedIcon sx={{ fontSize: 16 }} />
                ) : (
                  <SmartToyOutlinedIcon sx={{ fontSize: 16 }} />
                )}
              </span>
              <div className="min-w-0 text-left">
                <div className="linear-flow__picker-name">{agent.name}</div>
                <div className="linear-flow__picker-desc">{agent.description.slice(0, 72)}</div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="linear-flow__picker-empty">No agents match this search.</p>
          )}
        </div>
      </div>
    </WorkflowStudioModal>
  );
}

function LinearWorkflowStudio() {
  const deploymentType = useBuilderStore((s) => s.deploymentType);
  const setWorkflowDefinition = useBuilderStore((s) => s.setWorkflowDefinition);
  const setOrchestrationId = useBuilderStore((s) => s.setOrchestrationId);
  const setOrchestrationSaved = useBuilderStore((s) => s.setOrchestrationSaved);
  const setTestRan = useBuilderStore((s) => s.setTestRan);

  const marketplace = useAgents();
  const projectAgents = useMemo(
    () => marketplace.filter((agent) => resolveAgentDeployment(agent) === deploymentType),
    [marketplace, deploymentType],
  );

  const [phase, setPhase] = useState<OrchPhase>("build");
  const [agentPickerOpen, setAgentPickerOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<"parallel" | "linear">("parallel");
  const [pendingParentId, setPendingParentId] = useState<string | null>(null);
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, NodeRunStatus>>({});
  const [playTab, setPlayTab] = useState<"chat" | "history">("chat");
  const [workflowName, setWorkflowName] = useState("Untitled workflow");
  const [dirty, setDirty] = useState(false);
  const [tree, setTree] = useState<BranchTreeNode>(() => defaultWorkflowTree());

  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [traces, setTraces] = useState<TraceEntry[]>([]);

  const chatLogRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  const agentNodes = useMemo(() => collectAgentNodes(tree), [tree]);
  const workflow = useMemo(() => treeToWorkflowDefinition(tree), [tree]);
  const { orchestrator, agents } = workflow;

  const orchNode = useMemo(() => getOrchestrationNode(tree), [tree]);
  const connectedAgentIds = useMemo(
    () => (orchNode ? getParallelAgents(orchNode).map((a) => a.agentId).filter(Boolean) : []),
    [orchNode],
  );
  const availableAgents = useMemo(() => {
    if (pickerMode === "parallel") {
      return projectAgents.filter((a) => !connectedAgentIds.includes(a.id));
    }
    return projectAgents;
  }, [pickerMode, projectAgents, connectedAgentIds]);

  useEffect(() => {
    const el = chatLogRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chat, sending]);

  const setNodeStatus = useCallback((id: string, status: NodeRunStatus) => {
    setNodeStatuses((prev) => ({ ...prev, [id]: status }));
  }, []);

  const resetNodeStatuses = useCallback(() => setNodeStatuses({}), []);

  const markUnsaved = useCallback(() => {
    setDirty(true);
    setOrchestrationSaved(false);
    setTestRan(false);
    setPhase("build");
  }, [setOrchestrationSaved, setTestRan]);

  const syncTree = useCallback(
    (next: BranchTreeNode) => {
      setTree(next);
      setWorkflowDefinition(treeToWorkflowDefinition(next));
      markUnsaved();
    },
    [markUnsaved, setWorkflowDefinition],
  );

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const addAgentFromPicker = (agentId: string) => {
    const agent = marketplace.find((a) => a.id === agentId);
    const parentId = pendingParentId;
    if (!agent || !parentId) return;

    if (pickerMode === "parallel") {
      const orchId = parentId;
      if (connectedAgentIds.includes(agent.id)) {
        toast.error("This agent is already in the parallel group");
        return;
      }
      syncTree(addAgentToOrchestration(tree, orchId, agent));
    } else {
      syncTree(addLinearAgent(tree, parentId, agent));
    }

    toast.success(`Added ${agent.name}`);
    setAgentPickerOpen(false);
    setPendingParentId(null);
  };

  const saveWorkflow = () => {
    if (!orchestrator) {
      toast.error("Add at least one agent before saving");
      return;
    }
    if (agents.length === 0) {
      toast.error("Add at least one agent before saving");
      return;
    }
    if (!hasEndNode(tree)) {
      toast.error("Add an End node to complete the workflow");
      return;
    }
    setOrchestrationId(orchestrator.id);
    setOrchestrationSaved(true);
    setDirty(false);
    toast.success("Workflow saved. Test it in the playground.");
  };

  const runWorkflow = () => {
    if (!orchestrator || agents.length === 0) {
      toast.error("Add at least one agent first");
      return;
    }
    if (!hasEndNode(tree)) {
      toast.error("Add an End node before testing");
      return;
    }
    if (!useBuilderStore.getState().orchestrationSaved) saveWorkflow();
    setPhase("test");
    setChat([]);
    setTraces([]);
    resetNodeStatuses();
    setPlayTab("chat");
  };

  const editWorkflow = () => {
    setPhase("build");
    resetNodeStatuses();
  };

  const startOver = () => {
    const hasWorkflowContent = tree.children.length > 0 || dirty || chat.length > 0 || traces.length > 0;
    if (hasWorkflowContent && !window.confirm("Start over? This clears your workflow and test chat.")) {
      return;
    }

    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];

    const freshTree = defaultWorkflowTree();
    setTree(freshTree);
    setWorkflowDefinition(EMPTY_WORKFLOW);
    setWorkflowName("Untitled workflow");
    setDirty(false);
    setOrchestrationId("");
    setOrchestrationSaved(false);
    setTestRan(false);
    setPhase("build");
    setChat([]);
    setTraces([]);
    setInput("");
    setSending(false);
    resetNodeStatuses();
    setAgentPickerOpen(false);
    setPendingParentId(null);
    setPlayTab("chat");
    toast.success("Workflow reset");
  };

  const orchPresets = useMemo(() => getOrchestrationPresets(), []);

  const pushTrace = (entry: Omit<TraceEntry, "id" | "time">) => {
    setTraces((prev) => [...prev, { ...entry, id: `t-${Date.now()}-${prev.length}`, time: nowLabel() }]);
  };

  const sendQuery = (query: string) => {
    const q = query.trim();
    if (!q || sending || phase !== "test" || !orchestrator) return;

    setChat((prev) => [...prev, { id: `u-${Date.now()}`, role: "user", text: q, time: nowLabel() }]);
    setInput("");
    setSending(true);

    const reply = resolveDemoReply(q, { orchestrated: true });
    const preset = orchPresets.find((p) => p.query.toLowerCase() === q.toLowerCase());
    const executionPath = resolveExecutionPath(tree, q);
    const target =
      agents.find((a) => preset && a.agentId === preset.agentId) ??
      agents.find((a) => reply.trace?.toLowerCase().includes(a.name.toLowerCase())) ??
      agents[agents.length - 1] ??
      agents[0];

    const schedule = (fn: () => void, ms: number) => {
      timers.current.push(window.setTimeout(fn, ms));
    };

    resetNodeStatuses();
    pushTrace({ kind: "prompt", label: "User prompt received", detail: q });

    const stepMs = 280;
    executionPath.forEach((nodeId, index) => {
      schedule(() => {
        if (index > 0) setNodeStatus(executionPath[index - 1], "done");
        setNodeStatus(nodeId, "active");
        const node = agentNodes.find((a) => a.id === nodeId);
        if (node) {
          pushTrace({
            kind: index === 1 ? "prompt" : "route",
            label: index === 1 ? `Prompt → ${node.label}` : `Routing → ${node.label}`,
            detail: node.subtitle || "Executing workflow step",
          });
        }
      }, index * stepMs);
    });

    const finishMs = executionPath.length * stepMs + 400;
    schedule(() => {
      executionPath.forEach((id) => setNodeStatus(id, "done"));
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
        label: `${target?.name ?? "Agent"} responded`,
        detail: `${(preset?.cites ?? reply.sources)?.length ?? 0} sources · answer streamed to playground`,
      });
      setSending(false);
      setTestRan(true);
      setOrchestrationId(orchestrator.id);
    }, finishMs);
  };

  const isBuildPhase = phase === "build";

  return (
    <section className="orch-flow">
      <div
        className={cn(
          "orch-flow__layout",
          isBuildPhase ? "orch-flow__layout--build" : "orch-flow__layout--test",
        )}
      >
        <div className="orch-flow__studio ds-glass">
          <header className="orch-flow__studio-head">
            <div className="orch-flow__head-copy">
              {isBuildPhase ? (
                <h2 className="orch-flow__title">Build workflow</h2>
              ) : (
                <div className="orch-flow__workflow-title-field">
                  <input
                    className="orch-flow__workflow-title"
                    value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)}
                    placeholder="Untitled workflow"
                    aria-label="Workflow title"
                  />
                  <EditOutlinedIcon className="orch-flow__workflow-title-icon" sx={{ fontSize: 15 }} aria-hidden />
                </div>
              )}
            </div>
            {isBuildPhase ? (
              <div className="orch-flow__bar-actions">
                <Button
                  variant="secondary"
                  size="sm"
                  className="orch-flow__bar-btn orch-flow__btn-add"
                  onClick={startOver}
                >
                  <RestartAltRoundedIcon sx={{ fontSize: 16 }} />
                  Start over
                </Button>
                <Button variant="primary" size="sm" className="orch-flow__bar-btn orch-flow__bar-btn--primary" onClick={runWorkflow}>
                  <PlayArrowRoundedIcon sx={{ fontSize: 16 }} />
                  Save and test
                </Button>
              </div>
            ) : (
              <div className="orch-flow__bar-actions">
                <Button
                  variant="secondary"
                  size="sm"
                  className="orch-flow__bar-btn orch-flow__btn-add"
                  onClick={startOver}
                >
                  <RestartAltRoundedIcon sx={{ fontSize: 16 }} />
                  Start over
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="orch-flow__bar-btn orch-flow__btn-add orch-flow__btn-add--edit"
                  onClick={editWorkflow}
                >
                  <EditOutlinedIcon sx={{ fontSize: 17 }} />
                  Edit workflow
                </Button>
              </div>
            )}
          </header>
          <div className="orch-flow__studio-body">
            <BranchWorkflowCanvas
              tree={tree}
              onTreeChange={syncTree}
              isBuild={isBuildPhase}
              nodeStatuses={nodeStatuses}
              onSave={saveWorkflow}
              canSave={!!orchestrator && agents.length > 0 && hasEndNode(tree)}
              dirty={dirty}
              onRequestAgentPicker={(parentId, mode) => {
                setPendingParentId(parentId);
                setPickerMode(mode);
                setAgentPickerOpen(true);
              }}
            />
          </div>
        </div>

        {!isBuildPhase && (
          <div className="orch-flow__studio orch-flow__studio--chat ds-glass">
            <header className="orch-flow__studio-head">
              <div className="orch-flow__play-tabs">
                <button
                  type="button"
                  className={cn("orch-flow__play-tab", playTab === "chat" && "orch-flow__play-tab--active")}
                  onClick={() => setPlayTab("chat")}
                >
                  Chat
                </button>
                <button
                  type="button"
                  className={cn("orch-flow__play-tab", playTab === "history" && "orch-flow__play-tab--active")}
                  onClick={() => setPlayTab("history")}
                >
                  History
                </button>
              </div>
            </header>
            <div className="orch-flow__studio-body orch-flow__playground-body">
              {playTab === "chat" ? (
                <>
                  <div className="orch-flow__chat-log" ref={chatLogRef}>
                    {chat.length === 0 && !sending && (
                      <div className="orch-flow__chat-empty">
                        <span className="orch-flow__chat-empty-icon" aria-hidden>
                          <AutoAwesomeRoundedIcon sx={{ fontSize: 20 }} />
                        </span>
                        <h4>Try a test query</h4>
                        <p>Send a prompt to test routing through your workflow branches.</p>
                        <div className="orch-flow__sample-chips">
                          {orchPresets.slice(0, 3).map((p) => (
                            <button key={p.id} type="button" className="orch-flow__sample-chip" onClick={() => sendQuery(p.query)}>
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
                                  <span key={`${m.id}-${s.label}`} className="orch-flow__source" title={[s.connector, s.detail].filter(Boolean).join(" — ")}>
                                    <DescriptionOutlinedIcon sx={{ fontSize: 11 }} />
                                    {s.label}
                                  </span>
                                ))}
                              </div>
                            )}
                            {m.followUps && m.followUps.length > 0 && (
                              <div className="orch-flow__followups">
                                {m.followUps.map((f) => (
                                  <button key={f} type="button" className="orch-flow__followup" onClick={() => sendQuery(f)} disabled={sending}>
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
                      className="orch-flow__composer-input"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendQuery(input)}
                      placeholder="Ask the workflow..."
                      disabled={sending}
                    />
                    <button
                      type="button"
                      className="orch-flow__composer-send"
                      onClick={() => sendQuery(input)}
                      disabled={sending || !input.trim()}
                      aria-label="Send message"
                    >
                      <SendRoundedIcon sx={{ fontSize: 14 }} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="orch-flow__history-log">
                  {traces.length === 0 && chat.length === 0 && (
                    <div className="orch-flow__chat-empty">
                      <h4>No runs yet</h4>
                      <p>Execution traces and routing steps appear here after you test the workflow.</p>
                    </div>
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
        )}
      </div>

      <AgentPickerModal
        open={agentPickerOpen}
        agents={availableAgents}
        mode={pickerMode}
        onClose={() => {
          setAgentPickerOpen(false);
          setPendingParentId(null);
        }}
        onPick={addAgentFromPicker}
      />
    </section>
  );
}

export const StepOrchestration = () => <LinearWorkflowStudio />;
