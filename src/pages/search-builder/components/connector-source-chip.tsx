import { cn } from "@/lib/utils";

type ConnectorSourceChipProps = {
  name: string;
  included: boolean;
  active: boolean;
  pathCount: number;
  error?: boolean;
  onActivate: () => void;
  onToggleInclude: () => void;
};

export function ConnectorSourceChip({
  name,
  included,
  active,
  pathCount,
  error = false,
  onActivate,
  onToggleInclude,
}: ConnectorSourceChipProps) {
  const handleClick = () => {
    if (active && included) {
      onToggleInclude();
      return;
    }
    onActivate();
  };

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active && included}
      aria-pressed={included}
      title={
        !included
          ? `Include ${name}`
          : active
            ? `Deselect ${name}`
            : `Browse ${name}`
      }
      className={cn(
        "ds-source-chip",
        included && "ds-source-chip--included",
        active && included && "ds-source-chip--active",
        !included && "ds-source-chip--muted",
        error && "ds-source-chip--error",
      )}
      onClick={handleClick}
    >
      <span className="ds-source-chip__label">{name}</span>
      <span
        className={cn(
          "ds-source-chip__count",
          pathCount > 0 && "ds-source-chip__count--has-value",
        )}
      >
        {pathCount}
      </span>
    </button>
  );
}
