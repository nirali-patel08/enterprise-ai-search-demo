import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Bot,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Database,
  LayoutDashboard,
  Link2,
  Loader2,
  MessageSquare,
  Monitor,
  Rocket,
  Search,
  Send,
  Settings,
  Shield,
  Sparkles,
  X,
} from 'lucide-react'
import {
  ACTION_MODES,
  AGENTS,
  CHANNELS,
  CHAT_RESPONSE,
  CONNECTOR_CONFIG,
  CONNECTORS,
  EXAMPLE_QUESTIONS,
  SIDEBAR_NAV,
  STEPS,
  TEST_RESULT,
} from './data/sample'

type Toast = { id: number; message: string; type: 'success' | 'info' | 'error' }

function ToastStack({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex min-w-[280px] items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg animate-fade-in ${
            t.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : t.type === 'error'
                ? 'border-red-200 bg-red-50 text-red-900'
                : 'border-slate-200 bg-white text-slate-900'
          }`}
        >
          {t.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <Sparkles className="h-4 w-4 shrink-0" />}
          <span className="flex-1">{t.message}</span>
          <button type="button" onClick={() => onDismiss(t.id)} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

function StatusBadge({ status }: { status: 'pass' | 'review' | 'pending' | 'validated' | 'indexing' }) {
  const map = {
    pass: 'bg-emerald-100 text-emerald-700',
    review: 'bg-amber-100 text-amber-700',
    pending: 'bg-slate-100 text-slate-600',
    validated: 'bg-emerald-100 text-emerald-700',
    indexing: 'bg-sky-100 text-sky-700',
  }
  const label = {
    pass: 'Pass',
    review: 'Review',
    pending: 'Pending',
    validated: 'Validated',
    indexing: 'Indexing',
  }
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status]}`}>{label[status]}</span>
}

function Stepper({ step, onStep }: { step: number; onStep: (n: number) => void }) {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex min-w-max gap-2">
        {STEPS.map((s) => {
          const done = s.id < step
          const active = s.id === step
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onStep(s.id)}
              className={`group flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition ${
                active
                  ? 'border-brand-600 bg-brand-50 text-brand-800'
                  : done
                    ? 'border-emerald-200 bg-emerald-50/60 text-emerald-800'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  active
                    ? 'bg-brand-600 text-white'
                    : done
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : s.id}
              </span>
              <span className="hidden sm:block">
                <span className="block text-xs font-semibold">{s.label}</span>
                <span className="block text-[11px] opacity-70">{s.description}</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white lg:block">
      <div className="border-b border-slate-200 px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700 text-xs font-bold text-white">EA</div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Enterprise AI</p>
            <p className="text-xs text-slate-500">Search Platform</p>
          </div>
        </div>
      </div>
      <nav className="space-y-0.5 p-3">
        {SIDEBAR_NAV.map((item) => (
          <button
            key={item}
            type="button"
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
              item === 'AI Search Builder'
                ? 'bg-brand-50 font-medium text-brand-800'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {item === 'Dashboard' && <LayoutDashboard className="h-4 w-4" />}
            {item === 'AI Search Builder' && <Search className="h-4 w-4" />}
            {item === 'AI Chat' && <MessageSquare className="h-4 w-4" />}
            {item === 'Connectors' && <Database className="h-4 w-4" />}
            {item === 'Governance' && <Shield className="h-4 w-4" />}
            {item === 'Admin' && <Settings className="h-4 w-4" />}
            {!['Dashboard', 'AI Search Builder', 'AI Chat', 'Connectors', 'Governance', 'Admin'].includes(item) && (
              <Sparkles className="h-4 w-4" />
            )}
            {item}
          </button>
        ))}
      </nav>
      <div className="mx-3 mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
        <p className="text-xs font-medium text-amber-900">Demo environment</p>
        <p className="mt-1 text-[11px] leading-relaxed text-amber-800">Sample data only. No real connections are made.</p>
      </div>
    </aside>
  )
}

export default function App() {
  const [step, setStep] = useState(1)
  const [connectors, setConnectors] = useState(['sharepoint', 'azure-blob', 's3'])
  const [channels, setChannels] = useState(['web', 'teams'])
  const [agents, setAgents] = useState(['orchestrator', 'contract', 'po', 'invoice'])
  const [activeConnector, setActiveConnector] = useState('sharepoint')
  const [validated, setValidated] = useState<Record<string, boolean>>({ sharepoint: true })
  const [indexing, setIndexing] = useState(false)
  const [indexProgress, setIndexProgress] = useState(100)
  const [testing, setTesting] = useState(false)
  const [testRan, setTestRan] = useState(false)
  const [query, setQuery] = useState('Show contracts, POs and invoices related to ABC Vendor and identify mismatch.')
  const [actionMode, setActionMode] = useState<(typeof ACTION_MODES)[number]>('Search')
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<{ role: 'assistant' | 'user'; text: string }[]>([
    {
      role: 'assistant',
      text: 'Hello. I can search contracts, POs, invoices, policies and enterprise documents. How can I help?',
    },
  ])
  const [rbac, setRbac] = useState(true)
  const [citations, setCitations] = useState(true)
  const [teamsCompat, setTeamsCompat] = useState(true)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [validating, setValidating] = useState(false)
  const [deployed, setDeployed] = useState(false)

  const toast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  const selectedConnectors = useMemo(
    () => CONNECTORS.filter((c) => connectors.includes(c.id)),
    [connectors],
  )

  const validatedCount = connectors.filter((id) => validated[id]).length
  const canContinue = useMemo(() => {
    if (step === 1) return connectors.length > 0
    if (step === 2) return validatedCount === connectors.length
    if (step === 4) return agents.includes('orchestrator')
    if (step === 5) return testRan
    if (step === 6) return channels.length > 0
    return true
  }, [step, connectors.length, validatedCount, agents, testRan, channels.length])

  useEffect(() => {
    if (!indexing) return
    setIndexProgress(12)
    const interval = setInterval(() => {
      setIndexProgress((p) => {
        if (p >= 100) {
          clearInterval(interval)
          setIndexing(false)
          toast('Indexing complete — 12,438 documents indexed', 'success')
          return 100
        }
        return p + 8
      })
    }, 400)
    return () => clearInterval(interval)
  }, [indexing, toast])

  const toggle = (list: string[], id: string, set: (v: string[]) => void) => {
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id])
  }

  const handleValidate = async () => {
    setValidating(true)
    await new Promise((r) => setTimeout(r, 1200))
    setValidated((v) => ({ ...v, [activeConnector]: true }))
    setValidating(false)
    toast(`${CONNECTORS.find((c) => c.id === activeConnector)?.name} connection validated`, 'success')
  }

  const handleTest = async () => {
    setTesting(true)
    setTestRan(false)
    await new Promise((r) => setTimeout(r, 1500))
    setTesting(false)
    setTestRan(true)
    toast('Test query completed — review validation results', 'success')
  }

  const handleDeploy = async () => {
    await new Promise((r) => setTimeout(r, 1000))
    setDeployed(true)
    toast(`Published to ${channels.length} channel(s)`, 'success')
    setStep(7)
  }

  const handleSendChat = () => {
    if (!chatInput.trim()) return
    const userMsg = chatInput.trim()
    setChatMessages((m) => [...m, { role: 'user', text: userMsg }])
    setChatInput('')
    setTimeout(() => {
      setChatMessages((m) => [...m, { role: 'assistant', text: CHAT_RESPONSE }])
    }, 800)
  }

  const channelIcon = (id: string) => {
    if (id === 'web') return <Monitor className="h-5 w-5" />
    if (id === 'teams') return <MessageSquare className="h-5 w-5" />
    if (id === 'copilot') return <Bot className="h-5 w-5" />
    return <Link2 className="h-5 w-5" />
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
          <div className="rounded-2xl bg-gradient-to-r from-brand-800 to-brand-600 px-5 py-5 text-white">
            <h1 className="text-xl font-bold sm:text-2xl">Enterprise AI Search Builder</h1>
            <p className="mt-1 max-w-3xl text-sm text-teal-100">
              Build a multi-source intelligent search platform — select connectors, index content, enable agents, test, and publish to Web, Teams, Copilot or APIs.
            </p>
          </div>
        </header>

        <main className="flex-1 px-4 py-5 sm:px-6">
          <Stepper step={step} onStep={setStep} />

          <div className="mt-5 animate-fade-in">
            {step === 1 && (
              <section className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">1. Data Source Onboarding</h2>
                  <p className="mt-1 text-sm text-slate-500">Select connectors to ingest, process, chunk, embed and index into the enterprise search layer.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <span className="text-sm text-slate-600">
                    <strong className="text-slate-900">{connectors.length}</strong> source{connectors.length !== 1 ? 's' : ''} selected
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="text-sm text-slate-500">Recommended: SharePoint + Blob/S3 for documents</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {CONNECTORS.map((c) => {
                    const on = connectors.includes(c.id)
                    return (
                      <div
                        key={c.id}
                        className={`flex flex-col rounded-2xl border p-4 transition ${
                          on ? 'border-brand-500 bg-brand-50/50 ring-1 ring-brand-200' : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold text-white ${c.color}`}>{c.icon}</div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-slate-900">{c.name}</h3>
                            <p className="mt-1 text-xs leading-relaxed text-slate-500">{c.description}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggle(connectors, c.id, setConnectors)}
                          className={`mt-4 rounded-lg px-3 py-2 text-sm font-medium transition ${
                            on ? 'bg-white text-brand-700 ring-1 ring-brand-200 hover:bg-brand-50' : 'bg-brand-600 text-white hover:bg-brand-700'
                          }`}
                        >
                          {on ? `Remove ${c.name}` : `Add ${c.name}`}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {step === 2 && (
              <section className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">2. Connection & Indexing</h2>
                  <p className="mt-1 text-sm text-slate-500">Configure credentials, validate connections, then start and monitor indexing.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-4">
                  {[
                    { label: 'Sources', value: connectors.length },
                    { label: 'Validated', value: validatedCount },
                    { label: 'Status', value: indexing ? 'Running' : indexProgress === 100 ? 'Complete' : 'Ready' },
                    { label: 'Documents', value: indexProgress === 100 ? '12,438' : '—' },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                      <p className="text-xs text-slate-500">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Connectors</p>
                    {selectedConnectors.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setActiveConnector(c.id)}
                        className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                          activeConnector === c.id ? 'border-brand-500 bg-brand-50' : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <span className="font-medium">{c.name}</span>
                        <StatusBadge status={validated[c.id] ? 'validated' : 'pending'} />
                      </button>
                    ))}
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    {(() => {
                      const c = CONNECTORS.find((x) => x.id === activeConnector)!
                      const fields = CONNECTOR_CONFIG[activeConnector] ?? []
                      return (
                        <div className="grid gap-6 lg:grid-cols-2">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold text-white ${c.color}`}>{c.icon}</div>
                              <h3 className="text-lg font-semibold">{c.name}</h3>
                            </div>
                            <p className="text-sm text-slate-500"><span className="font-medium text-slate-700">Authentication:</span> {c.auth}</p>
                            <p className="text-sm text-slate-500"><span className="font-medium text-slate-700">Supported:</span> {c.description.split(': ')[1] ?? c.description}</p>
                            <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">Credentials are encrypted at rest. RBAC/ACL sync runs after validation.</p>
                          </div>
                          <div className="space-y-3">
                            {fields.map((f) => (
                              <div key={f.label}>
                                <label className="mb-1 block text-xs font-medium text-slate-600">{f.label}</label>
                                <input
                                  defaultValue={f.value}
                                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2"
                                />
                              </div>
                            ))}
                            <div className="flex flex-wrap gap-2 pt-2">
                              <button
                                type="button"
                                onClick={handleValidate}
                                disabled={validating}
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                              >
                                {validating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                Test Connection
                              </button>
                              <button
                                type="button"
                                onClick={handleValidate}
                                disabled={validating}
                                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
                              >
                                Save Configuration
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">Indexing Monitor</h3>
                      <p className="text-sm text-slate-500">{indexing ? 'Processing batch 14/20 — OCR and chunking in progress' : indexProgress === 100 ? 'All validated sources indexed successfully' : 'Ready to start indexing'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={validatedCount < connectors.length || indexing}
                        onClick={() => { setIndexing(true); toast('Indexing started', 'info') }}
                        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                      >
                        Start Indexing
                      </button>
                      <button type="button" onClick={() => setIndexing(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                        Pause
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-brand-600 transition-all duration-300" style={{ width: `${indexProgress}%` }} />
                  </div>
                </div>
              </section>
            )}

            {step === 3 && (
              <section className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">3. Enterprise AI Search Pipeline</h2>
                  <p className="mt-1 text-sm text-slate-500">End-to-end flow from connected sources through indexing to agents and channels.</p>
                </div>
                <div className="flex flex-wrap items-stretch gap-2">
                  {[
                    { title: 'Connected Sources', sub: `${connectors.length} selected`, pills: selectedConnectors.map((c) => c.name), color: 'bg-sky-100 text-sky-700' },
                    { title: 'Ingestion & Processing', sub: 'OCR, parsing, chunking', pills: ['Document Intelligence', 'ETL', 'Embeddings'], color: 'bg-sky-100 text-sky-700' },
                    { title: 'Search Index', sub: 'Hybrid + vector + semantic', pills: ['Azure AI Search'], color: 'bg-emerald-100 text-emerald-700' },
                    { title: 'AI Agents', sub: `${agents.length} configured`, pills: AGENTS.filter((a) => agents.includes(a.id)).map((a) => a.name), color: 'bg-violet-100 text-violet-700' },
                    { title: 'Access Channels', sub: `${channels.length} enabled`, pills: CHANNELS.filter((c) => channels.includes(c.id)).map((c) => c.name), color: 'bg-amber-100 text-amber-700' },
                  ].map((stage, i, arr) => (
                    <div key={stage.title} className="flex items-center gap-2">
                      <div className="min-w-[160px] flex-1 rounded-2xl border border-slate-200 bg-white p-4">
                        <h3 className="text-sm font-semibold">{stage.title}</h3>
                        <p className="text-xs text-slate-500">{stage.sub}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {stage.pills.map((p) => (
                            <span key={p} className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${stage.color}`}>{p}</span>
                          ))}
                        </div>
                      </div>
                      {i < arr.length - 1 && <ChevronRight className="hidden h-4 w-4 shrink-0 text-slate-300 sm:block" />}
                    </div>
                  ))}
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    { title: 'Document Extraction', desc: 'OCR, table extraction, layout analysis via Document Intelligence.', tags: ['OCR enabled', 'Tables'] },
                    { title: 'Chunking & Embeddings', desc: 'Semantic chunking with overlap. Model: text-embedding-3-large.', meta: 'Chunk: 512 tokens · Overlap: 64' },
                    { title: 'Search Index', desc: 'Hybrid retrieval with semantic ranker and vector search.', tags: ['Azure AI Search'] },
                  ].map((card) => (
                    <div key={card.title} className="rounded-2xl border border-slate-200 bg-white p-4">
                      <h3 className="font-semibold text-slate-900">{card.title}</h3>
                      <p className="mt-2 text-sm text-slate-500">{card.desc}</p>
                      {card.meta && <p className="mt-2 text-xs text-slate-400">{card.meta}</p>}
                      {card.tags && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {card.tags.map((t) => (
                            <span key={t} className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {step === 4 && (
              <section className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">4. Select Agent Capabilities</h2>
                  <p className="mt-1 text-sm text-slate-500">Enable specialized agents. Orchestrator routes queries to the right domain experts.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {AGENTS.map((a) => {
                    const on = agents.includes(a.id)
                    return (
                      <div
                        key={a.id}
                        className={`rounded-2xl border p-4 transition ${
                          on ? 'border-brand-500 bg-brand-50/40 ring-1 ring-brand-200' : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                          <Bot className="h-5 w-5 text-brand-700" />
                        </div>
                        <h3 className="text-center font-semibold">{a.name}</h3>
                        {a.required && <p className="mt-1 text-center text-[11px] font-medium text-brand-600">Required</p>}
                        <p className="mt-2 text-center text-xs leading-relaxed text-slate-500">{a.description}</p>
                        <button
                          type="button"
                          disabled={a.required}
                          onClick={() => toggle(agents, a.id, setAgents)}
                          className={`mt-4 w-full rounded-lg py-2 text-sm font-medium ${
                            on ? 'bg-white text-amber-700 ring-1 ring-amber-200 hover:bg-amber-50' : 'bg-brand-600 text-white hover:bg-brand-700'
                          } disabled:cursor-not-allowed disabled:opacity-70`}
                        >
                          {on ? `Remove ${a.name}` : `Add ${a.name}`}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {step === 5 && (
              <section className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">5. Test Enterprise Search</h2>
                  <p className="mt-1 text-sm text-slate-500">Validate retrieval, citations, agent routing, and response quality before deployment.</p>
                </div>
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-brand-500 focus:ring-2"
                />
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700">Action Mode</p>
                  <div className="flex flex-wrap gap-2">
                    {ACTION_MODES.map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setActionMode(mode)}
                        className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                          actionMode === mode ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleTest}
                  disabled={testing}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-70 sm:w-auto sm:px-8"
                >
                  {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Run Test Query
                </button>
                {testRan && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Retrieval Validation</h3>
                        <StatusBadge status={TEST_RESULT.retrieval.status} />
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{TEST_RESULT.retrieval.summary}</p>
                      <p className="mt-1 text-xs text-slate-400">Avg relevance: {TEST_RESULT.retrieval.score}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Agent Routing</h3>
                        <StatusBadge status={TEST_RESULT.routing.status} />
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{TEST_RESULT.routing.summary}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Citations</h3>
                        <StatusBadge status={TEST_RESULT.citations.status} />
                      </div>
                      <ul className="mt-2 space-y-2">
                        {TEST_RESULT.citations.sources.map((s) => (
                          <li key={s.name} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                            <span className="font-medium text-slate-800">{s.name}</span>
                            <span className="text-slate-500"> — {s.detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Response Validation</h3>
                        <StatusBadge status={TEST_RESULT.response.status} />
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">{TEST_RESULT.response.text}</p>
                    </div>
                  </div>
                )}
              </section>
            )}

            {step === 6 && (
              <section className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">6. Deploy to Access Channels</h2>
                  <p className="mt-1 text-sm text-slate-500">Publish the configured search experience to end-user channels.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {CHANNELS.map((ch) => {
                    const on = channels.includes(ch.id)
                    return (
                      <div key={ch.id} className={`rounded-2xl border p-4 ${on ? 'border-brand-500 bg-brand-50/40' : 'border-slate-200 bg-white'}`}>
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-brand-700">{channelIcon(ch.id)}</div>
                        <h3 className="font-semibold">{ch.name}</h3>
                        <p className="mt-1 text-xs text-slate-500">{ch.description}</p>
                        <button
                          type="button"
                          onClick={() => toggle(channels, ch.id, setChannels)}
                          className={`mt-4 w-full rounded-lg py-2 text-sm font-medium ${
                            on ? 'bg-white text-slate-700 ring-1 ring-slate-200' : 'bg-brand-600 text-white hover:bg-brand-700'
                          }`}
                        >
                          {on ? `Disable ${ch.name}` : `Enable ${ch.name}`}
                        </button>
                      </div>
                    )
                  })}
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="font-semibold">Pre-deploy Checklist</h3>
                  <ul className="mt-4 space-y-3">
                    {[
                      { ok: validatedCount === connectors.length, text: 'All connectors validated and indexed' },
                      { ok: agents.length > 0, text: 'At least one agent enabled' },
                      { ok: channels.length > 0, text: 'At least one access channel enabled' },
                      { ok: testRan, text: 'Admin test query passed' },
                    ].map((item) => (
                      <li key={item.text} className="flex items-center gap-2 text-sm">
                        {item.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <CircleAlert className="h-4 w-4 text-amber-500" />}
                        <span className={item.ok ? 'text-slate-700' : 'text-slate-500'}>{item.text}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleDeploy}
                      disabled={!testRan || channels.length === 0 || deployed}
                      className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                    >
                      <Rocket className="h-4 w-4" />
                      {deployed ? 'Published' : `Publish to ${channels.length} channel(s)`}
                    </button>
                  </div>
                </div>
              </section>
            )}

            {step === 7 && (
              <section className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">7. Agentic AI Chat</h2>
                  <p className="mt-1 text-sm text-slate-500">Production chat with orchestrated agents, RBAC filtering, and citations.</p>
                </div>
                <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
                  <div className="flex min-h-[420px] flex-col rounded-2xl border border-slate-200 bg-white">
                    <div className="flex-1 space-y-4 overflow-y-auto p-4">
                      {chatMessages.map((m, i) => (
                        <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white ${m.role === 'user' ? 'bg-slate-600' : 'bg-brand-600'}`}>
                            {m.role === 'user' ? 'You' : 'AI'}
                          </div>
                          <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === 'user' ? 'bg-brand-600 text-white' : 'bg-slate-50 text-slate-800'}`}>
                            {m.text.split('\n').map((line, j) => (
                              <p key={j} className={j > 0 ? 'mt-2' : ''}>
                                {line.split('**').map((part, k) => (k % 2 === 1 ? <strong key={k}>{part}</strong> : part))}
                              </p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-slate-100 p-4">
                      <div className="flex gap-2">
                        <input
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                          placeholder="Ask anything from enterprise knowledge…"
                          className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none ring-brand-500 focus:ring-2"
                        />
                        <button type="button" onClick={handleSendChat} className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white hover:bg-brand-700">
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <h3 className="font-semibold text-slate-900">Chat Settings</h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <p className="text-xs font-medium text-slate-600">Knowledge Scope</p>
                          <div className="mt-2 flex gap-2">
                            <button type="button" className="rounded-full bg-brand-600 px-3 py-1 text-xs font-medium text-white">All Sources</button>
                            <button type="button" className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">Single Source</button>
                          </div>
                        </div>
                        {[
                          { label: 'Apply RBAC / ACL Filter', value: rbac, set: setRbac },
                          { label: 'Use Citations', value: citations, set: setCitations },
                          { label: 'Teams / Copilot Compatible', value: teamsCompat, set: setTeamsCompat },
                        ].map((t) => (
                          <label key={t.label} className="flex items-center justify-between text-sm">
                            <span className="text-slate-700">{t.label}</span>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={t.value}
                              onClick={() => t.set(!t.value)}
                              className={`relative h-6 w-11 rounded-full transition ${t.value ? 'bg-brand-600' : 'bg-slate-200'}`}
                            >
                              <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition ${t.value ? 'translate-x-5' : ''}`} />
                            </button>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <h3 className="font-semibold text-slate-900">Example Questions</h3>
                      <div className="mt-3 space-y-2">
                        {EXAMPLE_QUESTIONS.map((q) => (
                          <button
                            key={q}
                            type="button"
                            onClick={() => setChatInput(q)}
                            className="w-full rounded-xl bg-sky-50 px-3 py-2.5 text-left text-xs leading-relaxed text-sky-900 hover:bg-sky-100"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-5">
            <button
              type="button"
              disabled={step === 1}
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <span className="text-sm text-slate-500">Step {step} of {STEPS.length}</span>
            <button
              type="button"
              disabled={step === 7 || !canContinue}
              onClick={() => setStep((s) => Math.min(7, s + 1))}
              className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40"
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </main>
      </div>
      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
    </div>
  )
}
