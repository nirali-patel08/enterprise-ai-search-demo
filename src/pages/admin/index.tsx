import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import CloudRoundedIcon from "@mui/icons-material/CloudRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { SectionCard } from "@/components/ui/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  return (
    <PageShell>
      <PageHeader
        icon={<SettingsRoundedIcon sx={{ fontSize: 20 }} />}
        title="Admin"
        description="Platform settings, environments, and deployment configuration."
        action={
          <Link to="/governance">
            <Button variant="secondary" size="sm">Open governance</Button>
          </Link>
        }
      />
      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard title="Environment" trailing={<Badge variant="demo">Demo</Badge>}>
          <div className="flex gap-3">
            <span className="route-page-header__icon !h-10 !w-10"><CloudRoundedIcon sx={{ fontSize: 19 }} /></span>
            <div>
              <p className="text-sm font-semibold text-black">Contoso sample workspace</p>
              <p className="mt-1 text-xs leading-5 text-gray-500">Sample data only. Configure production endpoints and secrets in a full deployment.</p>
            </div>
          </div>
        </SectionCard>
        <SectionCard title="Security">
          <div className="flex gap-3">
            <span className="route-page-header__icon !h-10 !w-10"><SecurityRoundedIcon sx={{ fontSize: 19 }} /></span>
            <div>
              <p className="text-sm font-semibold text-black">Managed credentials</p>
              <p className="mt-1 text-xs leading-5 text-gray-500">Secrets are masked in this demo. Use managed identities and a secure vault in production.</p>
            </div>
          </div>
        </SectionCard>
      </div>
    </PageShell>
  );
}
