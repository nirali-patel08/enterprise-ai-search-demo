import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import RocketLaunchRoundedIcon from "@mui/icons-material/RocketLaunchRounded";
import MonitorRoundedIcon from "@mui/icons-material/MonitorRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import { searchBuilderApi } from "@/api/search-builder";
import { CHANNELS } from "@/data/sample";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { useBuilderStore } from "@/store/builder-store";

const channelIcons: Record<string, React.ReactNode> = {
  web: <MonitorRoundedIcon sx={{ fontSize: 20 }} />,
  teams: <GroupsRoundedIcon sx={{ fontSize: 20 }} />,
  copilot: <SmartToyRoundedIcon sx={{ fontSize: 20 }} />,
  api: <LinkRoundedIcon sx={{ fontSize: 20 }} />,
};

export const StepDeploy = () => {
  const channels = useBuilderStore((s) => s.channels);
  const savedConnectors = useBuilderStore((s) => s.savedConnectors);
  const selectedAgentIds = useBuilderStore((s) => s.selectedAgentIds);
  const orchestrationId = useBuilderStore((s) => s.orchestrationId);
  const testRan = useBuilderStore((s) => s.testRan);
  const deployed = useBuilderStore((s) => s.deployed);
  const toggleChannel = useBuilderStore((s) => s.toggleChannel);
  const setDeployed = useBuilderStore((s) => s.setDeployed);

  const indexedCount = savedConnectors.filter((c) => c.status === "indexed").length;

  const deployMutation = useMutation({
    mutationFn: () => searchBuilderApi.deploy(channels),
    onSuccess: () => {
      setDeployed(true);
      toast.success(`Published to ${channels.length} channel(s)`);
    },
  });

  const checklist = [
    { ok: indexedCount > 0, text: "At least one source indexed" },
    { ok: selectedAgentIds.length > 0, text: "At least one agent selected" },
    { ok: !!orchestrationId, text: "Multi-agent orchestration configured" },
    { ok: channels.length > 0, text: "At least one access channel enabled" },
    { ok: testRan, text: "Admin test query passed" },
  ];

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">7. Deploy to Access Channels</h2>
        <p className="mt-1 text-sm text-gray-500">Publish the configured search experience to end-user channels.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {CHANNELS.map((ch) => {
          const on = channels.includes(ch.id);
          return (
            <Card key={ch.id} className={cn(on && "connector-card--selected")}>
              <CardBody className="p-4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-orange-600">
                  {channelIcons[ch.id]}
                </div>
                <h3 className="font-semibold text-gray-900">{ch.name}</h3>
                <p className="mt-1 text-xs text-gray-500">{ch.description}</p>
                <Button variant={on ? "secondary" : "primary"} size="sm" className="mt-4 w-full" onClick={() => toggleChannel(ch.id)}>
                  {on ? `Disable ${ch.name}` : `Enable ${ch.name}`}
                </Button>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <SectionCard title="Pre-deploy Checklist">
        <ul className="space-y-3">
          {checklist.map((item) => (
            <li key={item.text} className="flex items-center gap-2 text-sm">
              {item.ok ? (
                <CheckCircleRoundedIcon className="text-emerald-600" sx={{ fontSize: 18 }} />
              ) : (
                <ErrorOutlineRoundedIcon className="text-amber-500" sx={{ fontSize: 18 }} />
              )}
              <span className={item.ok ? "text-gray-700" : "text-gray-500"}>{item.text}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            variant="primary"
            loading={deployMutation.isPending}
            disabled={!testRan || channels.length === 0 || deployed}
            onClick={() => deployMutation.mutate()}
          >
            <RocketLaunchRoundedIcon sx={{ fontSize: 18 }} />
            {deployed ? "Published" : `Publish to ${channels.length} channel(s)`}
          </Button>
          {deployed && (
            <Link to="/chat">
              <Button variant="secondary">Open AI Chat</Button>
            </Link>
          )}
        </div>
      </SectionCard>
    </section>
  );
};
