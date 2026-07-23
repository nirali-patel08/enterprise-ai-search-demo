import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CloudOutlinedIcon from "@mui/icons-material/CloudOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import { Link } from "react-router-dom";
import {
  formatIndexSize,
  getAgentDeploymentLabel,
  type DeploymentType,
  type SearchIndex,
} from "@/data/sample";
import { useBuilderStore } from "@/store/builder-store";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { WizardPanel } from "@/pages/search-builder/components/wizard-ui";
import "./index-listing.scss";

const STATUS_LABEL: Record<SearchIndex["status"], string> = {
  green: "GREEN",
  yellow: "YELLOW",
  red: "RED",
};

interface IndexListingProps {
  variant?: "page" | "embedded" | "dashboard";
  deploymentFilter?: SearchIndex["deployment"];
  selectedIndex?: string;
  onSelect?: (indexName: string) => void;
  showDelete?: boolean;
}

function DeploymentTag({ deployment }: { deployment: DeploymentType }) {
  const Icon = deployment === "cloud" ? CloudOutlinedIcon : CodeOutlinedIcon;

  return (
    <span
      className={cn(
        "ds-tag dashboard-agents-table__deployment dashboard-agents-table__tag",
        deployment === "cloud"
          ? "dashboard-agents-table__tag--cloud"
          : "dashboard-agents-table__tag--opensource",
      )}
    >
      <Icon sx={{ fontSize: 13 }} />
      {getAgentDeploymentLabel(deployment)}
    </span>
  );
}

function IndexTableBody({
  indexes,
  selectedIndex,
  onSelect,
  showDelete,
  onDelete,
  showDeployment,
  viewAllHref,
  viewAllLabel = "View all indexes",
}: {
  indexes: SearchIndex[];
  selectedIndex?: string;
  onSelect?: (indexName: string) => void;
  showDelete: boolean;
  onDelete: (index: SearchIndex) => void;
  showDeployment: boolean;
  viewAllHref?: string;
  viewAllLabel?: string;
}) {
  return (
    <div className="dashboard-agents-table">
      <div className="dashboard-agents-table__scroll">
        <table className="ds-table ds-table--defined dashboard-agents-table__table w-full">
          <thead>
            <tr>
              <th>Index name</th>
              {showDeployment && <th>Deployment</th>}
              <th>Documents</th>
              <th>Size</th>
              {showDelete && <th aria-label="Actions" />}
            </tr>
          </thead>
          <tbody>
            {indexes.map((index) => {
              const isSelected = selectedIndex === index.name;
              return (
                <tr
                  key={index.id}
                  className={cn(isSelected && "index-listing__row--selected")}
                  onClick={() => onSelect?.(index.name)}
                >
                  <td>
                    <div className="dashboard-agents-table__agent">
                      <span className="index-listing__avatar" aria-hidden>
                        <StorageRoundedIcon sx={{ fontSize: 18 }} />
                      </span>
                      <div className="dashboard-agents-table__agent-text">
                        <span className="dashboard-agents-table__name" title={index.name}>
                          {index.name}
                        </span>
                        <div className="dashboard-agents-table__meta">
                          <span
                            className={cn(
                              "index-listing__status",
                              `index-listing__status--${index.status}`,
                            )}
                          >
                            {STATUS_LABEL[index.status]}
                          </span>
                        </div>
                      </div>
                      {onSelect && <ChevronRightRoundedIcon className="dashboard-agents-table__chevron" />}
                    </div>
                  </td>
                  {showDeployment && (
                    <td>
                      <DeploymentTag deployment={index.deployment} />
                    </td>
                  )}
                  <td>{index.documentCount.toLocaleString()}</td>
                  <td>{formatIndexSize(index.sizeBytes)}</td>
                  {showDelete && (
                    <td>
                      <button
                        type="button"
                        className="index-listing__delete"
                        aria-label={`Delete ${index.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(index);
                        }}
                      >
                        <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="dashboard-agents-table__footer">
        <span>
          Showing <strong>1–{indexes.length}</strong> of <strong>{indexes.length}</strong> indexes
        </span>
        {viewAllHref && (
          <Link to={viewAllHref} className="dashboard-agents-table__footer-link">
            {viewAllLabel}
            <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
          </Link>
        )}
      </div>
    </div>
  );
}

export function IndexListing({
  variant = "page",
  deploymentFilter,
  selectedIndex,
  onSelect,
  showDelete = true,
}: IndexListingProps) {
  const searchIndexes = useBuilderStore((s) => s.searchIndexes);
  const removeSearchIndex = useBuilderStore((s) => s.removeSearchIndex);

  const indexes = deploymentFilter
    ? searchIndexes.filter((i) => i.deployment === deploymentFilter)
    : searchIndexes;

  const showDeployment = variant !== "embedded";
  const showDeleteAction = showDelete && variant !== "dashboard";

  const handleDelete = (index: SearchIndex) => {
    removeSearchIndex(index.id);
    toast.success(`Index "${index.name}" removed`);
  };

  if (indexes.length === 0) {
    const empty = (
      <div className="dashboard-agents-table__empty route-empty">
        <span className="dashboard-agents-table__empty-icon" aria-hidden>
          <StorageRoundedIcon sx={{ fontSize: 24 }} />
        </span>
        <p className="dashboard-agents-table__empty-title">No search indexes yet</p>
        <p className="dashboard-agents-table__empty-copy">
          Run indexing in the{" "}
          <Link to="/builder" className="dashboard-agents-table__footer-link">
            AI Search Builder
          </Link>{" "}
          to create indexes from your connectors.
        </p>
      </div>
    );

    if (variant === "page") {
      return (
        <WizardPanel className="overflow-hidden !rounded-[14px] !p-0" bodyClassName="p-0">
          {empty}
        </WizardPanel>
      );
    }

    if (variant === "dashboard") {
      return <div className="index-listing index-listing--dashboard">{empty}</div>;
    }

    return <div className="index-listing__empty--embedded">{empty}</div>;
  }

  const table = (
    <IndexTableBody
      indexes={indexes}
      selectedIndex={selectedIndex}
      onSelect={onSelect}
      showDelete={showDeleteAction}
      onDelete={handleDelete}
      showDeployment={showDeployment}
      viewAllHref={variant === "dashboard" ? "/indexes" : undefined}
      viewAllLabel="Open indices"
    />
  );

  if (variant === "dashboard") {
    return <div className="index-listing index-listing--dashboard">{table}</div>;
  }

  if (variant === "page") {
    return (
      <div className="index-listing index-listing--page">
        <WizardPanel className="overflow-hidden !rounded-[14px] !p-0" bodyClassName="p-0">
          {table}
        </WizardPanel>
      </div>
    );
  }

  return <div className="index-listing index-listing--embedded">{table}</div>;
}
