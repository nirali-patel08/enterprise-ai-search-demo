import type { WorkflowDefinition } from "@/data/sample";

export type BranchNodeType =
  | "start"
  | "orchestration"
  | "agent"
  | "condition"
  | "branch-if"
  | "branch-elseif"
  | "branch-else"
  | "action"
  | "ask"
  | "end";

export type BranchTreeNode = {
  id: string;
  type: BranchNodeType;
  label: string;
  subtitle?: string;
  agentId?: string;
  children: BranchTreeNode[];
};

export const TYPE_META: Record<
  BranchNodeType,
  {
    color: string;
    bg: string;
    border: string;
    title: string;
    hasSubtitle: boolean;
    subtitleLabel?: string;
  }
> = {
  start: { color: "#15803D", bg: "#DCFCE7", border: "#86EFAC", title: "Start", hasSubtitle: false },
  orchestration: {
    color: "#B45309",
    bg: "#FEF3C7",
    border: "#FCD34D",
    title: "Agent orchestration",
    hasSubtitle: true,
    subtitleLabel: "Routing instructions",
  },
  agent: {
    color: "#1D4ED8",
    bg: "#DBEAFE",
    border: "#93C5FD",
    title: "Agent",
    hasSubtitle: true,
    subtitleLabel: "Instructions",
  },
  condition: {
    color: "#B45309",
    bg: "#FEF3C7",
    border: "#FCD34D",
    title: "If/Else condition",
    hasSubtitle: false,
  },
  "branch-if": {
    color: "#B45309",
    bg: "#FEF3C7",
    border: "#FCD34D",
    title: "If",
    hasSubtitle: true,
    subtitleLabel: "Condition expression",
  },
  "branch-elseif": {
    color: "#B45309",
    bg: "#FEF3C7",
    border: "#FCD34D",
    title: "Else if",
    hasSubtitle: true,
    subtitleLabel: "Condition expression",
  },
  "branch-else": { color: "#B45309", bg: "#FEF3C7", border: "#FCD34D", title: "Else", hasSubtitle: false },
  action: {
    color: "#A21CAF",
    bg: "#FAE8FF",
    border: "#E9A5F1",
    title: "Send message",
    hasSubtitle: true,
    subtitleLabel: "Message text",
  },
  ask: {
    color: "#6D28D9",
    bg: "#EDE9FE",
    border: "#C4B5FD",
    title: "Ask a question",
    hasSubtitle: true,
    subtitleLabel: "Prompt",
  },
  end: { color: "#B91C1C", bg: "#FEE2E2", border: "#FCA5A5", title: "End", hasSubtitle: false },
};

export type NodeVisualMeta = {
  color: string;
  bg: string;
  border: string;
  title: string;
  hasSubtitle: boolean;
  subtitleLabel?: string;
};

/** Purple styling for parallel branch agents directly under orchestration. */
export const PARALLEL_BRANCH_META: NodeVisualMeta = {
  color: "#6D28D9",
  bg: "#EDE9FE",
  border: "#C4B5FD",
  title: "Parallel agent",
  hasSubtitle: true,
  subtitleLabel: "Instructions",
};

export const BRANCH_SLOT_META = PARALLEL_BRANCH_META;

export const ADD_OPTIONS: Array<{ type: BranchNodeType; label: string }> = [
  { type: "agent", label: "Agent" },
  { type: "condition", label: "If/Else condition" },
  { type: "ask", label: "Ask a question" },
  { type: "action", label: "Send message" },
  { type: "end", label: "End" },
];

export const START_ADD_OPTIONS: Array<{ type: BranchNodeType; label: string }> = [
  { type: "orchestration", label: "Agent orchestration" },
  { type: "agent", label: "Single agent" },
];

export const BRANCH_CHAIN_OPTIONS: Array<{ type: BranchNodeType; label: string }> = [
  { type: "agent", label: "Agent" },
  { type: "end", label: "End" },
];

export const NODE_W = 185;
export const START_END_NODE_W = 96;
export const NODE_H = 52;
export const START_END_NODE_H = 34;
export const ROW_H = 112;
export const COL_W = 208;

export function getNodeWidth(type: BranchNodeType): number {
  return type === "start" || type === "end" ? START_END_NODE_W : NODE_W;
}

export function getNodeHeight(type: BranchNodeType): number {
  return type === "start" || type === "end" ? START_END_NODE_H : NODE_H;
}

let idCounter = 1;
export const uid = () => `n${idCounter++}`;

export function makeNode(type: BranchNodeType, overrides: Partial<BranchTreeNode> = {}): BranchTreeNode {
  const meta = TYPE_META[type];
  return {
    id: uid(),
    type,
    label: meta.title,
    subtitle: meta.hasSubtitle ? "" : undefined,
    children: [],
    ...overrides,
  };
}

export function createOrchestrationNode(overrides?: { label?: string; subtitle?: string }): BranchTreeNode {
  return makeNode("orchestration", {
    label: overrides?.label?.trim() || "Agent orchestration",
    subtitle: overrides?.subtitle?.trim() || "",
  });
}

export function defaultWorkflowTree(): BranchTreeNode {
  return makeNode("start");
}

export function sampleWorkflowTree(): BranchTreeNode {
  const orch = makeNode("orchestration", { label: "Agent orchestration" });

  const branch1 = makeNode("agent", {
    label: "Agent 1",
    children: [
      makeNode("agent", {
        label: "AgentA",
        subtitle: "Process branch 1 results.",
        children: [makeNode("end")],
      }),
    ],
  });

  const branch2 = makeNode("agent", {
    label: "Agent 3",
    children: [
      makeNode("agent", {
        label: "AgentB",
        subtitle: "Process branch 2 results.",
        children: [makeNode("end")],
      }),
    ],
  });

  const branch3 = makeNode("agent", {
    label: "Agent 2",
    children: [makeNode("end")],
  });

  orch.children = [branch1, branch2, branch3];

  return makeNode("start", { children: [orch] });
}

export function cloneTree(node: BranchTreeNode): BranchTreeNode {
  return JSON.parse(JSON.stringify(node)) as BranchTreeNode;
}

export function findNode(node: BranchTreeNode, id: string): BranchTreeNode | null {
  if (node.id === id) return node;
  for (const child of node.children) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
}

export function findParent(
  node: BranchTreeNode,
  id: string,
  parent: BranchTreeNode | null = null,
): BranchTreeNode | null {
  if (node.id === id) return parent;
  for (const child of node.children) {
    const found = findParent(child, id, node);
    if (found) return found;
  }
  return null;
}

export function updateNodeById(
  node: BranchTreeNode,
  id: string,
  fn: (n: BranchTreeNode) => BranchTreeNode,
): BranchTreeNode {
  if (node.id === id) return { ...fn(node) };
  return { ...node, children: node.children.map((c) => updateNodeById(c, id, fn)) };
}

export function insertChild(
  node: BranchTreeNode,
  parentId: string,
  newChild: BranchTreeNode,
  atIndex?: number,
): BranchTreeNode {
  if (node.id === parentId) {
    const children = [...node.children];
    const idx = atIndex === undefined ? children.length : atIndex;
    children.splice(idx, 0, newChild);
    return { ...node, children };
  }
  return { ...node, children: node.children.map((c) => insertChild(c, parentId, newChild, atIndex)) };
}

export function deleteNodeById(node: BranchTreeNode, id: string): BranchTreeNode {
  return {
    ...node,
    children: node.children.filter((c) => c.id !== id).map((c) => deleteNodeById(c, id)),
  };
}

export function getOrchestrationNode(tree: BranchTreeNode): BranchTreeNode | null {
  if (tree.type === "orchestration") return tree;
  for (const child of tree.children) {
    const found = getOrchestrationNode(child);
    if (found) return found;
  }
  return null;
}

export function getParallelAgents(orch: BranchTreeNode): BranchTreeNode[] {
  return orch.children.filter((c) => c.type === "agent");
}

export function isOrchestrationBranchRoot(tree: BranchTreeNode, nodeId: string): boolean {
  const node = findNode(tree, nodeId);
  const parent = findParent(tree, nodeId);
  return node?.type === "agent" && parent?.type === "orchestration";
}

export function isInOrchestrationBranch(tree: BranchTreeNode, nodeId: string): boolean {
  let current = findParent(tree, nodeId);
  while (current) {
    if (current.type === "orchestration") return true;
    current = findParent(tree, current.id);
  }
  return false;
}

export type ForkPoint = {
  parentId: string;
  x: number;
  y: number;
  kind: "condition" | "orchestration";
};

export type LayoutResult = {
  positions: Record<string, { x: number; y: number }>;
  edges: Array<{ from: string; to: string }>;
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
  forks: ForkPoint[];
};

export function layoutTree(root: BranchTreeNode): LayoutResult {
  const positions: Record<string, { x: number; y: number }> = {};
  const edges: Array<{ from: string; to: string }> = [];
  const forks: ForkPoint[] = [];
  let cursor = 0;

  function place(node: BranchTreeNode, depth: number): number {
    if (node.type === "orchestration" || node.type === "condition") {
      if (node.children.length === 0) {
        const x = cursor * COL_W;
        cursor += 1;
        positions[node.id] = { x, y: depth * ROW_H };
        forks.push({
          parentId: node.id,
          x,
          y: depth * ROW_H + ROW_H / 2,
          kind: node.type === "orchestration" ? "orchestration" : "condition",
        });
        return x;
      }

      const childXs = node.children.map((c) => place(c, depth + 1));
      const x = (Math.min(...childXs) + Math.max(...childXs)) / 2;
      positions[node.id] = { x, y: depth * ROW_H };
      forks.push({
        parentId: node.id,
        x,
        y: depth * ROW_H + ROW_H / 2,
        kind: node.type === "orchestration" ? "orchestration" : "condition",
      });
      node.children.forEach((c) => edges.push({ from: node.id, to: c.id }));
      return x;
    }

    if (node.children.length === 0) {
      const x = cursor * COL_W;
      cursor += 1;
      positions[node.id] = { x, y: depth * ROW_H };
      return x;
    }

    const childXs = node.children.map((c) => place(c, depth + 1));
    const x = (Math.min(...childXs) + Math.max(...childXs)) / 2;
    positions[node.id] = { x, y: depth * ROW_H };
    node.children.forEach((c) => edges.push({ from: node.id, to: c.id }));
    return x;
  }

  place(root, 0);

  // Horizontally center the tree on the start node.
  const rootPos = positions[root.id];
  if (rootPos) {
    const rootCenterX = rootPos.x + NODE_W / 2;
    Object.keys(positions).forEach((id) => {
      positions[id] = { ...positions[id], x: positions[id].x - rootCenterX };
    });
    forks.forEach((f) => {
      f.x -= rootCenterX;
    });
  }

  const xs = Object.values(positions).map((p) => p.x);
  const ys = Object.values(positions).map((p) => p.y);
  const bounds = {
    minX: Math.min(...xs) - NODE_W / 2,
    maxX: Math.max(...xs) + NODE_W / 2,
    minY: Math.min(...ys) - 20,
    maxY: Math.max(...ys) + NODE_H + 20,
  };

  return { positions, edges, forks, bounds };
}

export function edgePath(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  fromH: number = NODE_H,
) {
  const x1 = p1.x + NODE_W / 2;
  const y1 = p1.y + fromH;
  const x2 = p2.x + NODE_W / 2;
  const y2 = p2.y;
  const midY = (y1 + y2) / 2;
  return `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
}

export function serializeYaml(node: BranchTreeNode, depth = 0): string {
  const pad = "  ".repeat(depth);
  const meta = TYPE_META[node.type];
  let out = `${pad}- id: ${node.id}\n${pad}  type: ${node.type}\n${pad}  label: "${node.label}"\n`;
  if (meta.hasSubtitle && node.subtitle) {
    const key = meta.subtitleLabel?.toLowerCase().replace(/ /g, "_") ?? "subtitle";
    out += `${pad}  ${key}: "${node.subtitle.replace(/"/g, '\\"')}"\n`;
  }
  if (node.children.length) {
    out += `${pad}  next:\n`;
    node.children.forEach((c) => {
      out += serializeYaml(c, depth + 2);
    });
  }
  return out;
}

export function collectAgentNodes(node: BranchTreeNode): BranchTreeNode[] {
  const agents: BranchTreeNode[] = [];
  if (node.type === "agent") agents.push(node);
  node.children.forEach((c) => agents.push(...collectAgentNodes(c)));
  return agents;
}

export function hasEndNode(node: BranchTreeNode): boolean {
  if (node.type === "end") return true;
  return node.children.some(hasEndNode);
}

export function treeToWorkflowDefinition(tree: BranchTreeNode): WorkflowDefinition {
  const orch = getOrchestrationNode(tree);
  const agentNodes = collectAgentNodes(tree);
  if (agentNodes.length === 0) return { orchestrator: null, agents: [] };

  if (orch) {
    return {
      orchestrator: {
        id: orch.id,
        name: orch.label,
        routingInstructions: orch.subtitle?.trim() || undefined,
      },
      agents: agentNodes.map((n) => ({
        id: n.id,
        agentId: n.agentId ?? n.label.toLowerCase().replace(/\s+/g, "-"),
        name: n.label,
        description: n.subtitle,
      })),
    };
  }

  const [orchestratorNode] = agentNodes;
  return {
    orchestrator: {
      id: orchestratorNode.id,
      name: orchestratorNode.label,
      routingInstructions: orchestratorNode.subtitle?.trim() || undefined,
    },
    agents: agentNodes.map((n) => ({
      id: n.id,
      agentId: n.agentId ?? n.label.toLowerCase().replace(/\s+/g, "-"),
      name: n.label,
      description: n.subtitle,
    })),
  };
}

export function resolveExecutionPath(tree: BranchTreeNode, _query?: string): string[] {
  const path: string[] = [];

  function walkBranch(node: BranchTreeNode) {
    path.push(node.id);
    if (node.children.length > 0) walkBranch(node.children[0]);
  }

  function walk(node: BranchTreeNode): void {
    path.push(node.id);

    if (node.type === "orchestration") {
      const firstBranch = node.children[0];
      if (firstBranch) walkBranch(firstBranch);
      return;
    }

    if (node.type === "end" || node.children.length === 0) return;

    if (node.type === "condition") {
      const branches = node.children.filter((c) => c.type === "branch-if" || c.type === "branch-elseif");
      const matched = branches[0];
      if (matched) {
        walk(matched);
        return;
      }
      const elseBranch = node.children.find((c) => c.type === "branch-else");
      if (elseBranch) walk(elseBranch);
      return;
    }

    walk(node.children[0]);
  }

  walk(tree);
  return path;
}

export function addAgentToOrchestration(
  tree: BranchTreeNode,
  orchId: string,
  agent: { id: string; name: string; description?: string },
): BranchTreeNode {
  return updateNodeById(tree, orchId, (n) => {
    if (n.type !== "orchestration") return n;
    const branchNum = n.children.filter((c) => c.type === "agent").length + 1;
    const wfAgent = makeNode("agent", {
      label: agent.name || `Agent ${branchNum}`,
      subtitle: agent.description ?? "",
      agentId: agent.id,
    });
    return { ...n, children: [...n.children, wfAgent] };
  });
}

export function addBranchSlot(tree: BranchTreeNode, orchId: string): BranchTreeNode {
  return updateNodeById(tree, orchId, (n) => {
    if (n.type !== "orchestration") return n;
    const branchNum = n.children.filter((c) => c.type === "agent").length + 1;
    return { ...n, children: [...n.children, makeNode("agent", { label: `Agent ${branchNum}` })] };
  });
}

export function addLinearAgent(
  tree: BranchTreeNode,
  parentId: string,
  agent: { id: string; name: string; description?: string },
): BranchTreeNode {
  const wfAgent = makeNode("agent", {
    label: agent.name,
    subtitle: agent.description ?? "",
    agentId: agent.id,
  });
  return insertChild(tree, parentId, wfAgent);
}

export function getAddOptionsFor(parent: BranchTreeNode, tree: BranchTreeNode): Array<{ type: BranchNodeType; label: string }> {
  if (parent.type === "start") {
    if (parent.children.length === 0) return START_ADD_OPTIONS;
    return [];
  }
  if (parent.type === "orchestration") return [];
  if (parent.type === "agent") {
    if (isInOrchestrationBranch(tree, parent.id) || isOrchestrationBranchRoot(tree, parent.id)) {
      return BRANCH_CHAIN_OPTIONS;
    }
    return BRANCH_CHAIN_OPTIONS;
  }
  if (parent.type === "end" || parent.type === "condition") return [];
  return ADD_OPTIONS;
}

export function canShowPlus(node: BranchTreeNode, _tree: BranchTreeNode): boolean {
  if (node.type === "end") return false;
  if (node.type === "orchestration" || node.type === "condition") return false;
  if (node.type === "start") return node.children.length === 0;
  return node.children.length === 0;
}

export function getNodeVisualMeta(tree: BranchTreeNode, node: BranchTreeNode): NodeVisualMeta {
  if (isOrchestrationBranchRoot(tree, node.id)) return PARALLEL_BRANCH_META;
  return TYPE_META[node.type];
}

export function getAddOptionVisualMeta(
  type: BranchNodeType,
  parent: BranchTreeNode,
  tree: BranchTreeNode,
): NodeVisualMeta {
  if (type === "orchestration") return TYPE_META.orchestration;
  if (type === "agent") {
    if (parent.type === "orchestration") return PARALLEL_BRANCH_META;
    if (isOrchestrationBranchRoot(tree, parent.id)) return TYPE_META.agent;
    return TYPE_META.agent;
  }
  return TYPE_META[type];
}
