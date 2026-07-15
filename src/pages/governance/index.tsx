import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { SectionCard } from "@/components/ui/section-card";
import { Button } from "@/components/ui/button";
import { useBuilderStore } from "@/store/builder-store";

export default function GovernancePage() {
  const rbac = useBuilderStore((s) => s.rbac);
  const citations = useBuilderStore((s) => s.citations);

  return (
    <PageShell>
      <PageHeader
        icon={<ShieldRoundedIcon sx={{ fontSize: 20 }} />}
        title="Governance"
        description="RBAC, ACL filtering, citations, and compliance controls."
        action={
          <Link to="/chat">
            <Button variant="secondary" size="sm">Review chat controls</Button>
          </Link>
        }
      />
      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard title="Access control">
          <ul className="space-y-3 text-sm text-gray-600">
            {[
              ["RBAC / ACL filter", rbac ? "Enabled" : "Disabled"],
              ["Citations required", citations ? "Enabled" : "Disabled"],
              ["Single sign-on", "Entra ID"],
            ].map(([label, value]) => (
              <li key={label} className="flex items-center justify-between gap-3 rounded-[10px] border border-white bg-white/55 px-3 py-2">
                <span className="flex items-center gap-2">
                  <CheckCircleRoundedIcon sx={{ fontSize: 16 }} className="text-success-icon" />
                  {label}
                </span>
                <strong className="text-black">{value}</strong>
              </li>
            ))}
          </ul>
        </SectionCard>
        <SectionCard title="Audit">
          <div className="flex gap-3">
            <span className="route-page-header__icon !h-9 !w-9"><HistoryRoundedIcon sx={{ fontSize: 18 }} /></span>
            <p className="text-sm leading-6 text-gray-500">Connector validation, indexing, and agent routing events are logged for admin review.</p>
          </div>
        </SectionCard>
      </div>
    </PageShell>
  );
}
