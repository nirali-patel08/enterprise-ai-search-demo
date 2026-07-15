import { TEST_RESULT } from "@/data/sample";
import { resolveDemoReply } from "@/data/playground-demo";
import type { IndexingScopeSummary } from "@/types/content";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const searchBuilderApi = {
  validateConnector: async (connectorId: string): Promise<{ ok: boolean; connectorId: string }> => {
    await delay(1200);
    return { ok: true, connectorId };
  },
  startIndexing: async (scope: IndexingScopeSummary[]): Promise<{ documentCount: number; jobId: string }> => {
    await delay(300);
    const documentCount = scope.reduce((sum, s) => sum + s.estimatedFiles, 0);
    return { documentCount, jobId: `idx-${Date.now()}` };
  },
  runTestQuery: async (query: string, _mode: string) => {
    await delay(1500);
    const reply = resolveDemoReply(query, { orchestrated: true });
    return {
      ...TEST_RESULT,
      retrieval: {
        ...TEST_RESULT.retrieval,
        summary: `Retrieved ${reply.cites.length} grounded chunks from Corp intranet and Finance archives.`,
      },
      routing: {
        ...TEST_RESULT.routing,
        summary: reply.trace || TEST_RESULT.routing.summary,
      },
      citations: {
        ...TEST_RESULT.citations,
        sources: reply.cites.map((name) => ({
          name: name.split(" (")[0],
          detail: name.includes("(") ? name.slice(name.indexOf("(") + 1, -1) : "Indexed chunk",
        })),
      },
      response: {
        ...TEST_RESULT.response,
        text: reply.answer,
      },
    };
  },
  deploy: async (channelIds: string[]) => {
    await delay(1000);
    return { published: true, channels: channelIds };
  },
  askChat: async (message: string) => {
    await delay(800);
    const reply = resolveDemoReply(message, { orchestrated: true });
    const citeBlock = reply.cites.length
      ? `\n\nSources:\n${reply.cites.map((c) => `• ${c}`).join("\n")}`
      : "";
    return { text: `${reply.answer}${citeBlock}` };
  },
};
