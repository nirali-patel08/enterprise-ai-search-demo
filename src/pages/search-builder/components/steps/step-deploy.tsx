import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import RocketLaunchRoundedIcon from "@mui/icons-material/RocketLaunchRounded";
import MonitorRoundedIcon from "@mui/icons-material/MonitorRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { searchBuilderApi } from "@/api/search-builder";
import { CHANNELS } from "@/data/sample";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { useBuilderStore } from "@/store/builder-store";
import { WizardPanel } from "../wizard-ui";

const channelIcons: Record<string, React.ReactNode> = {
  web: <MonitorRoundedIcon sx={{ fontSize: 22 }} />,
  teams: <GroupsRoundedIcon sx={{ fontSize: 22 }} />,
  copilot: <SmartToyRoundedIcon sx={{ fontSize: 22 }} />,
  api: <LinkRoundedIcon sx={{ fontSize: 22 }} />,
};

const channelIconTone: Record<string, string> = {
  web: "ds-source-tile__icon--files",
  teams: "ds-source-tile__icon--apps",
  copilot: "ds-source-tile__icon--db",
  api: "ds-source-tile__icon--api",
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
      <div className="grid gap-[14px] sm:grid-cols-2 xl:grid-cols-4">
        {CHANNELS.map((ch) => {
          const on = channels.includes(ch.id);
          return (
            <div
              key={ch.id}
              role="button"
              tabIndex={0}
              aria-pressed={on}
              onClick={() => toggleChannel(ch.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleChannel(ch.id);
                }
              }}
              className={cn("ds-source-tile deploy-channel", on && "ds-source-tile--selected")}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={cn("ds-source-tile__icon", channelIconTone[ch.id])}
                  aria-hidden
                >
                  {channelIcons[ch.id]}
                </span>
                <span className="ds-source-tile__check" aria-hidden>
                  <CheckRoundedIcon sx={{ fontSize: 15 }} />
                </span>
              </div>

              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold leading-tight text-black">
                  {ch.name}
                </p>
                <p className="mt-1 line-clamp-2 text-[12px] leading-[150%] text-black/55">
                  {ch.description}
                </p>
              </div>

              <div className="mt-auto pt-1">
                {on ? (
                  <span className="ds-source-tile__status ds-source-tile__status--ready">
                    <CheckCircleRoundedIcon sx={{ fontSize: 14 }} />
                    Enabled
                  </span>
                ) : (
                  <span className="deploy-channel__enable">
                    <AddRoundedIcon sx={{ fontSize: 16 }} />
                    Enable channel
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <WizardPanel title="Pre-deploy Checklist" className="!p-5">
        <ul className="space-y-3">
          {checklist.map((item) => (
            <li key={item.text} className="flex items-center gap-2 text-[13px]">
              {item.ok ? (
                <CheckCircleRoundedIcon className="text-emerald-600" sx={{ fontSize: 18 }} />
              ) : (
                <ErrorOutlineRoundedIcon className="text-amber-500" sx={{ fontSize: 18 }} />
              )}
              <span className={item.ok ? "text-black" : "text-black/55"}>{item.text}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            variant="primary"
            size="md"
            loading={deployMutation.isPending}
            disabled={!testRan || channels.length === 0 || deployed}
            onClick={() => deployMutation.mutate()}
          >
            <RocketLaunchRoundedIcon sx={{ fontSize: 16 }} />
            {deployed ? "Published" : `Publish to ${channels.length} channel(s)`}
          </Button>
          {deployed && (
            <Link to="/chat">
              <Button variant="secondary" size="md">
                Open AI Chat
              </Button>
            </Link>
          )}
        </div>
      </WizardPanel>
    </section>
  );
};
