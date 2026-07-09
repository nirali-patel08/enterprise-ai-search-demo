import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { SectionCard } from "@/components/ui/section-card";

export default function AdminPage() {
  return (
    <PageShell>
      <PageHeader icon={<SettingsRoundedIcon sx={{ fontSize: 20 }} />} title="Admin" description="Platform settings, environments, and deployment configuration." />
      <SectionCard title="Environment">
        <p className="text-sm text-gray-500">Demo environment — sample data only. Configure production endpoints and secrets in a full deployment.</p>
      </SectionCard>
    </PageShell>
  );
}
