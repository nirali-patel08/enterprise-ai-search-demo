import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import Dialog from "@mui/material/Dialog";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import CloudOutlinedIcon from "@mui/icons-material/CloudOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import ViewKanbanOutlinedIcon from "@mui/icons-material/ViewKanbanOutlined";
import ElectricalServicesOutlinedIcon from "@mui/icons-material/ElectricalServicesOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import DatasetOutlinedIcon from "@mui/icons-material/DatasetOutlined";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import { searchBuilderApi } from "@/api/search-builder";
import {
  CONNECTOR_CONFIG,
  getConnectorById,
  getConnectorsForDeployment,
  type SavedConnector,
} from "@/data/sample";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { useBuilderStore } from "@/store/builder-store";
import { Field, TextInput } from "../wizard-ui";

const CATEGORIES = ["Storage", "Databases"] as const;
type Category = (typeof CATEGORIES)[number];

const categoryIcon = {
  Storage: <StorageOutlinedIcon sx={{ fontSize: 15 }} />,
  Databases: <DatasetOutlinedIcon sx={{ fontSize: 15 }} />,
};

function connectorIcon(id: string, size = 22) {
  const sx = { fontSize: size };
  switch (id) {
    case "sharepoint":
      return <MenuBookOutlinedIcon sx={sx} />;
    case "confluence":
      return <MenuBookOutlinedIcon sx={sx} />;
    case "jira":
      return <ViewKanbanOutlinedIcon sx={sx} />;
    case "rest-api":
    case "rest-api-os":
      return <ElectricalServicesOutlinedIcon sx={sx} />;
    case "postgresql":
    case "azure-sql":
      return <StorageOutlinedIcon sx={sx} />;
    case "mongodb":
      return <DatasetOutlinedIcon sx={sx} />;
    case "s3-minio":
    case "azure-blob":
      return <CloudOutlinedIcon sx={sx} />;
    case "local-fs":
      return <FolderOutlinedIcon sx={sx} />;
    case "file-upload":
      return <InsertDriveFileOutlinedIcon sx={sx} />;
    case "teams-files":
      return <GroupsOutlinedIcon sx={sx} />;
    case "onelake":
      return <LayersOutlinedIcon sx={sx} />;
    default:
      if (id.includes("sql") || id.includes("postgres")) return <StorageOutlinedIcon sx={sx} />;
      if (id.includes("rest")) return <CodeOutlinedIcon sx={sx} />;
      return <HubOutlinedIcon sx={sx} />;
  }
}

function iconTone(id: string, category: Category) {
  if (id.includes("rest")) return "ds-source-tile__icon--api";
  if (category === "Databases") return "ds-source-tile__icon--db";
  return "ds-source-tile__icon--files";
}

function defaultDetail(typeId: string, values: Record<string, string>): string {
  const fields = CONNECTOR_CONFIG[typeId] ?? [];
  const parts = fields.slice(0, 2).map((f) => values[f.label] || f.value);
  return parts.filter(Boolean).join(" / ");
}

export const StepConnectors = () => {
  const deploymentType = useBuilderStore((s) => s.deploymentType);
  const savedConnectors = useBuilderStore((s) => s.savedConnectors);
  const selectedConnectorTypeIds = useBuilderStore((s) => s.selectedConnectorTypeIds);
  const toggleConnectorType = useBuilderStore((s) => s.toggleConnectorType);
  const saveConnector = useBuilderStore((s) => s.saveConnector);

  const available = getConnectorsForDeployment(deploymentType);
  const grouped = CATEGORIES.map((cat) => ({
    cat,
    items: available.filter((c) => c.category === cat),
  })).filter((g) => g.items.length > 0);

  const [activeCat, setActiveCat] = useState<Category>(grouped[0]?.cat ?? "Storage");

  useEffect(() => {
    setActiveCat((prev) => {
      const cats = CATEGORIES.filter((cat) =>
        getConnectorsForDeployment(deploymentType).some((c) => c.category === cat),
      );
      return cats.includes(prev) ? prev : (cats[0] ?? "Storage");
    });
  }, [deploymentType]);

  const isReady = (typeId: string) =>
    savedConnectors.some(
      (c) => c.deployment === deploymentType && c.connectorTypeId === typeId && c.validated,
    );

  const selectedInDeploy = selectedConnectorTypeIds.filter((id) =>
    available.some((c) => c.id === id),
  );
  const selectedReady = selectedInDeploy.filter(isReady);
  const selectedNeedsConfig = selectedInDeploy.filter((id) => !isReady(id));

  const [configuringTypeId, setConfiguringTypeId] = useState<string | null>(null);
  const [connectionName, setConnectionName] = useState("");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [testPassed, setTestPassed] = useState(false);

  const configuring = configuringTypeId ? getConnectorById(configuringTypeId) : null;
  const modalOpen = Boolean(configuring);
  const baseFields = configuring ? (CONNECTOR_CONFIG[configuring.id] ?? []) : [];
  const activeGroup = grouped.find((g) => g.cat === activeCat) ?? grouped[0];

  const openConnectForm = (typeId: string) => {
    const type = getConnectorById(typeId);
    if (!type) return;
    if (!selectedConnectorTypeIds.includes(typeId)) {
      toggleConnectorType(typeId);
    }
    const fields = CONNECTOR_CONFIG[typeId] ?? [];
    const values: Record<string, string> = {};
    fields.forEach((f) => {
      values[f.label] = f.value;
    });
    setFieldValues(values);
    setConnectionName(`${type.name} connection`);
    setTestPassed(false);
    setConfiguringTypeId(typeId);
  };

  const closeModal = () => {
    setConfiguringTypeId(null);
    setTestPassed(false);
  };

  const testMutation = useMutation({
    mutationFn: () => searchBuilderApi.validateConnector(configuring!.id),
    onSuccess: () => {
      setTestPassed(true);
      toast.success("Connection test passed");
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!testPassed || !configuring) throw new Error("Test required");
      return true;
    },
    onSuccess: () => {
      if (!configuring) return;
      const now = new Date().toLocaleString();
      const saved: SavedConnector = {
        id: `conn-${Date.now()}`,
        connectorTypeId: configuring.id,
        name: connectionName.trim() || `${configuring.name} connection`,
        deployment: deploymentType,
        validated: true,
        savedAt: now,
        lastTestedAt: now,
        detail: defaultDetail(configuring.id, fieldValues),
        status: "connected",
      };
      saveConnector(saved);
      closeModal();
      toast.success(`${saved.name} connected — now in Connectors list`);
    },
  });

  const onToggle = (typeId: string) => {
    const willSelect = !selectedConnectorTypeIds.includes(typeId);
    toggleConnectorType(typeId);
    if (willSelect && !isReady(typeId)) {
      openConnectForm(typeId);
    } else if (!willSelect && configuringTypeId === typeId) {
      closeModal();
    }
  };

  return (
    <section className="space-y-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-[15px] font-bold text-black">Select data sources</h3>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={selectedReady.length > 0 ? "success" : "outline"}>
            {selectedReady.length} ready
          </Badge>
          <Link to="/connectors">
            <Button variant="secondary" size="sm">
              Open Connectors
              <OpenInNewRoundedIcon sx={{ fontSize: 14 }} />
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="ds-cat-tabs ds-cat-tabs--pill" role="tablist" aria-label="Source categories">
          {grouped.map(({ cat, items }) => {
            const readyHere = items.filter((c) => isReady(c.id)).length;
            const selectedHere = items.filter((c) => selectedConnectorTypeIds.includes(c.id)).length;
            const countLabel =
              selectedHere > 0 ? `${selectedHere}/${items.length}` : String(items.length);
            const countTone =
              readyHere === items.length && items.length > 0
                ? "ds-cat-tab__count--done"
                : selectedHere > 0 && readyHere < selectedHere
                  ? "ds-cat-tab__count--partial"
                  : readyHere > 0
                    ? "ds-cat-tab__count--partial"
                    : "";
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={activeCat === cat}
                className={cn("ds-cat-tab", activeCat === cat && "ds-cat-tab--active")}
                onClick={() => setActiveCat(cat)}
              >
                {categoryIcon[cat]}
                {cat}
                <span className={cn("ds-cat-tab__count", countTone)}>{countLabel}</span>
              </button>
            );
          })}
        </div>

        {selectedNeedsConfig.length > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openConnectForm(selectedNeedsConfig[0])}
          >
            <LinkRoundedIcon sx={{ fontSize: 16 }} />
            Connect {selectedNeedsConfig.length} pending
          </Button>
        )}
      </div>

      {activeGroup && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {activeGroup.items.map((c) => {
            const saved = savedConnectors.find(
              (s) => s.deployment === deploymentType && s.connectorTypeId === c.id && s.validated,
            );
            const selected = selectedConnectorTypeIds.includes(c.id);

            return (
              <div
                key={c.id}
                role="button"
                tabIndex={0}
                aria-pressed={selected}
                onClick={() => onToggle(c.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onToggle(c.id);
                  }
                }}
                className={cn("ds-source-tile", selected && "ds-source-tile--selected")}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className={cn("ds-source-tile__icon", iconTone(c.id, activeGroup.cat))} aria-hidden>
                    {connectorIcon(c.id)}
                  </span>
                  <span className="ds-source-tile__check" aria-hidden>
                    <CheckRoundedIcon sx={{ fontSize: 15 }} />
                  </span>
                </div>

                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold leading-tight text-black">{c.name}</p>
                  <p className="mt-1 line-clamp-2 text-[12px] leading-[150%] text-black/55">{c.description}</p>
                  {saved?.name && (
                    <p className="mt-1 truncate text-[11px] font-medium text-black/40">{saved.name}</p>
                  )}
                </div>

                <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                  {saved ? (
                    <span className="ds-source-tile__status ds-source-tile__status--ready">
                      <CheckCircleRoundedIcon sx={{ fontSize: 14 }} />
                      Ready for indexing
                    </span>
                  ) : selected ? (
                    <Button
                      variant="primary"
                      size="sm"
                      className="!shadow-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        openConnectForm(c.id);
                      }}
                    >
                      Test & connect
                    </Button>
                  ) : (
                    <span className="ds-source-tile__status ds-source-tile__status--idle">
                      Not configured
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px]">
        <span className="font-medium text-black">
          {selectedInDeploy.length} selected
          {selectedReady.length > 0 && (
            <span className="text-success-title"> · {selectedReady.length} ready</span>
          )}
        </span>
        {selectedNeedsConfig.length > 0 && (
          <span className="text-amber-700">
            {selectedNeedsConfig.length} still need Test & connect
          </span>
        )}
        {selectedInDeploy.length === 0 && (
          <span className="text-black/55">Select at least one source to continue.</span>
        )}
      </div>

      <Dialog
        open={modalOpen}
        onClose={closeModal}
        maxWidth={false}
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: "rgba(40, 36, 30, 0.35)",
              backdropFilter: "blur(6px)",
            },
          },
          paper: {
            className: "ds-modal-paper m-4",
            sx: {
              width: "min(520px, calc(100vw - 32px))",
              maxWidth: 520,
              overflow: "hidden",
            },
          },
        }}
      >
        {configuring && (
          <div className="flex flex-col overflow-hidden">
            <header className="ds-modal-header">
              <div className="ds-modal-header__inner">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="ds-modal-header__icon" aria-hidden>
                    {connectorIcon(configuring.id, 20)}
                  </span>
                  <div className="min-w-0">
                    <p className="ds-modal-header__eyebrow">Test & connect</p>
                    <h2 className="ds-modal-header__title truncate">{configuring.name}</h2>
                  </div>
                </div>
                <button type="button" aria-label="Close" className="ds-modal-close" onClick={closeModal}>
                  <CloseRoundedIcon sx={{ fontSize: 18 }} />
                </button>
              </div>
            </header>

            <div className="ds-modal-body space-y-4 overflow-hidden">
              <Field label="Connection name" className="gap-2">
                <TextInput
                  value={connectionName}
                  onChange={(e) => {
                    setConnectionName(e.target.value);
                    setTestPassed(false);
                  }}
                  placeholder="e.g. orders_prod_db"
                  autoFocus
                />
              </Field>

              {(() => {
                const authPair = baseFields.filter((f) => /access key|secret key/i.test(f.label));
                const rest = baseFields.filter((f) => !/access key|secret key/i.test(f.label));
                return (
                  <>
                    <div className={cn("grid gap-4", rest.length > 1 && "sm:grid-cols-2")}>
                      {rest.map((f) => (
                        <Field key={f.label} label={f.label} className="gap-2">
                          <TextInput
                            value={fieldValues[f.label] ?? ""}
                            type={/secret|password|token/i.test(f.label) ? "password" : "text"}
                            onChange={(e) => {
                              setFieldValues((v) => ({ ...v, [f.label]: e.target.value }));
                              setTestPassed(false);
                            }}
                            placeholder={`Enter ${f.label.toLowerCase()}…`}
                          />
                        </Field>
                      ))}
                    </div>
                    {authPair.length === 2 && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        {authPair.map((f) => (
                          <Field key={f.label} label={f.label} className="gap-2">
                            <TextInput
                              value={fieldValues[f.label] ?? ""}
                              type="password"
                              onChange={(e) => {
                                setFieldValues((v) => ({ ...v, [f.label]: e.target.value }));
                                setTestPassed(false);
                              }}
                              placeholder={`Enter ${f.label.toLowerCase()}…`}
                            />
                          </Field>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            <footer className="ds-modal-footer flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <Button
                variant="secondary"
                size="sm"
                className="ds-modal-btn-test"
                loading={testMutation.isPending}
                onClick={() => testMutation.mutate()}
              >
                Test connection
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!testPassed}
                loading={saveMutation.isPending}
                className={cn(testPassed ? "ds-modal-btn-save" : "ds-btn-save-locked")}
                title={!testPassed ? "Run test first to enable save" : undefined}
                onClick={() => saveMutation.mutate()}
              >
                Save & connect
              </Button>
              {!testPassed ? (
                <span className="ds-modal-footer__hint">Run test before saving</span>
              ) : (
                <span className="ds-modal-footer__hint--ok">
                  <CheckCircleRoundedIcon sx={{ fontSize: 15 }} />
                  Test passed — ready to save
                </span>
              )}
            </footer>
          </div>
        )}
      </Dialog>
    </section>
  );
};
