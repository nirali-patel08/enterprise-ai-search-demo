import { DEFAULT_ORCH_GRAPH, MARKETPLACE_AGENTS, type MarketplaceAgent } from "@/data/sample";

export type DemoCitation = {
  label: string;
  path?: string;
  connector?: string;
  detail?: string;
};

export type DemoPlaygroundTurn = {
  id: string;
  /** Target worker for orchestration; specific agent for single-agent playground */
  agentId: string;
  domain: string;
  query: string;
  /** Orchestrator label shown in trace */
  routedTo: string;
  model: string;
  searchIndex?: string;
  connector?: string;
  sourcePaths?: string[];
  /** Natural, user-facing answer — no index/model jargon */
  answer: string;
  cites: DemoCitation[];
  /** Suggested next questions shown as chips */
  followUps?: string[];
  matchTerms: string[];
};

const CONNECTORS = {
  sharepoint: "Corp intranet (Document Library)",
  financeBlob: "Finance archives (Object Storage)",
  enterpriseSql: "EnterpriseKnowledge (SQL Database)",
  postgres: "orders_prod_db (PostgreSQL)",
} as const;

const INDEXED_PATHS = {
  contracts: "/sites/knowledge/Shared Documents/Contracts",
  finance: "/sites/knowledge/Shared Documents/Finance",
  engineering: "/sites/knowledge/Shared Documents/Engineering Drawings",
} as const;

/** Static demo corpus — mirrors content-browser.ts + sample connectors/agents */
export const DEMO_PLAYGROUND_TURNS: DemoPlaygroundTurn[] = [
  {
    id: "contracts-abc",
    agentId: "sharepoint-agent",
    domain: "Contracts",
    query: "Show ABC Vendor contracts expiring in the next 90 days and any open POs.",
    routedTo: "Document Library agent",
    model: "gpt-4o-mini",
    searchIndex: "document-library-index",
    connector: CONNECTORS.sharepoint,
    sourcePaths: [INDEXED_PATHS.contracts, INDEXED_PATHS.finance],
    answer:
      "ABC Vendor has 2 contracts expiring within the next 90 days. The main agreement renews on 15 Dec 2026 and needs 90 days' written notice to cancel. There's also one open purchase order, PO-88421 for $42,000, still linked to this vendor.",
    cites: [
      { label: "Contract_ABC_2024.pdf", path: `${INDEXED_PATHS.contracts}/Contract_ABC_2024.pdf`, connector: CONNECTORS.sharepoint, detail: "Renewal clause, p.12" },
      { label: "PO-88421.xlsx", path: `${INDEXED_PATHS.finance}/PO-88421.xlsx`, connector: CONNECTORS.sharepoint, detail: "Line 14 — $42,000" },
    ],
    followUps: [
      "What are the renewal terms for this contract?",
      "Has PO-88421 been fully invoiced?",
      "Which other vendors have contracts expiring this quarter?",
    ],
    matchTerms: ["abc", "contract", "vendor", "expir", "po", "purchase"],
  },
  {
    id: "finance-mismatch",
    agentId: "byod-agent",
    domain: "Finance",
    query: "Compare PO amount and invoice amount for ABC Vendor — is there a mismatch?",
    routedTo: "Finance archives agent",
    model: "gpt-4o-mini",
    searchIndex: "byod-index",
    connector: CONNECTORS.financeBlob,
    sourcePaths: ["enterprise-docs/finance/pos/", "enterprise-docs/finance/invoices/"],
    answer:
      "Yes, there's a difference. Purchase order PO-88421 was approved for $42,000, while invoice INV-22019 was billed at $45,200 — a $3,200 gap. That's within the $5,000 auto-approval tolerance, so it doesn't need finance sign-off, but it's flagged here for your awareness.",
    cites: [
      { label: "PO-88421.xlsx", path: "enterprise-docs/finance/pos/PO-88421.xlsx", connector: CONNECTORS.financeBlob, detail: "$42,000 approved" },
      { label: "INV-22019.pdf", path: "enterprise-docs/finance/invoices/INV-22019.pdf", connector: CONNECTORS.financeBlob, detail: "$45,200 billed" },
      { label: "Approval_Policy.pdf", path: `${INDEXED_PATHS.finance}/Approval_Policy.pdf`, connector: CONNECTORS.sharepoint, detail: "$5k tolerance rule" },
    ],
    followUps: [
      "Why is the invoice higher than the PO?",
      "What's the payment status of INV-22019?",
      "What's the variance approval threshold?",
    ],
    matchTerms: ["invoice", "po", "mismatch", "compare", "abc", "variance", "spend"],
  },
  {
    id: "finance-q3",
    agentId: "byod-agent",
    domain: "Finance",
    query: "What was Q3 marketing spend versus budget?",
    routedTo: "Finance archives agent",
    model: "gpt-4o-mini",
    searchIndex: "byod-index",
    connector: CONNECTORS.financeBlob,
    sourcePaths: [`${INDEXED_PATHS.finance}/Q3-budget.xlsx`],
    answer:
      "Q3 marketing spend came in at $2.4M against a $2.6M budget — about 8% under plan. Most of the savings came from lower paid-media costs in September.",
    cites: [
      { label: "Q3-budget.xlsx", path: `${INDEXED_PATHS.finance}/Q3-budget.xlsx`, connector: CONNECTORS.sharepoint, detail: "Marketing tab" },
      { label: "Q2-summary.pdf", path: "enterprise-docs/finance/reports/Q2-summary.pdf", connector: CONNECTORS.financeBlob },
    ],
    followUps: [
      "What drove the September savings?",
      "How does Q3 compare to Q2?",
      "Show the full Q3 budget breakdown",
    ],
    matchTerms: ["q3", "marketing", "budget", "spend", "quarter"],
  },
  {
    id: "drawing-cooling",
    agentId: "engineering-drawing-agent",
    domain: "Engineering",
    query: "Which drawing shows the cooling-tower basin assembly for model CT-450?",
    routedTo: "Engineering Drawing agent",
    model: "gpt-4o-mini",
    searchIndex: "byod-index",
    connector: CONNECTORS.sharepoint,
    sourcePaths: [INDEXED_PATHS.engineering],
    answer:
      "The basin assembly for the CT-450 is shown in Cooling_Tower_Assembly.pdf, Figure 3 (revision C). The connected inlet and outlet piping for the same unit is detailed in Piping_Layout_Diagram.pdf.",
    cites: [
      { label: "Cooling_Tower_Assembly.pdf", path: `${INDEXED_PATHS.engineering}/Cooling_Tower_Assembly.pdf`, connector: CONNECTORS.sharepoint, detail: "Figure 3 — basin" },
      { label: "Piping_Layout_Diagram.pdf", path: `${INDEXED_PATHS.engineering}/Piping_Layout_Diagram.pdf`, connector: CONNECTORS.sharepoint },
    ],
    followUps: [
      "What's the basin material spec?",
      "Show the piping layout for CT-450",
      "Which drawing revision is current?",
    ],
    matchTerms: ["drawing", "cooling", "tower", "basin", "ct-450", "assembly", "diagram", "figure"],
  },
  {
    id: "table-bom",
    agentId: "engineering-table-agent",
    domain: "Engineering",
    query: "List fastener quantities for CT-450 from the engineering BOM tables.",
    routedTo: "Engineering Table agent",
    model: "gpt-4o-mini",
    searchIndex: "engineering-tables",
    connector: CONNECTORS.sharepoint,
    answer:
      "For the CT-450 basin skid, the bill of materials lists 48 × M12×40 bolts, 96 × M10 washers, and 12 anchor studs. These quantities match the hardware line items in the capital plan.",
    cites: [
      { label: "CT-450_BOM.xlsx", path: `${INDEXED_PATHS.engineering}/CT-450_BOM.xlsx`, connector: CONNECTORS.sharepoint, detail: "Fastener rows" },
      { label: "CapEx-plan.xlsx", path: `${INDEXED_PATHS.finance}/FY24/CapEx-plan.xlsx`, connector: CONNECTORS.sharepoint, detail: "Hardware tab" },
    ],
    followUps: [
      "What torque spec applies to the M12 bolts?",
      "List all fasteners for the full CT-450",
      "What's the material grade for the anchor studs?",
    ],
    matchTerms: ["bom", "fastener", "bolt", "table", "ct-450", "quantity", "spec"],
  },
  {
    id: "policy-leave",
    agentId: "sharepoint-agent",
    domain: "Policies",
    query: "What's our current parental leave policy for primary caregivers?",
    routedTo: "Document Library agent",
    model: "gpt-4o-mini",
    searchIndex: "document-library-index",
    connector: CONNECTORS.sharepoint,
    sourcePaths: ["enterprise-docs/hr/policies/"],
    answer:
      "You're entitled to 16 weeks of paid parental leave as a primary caregiver, and 6 weeks as a secondary caregiver. This applies for the current fiscal year.",
    cites: [
      { label: "Leave_Policy.docx", path: "enterprise-docs/hr/policies/Leave_Policy.docx", connector: CONNECTORS.financeBlob, detail: "Section 4.2" },
      { label: "Employee_Handbook.pdf", path: "enterprise-docs/hr/handbook/Employee_Handbook.pdf", connector: CONNECTORS.financeBlob },
    ],
    followUps: [
      "How do I apply for parental leave?",
      "Is leave available for adoption?",
      "What notice period is required?",
    ],
    matchTerms: ["parental", "leave", "policy", "caregiver", "hr", "handbook"],
  },
  {
    id: "policy-procurement",
    agentId: "sharepoint-agent",
    domain: "Procurement",
    query: "What is the approval policy for high-value procurement?",
    routedTo: "Document Library agent",
    model: "gpt-4o-mini",
    searchIndex: "document-library-index",
    connector: CONNECTORS.sharepoint,
    sourcePaths: [`${INDEXED_PATHS.finance}/Approval_Policy.pdf`],
    answer:
      "High-value purchases need extra sign-off. Purchase orders above $25,000 require VP Finance approval, and anything above $100,000 needs CFO approval. Any PO-to-invoice difference over $5,000 also goes to finance review before payment.",
    cites: [
      { label: "Approval_Policy.pdf", path: `${INDEXED_PATHS.finance}/Approval_Policy.pdf`, connector: CONNECTORS.sharepoint, detail: "Approval thresholds" },
    ],
    followUps: [
      "Who approves a $50,000 purchase order?",
      "What documents are needed for CFO approval?",
      "How long does approval usually take?",
    ],
    matchTerms: ["approval", "procurement", "high-value", "policy", "purchase", "sign-off"],
  },
  {
    id: "postgres-pos",
    agentId: "postgres-agent",
    domain: "Data",
    query: "How many open purchase orders exist for vendor ABC in orders_prod_db?",
    routedTo: "postgres-agent",
    model: "gpt-4o-mini",
    searchIndex: "postgres-index",
    connector: CONNECTORS.postgres,
    answer:
      "Vendor ABC currently has 3 open purchase orders, including PO-88421 for $42,000. One linked invoice, INV-22019, is still pending reconciliation.",
    cites: [
      { label: "purchase_orders", path: "dbo/purchase_orders", connector: CONNECTORS.postgres, detail: "3 open records" },
      { label: "invoices", path: "dbo/invoices", connector: CONNECTORS.postgres, detail: "1 pending" },
    ],
    followUps: [
      "Which of these POs are overdue?",
      "What's the total open value for ABC?",
      "When is PO-88421 due?",
    ],
    matchTerms: ["postgres", "sql", "purchase", "open", "vendor", "table", "database"],
  },
  {
    id: "tech-sop",
    agentId: "technical-docs-agent",
    domain: "SOP",
    query: "What is the lockout/tagout procedure for cooling tower maintenance?",
    routedTo: "Technical-Documentation-Agent",
    model: "gpt-4o-mini",
    searchIndex: "tech-docs-index",
    connector: CONNECTORS.sharepoint,
    answer:
      "To safely service the cooling tower: isolate the electrical feed at panel CT-MAIN-01, apply lockout/tagout devices, confirm zero energy with a test meter, and get shift-supervisor sign-off before starting any basin work.",
    cites: [
      { label: "SOP-MAINT-014.pdf", path: "/sites/knowledge/Shared Documents/Engineering/SOP-MAINT-014.pdf", connector: CONNECTORS.sharepoint, detail: "Lockout/tagout steps" },
      { label: "Cooling_Tower_O&M.pdf", path: "/sites/knowledge/Shared Documents/Engineering/Cooling_Tower_O&M.pdf", connector: CONNECTORS.sharepoint },
    ],
    followUps: [
      "Who is authorized to perform lockout/tagout?",
      "What PPE is required for basin work?",
      "Show the full maintenance procedure",
    ],
    matchTerms: ["sop", "lockout", "tagout", "loto", "maintenance", "procedure", "cooling"],
  },
  {
    id: "router-multi",
    agentId: "document-router-agent",
    domain: "Multi-domain",
    query: "Show unpaid invoices related to contracts expiring next month for ABC Vendor.",
    routedTo: "Document-Router-Agent",
    model: "gpt-4o",
    searchIndex: "document-library-index",
    connector: CONNECTORS.sharepoint,
    answer:
      "For ABC Vendor, one contract is expiring next month. It has an unpaid invoice, INV-22019 for $45,200, tied to purchase order PO-88421 ($42,000).",
    cites: [
      { label: "Contract_ABC_2024.pdf", path: `${INDEXED_PATHS.contracts}/Contract_ABC_2024.pdf`, connector: CONNECTORS.sharepoint, detail: "Expiring next month" },
      { label: "INV-22019.pdf", path: `${INDEXED_PATHS.finance}/INV-22019.pdf`, connector: CONNECTORS.sharepoint, detail: "Unpaid — $45,200" },
    ],
    followUps: [
      "When exactly does the contract expire?",
      "Why is INV-22019 still unpaid?",
      "Show all unpaid invoices this month",
    ],
    matchTerms: ["unpaid", "invoice", "contract", "expir", "next month", "abc"],
  },
];

const SUPERVISOR = DEFAULT_ORCH_GRAPH.find((n) => n.kind === "supervisor")!;

function scoreTurn(query: string, turn: DemoPlaygroundTurn): number {
  const q = query.toLowerCase();
  let score = 0;
  for (const term of turn.matchTerms) {
    if (q.includes(term.toLowerCase())) score += term.length > 4 ? 2 : 1;
  }
  if (q.includes(turn.domain.toLowerCase())) score += 1;
  return score;
}

export function getAgentById(agentId: string): MarketplaceAgent | undefined {
  return MARKETPLACE_AGENTS.find((a) => a.id === agentId);
}

/** Presets for a single agent playground (detail or draft config) */
export function getPresetsForAgent(agentId?: string, searchIndex?: string): DemoPlaygroundTurn[] {
  if (agentId) {
    const direct = DEMO_PLAYGROUND_TURNS.filter((t) => t.agentId === agentId);
    if (direct.length) return direct.slice(0, 4);
  }
  if (searchIndex) {
    const byIndex = DEMO_PLAYGROUND_TURNS.filter((t) => t.searchIndex === searchIndex);
    if (byIndex.length) return byIndex.slice(0, 4);
  }
  return DEMO_PLAYGROUND_TURNS.slice(0, 3);
}

/** Orchestration studio sample queries — short Contoso Q&A for live testing */
export function getOrchestrationPresets(): DemoPlaygroundTurn[] {
  const shorts: Record<string, Pick<DemoPlaygroundTurn, "query" | "answer" | "followUps">> = {
    "contracts-abc": {
      query: "ABC contracts expiring in 90 days?",
      answer:
        "ABC Vendor has 2 contracts renewing by 15 Dec 2026, plus open PO-88421 for $42,000.",
      followUps: ["Renewal terms?", "Has PO-88421 been invoiced?"],
    },
    "finance-mismatch": {
      query: "PO vs invoice mismatch for ABC?",
      answer:
        "PO-88421 is $42,000 vs INV-22019 at $45,200 — a $3,200 gap, still within the $5k tolerance.",
      followUps: ["Why the variance?", "Payment status of INV-22019?"],
    },
    "drawing-cooling": {
      query: "CT-450 cooling tower basin drawing?",
      answer: "Basin assembly is in Cooling_Tower_Assembly.pdf, Figure 3 (rev C).",
      followUps: ["Show piping layout", "Current drawing revision?"],
    },
  };

  return (["contracts-abc", "finance-mismatch", "drawing-cooling"] as const)
    .map((id) => {
      const base = DEMO_PLAYGROUND_TURNS.find((t) => t.id === id);
      const override = shorts[id];
      return base && override ? { ...base, ...override } : null;
    })
    .filter((t): t is DemoPlaygroundTurn => Boolean(t));
}

export type ResolvedDemoReply = {
  query: string;
  answer: string;
  trace: string;
  cites: string[];
  sources: DemoCitation[];
  followUps: string[];
  model: string;
  meta?: string;
};

function citeLabels(cites: DemoCitation[]): string[] {
  return cites.map((c) => (c.detail ? `${c.label} (${c.detail})` : c.label));
}

/** Match user text to the best static demo turn */
export function resolveDemoReply(
  query: string,
  opts?: { agentId?: string; searchIndex?: string; orchestrated?: boolean },
): ResolvedDemoReply {
  const q = query.trim();
  if (!q) {
    return {
      query: "",
      answer: "Enter a question to search your indexed enterprise sources.",
      trace: "",
      cites: [],
      sources: [],
      followUps: [],
      model: "gpt-4o-mini",
    };
  }

  let pool = DEMO_PLAYGROUND_TURNS;
  if (opts?.agentId) {
    const agentPool = pool.filter((t) => t.agentId === opts.agentId);
    if (agentPool.length) pool = agentPool;
    else {
      const agent = getAgentById(opts.agentId);
      if (agent?.searchIndex) {
        const indexPool = pool.filter((t) => t.searchIndex === agent.searchIndex);
        if (indexPool.length) pool = indexPool;
      }
    }
  } else if (opts?.searchIndex) {
    const indexPool = pool.filter((t) => t.searchIndex === opts.searchIndex);
    if (indexPool.length) pool = indexPool;
  }

  const ranked = [...pool]
    .map((t) => ({ turn: t, score: scoreTurn(q, t) }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];
  const turn = best && best.score > 0 ? best.turn : ranked[0]?.turn ?? pool[0];

  const agent = getAgentById(turn.agentId);
  const model = agent?.model ?? turn.model;
  const index = agent?.searchIndex ?? turn.searchIndex;

  if (opts?.orchestrated) {
    const worker = DEFAULT_ORCH_GRAPH.find((n) => n.agentId === turn.agentId);
    const workerLabel = worker?.label ?? turn.routedTo;
    const meta = [
      turn.connector && `Source: ${turn.connector}`,
      index && `Index: ${index}`,
      turn.sourcePaths?.length && `${turn.sourcePaths.length} scoped path(s)`,
    ]
      .filter(Boolean)
      .join(" · ");

    return {
      query: q,
      answer: turn.answer,
      trace: `${SUPERVISOR.label} (${SUPERVISOR.model}) → ${workerLabel} (${model})`,
      cites: citeLabels(turn.cites),
      sources: turn.cites,
      followUps: turn.followUps ?? [],
      model,
      meta,
    };
  }

  const meta = [
    turn.connector && `Source: ${turn.connector}`,
    index && `Index: ${index}`,
    agent?.instructions ? "Instructions applied" : undefined,
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    query: q,
    answer: turn.answer,
    trace: `${agent?.name ?? turn.routedTo} · ${model}${index ? ` · ${index}` : ""}`,
    cites: citeLabels(turn.cites),
    sources: turn.cites,
    followUps: turn.followUps ?? [],
    model,
    meta,
  };
}

export function turnToChatMessage(turn: DemoPlaygroundTurn, orchestrated = false): ResolvedDemoReply {
  return resolveDemoReply(turn.query, {
    agentId: orchestrated ? undefined : turn.agentId,
    orchestrated,
  });
}
