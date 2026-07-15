export type ContentNodeType = "site" | "library" | "folder" | "file" | "container" | "prefix";

export interface ContentNode {
  id: string;
  name: string;
  path: string;
  type: ContentNodeType;
  mimeType?: string;
  sizeBytes?: number;
  childCount?: number;
  children?: ContentNode[];
}

export interface ContentBrowseResponse {
  connectorTypeId: string;
  rootPath: string;
  nodes: ContentNode[];
  totalFiles: number;
  totalFolders: number;
}

export interface IndexingScopeSummary {
  connectorId: string;
  connectorName: string;
  selectedPaths: string[];
  estimatedFiles: number;
  estimatedSizeMb: number;
}

export function flattenFilePaths(nodes: ContentNode[]): { path: string; name: string; sizeBytes: number }[] {
  const files: { path: string; name: string; sizeBytes: number }[] = [];
  for (const node of nodes) {
    if (node.type === "file") {
      files.push({ path: node.path, name: node.name, sizeBytes: node.sizeBytes ?? 0 });
    }
    if (node.children?.length) {
      files.push(...flattenFilePaths(node.children));
    }
  }
  return files;
}

export function collectPathsUnderSelection(nodes: ContentNode[], selectedPaths: string[]): string[] {
  const allFiles = flattenFilePaths(nodes);
  const selected = new Set<string>();

  for (const sel of selectedPaths) {
    if (sel.includes(".") && !sel.endsWith("/")) {
      selected.add(sel);
      continue;
    }
    const prefix = sel.endsWith("/") ? sel : `${sel}/`;
    allFiles.forEach((f) => {
      if (f.path.startsWith(prefix) || f.path === sel) selected.add(f.path);
    });
    const exactFolder = allFiles.filter((f) => f.path.startsWith(prefix));
    exactFolder.forEach((f) => selected.add(f.path));
  }

  return [...selected];
}

export function estimateSelection(nodes: ContentNode[], selectedPaths: string[]) {
  const filePaths = collectPathsUnderSelection(nodes, selectedPaths);
  const allFiles = flattenFilePaths(nodes);
  const matched = allFiles.filter((f) => filePaths.includes(f.path));
  const sizeBytes = matched.reduce((sum, f) => sum + f.sizeBytes, 0);
  return { fileCount: matched.length, sizeMb: Math.round((sizeBytes / 1024 / 1024) * 10) / 10, files: matched };
}
