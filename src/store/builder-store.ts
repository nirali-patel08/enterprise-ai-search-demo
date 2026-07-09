import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ACTION_MODES, DeploymentType, SavedConnector } from "@/data/sample";
import { SAMPLE_SAVED_CONNECTORS } from "@/data/sample";

const MAX_STEP = 7;

export interface BuilderStore {
  step: number;
  deploymentType: DeploymentType;
  savedConnectors: SavedConnector[];
  activeConnectorTypeId: string;
  indexingSelection: string[];
  selectedAgentIds: string[];
  orchestrationId: string;
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
  saveConnector: (connector: SavedConnector) => void;
  setIndexingSelection: (ids: string[]) => void;
  toggleIndexingSelection: (id: string) => void;
  updateConnectorStatus: (id: string, status: SavedConnector["status"], documentCount?: number) => void;
  toggleAgent: (id: string) => void;
  setOrchestrationId: (id: string) => void;
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
      activeConnectorTypeId: "sharepoint",
      indexingSelection: ["conn-1"],
      selectedAgentIds: ["sharepoint-agent", "engineering-drawing-agent", "document-router-agent"],
      orchestrationId: "foundry-workflow",
      channels: ["web", "teams"],
      indexProgress: 72,
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
      saveConnector: (connector) =>
        set((s) => {
          const exists = s.savedConnectors.find((c) => c.id === connector.id);
          if (exists) {
            return { savedConnectors: s.savedConnectors.map((c) => (c.id === connector.id ? connector : c)) };
          }
          return { savedConnectors: [...s.savedConnectors, connector] };
        }),
      setIndexingSelection: (indexingSelection) => set({ indexingSelection }),
      toggleIndexingSelection: (id) =>
        set((s) => ({
          indexingSelection: s.indexingSelection.includes(id)
            ? s.indexingSelection.filter((x) => x !== id)
            : [...s.indexingSelection, id],
        })),
      updateConnectorStatus: (id, status, documentCount) =>
        set((s) => ({
          savedConnectors: s.savedConnectors.map((c) =>
            c.id === id ? { ...c, status, documentCount: documentCount ?? c.documentCount } : c,
          ),
        })),
      toggleAgent: (id) =>
        set((s) => ({
          selectedAgentIds: s.selectedAgentIds.includes(id)
            ? s.selectedAgentIds.filter((x) => x !== id)
            : [...s.selectedAgentIds, id],
        })),
      setOrchestrationId: (orchestrationId) => set({ orchestrationId }),
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
      name: "enterprise-search-builder-v2",
      partialize: (state) => ({
        step: state.step,
        deploymentType: state.deploymentType,
        savedConnectors: state.savedConnectors,
        indexingSelection: state.indexingSelection,
        selectedAgentIds: state.selectedAgentIds,
        orchestrationId: state.orchestrationId,
        channels: state.channels,
        indexProgress: state.indexProgress,
        testRan: state.testRan,
        deployed: state.deployed,
        chatMessages: state.chatMessages,
      }),
    },
  ),
);
