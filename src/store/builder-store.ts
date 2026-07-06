import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ACTION_MODES } from "@/data/sample";

export interface BuilderStore {
  step: number;
  connectors: string[];
  channels: string[];
  agents: string[];
  activeConnector: string;
  validated: Record<string, boolean>;
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
  toggleConnector: (id: string) => void;
  toggleChannel: (id: string) => void;
  toggleAgent: (id: string) => void;
  setActiveConnector: (id: string) => void;
  setValidated: (id: string, value: boolean) => void;
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
      connectors: ["sharepoint", "azure-blob", "s3"],
      channels: ["web", "teams"],
      agents: ["orchestrator", "contract", "po", "invoice"],
      activeConnector: "sharepoint",
      validated: { sharepoint: true },
      indexProgress: 100,
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
      nextStep: () => set({ step: Math.min(7, get().step + 1) }),
      prevStep: () => set({ step: Math.max(1, get().step - 1) }),
      toggleConnector: (id) =>
        set((s) => ({
          connectors: s.connectors.includes(id)
            ? s.connectors.filter((x) => x !== id)
            : [...s.connectors, id],
        })),
      toggleChannel: (id) =>
        set((s) => ({
          channels: s.channels.includes(id) ? s.channels.filter((x) => x !== id) : [...s.channels, id],
        })),
      toggleAgent: (id) => {
        if (id === "orchestrator") return;
        set((s) => ({
          agents: s.agents.includes(id) ? s.agents.filter((x) => x !== id) : [...s.agents, id],
        }));
      },
      setActiveConnector: (id) => set({ activeConnector: id }),
      setValidated: (id, value) => set((s) => ({ validated: { ...s.validated, [id]: value } })),
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
      name: "enterprise-search-builder",
      partialize: (state) => ({
        step: state.step,
        connectors: state.connectors,
        channels: state.channels,
        agents: state.agents,
        validated: state.validated,
        indexProgress: state.indexProgress,
        testRan: state.testRan,
        deployed: state.deployed,
        chatMessages: state.chatMessages,
      }),
    },
  ),
);
