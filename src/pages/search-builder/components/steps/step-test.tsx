import { useMutation } from "@tanstack/react-query";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { searchBuilderApi } from "@/api/search-builder";
import { ACTION_MODES, TEST_RESULT } from "@/data/sample";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { useBuilderStore } from "@/store/builder-store";

export const StepTest = () => {
  const query = useBuilderStore((s) => s.query);
  const actionMode = useBuilderStore((s) => s.actionMode);
  const testRan = useBuilderStore((s) => s.testRan);
  const setQuery = useBuilderStore((s) => s.setQuery);
  const setActionMode = useBuilderStore((s) => s.setActionMode);
  const setTestRan = useBuilderStore((s) => s.setTestRan);

  const testMutation = useMutation({
    mutationFn: () => searchBuilderApi.runTestQuery(query, actionMode),
    onSuccess: () => {
      setTestRan(true);
      toast.success("Test query completed — review validation results");
    },
  });

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">6. Test Enterprise Search</h2>
        <p className="mt-1 text-sm text-gray-500">Validate retrieval, citations, agent routing, and response quality before deployment.</p>
      </div>

      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        rows={2}
        className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-3 text-sm outline-none ring-orange-500 focus:ring-2"
        aria-label="Test query"
      />

      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">Action Mode</p>
        <div className="flex flex-wrap gap-2">
          {ACTION_MODES.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setActionMode(mode)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition",
                actionMode === mode ? "bg-orange-500 text-white" : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50",
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <Button variant="primary" loading={testMutation.isPending} onClick={() => testMutation.mutate()}>
        <SearchRoundedIcon sx={{ fontSize: 18 }} />
        Run Test Query
      </Button>

      {testRan && (
        <div className="grid gap-4 md:grid-cols-2">
          <SectionCard title="Retrieval Validation" trailing={<Badge variant="success">Pass</Badge>}>
            <p className="text-sm text-gray-600">{TEST_RESULT.retrieval.summary}</p>
            <p className="mt-1 text-xs text-gray-400">Avg relevance: {TEST_RESULT.retrieval.score}</p>
          </SectionCard>
          <SectionCard title="Agent Routing" trailing={<Badge variant="success">Pass</Badge>}>
            <p className="text-sm text-gray-600">{TEST_RESULT.routing.summary}</p>
          </SectionCard>
          <SectionCard title="Citations" trailing={<Badge variant="success">Pass</Badge>}>
            <ul className="space-y-2">
              {TEST_RESULT.citations.sources.map((s) => (
                <li key={s.name} className="rounded-lg bg-gray-50 px-3 py-2 text-sm">
                  <span className="font-medium text-gray-800">{s.name}</span>
                  <span className="text-gray-500"> — {s.detail}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
          <SectionCard title="Response Validation" trailing={<Badge variant="warning">Review</Badge>}>
            <p className="text-sm leading-relaxed text-gray-600">{TEST_RESULT.response.text}</p>
          </SectionCard>
        </div>
      )}
    </section>
  );
};
