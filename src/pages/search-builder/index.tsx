import { motion, AnimatePresence } from "framer-motion";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { WizardStepper } from "./components/wizard-stepper";
import { useBuilderStore } from "@/store/builder-store";
import { StepDeployment } from "./components/steps/step-deployment";
import { StepConnectors } from "./components/steps/step-connectors";
import { StepIndexing } from "./components/steps/step-indexing";
import { StepAgents } from "./components/steps/step-agents";
import { StepOrchestration } from "./components/steps/step-orchestration";
import { StepTest } from "./components/steps/step-test";
import { StepDeploy } from "./components/steps/step-deploy";
import "./search-builder.scss";

const MAX_STEP = 7;

export default function SearchBuilderPage() {
  const step = useBuilderStore((s) => s.step);
  const prevStep = useBuilderStore((s) => s.prevStep);
  const nextStep = useBuilderStore((s) => s.nextStep);
  const savedConnectors = useBuilderStore((s) => s.savedConnectors);
  const indexingSelection = useBuilderStore((s) => s.indexingSelection);
  const selectedAgentIds = useBuilderStore((s) => s.selectedAgentIds);
  const orchestrationId = useBuilderStore((s) => s.orchestrationId);
  const testRan = useBuilderStore((s) => s.testRan);
  const indexProgress = useBuilderStore((s) => s.indexProgress);

  const canContinue =
    step === 1 ||
    (step === 2 && savedConnectors.some((c) => c.validated)) ||
    (step === 3 &&
      indexingSelection.length > 0 &&
      (indexProgress === 100 ||
        savedConnectors.some((c) => indexingSelection.includes(c.id) && c.status === "indexed"))) ||
    (step === 4 && selectedAgentIds.length > 0) ||
    (step === 5 && !!orchestrationId) ||
    (step === 6 && testRan) ||
    step === 7;

  return (
    <PageShell>
      <PageHeader
        title="Enterprise AI Search Builder"
        description="Cloud or open source deployment — connect sources, index, add agents, orchestrate, test, and deploy."
      />
      <WizardStepper />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="search-builder-step mt-6"
        >
          {step === 1 && <StepDeployment />}
          {step === 2 && <StepConnectors />}
          {step === 3 && <StepIndexing />}
          {step === 4 && <StepAgents />}
          {step === 5 && <StepOrchestration />}
          {step === 6 && <StepTest />}
          {step === 7 && <StepDeploy />}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-5">
        <Button variant="secondary" disabled={step === 1} onClick={prevStep}>
          <ChevronLeftRoundedIcon sx={{ fontSize: 18 }} />
          Previous
        </Button>
        <span className="text-sm text-gray-500">Step {step} of {MAX_STEP}</span>
        <Button variant="primary" disabled={step === MAX_STEP || !canContinue} onClick={nextStep}>
          Continue
          <ChevronRightRoundedIcon sx={{ fontSize: 18 }} />
        </Button>
      </div>
    </PageShell>
  );
}
