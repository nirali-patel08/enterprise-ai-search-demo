import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { Card, CardBody } from "@/components/ui/card";
import { useBuilderStore } from "@/store/builder-store";

export default function AnalyticsPage() {
  const testRan = useBuilderStore((s) => s.testRan);
  const indexProgress = useBuilderStore((s) => s.indexProgress);

  return (
    <PageShell>
      <PageHeader icon={<AnalyticsRoundedIcon sx={{ fontSize: 20 }} />} title="Analytics" description="Search usage, retrieval quality, and agent performance metrics." />
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Queries (7d)", value: testRan ? "128" : "—" },
          { label: "Avg relevance", value: testRan ? "0.87" : "—" },
          { label: "Index health", value: `${indexProgress}%` },
        ].map((m) => (
          <Card key={m.label}><CardBody className="p-5"><p className="text-2xl font-bold">{m.value}</p><p className="text-sm text-gray-500">{m.label}</p></CardBody></Card>
        ))}
      </div>
    </PageShell>
  );
}
