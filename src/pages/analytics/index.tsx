import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBuilderStore } from "@/store/builder-store";

export default function AnalyticsPage() {
  const testRan = useBuilderStore((s) => s.testRan);
  const indexProgress = useBuilderStore((s) => s.indexProgress);
  const setStep = useBuilderStore((s) => s.setStep);
  const navigate = useNavigate();

  const openTest = () => {
    setStep(6);
    navigate("/builder");
  };

  return (
    <PageShell>
      <PageHeader
        icon={<AnalyticsRoundedIcon sx={{ fontSize: 20 }} />}
        title="Analytics"
        description="Search usage, retrieval quality, and agent performance metrics."
        action={
          <Button variant="primary" size="sm" onClick={openTest}>
            <SearchRoundedIcon sx={{ fontSize: 16 }} />
            Run validation
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Queries (7d)", value: testRan ? "128" : "—", icon: <SearchRoundedIcon sx={{ fontSize: 18 }} />, tone: "orange" },
          { label: "Avg relevance", value: testRan ? "0.87" : "—", icon: <TrendingUpRoundedIcon sx={{ fontSize: 18 }} />, tone: "green" },
          { label: "Index health", value: `${indexProgress}%`, icon: <StorageRoundedIcon sx={{ fontSize: 18 }} />, tone: "blue" },
        ].map((m) => (
          <Card key={m.label}>
            <CardBody className="flex items-center gap-3 p-5">
              <span className={`route-page-header__icon !h-10 !w-10 ${m.tone === "green" ? "!bg-success-bg !text-success-icon" : m.tone === "blue" ? "!bg-blue-100 !text-blue-700" : ""}`}>
                {m.icon}
              </span>
              <div>
                <p className="text-2xl font-bold">{m.value}</p>
                <p className="text-sm text-gray-500">{m.label}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
      {!testRan && (
        <div className="route-empty mt-4">
          <h2 className="text-sm font-semibold text-black">Run your first validation to unlock analytics</h2>
          <p className="mt-1 text-xs text-black/55">Query volume and relevance metrics appear after Step 6 completes.</p>
          <Button variant="primary" size="sm" className="mt-4" onClick={openTest}>Go to test step</Button>
        </div>
      )}
    </PageShell>
  );
}
