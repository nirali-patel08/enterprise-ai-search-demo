import CloudOutlinedIcon from "@mui/icons-material/CloudOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import {
  CLOUD_CONNECTORS,
  OPENSOURCE_CONNECTORS,
  type DeploymentType,
} from "@/data/sample";
import { cn } from "@/lib/utils";
import { useBuilderStore } from "@/store/builder-store";

const DEPLOY_OPTIONS: {
  id: DeploymentType;
  title: string;
  desc: string;
  nextPreview: string;
  icon: React.ReactNode;
  connectors: { id: string; label: string }[];
}[] = [
  {
    id: "cloud",
    title: "Cloud deployment",
    desc: "Managed cloud services, enterprise search, document libraries, object storage, SQL, and team integrations.",
    nextPreview: "Document Library, Object Storage, SQL Database, Data Lake, Team Files, REST API",
    icon: <CloudOutlinedIcon sx={{ fontSize: 22 }} />,
    connectors: CLOUD_CONNECTORS.filter((c) =>
      ["sharepoint", "azure-blob", "azure-sql", "onelake", "teams-files", "rest-api"].includes(c.id),
    ).map((c) => ({
      id: c.id,
      label: c.name.replace(" Storage", "").replace(" Database", "").replace("Team ", ""),
    })),
  },
  {
    id: "opensource",
    title: "Open source deployment",
    desc: "LangGraph orchestration, OpenSearch, PostgreSQL, MinIO, Confluence, and Jira.",
    nextPreview: "Local FS, S3 / MinIO, PostgreSQL, MongoDB, Confluence, Jira",
    icon: <CodeOutlinedIcon sx={{ fontSize: 22 }} />,
    connectors: OPENSOURCE_CONNECTORS.filter((c) =>
      ["local-fs", "s3-minio", "postgresql", "mongodb", "confluence", "jira"].includes(c.id),
    ).map((c) => ({
      id: c.id,
      label: c.id === "local-fs" ? "Local FS" : c.id === "s3-minio" ? "S3 / MinIO" : c.name,
    })),
  },
];

export const StepDeployment = () => {
  const deploymentType = useBuilderStore((s) => s.deploymentType);
  const setDeploymentType = useBuilderStore((s) => s.setDeploymentType);
  const savedConnectors = useBuilderStore((s) => s.savedConnectors);

  return (
    <section className="grid gap-6 md:grid-cols-2">
      {DEPLOY_OPTIONS.map((opt) => {
        const selected = deploymentType === opt.id;
        const configuredIds = new Set(
          savedConnectors
            .filter((c) => c.deployment === opt.id && c.validated)
            .map((c) => c.connectorTypeId),
        );

        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setDeploymentType(opt.id)}
            aria-pressed={selected}
            className={cn("ds-suite-card group text-left", selected && "ds-suite-card--selected")}
          >
            <div className="ds-suite-card__inner">
              <div className="ds-suite-card__header">
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  <span className="ds-suite-card__avatar" aria-hidden>
                    {opt.icon}
                  </span>
                  <span className="ds-suite-card__title">{opt.title}</span>
                </div>
                {selected && (
                  <span className="ds-suite-card__check" aria-hidden>
                    <CheckRoundedIcon sx={{ fontSize: 16 }} />
                  </span>
                )}
              </div>

              <p className="ds-suite-card__desc">{opt.desc}</p>

              <div className="ds-suite-card__footer flex-col items-stretch gap-3">
                <div className="flex flex-wrap gap-2">
                  {opt.connectors.map((chip, i) => {
                    const done = configuredIds.has(chip.id);
                    const tone = (["blue", "purple", "pink"] as const)[i % 3];
                    return (
                      <span
                        key={chip.id}
                        className={cn("ds-tag", done ? "ds-tag--configured" : `ds-tag--${tone}`)}
                      >
                        {done && <CheckRoundedIcon sx={{ fontSize: 12 }} />}
                        {chip.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </section>
  );
};
