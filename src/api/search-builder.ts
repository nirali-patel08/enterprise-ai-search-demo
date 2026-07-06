import { TEST_RESULT, CHAT_RESPONSE } from "@/data/sample";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const searchBuilderApi = {
  validateConnector: async (connectorId: string): Promise<{ ok: boolean; connectorId: string }> => {
    await delay(1200);
    return { ok: true, connectorId };
  },
  startIndexing: async (): Promise<{ documentCount: number }> => {
    await delay(500);
    return { documentCount: 12438 };
  },
  runTestQuery: async (_query: string, _mode: string) => {
    await delay(1500);
    return TEST_RESULT;
  },
  deploy: async (channelIds: string[]) => {
    await delay(1000);
    return { published: true, channels: channelIds };
  },
  askChat: async (_message: string) => {
    await delay(800);
    return { text: CHAT_RESPONSE };
  },
};
