import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { StepChat } from "@/pages/search-builder/components/steps/step-chat";

export default function ChatPage() {
  return (
    <PageShell>
      <PageHeader
        icon={<SearchRoundedIcon sx={{ fontSize: 20 }} />}
        title="Agentic AI Chat"
        description="Ask questions across enterprise knowledge. The Orchestrator Agent routes the query to specialized agents."
      />
      <StepChat />
    </PageShell>
  );
}
