import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import { AGENTS, CHANNELS, CONNECTORS } from "@/data/sample";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBuilderStore } from "@/store/builder-store";

export const StepPipeline = () => {
  const connectors = useBuilderStore((s) => s.connectors);
  const agents = useBuilderStore((s) => s.agents);
  const channels = useBuilderStore((s) => s.channels);

  const stages = [
    { title: "Connected Sources", sub: `${connectors.length} selected`, pills: CONNECTORS.filter((c) => connectors.includes(c.id)).map((c) => c.name), tone: "info" as const },
    { title: "Ingestion & Processing", sub: "OCR, parsing, chunking", pills: ["Document Intelligence", "ETL", "Embeddings"], tone: "info" as const },
    { title: "Search Index", sub: "Hybrid + vector + semantic", pills: ["Azure AI Search"], tone: "success" as const },
    { title: "AI Agents", sub: `${agents.length} configured`, pills: AGENTS.filter((a) => agents.includes(a.id)).map((a) => a.name), tone: "warning" as const },
    { title: "Access Channels", sub: `${channels.length} enabled`, pills: CHANNELS.filter((c) => channels.includes(c.id)).map((c) => c.name), tone: "gold" as const },
  ];

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">3. Enterprise AI Search Pipeline</h2>
        <p className="mt-1 text-sm text-gray-500">End-to-end flow from connected sources through indexing to agents and channels.</p>
      </div>

      <div className="flex flex-wrap items-stretch gap-2">
        {stages.map((stage, i) => (
          <div key={stage.title} className="flex items-center gap-2">
            <Card className="min-w-[160px] flex-1">
              <CardBody className="p-4">
                <h3 className="text-sm font-semibold">{stage.title}</h3>
                <p className="text-xs text-gray-500">{stage.sub}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {stage.pills.map((p) => (
                    <Badge key={p} variant={stage.tone} size="sm">{p}</Badge>
                  ))}
                </div>
              </CardBody>
            </Card>
            {i < stages.length - 1 && <ChevronRightRoundedIcon className="hidden text-gray-300 sm:block" sx={{ fontSize: 18 }} />}
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: "Document Extraction", desc: "OCR, table extraction, layout analysis via Document Intelligence.", tags: ["OCR enabled", "Tables"] },
          { title: "Chunking & Embeddings", desc: "Semantic chunking with overlap. Model: text-embedding-3-large.", meta: "Chunk: 512 tokens · Overlap: 64" },
          { title: "Search Index", desc: "Hybrid retrieval with semantic ranker and vector search.", tags: ["Azure AI Search"] },
        ].map((card) => (
          <Card key={card.title}>
            <CardBody className="p-4">
              <h3 className="font-semibold text-gray-900">{card.title}</h3>
              <p className="mt-2 text-sm text-gray-500">{card.desc}</p>
              {card.meta && <p className="mt-2 text-xs text-gray-400">{card.meta}</p>}
              {card.tags && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {card.tags.map((t) => (
                    <Badge key={t} variant="outline" size="sm">{t}</Badge>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>
    </section>
  );
};
