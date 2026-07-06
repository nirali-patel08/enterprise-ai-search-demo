import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import { AGENTS } from "@/data/sample";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useBuilderStore } from "@/store/builder-store";

export const StepAgents = () => {
  const agents = useBuilderStore((s) => s.agents);
  const toggleAgent = useBuilderStore((s) => s.toggleAgent);

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">4. Select Agent Capabilities</h2>
        <p className="mt-1 text-sm text-gray-500">Enable specialized agents. Orchestrator routes queries to the right domain experts.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {AGENTS.map((a) => {
          const on = agents.includes(a.id);
          return (
            <Card key={a.id} className={cn(on && "agent-card--selected")}>
              <CardBody className="p-4 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-orange-600">
                  <SmartToyRoundedIcon sx={{ fontSize: 20 }} />
                </div>
                <h3 className="font-semibold text-gray-900">{a.name}</h3>
                {a.required && <Badge variant="gold" size="sm" className="mt-2">Required</Badge>}
                <p className="mt-2 text-xs leading-relaxed text-gray-500">{a.description}</p>
                <Button
                  variant={on ? "secondary" : "primary"}
                  size="sm"
                  className="mt-4 w-full"
                  disabled={a.required}
                  onClick={() => toggleAgent(a.id)}
                >
                  {on ? `Remove ${a.name}` : `Add ${a.name}`}
                </Button>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </section>
  );
};
