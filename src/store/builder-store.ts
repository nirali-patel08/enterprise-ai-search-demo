import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ACTION_MODES,
  DeploymentType,
  MarketplaceAgent,
  SavedConnector,
  SearchIndex,
  WorkflowDefinition,
} from "@/data/sample";
import { EMPTY_WORKFLOW, SAMPLE_SAVED_CONNECTORS, SAMPLE_SEARCH_INDEXES, buildIndexName } from "@/data/sample";

const MAX_STEP = 5;

export interface BuilderStore {
  step: number;
  deploymentType: DeploymentType;
  savedConnectors: SavedConnector[];
  selectedConnectorTypeIds: string[];
  activeConnectorTypeId: string;
  indexingSelection: string[];
  activeBrowseConnectorId: string;
  contentSelections: Record<string, string[]>;
  includeSubfolders: boolean;
  indexingComplete: boolean;
  customAgents: MarketplaceAgent[];
  selectedAgentIds: string[];
  searchIndexes: SearchIndex[];
  workflowDefinition: WorkflowDefinition;
  orchestrationId: string;
  orchestrationSaved: boolean;
  channels: string[];
  indexProgress: number;
  indexing: boolean;
  query: string;
  actionMode: (typeof ACTION_MODES)[number];
  testRan: boolean;
  deployed: boolean;
  chatMessages: { role: "assistant" | "user"; text: string }[];
  rbac: boolean;
  citations: boolean;
  teamsCompat: boolean;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setDeploymentType: (type: DeploymentType) => void;
  setActiveConnectorTypeId: (id: string) => void;
  toggleConnectorType: (typeId: string) => void;
  saveConnector: (connector: SavedConnector) => void;
  removeConnector: (id: string) => void;
  setIndexingSelection: (ids: string[]) => void;
  toggleIndexingSelection: (id: string) => void;
  setActiveBrowseConnectorId: (id: string) => void;
  toggleContentPath: (connectorId: string, path: string) => void;
  setContentSelections: (connectorId: string, paths: string[]) => void;
  setIncludeSubfolders: (value: boolean) => void;
  setIndexingComplete: (value: boolean) => void;
  updateConnectorStatus: (id: string, status: SavedConnector["status"], documentCount?: number, indexedPaths?: string[]) => void;
  toggleAgent: (id: string) => void;
  addCustomAgent: (agent: MarketplaceAgent) => void;
  addSearchIndex: (index: SearchIndex) => void;
  removeSearchIndex: (id: string) => void;
  upsertSearchIndexesFromIndexing: (
    entries: Array<{
      connectorId: string;
      connectorName: string;
      connectorTypeId: string;
      deployment: DeploymentType;
      documentCount: number;
    }>,
  ) => void;
  setWorkflowDefinition: (workflow: WorkflowDefinition) => void;
  setOrchestrationId: (id: string) => void;
  setOrchestrationSaved: (value: boolean) => void;
  toggleChannel: (id: string) => void;
  setIndexing: (value: boolean) => void;
  setIndexProgress: (value: number) => void;
  setQuery: (value: string) => void;
  setActionMode: (mode: (typeof ACTION_MODES)[number]) => void;
  setTestRan: (value: boolean) => void;
  setDeployed: (value: boolean) => void;
  addChatMessage: (role: "assistant" | "user", text: string) => void;
  setRbac: (value: boolean) => void;
  setCitations: (value: boolean) => void;
  setTeamsCompat: (value: boolean) => void;
}

export const useBuilderStore = create<BuilderStore>()(
  persist(
    (set, get) => ({
      step: 1,
      deploymentType: "cloud",
      savedConnectors: SAMPLE_SAVED_CONNECTORS,
      selectedConnectorTypeIds: ["sharepoint", "azure-blob", "azure-sql"],
      activeConnectorTypeId: "sharepoint",
      indexingSelection: ["conn-1"],
      activeBrowseConnectorId: "conn-1",
      contentSelections: {
        "conn-1": ["/sites/knowledge/Shared Documents/Contracts", "/sites/knowledge/Shared Documents/Finance"],
      },
      includeSubfolders: true,
      indexingComplete: false,
      customAgents: [],
      selectedAgentIds: ["sharepoint-agent", "engineering-drawing-agent", "document-router-agent"],
      searchIndexes: SAMPLE_SEARCH_INDEXES,
      workflowDefinition: { ...EMPTY_WORKFLOW },
      orchestrationId: "",
      orchestrationSaved: false,
      channels: ["web", "teams"],
      indexProgress: 0,
      indexing: false,
      query: "Show contracts, POs and invoices related to ABC Vendor and identify mismatch.",
      actionMode: "Search",
      testRan: false,
      deployed: false,
      chatMessages: [
        {
          role: "assistant",
          text: "Hello. I can search contracts, POs, invoices, policies and enterprise documents. How can I help?",
        },
      ],
      rbac: true,
      citations: true,
      teamsCompat: true,
      setStep: (step) => set({ step }),
      nextStep: () => set({ step: Math.min(MAX_STEP, get().step + 1) }),
      prevStep: () => set({ step: Math.max(1, get().step - 1) }),
      setDeploymentType: (deploymentType) => set({ deploymentType }),
      setActiveConnectorTypeId: (activeConnectorTypeId) => set({ activeConnectorTypeId }),
      toggleConnectorType: (typeId) =>
        set((s) => {
          const selected = s.selectedConnectorTypeIds.includes(typeId)
            ? s.selectedConnectorTypeIds.filter((id) => id !== typeId)
            : [...s.selectedConnectorTypeIds, typeId];

          const indexingSelection = s.savedConnectors
            .filter(
              (c) =>
                c.deployment === s.deploymentType &&
                c.validated &&
                selected.includes(c.connectorTypeId),
            )
            .map((c) => c.id);

          return {
            selectedConnectorTypeIds: selected,
            indexingSelection,
            indexingComplete: false,
            activeBrowseConnectorId: indexingSelection[0] ?? "",
          };
        }),
      saveConnector: (connector) =>
        set((s) => {
          const exists = s.savedConnectors.find((c) => c.id === connector.id);
          const savedConnectors = exists
            ? s.savedConnectors.map((c) => (c.id === connector.id ? connector : c))
            : [...s.savedConnectors, connector];

          const selectedConnectorTypeIds = s.selectedConnectorTypeIds.includes(connector.connectorTypeId)
            ? s.selectedConnectorTypeIds
            : [...s.selectedConnectorTypeIds, connector.connectorTypeId];

          const indexingSelection = savedConnectors
            .filter(
              (c) =>
                c.deployment === s.deploymentType &&
                c.validated &&
                selectedConnectorTypeIds.includes(c.connectorTypeId),
            )
            .map((c) => c.id);

          return {
            savedConnectors,
            selectedConnectorTypeIds,
            indexingSelection,
            activeBrowseConnectorId: indexingSelection[0] ?? s.activeBrowseConnectorId,
          };
        }),
      removeConnector: (id) =>
        set((s) => {
          const removed = s.savedConnectors.find((c) => c.id === id);
          const savedConnectors = s.savedConnectors.filter((c) => c.id !== id);
          const stillHasType = removed
            ? savedConnectors.some(
                (c) => c.connectorTypeId === removed.connectorTypeId && c.deployment === removed.deployment,
              )
            : true;
          const selectedConnectorTypeIds =
            removed && !stillHasType
              ? s.selectedConnectorTypeIds.filter((t) => t !== removed.connectorTypeId)
              : s.selectedConnectorTypeIds;
          return {
            savedConnectors,
            selectedConnectorTypeIds,
            indexingSelection: s.indexingSelection.filter((x) => x !== id),
          };
        }),
      setIndexingSelection: (indexingSelection) => set({ indexingSelection, indexingComplete: false }),
      toggleIndexingSelection: (id) =>
        set((s) => {
          const next = s.indexingSelection.includes(id)
            ? s.indexingSelection.filter((x) => x !== id)
            : [...s.indexingSelection, id];
          return { indexingSelection: next, indexingComplete: false };
        }),
      setActiveBrowseConnectorId: (activeBrowseConnectorId) => set({ activeBrowseConnectorId }),
      toggleContentPath: (connectorId, path) =>
        set((s) => {
          const current = s.contentSelections[connectorId] ?? [];
          const next = current.includes(path) ? current.filter((p) => p !== path) : [...current, path];
          return {
            contentSelections: { ...s.contentSelections, [connectorId]: next },
            indexingComplete: false,
          };
        }),
      setContentSelections: (connectorId, paths) =>
        set((s) => ({
          contentSelections: { ...s.contentSelections, [connectorId]: paths },
          indexingComplete: false,
        })),
      setIncludeSubfolders: (includeSubfolders) => set({ includeSubfolders }),
      setIndexingComplete: (indexingComplete) => set({ indexingComplete }),
      updateConnectorStatus: (id, status, documentCount, indexedPaths) =>
        set((s) => ({
          savedConnectors: s.savedConnectors.map((c) =>
            c.id === id
              ? {
                  ...c,
                  status,
                  documentCount: documentCount ?? c.documentCount,
                  indexedPaths: indexedPaths ?? c.indexedPaths,
                  selectedPaths: indexedPaths ?? c.selectedPaths,
                  lastIndexedAt: status === "indexed" ? new Date().toLocaleString() : c.lastIndexedAt,
                }
              : c,
          ),
        })),
      toggleAgent: (id) =>
        set((s) => ({
          selectedAgentIds: s.selectedAgentIds.includes(id)
            ? s.selectedAgentIds.filter((x) => x !== id)
            : [...s.selectedAgentIds, id],
        })),
      addCustomAgent: (agent) =>
        set((s) => ({
          customAgents: [...s.customAgents, agent],
          selectedAgentIds: s.selectedAgentIds.includes(agent.id)
            ? s.selectedAgentIds
            : [...s.selectedAgentIds, agent.id],
        })),
      addSearchIndex: (index) =>
        set((s) => ({
          searchIndexes: s.searchIndexes.some((i) => i.id === index.id)
            ? s.searchIndexes.map((i) => (i.id === index.id ? index : i))
            : [...s.searchIndexes, index],
        })),
      removeSearchIndex: (id) =>
        set((s) => ({
          searchIndexes: s.searchIndexes.filter((i) => i.id !== id),
        })),
      upsertSearchIndexesFromIndexing: (entries) =>
        set((s) => {
          const next = [...s.searchIndexes];
          entries.forEach((entry) => {
            const id = `idx-${entry.connectorId}`;
            const existing = next.find((i) => i.id === id);
            const sizeBytes = Math.max(1, entry.documentCount) * 1450;
            const index: SearchIndex = {
              id,
              name: existing?.name ?? buildIndexName(entry.connectorName, entry.connectorTypeId),
              deployment: entry.deployment,
              createdVia: "builder-indexing",
              connectorId: entry.connectorId,
              connectorName: entry.connectorName,
              documentCount: entry.documentCount,
              sizeBytes,
              status: entry.documentCount > 0 ? "yellow" : "red",
              createdAt: new Date().toLocaleString(),
            };
            if (existing) {
              const idx = next.findIndex((i) => i.id === id);
              next[idx] = { ...existing, ...index, name: existing.name };
            } else {
              next.push(index);
            }
          });
          return { searchIndexes: next };
        }),
      setWorkflowDefinition: (workflowDefinition) => set({ workflowDefinition }),
      setOrchestrationId: (orchestrationId) => set({ orchestrationId }),
      setOrchestrationSaved: (orchestrationSaved) => set({ orchestrationSaved }),
      toggleChannel: (id) =>
        set((s) => ({
          channels: s.channels.includes(id) ? s.channels.filter((x) => x !== id) : [...s.channels, id],
        })),
      setIndexing: (indexing) => set({ indexing }),
      setIndexProgress: (indexProgress) => set({ indexProgress }),
      setQuery: (query) => set({ query }),
      setActionMode: (actionMode) => set({ actionMode }),
      setTestRan: (testRan) => set({ testRan }),
      setDeployed: (deployed) => set({ deployed }),
      addChatMessage: (role, text) => set((s) => ({ chatMessages: [...s.chatMessages, { role, text }] })),
      setRbac: (rbac) => set({ rbac }),
      setCitations: (citations) => set({ citations }),
      setTeamsCompat: (teamsCompat) => set({ teamsCompat }),
    }),
    {
      name: "enterprise-search-builder-v6",
      partialize: (state) => ({
        step: state.step,
        deploymentType: state.deploymentType,
        savedConnectors: state.savedConnectors,
        selectedConnectorTypeIds: state.selectedConnectorTypeIds,
        indexingSelection: state.indexingSelection,
        contentSelections: state.contentSelections,
        includeSubfolders: state.includeSubfolders,
        indexingComplete: state.indexingComplete,
        customAgents: state.customAgents,
        selectedAgentIds: state.selectedAgentIds,
        searchIndexes: state.searchIndexes,
        workflowDefinition: state.workflowDefinition,
        orchestrationId: state.orchestrationId,
        orchestrationSaved: state.orchestrationSaved,
        channels: state.channels,
        indexProgress: state.indexProgress,
        testRan: state.testRan,
        deployed: state.deployed,
        chatMessages: state.chatMessages,
      }),
    },
  ),
);
