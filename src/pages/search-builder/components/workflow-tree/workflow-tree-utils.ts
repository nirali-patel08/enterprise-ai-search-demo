import type { WorkflowAgentNode, WorkflowDefinition, WorkflowOrchestrator } from "@/data/sample";

export type WfNodeType = "start" | "orchestration" | "agent" | "end";

export type WfTreeNode = {
  id: string;
  type: WfNodeType;
  label: string;
  subtitle?: string;
  agentId?: string;
  /** Agents nested under orchestration (not separate canvas nodes). */
  agents?: WorkflowAgentNode[];
  children: WfTreeNode[];
};

let idCounter = 1;
export const uid = (prefix = "n") => `${prefix}-${Date.now()}-${idCounter++}`;

export function makeNode(type: WfNodeType, overrides: Partial<WfTreeNode> = {}): WfTreeNode {
  const defaults: Record<WfNodeType, Partial<WfTreeNode>> = {
    start: { label: "Start" },
    orchestration: { label: "Main_orchestrator", agents: [] },
    agent: { label: "Agent" },
    end: { label: "End" },
  };
  return {
    id: uid(type),
    type,
    label: defaults[type].label ?? type,
    children: [],
    ...defaults[type],
    ...overrides,
  } as WfTreeNode;
}

export function defaultWorkflowTree(): WfTreeNode {
  return makeNode("start");
}

export function sampleWorkflowTree(): WfTreeNode {
  const orchestration = makeNode("orchestration", {
    id: "orch-sample",
    label: "Main_orchestrator",
    subtitle: "Route customer requests to the best specialist agent based on intent.",
    agents: [
      {
        id: "wf-agent-sharepoint",
        agentId: "sharepoint-agent",
        name: "Document Library agent",
        description: "Search contracts, policies, and SharePoint knowledge.",
      },
      {
        id: "wf-agent-router",
        agentId: "document-router-agent",
        name: "Document router agent",
        description: "Classify queries and delegate to the right downstream agent.",
      },
    ],
    children: [makeNode("end", { id: "end-sample" })],
  });
  return makeNode("start", { id: "start-sample", children: [orchestration] });
}

export function cloneTree(node: WfTreeNode): WfTreeNode {
  return JSON.parse(JSON.stringify(node)) as WfTreeNode;
}

export function findNode(node: WfTreeNode, id: string): WfTreeNode | null {
  if (node.id === id) return node;
  for (const child of node.children) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
}

export function updateNodeById(node: WfTreeNode, id: string, fn: (n: WfTreeNode) => WfTreeNode): WfTreeNode {
  if (node.id === id) return fn({ ...node });
  return { ...node, children: node.children.map((c) => updateNodeById(c, id, fn)) };
}

export function insertChild(
  node: WfTreeNode,
  parentId: string,
  newChild: WfTreeNode,
  atIndex?: number,
): WfTreeNode {
  if (node.id === parentId) {
    const children = [...node.children];
    const idx = atIndex === undefined ? children.length : atIndex;
    children.splice(idx, 0, newChild);
    return { ...node, children };
  }
  return { ...node, children: node.children.map((c) => insertChild(c, parentId, newChild, atIndex)) };
}

export function deleteNodeById(node: WfTreeNode, id: string): WfTreeNode {
  return {
    ...node,
    children: node.children.filter((c) => c.id !== id).map((c) => deleteNodeById(c, id)),
  };
}

export function getOrchestrationNode(tree: WfTreeNode): WfTreeNode | null {
  return tree.children.find((c) => c.type === "orchestration") ?? null;
}

export function treeToWorkflow(tree: WfTreeNode): WorkflowDefinition {
  const orch = getOrchestrationNode(tree);
  if (!orch) return { orchestrator: null, agents: [] };
  const orchestrator: WorkflowOrchestrator = {
    id: orch.id,
    name: orch.label,
    routingInstructions: orch.subtitle?.trim() || undefined,
  };
  return {
    orchestrator,
    agents: [...(orch.agents ?? [])],
  };
}

export function workflowToTree(workflow: WorkflowDefinition, existing?: WfTreeNode): WfTreeNode {
  if (!workflow.orchestrator) return existing ? cloneTree(existing) : defaultWorkflowTree();

  const endChild =
    existing && findNode(existing, "end-sample")
      ? findNode(existing, workflow.orchestrator.id)?.children.find((c) => c.type === "end") ??
        makeNode("end")
      : makeNode("end");

  const orchestration = makeNode("orchestration", {
    id: workflow.orchestrator.id,
    label: workflow.orchestrator.name,
    subtitle: workflow.orchestrator.routingInstructions,
    agents: workflow.agents,
    children: workflow.agents.length > 0 ? [endChild] : [],
  });

  return makeNode("start", {
    id: existing?.id ?? "start-root",
    children: [orchestration],
  });
}

export const NODE_W = 240;
export const NODE_H = 64;
export const ROW_H = 132;
export const AGENT_ROW_H = 58;
export const ORCH_PAD = 52;

export type LayoutResult = {
  positions: Record<string, { x: number; y: number }>;
  edges: Array<{ from: string; to: string }>;
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
  orchHeights: Record<string, number>;
};

function orchestrationCardHeight(agentCount: number) {
  const agentsBlock = agentCount === 0 ? 44 : agentCount * AGENT_ROW_H + 8;
  return NODE_H + ORCH_PAD + agentsBlock + 40;
}

/** Linear layout: Start → Orchestration (tall) → End */
export function layoutLinearWorkflow(root: WfTreeNode): LayoutResult {
  const positions: Record<string, { x: number; y: number }> = {};
  const edges: Array<{ from: string; to: string }> = [];
  const orchHeights: Record<string, number> = {};

  let y = 0;
  const centerX = 0;

  positions[root.id] = { x: centerX, y };
  let prevId = root.id;
  y += ROW_H;

  const orch = root.children.find((c) => c.type === "orchestration");
  if (orch) {
    const h = orchestrationCardHeight(orch.agents?.length ?? 0);
    orchHeights[orch.id] = h;
    positions[orch.id] = { x: centerX, y };
    edges.push({ from: prevId, to: orch.id });
    prevId = orch.id;
    y += h + 36;

    const end = orch.children.find((c) => c.type === "end");
    if (end) {
      positions[end.id] = { x: centerX, y };
      edges.push({ from: orch.id, to: end.id });
    }
  }

  const xs = Object.values(positions).map((p) => p.x);
  const ys = Object.values(positions).map((p) => p.y);
  const maxY = Math.max(...ys.map((py, i) => {
    const id = Object.keys(positions)[i];
    const orch = id ? orchHeights[id] : 0;
    return py + (orch || NODE_H);
  }));

  return {
    positions,
    edges,
    orchHeights,
    bounds: {
      minX: Math.min(...xs) - NODE_W / 2,
      maxX: Math.max(...xs) + NODE_W / 2,
      minY: Math.min(...ys) - 24,
      maxY: maxY + 40,
    },
  };
}

export function edgePath(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  fromHeight = NODE_H,
) {
  const x1 = p1.x + NODE_W / 2;
  const y1 = p1.y + fromHeight;
  const x2 = p2.x + NODE_W / 2;
  const y2 = p2.y;
  const midY = (y1 + y2) / 2;
  return `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
}

export function addAgentToOrchestration(
  tree: WfTreeNode,
  orchId: string,
  agent: { id: string; name: string; description?: string },
): WfTreeNode {
  return updateNodeById(tree, orchId, (n) => {
    if (n.type !== "orchestration") return n;
    if (n.agents?.some((a) => a.agentId === agent.id)) return n;
    const wfAgent: WorkflowAgentNode = {
      id: uid("wf-agent"),
      agentId: agent.id,
      name: agent.name,
      description: agent.description,
    };
    return { ...n, agents: [...(n.agents ?? []), wfAgent] };
  });
}

export function serializeYaml(node: WfTreeNode, depth = 0): string {
  const pad = "  ".repeat(depth);
  let out = `${pad}- id: ${node.id}\n${pad}  type: ${node.type}\n${pad}  label: "${node.label}"\n`;
  if (node.subtitle) out += `${pad}  routing: "${node.subtitle.replace(/"/g, '\\"')}"\n`;
  if (node.type === "orchestration" && node.agents?.length) {
    out += `${pad}  agents:\n`;
    node.agents.forEach((a) => {
      out += `${pad}    - id: ${a.id}\n${pad}      agent_id: ${a.agentId}\n${pad}      name: "${a.name}"\n`;
    });
  }
  if (node.children.length) {
    out += `${pad}  next:\n`;
    node.children.forEach((c) => {
      out += serializeYaml(c, depth + 2);
    });
  }
  return out;
}
