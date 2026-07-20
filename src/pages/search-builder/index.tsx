import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import createAgentBoxBg from "@/assets/module/create-agent/create_agent_box_bg.svg";
import { PageShell } from "@/components/ui/page-shell";
import { Button } from "@/components/ui/button";
import { WizardStepper } from "./components/wizard-stepper";
import { STEPS } from "@/data/sample";
import { useBuilderStore } from "@/store/builder-store";
import { StepDeployment } from "./components/steps/step-deployment";
import { StepConnectors } from "./components/steps/step-connectors";
import { StepIndexing } from "./components/steps/step-indexing";
import { StepAgents } from "./components/steps/step-agents";
import { StepOrchestration } from "./components/steps/step-orchestration";
import "./search-builder.scss";

const MAX_STEP = STEPS.length;

export default function SearchBuilderPage() {
  const navigate = useNavigate();
  const step = useBuilderStore((s) => s.step);
  const prevStep = useBuilderStore((s) => s.prevStep);
  const nextStep = useBuilderStore((s) => s.nextStep);
  const savedConnectors = useBuilderStore((s) => s.savedConnectors);
  const deploymentType = useBuilderStore((s) => s.deploymentType);
  const selectedConnectorTypeIds = useBuilderStore((s) => s.selectedConnectorTypeIds);
  const indexingSelection = useBuilderStore((s) => s.indexingSelection);
  const selectedAgentIds = useBuilderStore((s) => s.selectedAgentIds);
  const orchestrationId = useBuilderStore((s) => s.orchestrationId);
  const orchestrationSaved = useBuilderStore((s) => s.orchestrationSaved);
  const testRan = useBuilderStore((s) => s.testRan);
  const indexingComplete = useBuilderStore((s) => s.indexingComplete);
  const indexProgress = useBuilderStore((s) => s.indexProgress);

  const selectedReady = selectedConnectorTypeIds.filter((typeId) =>
    savedConnectors.some(
      (c) => c.deployment === deploymentType && c.connectorTypeId === typeId && c.validated,
    ),
  );

  const isLastStep = step === MAX_STEP;

  const canContinue =
    step === 1 ||
    (step === 2 && selectedReady.length > 0) ||
    (step === 3 && indexingSelection.length > 0 && (indexingComplete || indexProgress >= 100)) ||
    (step === 4 && selectedAgentIds.length > 0) ||
    (step === 5 && !!orchestrationId && orchestrationSaved && testRan);

  return (
    <PageShell className="search-builder-page">
      <div className="search-builder-page__chrome">
        {/* <p className="mb-3 text-[13px] leading-[150%] text-text-secondary">
          Cloud or open source deployment — connect sources, index, add agents, then orchestrate and test.
        </p> */}
        <WizardStepper />
      </div>

      <div className="search-builder-page__stage-wrap">
        <div className="ds-wizard-stage search-builder-page__stage">
          <img src={createAgentBoxBg} alt="" aria-hidden="true" className="ds-wizard-stage__bg" />
          <div className="ds-wizard-stage__body search-builder-page__stage-body">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className={
                  step === 3 || step === 5
                    ? "search-builder-step"
                    : "search-builder-step search-builder-step--scroll"
                }
              >
                {step === 1 && <StepDeployment />}
                {step === 2 && <StepConnectors />}
                {step === 3 && <StepIndexing />}
                {step === 4 && <StepAgents />}
                {step === 5 && <StepOrchestration />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="search-builder-page__nav">
        <Button variant="secondary" disabled={step === 1} onClick={prevStep}>
          <ChevronLeftRoundedIcon sx={{ fontSize: 18 }} />
          Previous
        </Button>
        <span className="text-sm text-text-secondary">
          Step {step} of {MAX_STEP}
        </span>
        {isLastStep ? (
          <Button
            variant="primary"
            disabled={!canContinue}
            onClick={() => navigate("/agents")}
          >
            <CheckRoundedIcon sx={{ fontSize: 18 }} />
            Finish
          </Button>
        ) : (
          <Button variant="primary" disabled={!canContinue} onClick={nextStep}>
            Continue
            <ChevronRightRoundedIcon sx={{ fontSize: 18 }} />
          </Button>
        )}
      </div>
    </PageShell>
  );
}
