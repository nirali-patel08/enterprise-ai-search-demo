import { motion, AnimatePresence } from "framer-motion";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { WizardStepper } from "./components/wizard-stepper";
import { useBuilderStore } from "@/store/builder-store";
import { StepDataSources } from "./components/steps/step-data-sources";
import { StepConfigureIndex } from "./components/steps/step-configure-index";
import { StepPipeline } from "./components/steps/step-pipeline";
import { StepAgents } from "./components/steps/step-agents";
import { StepTest } from "./components/steps/step-test";
import { StepDeploy } from "./components/steps/step-deploy";
import { StepChat } from "./components/steps/step-chat";
import "./search-builder.scss";

export default function SearchBuilderPage() {
  const step = useBuilderStore((s) => s.step);
  const prevStep = useBuilderStore((s) => s.prevStep);
  const nextStep = useBuilderStore((s) => s.nextStep);
  const connectors = useBuilderStore((s) => s.connectors);
  const validated = useBuilderStore((s) => s.validated);
  const agents = useBuilderStore((s) => s.agents);
  const testRan = useBuilderStore((s) => s.testRan);
  const channels = useBuilderStore((s) => s.channels);

  const validatedCount = connectors.filter((id) => validated[id]).length;
  const canContinue =
    (step === 1 && connectors.length > 0) ||
    (step === 2 && validatedCount === connectors.length) ||
    (step === 3) ||
    (step === 4 && agents.includes("orchestrator")) ||
    (step === 5 && testRan) ||
    (step === 6 && channels.length > 0) ||
    step === 7;

  return (
    <PageShell>
      <PageHeader
        title="Enterprise AI Search Builder"
        description="Connect sources, index content, configure agents, test, and publish to Web, Teams, Copilot or APIs."
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
          {step === 1 && <StepDataSources />}
          {step === 2 && <StepConfigureIndex />}
          {step === 3 && <StepPipeline />}
          {step === 4 && <StepAgents />}
          {step === 5 && <StepTest />}
          {step === 6 && <StepDeploy />}
          {step === 7 && <StepChat />}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-5">
        <Button variant="secondary" disabled={step === 1} onClick={prevStep}>
          <ChevronLeftRoundedIcon sx={{ fontSize: 18 }} />
          Previous
        </Button>
        <span className="text-sm text-gray-500">Step {step} of 7</span>
        <Button variant="primary" disabled={step === 7 || !canContinue} onClick={nextStep}>
          Continue
          <ChevronRightRoundedIcon sx={{ fontSize: 18 }} />
        </Button>
      </div>
    </PageShell>
  );
}
