import CloudOutlinedIcon from "@mui/icons-material/CloudOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import { Card, CardBody } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DeploymentType } from "@/data/sample";
import { useBuilderStore } from "@/store/builder-store";

export const StepDeployment = () => {
  const deploymentType = useBuilderStore((s) => s.deploymentType);
  const setDeploymentType = useBuilderStore((s) => s.setDeploymentType);

  const options: { id: DeploymentType; title: string; desc: string; items: string[]; icon: React.ReactNode; accent: string }[] = [
    {
      id: "cloud",
      title: "Cloud (Azure) Deployment",
      desc: "Microsoft Foundry, Azure AI Search, SharePoint, Blob, SQL, and Teams integrations.",
      items: ["SharePoint", "Azure Blob", "Azure SQL", "OneLake", "Teams Files", "REST API"],
      icon: <CloudOutlinedIcon sx={{ fontSize: 28 }} />,
      accent: "border-sky-500 bg-sky-50/60 ring-sky-200",
    },
    {
      id: "opensource",
      title: "Open Source Deployment",
      desc: "LangGraph orchestration, OpenSearch, PostgreSQL, MinIO, Confluence, and Jira.",
      items: ["Local FS", "S3 / MinIO", "PostgreSQL", "MongoDB", "Confluence", "Jira"],
      icon: <CodeOutlinedIcon sx={{ fontSize: 28 }} />,
      accent: "border-emerald-500 bg-emerald-50/60 ring-emerald-200",
    },
  ];

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">1. Select Deployment Type</h2>
        <p className="mt-1 text-sm text-gray-500">Choose cloud or open source first. Available data sources and orchestration options depend on this selection.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {options.map((opt) => {
          const selected = deploymentType === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setDeploymentType(opt.id)}
              className={cn("text-left transition", selected && "rounded-2xl ring-2", selected && opt.accent)}
            >
              <Card className={cn("h-full", selected && "border-transparent shadow-none")}>
                <CardBody className="p-5">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-700">{opt.icon}</div>
                  <h3 className="font-semibold text-gray-900">{opt.title}</h3>
                  <p className="mt-2 text-sm text-gray-500">{opt.desc}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {opt.items.map((item) => (
                      <span key={item} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-600">
                        {item}
                      </span>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </button>
          );
        })}
      </div>
    </section>
  );
};
