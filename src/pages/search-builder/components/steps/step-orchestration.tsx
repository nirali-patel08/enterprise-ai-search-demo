import { useEffect, useMemo, useRef, useState } from "react";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import {
  getOrchestrationPresets,
  resolveDemoReply,
  type DemoCitation,
} from "@/data/playground-demo";
import {
  DEFAULT_ORCH_GRAPH,
  ORCH_SCOPES,
  ORCH_VALIDATION_ROWS,
  ORCHESTRATION_OPTIONS,
  type OrchGraphNode,
  type OrchScope,
  type OrchValidationRow,
} from "@/data/sample";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { useAgents } from "@/hooks/useAgents";
import { useBuilderStore } from "@/store/builder-store";
import { Field, Textarea, WizardPanel } from "../wizard-ui";

type StudioView = "orchestrate" | "use" | "validate";

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

const STUDIO_TABS: { id: StudioView; label: string; n: number; hint: string }[] = [
  { id: "orchestrate", label: "Orchestrate agents", n: 1, hint: "Connect specialist agents on the canvas" },
  { id: "use", label: "Use", n: 2, hint: "Ask sample Contoso questions and check routing" },
  { id: "validate", label: "Validate", n: 3, hint: "Confirm every agent stays in its data scope" },
];

function nowLabel() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function StatusChip({ status }: { status: OrchValidationRow["retrieval"] }) {
  const label = status === "pass" ? "Pass" : status === "warn" ? "Review" : "Fail";
  return (
    <span className={cn("orch-studio__chip", `orch-studio__chip--${status}`)}>{label}</span>
  );
}

export const StepOrchestration = () => {
  const deploymentType = useBuilderStore((s) => s.deploymentType);
  const orchestrationId = useBuilderStore((s) => s.orchestrationId);
  const selectedAgentIds = useBuilderStore((s) => s.selectedAgentIds);
  const setOrchestrationId = useBuilderStore((s) => s.setOrchestrationId);
  const setTestRan = useBuilderStore((s) => s.setTestRan);

  const marketplace = useAgents();
  const patterns = ORCHESTRATION_OPTIONS.filter(
    (o) => o.deployment === deploymentType || o.deployment === "both",
  );

  const [view, setView] = useState<StudioView>("orchestrate");
  const [selectedNodeId, setSelectedNodeId] = useState("supervisor");
  const [graph, setGraph] = useState<OrchGraphNode[]>(DEFAULT_ORCH_GRAPH);
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [validating, setValidating] = useState(false);
  const [valRows, setValRows] = useState<OrchValidationRow[]>(ORCH_VALIDATION_ROWS);
  const [readyPct, setReadyPct] = useState(90);
  const [readyLabel, setReadyLabel] = useState("1 warning to review before rollout");
  const chatLogRef = useRef<HTMLDivElement>(null);
  const replyTimer = useRef<number | null>(null);

  useEffect(() => {
    const valid = patterns.some((p) => p.id === orchestrationId);
    if ((!orchestrationId || !valid) && patterns[0]) {
      setOrchestrationId(patterns[0].id);
    }
  }, [orchestrationId, patterns, setOrchestrationId]);

  useEffect(() => {
    const el = chatLogRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chat, sending]);

  useEffect(() => {
    return () => {
      if (replyTimer.current) window.clearTimeout(replyTimer.current);
    };
  }, []);

  /** Contoso routing graph — specialists from studio + any agents added from marketplace. */
  const activeWorkers = useMemo(() => graph.filter((n) => n.kind === "worker"), [graph]);

  const supervisor = graph.find((n) => n.kind === "supervisor")!;
  const queryNode = graph.find((n) => n.kind === "query")!;
  const selectedNode = graph.find((n) => n.id === selectedNodeId) ?? supervisor;

  const updateNode = (id: string, patch: Partial<OrchGraphNode>) => {
    setGraph((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  };

  const toggleScope = (id: string, scope: OrchScope) => {
    const node = graph.find((n) => n.id === id);
    if (!node || node.kind === "query") return;
    const scopes = node.scopes.includes(scope)
      ? node.scopes.filter((s) => s !== scope)
      : [...node.scopes, scope];
    updateNode(id, { scopes });
  };

  const orchPresets = useMemo(() => getOrchestrationPresets(), []);

  const sendQuery = (query: string) => {
    const q = query.trim();
    if (!q || sending) return;

    const userMsg: ChatMsg = {
      id: `u-${Date.now()}`,
      role: "user",
      text: q,
      time: nowLabel(),
    };
    setChat((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    if (replyTimer.current) window.clearTimeout(replyTimer.current);
    replyTimer.current = window.setTimeout(() => {
      const reply = resolveDemoReply(q, { orchestrated: true });
      const preset = orchPresets.find((p) => p.query.toLowerCase() === q.toLowerCase());
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
      setSending(false);
      setTestRan(true);
      if (!orchestrationId && patterns[0]) setOrchestrationId(patterns[0].id);
    }, 650);
  };

  const sendCustom = () => sendQuery(input);

  const runValidation = () => {
    setValidating(true);
    window.setTimeout(() => {
      setValRows((rows) =>
        rows.map((r) =>
          r.agentId === "engineering-drawing-agent" ? { ...r, citations: "pass" } : r,
        ),
      );
      setReadyPct(97);
      setReadyLabel("1 item still needs review");
      setValidating(false);
      setTestRan(true);
      toast.success("Validation suite completed");
    }, 900);
  };

  const addWorkerFromSelected = () => {
    const used = new Set(graph.filter((n) => n.agentId).map((n) => n.agentId));
    const next = marketplace.find((a) => selectedAgentIds.includes(a.id) && !used.has(a.id));
    if (!next) {
      toast.error("Select another agent in the previous step first");
      return;
    }
    const node: OrchGraphNode = {
      id: next.id,
      kind: "worker",
      agentId: next.id,
      label: next.name,
      role: "Worker node",
      sub: next.description.slice(0, 42),
      model: next.model ?? "gpt-4o-mini",
      instructions: next.instructions ?? next.description,
      scopes: ["Policies"],
    };
    setGraph((prev) => [...prev, node]);
    setSelectedNodeId(node.id);
    toast.success(`Added ${next.name} to the graph`);
  };

  const ringDeg = Math.round((readyPct / 100) * 360);
  const activeTab = STUDIO_TABS.find((t) => t.id === view) ?? STUDIO_TABS[0];
  const tabIndex = STUDIO_TABS.findIndex((t) => t.id === view);

  const goPrev = () => {
    if (tabIndex > 0) setView(STUDIO_TABS[tabIndex - 1].id);
  };

  const goNext = () => {
    if (tabIndex < STUDIO_TABS.length - 1) setView(STUDIO_TABS[tabIndex + 1].id);
  };

  return (
    <section className="orch-studio">
      <div className="orch-studio__chrome">
        <div className="orch-studio__intro">
          <h2 className="orch-studio__title">Agent orchestration studio</h2>
        </div>

        {patterns.length > 1 && (
          <div className="orch-studio__pattern">
            {patterns.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setOrchestrationId(opt.id)}
                className={cn(
                  "orch-studio__pattern-card ds-glass-option",
                  orchestrationId === opt.id && "ds-glass-option--selected",
                )}
              >
                <div className="orch-studio__pattern-name">{opt.name}</div>
                <div className="orch-studio__pattern-desc">{opt.description}</div>
              </button>
            ))}
          </div>
        )}

        <div className="orch-studio__steps">
          <div className="orch-studio__steps-row">
            <div className="orch-studio__tabs ds-cat-tabs ds-cat-tabs--pill" role="tablist" aria-label="Orchestration studio view">
              {STUDIO_TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={view === t.id}
                  onClick={() => setView(t.id)}
                  className={cn("ds-cat-tab", view === t.id && "ds-cat-tab--active")}
                >
                  <span className="ds-cat-tab__count">{t.n}</span>
                  {t.label}
                </button>
              ))}
            </div>

            <div className="orch-studio__pager" aria-label="Step navigation">
              <button
                type="button"
                className="orch-studio__pager-btn"
                onClick={goPrev}
                disabled={tabIndex <= 0}
                aria-label="Previous step"
              >
                <ChevronLeftRoundedIcon sx={{ fontSize: 18 }} />
              </button>
              <span className="orch-studio__pager-num">
                {tabIndex + 1}
                <span className="orch-studio__pager-of">/{STUDIO_TABS.length}</span>
              </span>
              <button
                type="button"
                className="orch-studio__pager-btn"
                onClick={goNext}
                disabled={tabIndex >= STUDIO_TABS.length - 1}
                aria-label="Next step"
              >
                <ChevronRightRoundedIcon sx={{ fontSize: 18 }} />
              </button>
            </div>
          </div>
        </div>
        <p className="orch-studio__step-hint">{activeTab.hint}</p>
      </div>

      <div className="orch-studio__body">
        {view === "orchestrate" && (
          <div className="orch-studio__grid">
            <WizardPanel
              className="orch-studio__canvas !p-4"
              bodyClassName="flex min-h-0 flex-1 flex-col overflow-hidden"
            >
              <div className="orch-studio__canvas-head">
                <div>
                  <h3>Routing canvas</h3>
                  <span className="orch-studio__canvas-hint">Click a node to configure it</span>
                </div>
                <Button variant="secondary" size="sm" onClick={addWorkerFromSelected}>
                  + Add agent
                </Button>
              </div>

              <div className="orch-studio__flow">
                <button
                  type="button"
                  className={cn(
                    "orch-studio__node orch-studio__node--query",
                    selectedNodeId === "query" && "orch-studio__node--selected",
                  )}
                  onClick={() => setSelectedNodeId("query")}
                >
                  <span className="orch-studio__node-name">{queryNode.label}</span>
                </button>

                <span className="orch-studio__connector" aria-hidden />

                <button
                  type="button"
                  className={cn(
                    "orch-studio__node orch-studio__node--supervisor",
                    selectedNodeId === supervisor.id && "orch-studio__node--selected",
                  )}
                  onClick={() => setSelectedNodeId(supervisor.id)}
                >
                  <div className="orch-studio__node-role">{supervisor.role}</div>
                  <div className="orch-studio__node-name">{supervisor.label}</div>
                </button>

                {activeWorkers.length > 0 && (
                  <>
                    <div className="orch-studio__fan" aria-hidden>
                      <span className="orch-studio__fan-stem" />
                      <span className="orch-studio__fan-bar" />
                      <div className="orch-studio__fan-legs">
                        {activeWorkers.map((w) => (
                          <span key={w.id} className="orch-studio__fan-leg" />
                        ))}
                      </div>
                    </div>

                    <div className="orch-studio__workers">
                      {activeWorkers.map((w) => (
                        <button
                          key={w.id}
                          type="button"
                          className={cn(
                            "orch-studio__node orch-studio__node--worker",
                            selectedNodeId === w.id && "orch-studio__node--selected",
                          )}
                          onClick={() => setSelectedNodeId(w.id)}
                        >
                          <div className="orch-studio__node-role">{w.role}</div>
                          <div className="orch-studio__node-name">{w.label}</div>
                          {w.sub && <div className="orch-studio__node-sub">{w.sub}</div>}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </WizardPanel>

            <WizardPanel
              className="orch-studio__props !p-3 sm:!p-4"
              bodyClassName="min-h-0"
            >
              <h4>{selectedNode.label}</h4>
              {selectedNode.kind === "query" ? (
                <p className="orch-studio__props-hint">
                  The raw text a Contoso employee types — no configuration, just the entry point into the
                  routing graph.
                </p>
              ) : (
                <div className="orch-studio__props-fields">
                  <Field label="Role" className="orch-studio__field">
                    <input className="ds-field orch-studio__input" value={selectedNode.role} readOnly />
                  </Field>
                  <Field label="Model" className="orch-studio__field">
                    <select
                      className="ds-field orch-studio__input"
                      value={selectedNode.model ?? "gpt-4o-mini"}
                      onChange={(e) => updateNode(selectedNode.id, { model: e.target.value })}
                    >
                      <option value="gpt-4o">gpt-4o</option>
                      <option value="gpt-4o-mini">gpt-4o-mini</option>
                      <option value="gpt-5">gpt-5</option>
                    </select>
                  </Field>
                  <Field label="Instructions" className="orch-studio__field">
                    <Textarea
                      rows={3}
                      className="orch-studio__textarea"
                      value={selectedNode.instructions ?? ""}
                      onChange={(e) => updateNode(selectedNode.id, { instructions: e.target.value })}
                    />
                  </Field>
                  <Field label="Data scope" className="orch-studio__field">
                    <div className="orch-studio__scope-tags">
                      {ORCH_SCOPES.map((scope) => (
                        <button
                          key={scope}
                          type="button"
                          className={cn(
                            "orch-studio__scope-tag",
                            selectedNode.scopes.includes(scope) && "orch-studio__scope-tag--on",
                          )}
                          onClick={() => toggleScope(selectedNode.id, scope)}
                        >
                          {scope}
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>
              )}
            </WizardPanel>
          </div>
        )}

        {view === "use" && (
          <div className="orch-studio__use">
            <WizardPanel
              className="orch-studio__chat !p-0"
              bodyClassName="flex min-h-0 flex-1 flex-col overflow-hidden"
            >
              

              <div className="orch-studio__chat-log" ref={chatLogRef}>
                {chat.length === 0 && !sending && (
                  <div className="orch-studio__chat-empty">
                    <span className="orch-studio__chat-empty-icon" aria-hidden>
                      <AutoAwesomeRoundedIcon sx={{ fontSize: 22 }} />
                    </span>
                    <h4>Try a sample question</h4>
                    <p>Short Contoso queries with real indexed documents behind them.</p>
                    <div className="orch-studio__sample-chips">
                      {orchPresets.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          className="orch-studio__sample-chip"
                          onClick={() => sendQuery(p.query)}
                        >
                          <span className="orch-studio__sample-chip-domain">{p.domain}</span>
                          {p.query}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {chat.map((m) =>
                  m.role === "user" ? (
                    <div key={m.id} className="orch-studio__row orch-studio__row--user">
                      <div className="orch-studio__bubble orch-studio__bubble--user">{m.text}</div>
                      <span className="orch-studio__avatar orch-studio__avatar--user" aria-hidden>
                        <PersonRoundedIcon sx={{ fontSize: 15 }} />
                      </span>
                    </div>
                  ) : (
                    <div key={m.id} className="orch-studio__row orch-studio__row--agent">
                      <span className="orch-studio__avatar orch-studio__avatar--agent" aria-hidden>
                        <AutoAwesomeRoundedIcon sx={{ fontSize: 15 }} />
                      </span>
                      <div className="orch-studio__bubble orch-studio__bubble--agent">
                        {m.trace && <div className="orch-studio__route">{m.trace}</div>}
                        <div className="orch-studio__answer">{m.text}</div>

                        {m.sources && m.sources.length > 0 && (
                          <div className="orch-studio__sources">
                            <div className="orch-studio__sources-label">Sources ({m.sources.length})</div>
                            <div className="orch-studio__source-list">
                              {m.sources.map((s) => (
                                <span
                                  key={`${m.id}-${s.label}`}
                                  className="orch-studio__source"
                                  title={[s.connector, s.detail].filter(Boolean).join(" — ")}
                                >
                                  <DescriptionOutlinedIcon sx={{ fontSize: 12 }} />
                                  {s.label}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="orch-studio__msg-meta">
                          <span>{m.time}</span>
                          {m.meta && <span>{m.meta}</span>}
                        </div>

                        {m.followUps && m.followUps.length > 0 && (
                          <div className="orch-studio__followups">
                            {m.followUps.map((f) => (
                              <button
                                key={f}
                                type="button"
                                className="orch-studio__followup"
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
                  <div className="orch-studio__row orch-studio__row--agent">
                    <span className="orch-studio__avatar orch-studio__avatar--agent" aria-hidden>
                      <AutoAwesomeRoundedIcon sx={{ fontSize: 15 }} />
                    </span>
                    <div className="orch-studio__bubble orch-studio__bubble--agent">
                      <span className="orch-studio__typing" aria-label="Thinking">
                        <span />
                        <span />
                        <span />
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {chat.length > 0 && (
                <div className="orch-studio__sample-row">
                  {orchPresets.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className="orch-studio__sample-pill"
                      onClick={() => sendQuery(p.query)}
                      disabled={sending}
                    >
                      {p.domain}
                    </button>
                  ))}
                </div>
              )}

              <div className="orch-studio__composer">
                <input
                  className="ds-field orch-studio__composer-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendCustom()}
                  placeholder="Ask a short Contoso question…"
                  disabled={sending}
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={sendCustom}
                  disabled={sending || !input.trim()}
                >
                  <SendRoundedIcon sx={{ fontSize: 16 }} />
                  Send
                </Button>
              </div>
            </WizardPanel>
          </div>
        )}

        {view === "validate" && (
          <div className="orch-studio__validate">
            <div className="orch-studio__val-top">
              <div className="orch-studio__readiness">
                <div
                  className="orch-studio__ring"
                  style={{
                    background: `conic-gradient(#2bbe7b 0deg, #2bbe7b ${ringDeg}deg, rgba(0,0,0,0.08) ${ringDeg}deg)`,
                  }}
                >
                  <span className="orch-studio__ring-inner">{readyPct}%</span>
                </div>
                <div>
                  <span className="orch-studio__ready-title">Ready to publish</span>
                  <span className="orch-studio__ready-sub">{readyLabel}</span>
                </div>
              </div>
              <Button variant="primary" size="sm" loading={validating} onClick={runValidation}>
                Run validation suite
              </Button>
            </div>

            <WizardPanel
              className="orch-studio__val-table !p-0 overflow-hidden"
              bodyClassName="min-h-0 flex-1 overflow-auto"
            >
              <table className="ds-table w-full min-w-[640px]">
                <thead>
                  <tr>
                    <th>Agent</th>
                    <th>Retrieval</th>
                    <th>Citations</th>
                    <th>Routing accuracy</th>
                    <th>Scope isolation</th>
                  </tr>
                </thead>
                <tbody>
                  {valRows.map((r) => (
                    <tr key={r.agentId}>
                      <td>
                        <div className="orch-studio__agent-cell">
                          <span className="orch-studio__agent-dot">{r.name[0]}</span>
                          {r.name}
                        </div>
                      </td>
                      <td>
                        <StatusChip status={r.retrieval} />
                      </td>
                      <td>
                        <StatusChip status={r.citations} />
                      </td>
                      <td>
                        <StatusChip status={r.routing} />
                      </td>
                      <td>
                        <StatusChip status={r.scope} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </WizardPanel>

            <div className="orch-studio__val-badges">
              <Badge variant="success">Retrieval</Badge>
              <Badge variant="success">Citations</Badge>
              <Badge variant="warning">Routing</Badge>
              <Badge variant="success">Scope isolation</Badge>
              <Badge variant="outline">Observability ready</Badge>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
