import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import TravelExploreRoundedIcon from "@mui/icons-material/TravelExploreRounded";
import RateReviewRoundedIcon from "@mui/icons-material/RateReviewRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import RocketLaunchRoundedIcon from "@mui/icons-material/RocketLaunchRounded";
import LightbulbRoundedIcon from "@mui/icons-material/LightbulbRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import CircularProgress from "@mui/material/CircularProgress";
import { searchBuilderApi } from "@/api/search-builder";
import { ACTION_MODES, TEST_RESULT } from "@/data/sample";
import { getOrchestrationPresets } from "@/data/playground-demo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { useBuilderStore } from "@/store/builder-store";

const CHECKS = [
  {
    id: "retrieval",
    label: "Retrieval",
    desc: "Relevant chunks are found",
    icon: TravelExploreRoundedIcon,
  },
  {
    id: "routing",
    label: "Routing",
    desc: "Query reaches the right agents",
    icon: HubRoundedIcon,
  },
  {
    id: "citations",
    label: "Citations",
    desc: "Answers cite real sources",
    icon: DescriptionRoundedIcon,
  },
  {
    id: "response",
    label: "Response",
    desc: "Output is accurate & in-scope",
    icon: RateReviewRoundedIcon,
  },
] as const;

type Phase = "idle" | "running" | "done";

export const StepTest = () => {
  const query = useBuilderStore((s) => s.query);
  const actionMode = useBuilderStore((s) => s.actionMode);
  const setQuery = useBuilderStore((s) => s.setQuery);
  const setActionMode = useBuilderStore((s) => s.setActionMode);
  const setTestRan = useBuilderStore((s) => s.setTestRan);

  // Always start idle so results only appear after this run
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [acknowledged, setAcknowledged] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const testMutation = useMutation({
    mutationFn: () => searchBuilderApi.runTestQuery(query, actionMode),
  });

  const runTest = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPhase("running");
    setProgress(0);
    setAcknowledged(false);
    testMutation.mutate();

    const stepMs = 380;
    CHECKS.forEach((_, i) => {
      timers.current.push(setTimeout(() => setProgress(i + 1), stepMs * (i + 1)));
    });
    timers.current.push(
      setTimeout(() => {
        setPhase("done");
        setTestRan(true);
        toast.success("Validation complete — 1 item needs your review");
        requestAnimationFrame(() => {
          resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
      }, stepMs * (CHECKS.length + 0.5)),
    );
  };

  const cleared = acknowledged;

  return (
    <section className="test-step">
      <div className="test-step__query ds-glass">
        <header className="test-step__query-head">
          <span className="test-step__query-icon" aria-hidden>
            <FactCheckRoundedIcon sx={{ fontSize: 20 }} />
          </span>
          <div className="test-step__query-heading">
            <h3 className="test-step__query-title">Confirm pre-deploy checks</h3>
            <p className="test-step__lead">
              Run a Contoso query to validate retrieval, routing, citations, and response before you
              publish.
            </p>
          </div>
        </header>

        <div className="test-step__field">
          <SearchRoundedIcon className="test-step__field-icon" sx={{ fontSize: 18 }} />
          <input
            className="test-step__input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && query.trim() && runTest()}
            aria-label="Test query"
            placeholder="Ask a Contoso question, e.g. ABC contracts expiring in 90 days…"
          />
          <Button
            variant="primary"
            size="sm"
            className="test-step__run-btn"
            loading={phase === "running"}
            disabled={!query.trim()}
            onClick={runTest}
          >
            {phase === "done" ? "Re-run" : "Run test"}
          </Button>
        </div>

        <div className="test-step__controls">
          <div className="test-step__control-group">
            <span className="test-step__control-label">
              <LightbulbRoundedIcon sx={{ fontSize: 14 }} />
              Suggested
            </span>
            <div className="test-step__chips">
              {getOrchestrationPresets().map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="test-step__chip"
                  onClick={() => setQuery(s.query)}
                >
                  {s.domain}
                </button>
              ))}
            </div>
          </div>
          <div className="test-step__control-group">
            <span className="test-step__control-label">
              <TuneRoundedIcon sx={{ fontSize: 14 }} />
              Action
            </span>
            <div className="test-step__chips">
              {ACTION_MODES.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setActionMode(mode)}
                  className={cn(
                    "test-step__chip",
                    actionMode === mode && "test-step__chip--active",
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="test-step__body" ref={resultsRef}>
        {phase === "idle" && (
          <div className="test-step__empty">
            <div className="test-step__empty-hero">
              <span className="test-step__empty-icon" aria-hidden>
                <RocketLaunchRoundedIcon sx={{ fontSize: 24 }} />
              </span>
              <h3 className="test-step__empty-title">Ready to validate your pipeline</h3>
              <p className="test-step__empty-sub">
                Run a test query and we'll check these four areas end-to-end before you deploy.
              </p>
            </div>
            <ul className="test-step__preview">
              {CHECKS.map((c) => {
                const Icon = c.icon;
                return (
                  <li key={c.id} className="test-step__preview-item">
                    <span className="test-step__preview-icon" aria-hidden>
                      <Icon sx={{ fontSize: 18 }} />
                    </span>
                    <div>
                      <span className="test-step__preview-name">{c.label}</span>
                      <span className="test-step__preview-desc">{c.desc}</span>
                    </div>
                    <span className="test-step__preview-status">Pending</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {phase === "running" && (
          <div className="test-step__running">
            <div className="test-step__running-head">
              <CircularProgress size={14} thickness={5} sx={{ color: "#f2760a" }} />
              <span>Running validation…</span>
              <span className="test-step__running-count">
                {progress}/{CHECKS.length}
              </span>
            </div>
            <ul className="test-step__checklist">
              {CHECKS.map((c, i) => {
                const state = progress > i ? "done" : progress === i ? "active" : "pending";
                const Icon = c.icon;
                return (
                  <li key={c.id} className={cn("test-step__checkitem", `is-${state}`)}>
                    <span className="test-step__checkitem-icon" aria-hidden>
                      {state === "done" ? (
                        <CheckCircleRoundedIcon sx={{ fontSize: 16 }} />
                      ) : state === "active" ? (
                        <CircularProgress size={12} thickness={5} sx={{ color: "#f2760a" }} />
                      ) : (
                        <Icon sx={{ fontSize: 14 }} />
                      )}
                    </span>
                    <span>{c.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <AnimatePresence>
          {phase === "done" && (
            <motion.div
              className="test-step__results"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div
                className={cn(
                  "test-step__guide",
                  cleared ? "test-step__guide--ok" : "test-step__guide--warn",
                )}
              >
                <span className="test-step__guide-icon" aria-hidden>
                  {cleared ? (
                    <CheckCircleRoundedIcon sx={{ fontSize: 20 }} />
                  ) : (
                    <WarningAmberRoundedIcon sx={{ fontSize: 20 }} />
                  )}
                </span>
                <div className="test-step__guide-copy">
                  <p className="test-step__guide-title">
                    {cleared
                      ? "All checks cleared — ready to deploy"
                      : "3 checks passed · 1 needs your review"}
                  </p>
                  <p className="test-step__guide-sub">
                    {cleared
                      ? "Hit Continue below to publish."
                      : "Response flagged a PO / Invoice mismatch — acknowledge it, then continue."}
                  </p>
                </div>
                <div className="test-step__guide-badges">
                  <Badge variant="success">3 Pass</Badge>
                  <Badge variant={cleared ? "success" : "warning"}>
                    {cleared ? "Reviewed" : "1 Review"}
                  </Badge>
                </div>
                {!cleared && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="test-step__guide-btn"
                    onClick={() => {
                      setAcknowledged(true);
                      toast.success("Response reviewed — you can continue");
                    }}
                  >
                    Mark reviewed
                  </Button>
                )}
              </div>

              <div className="test-step__grid">
                <article className="test-step__card test-step__card--metric">
                  <header className="test-step__card-head">
                    <span className="test-step__card-icon" aria-hidden>
                      <TravelExploreRoundedIcon sx={{ fontSize: 16 }} />
                    </span>
                    <div className="test-step__card-heading">
                      <h4 className="test-step__card-title">Retrieval</h4>
                      <p className="test-step__card-hint">
                        {TEST_RESULT.retrieval.chunks} chunks · score {TEST_RESULT.retrieval.score}
                      </p>
                    </div>
                    <Badge variant="success">Pass</Badge>
                  </header>
                  <div className="test-step__meter" aria-hidden>
                    <span style={{ width: `${Number(TEST_RESULT.retrieval.score) * 100}%` }} />
                  </div>
                  <p className="test-step__card-body">{TEST_RESULT.retrieval.summary}</p>
                </article>

                <article className="test-step__card test-step__card--route">
                  <header className="test-step__card-head">
                    <span className="test-step__card-icon" aria-hidden>
                      <HubRoundedIcon sx={{ fontSize: 16 }} />
                    </span>
                    <div className="test-step__card-heading">
                      <h4 className="test-step__card-title">Agent routing</h4>
                      <p className="test-step__card-hint">{TEST_RESULT.routing.supervisor}</p>
                    </div>
                    <Badge variant="success">Pass</Badge>
                  </header>
                  <div className="test-step__route">
                    {TEST_RESULT.routing.agents.map((agent) => (
                      <span key={agent} className="test-step__route-node">
                        {agent}
                      </span>
                    ))}
                  </div>
                </article>

                <article className="test-step__card test-step__card--citations">
                  <header className="test-step__card-head">
                    <span className="test-step__card-icon" aria-hidden>
                      <DescriptionRoundedIcon sx={{ fontSize: 16 }} />
                    </span>
                    <div className="test-step__card-heading">
                      <h4 className="test-step__card-title">Citations</h4>
                      <p className="test-step__card-hint">
                        {TEST_RESULT.citations.sources.length} sources grounded
                      </p>
                    </div>
                    <Badge variant="success">Pass</Badge>
                  </header>
                  <ul className="test-step__sources">
                    {TEST_RESULT.citations.sources.map((s) => (
                      <li key={s.name} className="test-step__source">
                        <CheckCircleRoundedIcon sx={{ fontSize: 14 }} className="test-step__source-ok" />
                        <span className="test-step__source-name">{s.name}</span>
                        <span className="test-step__source-detail">{s.detail}</span>
                      </li>
                    ))}
                  </ul>
                </article>

                <article
                  className={cn(
                    "test-step__card test-step__card--review",
                    !cleared && "test-step__card--attention",
                  )}
                >
                  <header className="test-step__card-head">
                    <span className="test-step__card-icon test-step__card-icon--warn" aria-hidden>
                      <RateReviewRoundedIcon sx={{ fontSize: 16 }} />
                    </span>
                    <div className="test-step__card-heading">
                      <h4 className="test-step__card-title">Response</h4>
                      <p className="test-step__card-hint">Needs finance review</p>
                    </div>
                    <Badge variant="warning">{cleared ? "Reviewed" : "Review"}</Badge>
                  </header>
                  <div className="test-step__flag">
                    <WarningAmberRoundedIcon sx={{ fontSize: 15 }} />
                    {TEST_RESULT.response.flag}
                  </div>
                  <p className="test-step__card-body">{TEST_RESULT.response.text}</p>
                </article>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
