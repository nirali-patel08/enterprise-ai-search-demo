import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { SectionCard } from "@/components/ui/section-card";
import { useBuilderStore } from "@/store/builder-store";

export default function GovernancePage() {
  const rbac = useBuilderStore((s) => s.rbac);
  const citations = useBuilderStore((s) => s.citations);

  return (
    <PageShell>
      <PageHeader icon={<ShieldRoundedIcon sx={{ fontSize: 20 }} />} title="Governance" description="RBAC, ACL filtering, citations, and compliance controls." />
      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard title="Access control">
          <ul className="space-y-2 text-sm text-gray-600">
            <li>RBAC / ACL filter: <strong>{rbac ? "Enabled" : "Disabled"}</strong></li>
            <li>Citations required: <strong>{citations ? "Yes" : "No"}</strong></li>
            <li>SSO: Entra ID (sample)</li>
          </ul>
        </SectionCard>
        <SectionCard title="Audit">
          <p className="text-sm text-gray-500">Connector validation, indexing, and agent routing events are logged for admin review.</p>
        </SectionCard>
      </div>
    </PageShell>
  );
}
