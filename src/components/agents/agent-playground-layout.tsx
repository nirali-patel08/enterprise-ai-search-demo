import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AttachFileRoundedIcon from "@mui/icons-material/AttachFileRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ThumbUpOffAltRoundedIcon from "@mui/icons-material/ThumbUpOffAltRounded";
import ThumbDownOffAltRoundedIcon from "@mui/icons-material/ThumbDownOffAltRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import createAgentBoxBg from "@/assets/module/create-agent/create_agent_box_bg.svg";
import { getPresetsForAgent, resolveDemoReply, type DemoCitation } from "@/data/playground-demo";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/ui/page-shell";
import { Field, Textarea, TextInput } from "@/pages/search-builder/components/wizard-ui";
import { cn } from "@/lib/utils";
import "@/pages/agents/agent-playground.scss";

const CREATE_MODES = [
  { id: "build", label: "Build", type: "prompt" as const },
  { id: "code", label: "Code", type: "workflow" as const },
  { id: "external", label: "Link", type: "external" as const },
];

const SEARCH_INDEXES = ["byod-index", "document-library-index", "engineering-tables", "tech-docs-index"];

export type AgentPlaygroundMode = (typeof CREATE_MODES)[number]["id"];

export interface AgentPlaygroundValues {
  name: string;
  description: string;
  instructions: string;
  searchIndex: string;
  externalUrl: string;
  mode: AgentPlaygroundMode;
}

interface AgentPlaygroundLayoutProps {
  variant: "create" | "detail";
  agentId?: string;
  values: AgentPlaygroundValues;
  onChange: <K extends keyof AgentPlaygroundValues>(key: K, value: AgentPlaygroundValues[K]) => void;
  onSave?: () => void;
  onPublish?: () => void;
}

type ChatMsg = {
  id: string;
  role: "user" | "agent";
  text: string;
  trace?: string;
  sources?: DemoCitation[];
  followUps?: string[];
  meta?: string;
  time: string;
};

function nowLabel() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="agent-playground__section ds-glass">
      <button type="button" className="agent-playground__section-toggle" onClick={() => setOpen((v) => !v)}>
        <span className="agent-playground__section-title">{title}</span>
        {open ? (
          <ExpandLessRoundedIcon sx={{ fontSize: 20, color: "rgba(0,0,0,0.45)" }} />
        ) : (
          <ExpandMoreRoundedIcon sx={{ fontSize: 20, color: "rgba(0,0,0,0.45)" }} />
        )}
      </button>
      {open && <div className="agent-playground__section-body">{children}</div>}
    </section>
  );
}

export function AgentPlaygroundLayout({
  variant,
  agentId,
  values,
  onChange,
  onSave,
  onPublish,
}: AgentPlaygroundLayoutProps) {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [sending, setSending] = useState(false);
  const [showDetailsId, setShowDetailsId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, "up" | "down">>({});

  const logRef = useRef<HTMLDivElement>(null);

  const selectedMode = CREATE_MODES.find((m) => m.id === values.mode) ?? CREATE_MODES[0];
  const displayName = values.name.trim() || "New agent";
  const presets = useMemo(
    () => getPresetsForAgent(agentId, values.searchIndex),
    [agentId, values.searchIndex],
  );

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [chat, sending]);

  const sendQuery = async (query: string) => {
    const q = query.trim();
    if (!q || sending) return;
    setMessage("");
    setSending(true);
    const userId = `u-${Date.now()}`;
    setChat((prev) => [...prev, { id: userId, role: "user", text: q, time: nowLabel() }]);
    await new Promise((r) => window.setTimeout(r, 550));
    const reply = resolveDemoReply(q, {
      agentId,
      searchIndex: values.searchIndex,
      orchestrated: selectedMode.type === "workflow",
    });
    setChat((prev) => [
      ...prev,
      {
        id: `a-${Date.now()}`,
        role: "agent",
        text: reply.answer,
        trace: reply.trace,
        sources: reply.sources,
        followUps: reply.followUps,
        meta: reply.meta,
        time: nowLabel(),
      },
    ]);
    setSending(false);
  };

  const copyMessage = (msg: ChatMsg) => {
    const sourceLine = msg.sources?.length
      ? `\n\nSources: ${msg.sources.map((s) => s.label).join(", ")}`
      : "";
    navigator.clipboard?.writeText(`${msg.text}${sourceLine}`);
    setCopiedId(msg.id);
    window.setTimeout(() => setCopiedId((id) => (id === msg.id ? null : id)), 1500);
  };

  return (
    <PageShell className="agent-playground-page !px-6">
      <div className="agent-playground">
      <div className="agent-playground__header">
        <Link
          to="/agents"
          className="inline-flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-text-primary"
        >
          <ChevronLeftRoundedIcon sx={{ fontSize: 18 }} />
          Agents
        </Link>

        {variant === "detail" ? (
          <h1 className="agent-playground__name">{displayName}</h1>
        ) : (
          <input
            id="agent-title"
            className="agent-playground__name-input"
            value={values.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="Agent name"
            aria-label="Agent name"
          />
        )}

        <div className="agent-playground__actions">
          <Button variant="secondary" size="sm" onClick={onSave}>
            Save
          </Button>
          <Button variant="primary" size="sm" onClick={onPublish}>
            Publish
          </Button>
        </div>
      </div>

      <div className="ds-wizard-stage agent-playground__stage">
        <img src={createAgentBoxBg} alt="" aria-hidden="true" className="ds-wizard-stage__bg" />
        <div className="ds-wizard-stage__body agent-playground__stage-body">
          <div className="agent-playground__workspace">
            <aside className="agent-playground__config">
              {selectedMode.type === "external" ? (
                <CollapsibleSection title="Connection">
                  <Field label="External agent endpoint" htmlFor="external-url">
                    <TextInput
                      id="external-url"
                      value={values.externalUrl}
                      onChange={(e) => onChange("externalUrl", e.target.value)}
                      placeholder="https://api.contoso.com/agents/procurement"
                    />
                  </Field>
                </CollapsibleSection>
              ) : (
                <CollapsibleSection title="Instructions">
                  {selectedMode.type === "workflow" ? (
                    <Field label="Workflow definition" htmlFor="workflow-definition">
                      <Textarea
                        id="workflow-definition"
                        rows={8}
                        value={values.instructions}
                        onChange={(e) => onChange("instructions", e.target.value)}
                        placeholder="Describe routing logic or paste workflow YAML"
                      />
                    </Field>
                  ) : (
                    <Field label="System instructions" htmlFor="instructions">
                      <Textarea
                        id="instructions"
                        rows={8}
                        value={values.instructions}
                        onChange={(e) => onChange("instructions", e.target.value)}
                        placeholder="You are an enterprise search assistant. Answer using indexed documents only."
                      />
                    </Field>
                  )}
                </CollapsibleSection>
              )}

              {selectedMode.type === "prompt" && (
                <CollapsibleSection title="Tools">
                  <p className="agent-playground__hint !mt-0">
                    Connect tools to your agent for faster access to key information and actions.
                  </p>
                  <div className="agent-playground__tool-card mt-3">
                    <div className="agent-playground__tool-head">
                      <span className="agent-playground__tool-icon" aria-hidden>
                        <SearchRoundedIcon sx={{ fontSize: 16 }} />
                      </span>
                      Enterprise Search
                    </div>
                    <select
                      className="ds-field"
                      value={values.searchIndex}
                      onChange={(e) => onChange("searchIndex", e.target.value)}
                      aria-label="Search index"
                    >
                      {SEARCH_INDEXES.map((index) => (
                        <option key={index} value={index}>
                          {index}
                        </option>
                      ))}
                    </select>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button variant="secondary" size="sm">
                        Add
                        <KeyboardArrowDownRoundedIcon sx={{ fontSize: 16 }} />
                      </Button>
                      <Button variant="outline" size="sm">
                        Upload files
                      </Button>
                    </div>
                  </div>
                </CollapsibleSection>
              )}

              <CollapsibleSection title="Description" defaultOpen={false}>
                <Field label="Agent description" htmlFor="agent-description">
                  <Textarea
                    id="agent-description"
                    rows={3}
                    value={values.description}
                    onChange={(e) => onChange("description", e.target.value)}
                    placeholder="What this agent helps users with"
                  />
                </Field>
              </CollapsibleSection>
            </aside>

            <section className="agent-playground__playground ds-glass">
              <div className="agent-playground__playground-toolbar">
                <div className="agent-playground__playground-tools">
                  <Button variant="ghost" size="icon" aria-label="New chat" onClick={() => setChat([])}>
                    <AddRoundedIcon sx={{ fontSize: 18 }} />
                  </Button>
                </div>
              </div>

              <div className="agent-playground__playground-body">
                <div className="agent-playground__chat-log" ref={logRef}>
                      {chat.length === 0 && (
                        <div className="agent-playground__playground-empty">
                          <span className="agent-playground__welcome-icon" aria-hidden>
                            <AutoAwesomeRoundedIcon sx={{ fontSize: 26 }} />
                          </span>
                          <h2>{displayName}</h2>
                          <p>
                            {values.description.trim() ||
                              "Ask a question and I'll answer from your connected enterprise sources, with the documents I used."}
                          </p>
                          <div className="agent-playground__presets mt-5 w-full max-w-lg text-left">
                            <div className="agent-playground__presets-label">Try asking</div>
                            {presets.map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                className="agent-playground__preset"
                                onClick={() => sendQuery(p.query)}
                              >
                                <b>{p.domain}</b>
                                {p.query}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {chat.map((m) =>
                        m.role === "user" ? (
                          <div key={m.id} className="agent-playground__row agent-playground__row--user">
                            <div className="agent-playground__bubble agent-playground__bubble--user">
                              {m.text}
                            </div>
                            <span className="agent-playground__avatar agent-playground__avatar--user" aria-hidden>
                              <PersonRoundedIcon sx={{ fontSize: 16 }} />
                            </span>
                          </div>
                        ) : (
                          <div key={m.id} className="agent-playground__row agent-playground__row--agent">
                            <span className="agent-playground__avatar agent-playground__avatar--agent" aria-hidden>
                              <AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />
                            </span>
                            <div className="agent-playground__bubble agent-playground__bubble--agent">
                              <div className="agent-playground__answer">{m.text}</div>

                              {m.sources && m.sources.length > 0 && (
                                <div className="agent-playground__sources">
                                  <div className="agent-playground__sources-label">
                                    Sources ({m.sources.length})
                                  </div>
                                  <div className="agent-playground__source-list">
                                    {m.sources.map((s) => (
                                      <span
                                        key={s.label}
                                        className="agent-playground__source"
                                        title={[s.connector, s.detail].filter(Boolean).join(" — ")}
                                      >
                                        <DescriptionOutlinedIcon sx={{ fontSize: 13 }} />
                                        {s.label}
                                        {s.detail && (
                                          <span className="agent-playground__source-detail">{s.detail}</span>
                                        )}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="agent-playground__msg-actions">
                                <button
                                  type="button"
                                  className="agent-playground__msg-action"
                                  onClick={() => copyMessage(m)}
                                  aria-label="Copy answer"
                                >
                                  {copiedId === m.id ? (
                                    <CheckRoundedIcon sx={{ fontSize: 15 }} />
                                  ) : (
                                    <ContentCopyRoundedIcon sx={{ fontSize: 15 }} />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  className={cn(
                                    "agent-playground__msg-action",
                                    feedback[m.id] === "up" && "agent-playground__msg-action--on",
                                  )}
                                  onClick={() => setFeedback((f) => ({ ...f, [m.id]: "up" }))}
                                  aria-label="Good response"
                                >
                                  <ThumbUpOffAltRoundedIcon sx={{ fontSize: 15 }} />
                                </button>
                                <button
                                  type="button"
                                  className={cn(
                                    "agent-playground__msg-action",
                                    feedback[m.id] === "down" && "agent-playground__msg-action--on",
                                  )}
                                  onClick={() => setFeedback((f) => ({ ...f, [m.id]: "down" }))}
                                  aria-label="Bad response"
                                >
                                  <ThumbDownOffAltRoundedIcon sx={{ fontSize: 15 }} />
                                </button>
                                <span className="agent-playground__msg-time">{m.time}</span>
                                {m.trace && (
                                  <button
                                    type="button"
                                    className="agent-playground__details-toggle"
                                    onClick={() =>
                                      setShowDetailsId((id) => (id === m.id ? null : m.id))
                                    }
                                  >
                                    {showDetailsId === m.id ? "Hide details" : "Details"}
                                  </button>
                                )}
                              </div>

                              {showDetailsId === m.id && (m.trace || m.meta) && (
                                <div className="agent-playground__details">
                                  {m.trace && (
                                    <div>
                                      <span className="agent-playground__details-key">Routing</span>
                                      {m.trace}
                                    </div>
                                  )}
                                  {m.meta && (
                                    <div>
                                      <span className="agent-playground__details-key">Retrieval</span>
                                      {m.meta}
                                    </div>
                                  )}
                                </div>
                              )}

                              {m.followUps && m.followUps.length > 0 && (
                                <div className="agent-playground__followups">
                                  {m.followUps.map((f) => (
                                    <button
                                      key={f}
                                      type="button"
                                      className="agent-playground__followup"
                                      onClick={() => sendQuery(f)}
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
                        <div className="agent-playground__row agent-playground__row--agent">
                          <span className="agent-playground__avatar agent-playground__avatar--agent" aria-hidden>
                            <AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />
                          </span>
                          <div className="agent-playground__bubble agent-playground__bubble--agent">
                            <span className="agent-playground__typing" aria-label="Thinking">
                              <span />
                              <span />
                              <span />
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="agent-playground__composer">
                      <div className="agent-playground__composer-row">
                        <Button variant="ghost" size="icon" aria-label="Attach file">
                          <AttachFileRoundedIcon sx={{ fontSize: 18 }} />
                        </Button>
                        <textarea
                          className="ds-field agent-playground__composer-input"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              sendQuery(message);
                            }
                          }}
                          placeholder="Ask about contracts, spend, drawings, policies…"
                          rows={1}
                          disabled={sending}
                        />
                        <Button
                          variant="primary"
                          size="icon"
                          aria-label="Send message"
                          disabled={sending || !message.trim()}
                          onClick={() => sendQuery(message)}
                        >
                          <SendRoundedIcon sx={{ fontSize: 18 }} />
                        </Button>
                      </div>
                      <p className="agent-playground__disclaimer">
                        Demo responses use static sample data · AI-generated content may be incorrect
                      </p>
                    </div>
              </div>
            </section>
          </div>
        </div>
      </div>
      </div>
    </PageShell>
  );
}
