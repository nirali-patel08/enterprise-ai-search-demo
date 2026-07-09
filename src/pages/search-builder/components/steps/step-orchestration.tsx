import { ORCHESTRATION_OPTIONS } from "@/data/sample";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useBuilderStore } from "@/store/builder-store";

export const StepOrchestration = () => {
  const deploymentType = useBuilderStore((s) => s.deploymentType);
  const orchestrationId = useBuilderStore((s) => s.orchestrationId);
  const setOrchestrationId = useBuilderStore((s) => s.setOrchestrationId);
  const selectedAgentIds = useBuilderStore((s) => s.selectedAgentIds);

  const options = ORCHESTRATION_OPTIONS.filter(
    (o) => o.deployment === deploymentType || o.deployment === "both",
  );

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">5. Multi-Agent Orchestration</h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose how selected agents ({selectedAgentIds.length}) are coordinated — workflow orchestrator for cloud or LangGraph supervisor for open source.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {options.map((opt) => {
          const selected = orchestrationId === opt.id;
          return (
            <button key={opt.id} type="button" onClick={() => setOrchestrationId(opt.id)} className="text-left">
              <Card className={cn("h-full transition", selected && "ring-2 ring-orange-500")}>
                <CardBody className="p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{opt.name}</h3>
                    {selected && <Badge variant="success">Selected</Badge>}
                  </div>
                  <p className="text-sm text-gray-500">{opt.description}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-1">
                    {opt.diagram.map((node, i) => (
                      <span key={node} className="flex items-center gap-1">
                        <span className="rounded-lg bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-700">{node}</span>
                        {i < opt.diagram.length - 1 && <span className="text-gray-300">→</span>}
                      </span>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </button>
          );
        })}
      </div>

      <Card>
        <CardBody className="p-5">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Validation checkpoints</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {["Retrieval validation", "Citations & references", "Agent routing validation", "Response quality", "Observability & logs"].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {item}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </section>
  );
};
