import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { IndexListing } from "@/components/indexes/index-listing";
import { useBuilderStore } from "@/store/builder-store";

export default function IndexesPage() {
  const deploymentType = useBuilderStore((s) => s.deploymentType);

  return (
    <PageShell>
      <PageHeader
        icon={<StorageRoundedIcon sx={{ fontSize: 22 }} />}
        title="OpenSearch Indices"
        description="Browse your active vector databases and search through indexed data chunks."
      />
      <IndexListing deploymentFilter={deploymentType} />
    </PageShell>
  );
}
