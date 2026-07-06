import { Icon } from "@iconify/react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CONNECTORS } from "@/data/sample";
import { cn } from "@/lib/utils";
import { useBuilderStore } from "@/store/builder-store";

const iconMap: Record<string, string> = {
  sharepoint: "logos:microsoft-icon",
  "azure-blob": "logos:azure-icon",
  s3: "logos:aws",
  sql: "mdi:database",
  upload: "mdi:upload",
  web: "mdi:web",
  sap: "mdi:office-building",
  salesforce: "logos:salesforce",
};

export const StepDataSources = () => {
  const connectors = useBuilderStore((s) => s.connectors);
  const toggleConnector = useBuilderStore((s) => s.toggleConnector);

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">1. Data Source Onboarding</h2>
        <p className="mt-1 text-sm text-gray-500">Select connectors to ingest, process, chunk, embed and index into the enterprise search layer.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white/70 px-4 py-3 backdrop-blur-sm">
        <span className="text-sm text-gray-600">
          <strong className="text-gray-900">{connectors.length}</strong> source{connectors.length !== 1 ? "s" : ""} selected
        </span>
        <span className="text-gray-300">|</span>
        <span className="text-sm text-gray-500">Recommended: SharePoint + Blob/S3 for documents</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {CONNECTORS.map((c) => {
          const selected = connectors.includes(c.id);
          return (
            <Card key={c.id} className={cn(selected && "connector-card--selected")} hoverable>
              <CardBody className="flex h-full flex-col p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                    <Icon icon={iconMap[c.id] ?? "mdi:database"} className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900">{c.name}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-gray-500">{c.description}</p>
                  </div>
                </div>
                <Button
                  variant={selected ? "secondary" : "primary"}
                  size="sm"
                  className="mt-4 w-full"
                  onClick={() => toggleConnector(c.id)}
                >
                  {selected ? `Remove ${c.name}` : `Add ${c.name}`}
                </Button>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </section>
  );
};
