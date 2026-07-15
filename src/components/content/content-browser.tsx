import { useEffect, useMemo, useState } from "react";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { ContentNode } from "@/types/content";
import { estimateSelection } from "@/types/content";

interface ContentBrowserProps {
  nodes: ContentNode[];
  selectedPaths: string[];
  onTogglePath: (path: string, node: ContentNode) => void;
  loading?: boolean;
  includeSubfolders: boolean;
  onIncludeSubfoldersChange: (value: boolean) => void;
}

function isFolderType(type: ContentNode["type"]) {
  return type !== "file";
}

function nodeMatchesFilter(node: ContentNode, filter: string): boolean {
  if (!filter) return true;
  const q = filter.toLowerCase();
  if (node.name.toLowerCase().includes(q)) return true;
  return node.children?.some((c) => nodeMatchesFilter(c, q)) ?? false;
}

function collectFolderPaths(nodes: ContentNode[], selected: Set<string>): number {
  let count = 0;
  const walk = (list: ContentNode[]) => {
    for (const n of list) {
      if (isFolderType(n.type) && selected.has(n.path)) count += 1;
      if (n.children) walk(n.children);
    }
  };
  walk(nodes);
  return count;
}

function collectExpandedPaths(nodes: ContentNode[]): Set<string> {
  const all = new Set<string>();
  const walk = (list: ContentNode[]) => {
    for (const n of list) {
      if (n.children?.length) {
        all.add(n.path);
        walk(n.children);
      }
    }
  };
  walk(nodes);
  return all;
}

function TreeNode({
  node,
  depth,
  selectedPaths,
  onTogglePath,
  expanded,
  onToggleExpand,
  filter,
}: {
  node: ContentNode;
  depth: number;
  selectedPaths: string[];
  onTogglePath: (path: string, node: ContentNode) => void;
  expanded: Set<string>;
  onToggleExpand: (path: string) => void;
  filter: string;
}) {
  if (!nodeMatchesFilter(node, filter)) return null;

  const isFolder = isFolderType(node.type);
  const isExpanded = expanded.has(node.path);
  const isSelected = selectedPaths.includes(node.path);
  const hasChildren = (node.children?.length ?? 0) > 0;

  return (
    <div>
      <div
        className={cn(
          "flex cursor-pointer items-center gap-1.5 rounded-md py-1 pr-2 text-[13px] hover:bg-black/[0.04]",
          isSelected && "bg-sky-50 ring-1 ring-inset ring-sky-500/30",
        )}
        style={{ paddingLeft: depth * 18 + 8 }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggleExpand(node.path)}
            className="inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center text-black/40"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <ExpandMoreRoundedIcon sx={{ fontSize: 16 }} />
            ) : (
              <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
            )}
          </button>
        ) : (
          <span className="inline-block w-[18px] shrink-0" />
        )}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onTogglePath(node.path, node)}
          aria-label={`Select ${node.name}`}
          className="h-3.5 w-3.5 shrink-0 accent-sky-600"
        />
        {isFolder ? (
          <FolderRoundedIcon className="shrink-0 text-amber-500" sx={{ fontSize: 16 }} />
        ) : (
          <InsertDriveFileRoundedIcon className="shrink-0 text-black/35" sx={{ fontSize: 16 }} />
        )}
        <span className="min-w-0 flex-1 truncate font-medium text-black/85">{node.name}</span>
        {node.type === "file" && node.sizeBytes ? (
          <span className="shrink-0 text-[11px] text-black/40">{(node.sizeBytes / 1024).toFixed(0)} KB</span>
        ) : node.childCount ? (
          <span className="shrink-0 text-[11px] text-black/40">{node.childCount} items</span>
        ) : null}
      </div>
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedPaths={selectedPaths}
              onTogglePath={onTogglePath}
              expanded={expanded}
              onToggleExpand={onToggleExpand}
              filter={filter}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ContentBrowser({
  nodes,
  selectedPaths,
  onTogglePath,
  loading,
  includeSubfolders,
  onIncludeSubfoldersChange,
}: ContentBrowserProps) {
  const [filter, setFilter] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(() => collectExpandedPaths(nodes));

  useEffect(() => {
    setExpanded(collectExpandedPaths(nodes));
  }, [nodes]);

  const estimate = useMemo(() => estimateSelection(nodes, selectedPaths), [nodes, selectedPaths]);
  const folderCount = useMemo(
    () => collectFolderPaths(nodes, new Set(selectedPaths)),
    [nodes, selectedPaths],
  );

  const toggleExpand = (path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center">
        <Spinner size="md" label="Loading content structure" />
      </div>
    );
  }

  return (
    <div className="grid h-full min-h-0 gap-3 lg:grid-cols-[minmax(0,1fr)_420px]">
      <div className="ds-content-browser-panel min-w-0">
        <div className="ds-content-browser-panel__toolbar flex flex-wrap items-center gap-2">
          <div className="relative min-w-[160px] flex-1">
            <SearchRoundedIcon
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-black/35"
              sx={{ fontSize: 16 }}
            />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter folders and files..."
              className="ds-content-browser-panel__search"
            />
          </div>
          <label className="flex shrink-0 items-center gap-1.5 text-[11px] text-black/55">
            <input
              type="checkbox"
              checked={includeSubfolders}
              onChange={(e) => onIncludeSubfoldersChange(e.target.checked)}
              className="accent-sky-600"
            />
            Include subfolders
          </label>
        </div>
        <div className="ds-content-browser-panel__body">
          {nodes.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              depth={0}
              selectedPaths={selectedPaths}
              onTogglePath={onTogglePath}
              expanded={expanded}
              onToggleExpand={toggleExpand}
              filter={filter}
            />
          ))}
        </div>
      </div>

      <div className="ds-content-browser-panel min-w-0">
        <h4 className="ds-content-browser-panel__title">Selection summary</h4>
        <div className="ds-content-browser-panel__stats">
          <div className="rounded-lg border border-black/[0.06] bg-white/55 px-2 py-2 text-center">
            <p className="text-[15px] font-bold leading-none text-black">{folderCount}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-black/45">Folders</p>
          </div>
          <div className="rounded-lg border border-sky-200/80 bg-sky-50/80 px-2 py-2 text-center">
            <p className="text-[15px] font-bold leading-none text-sky-900">~{estimate.fileCount}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-sky-800/70">Documents</p>
          </div>
          <div className="rounded-lg border border-emerald-200/80 bg-emerald-50/80 px-2 py-2 text-center">
            <p className="text-[15px] font-bold leading-none text-emerald-900">~{estimate.sizeMb}MB</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-800/70">Size</p>
          </div>
        </div>

        <div className="ds-content-browser-panel__paths">
          <p className="ds-content-browser-panel__paths-label">Selected paths</p>
          <ul className="ds-content-browser-panel__paths-list">
            {selectedPaths.length === 0 ? (
              <li className="px-2.5 py-3 text-[12px] text-black/40">Nothing selected yet</li>
            ) : (
              selectedPaths.map((p) => (
                <li
                  key={p}
                  className="flex items-center gap-1.5 border-b border-black/[0.05] px-2.5 py-1.5 last:border-b-0"
                >
                  <InsertDriveFileRoundedIcon className="shrink-0 text-black/30" sx={{ fontSize: 13 }} />
                  <span className="truncate text-[11px] text-black/65" title={p}>
                    {p}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
