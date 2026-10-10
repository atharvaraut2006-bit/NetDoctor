import React, { useState } from 'react';
import type { DiagnosticStep, OperatingSystem, QuickResultOption, RoadmapStepItem } from '../../types/diagnostic';
import { DiagnosticRoadmap } from '../roadmap/DiagnosticRoadmap';
import { StepViewer } from './StepViewer';
import { WhyDrawer } from './WhyDrawer';

interface DiagnosticWorkspaceProps {
  category: string;
  selectedOS: OperatingSystem;
  steps: DiagnosticStep[];
  roadmap: RoadmapStepItem[];
  currentStepIndex: number;
  onSelectStep: (stepId: string) => void;
  onPreviousStep: () => void;
  onNextStep: () => void;
  onSkipStep: () => void;
  onSubmitResult: (stepId: string, resultType: 'QUICK' | 'OUTPUT' | 'SCREENSHOT', data: any) => void;
  onStopDiagnosis: () => void;
  onStartOver: () => void;
  lastInterpretation: string | null;
}

export const DiagnosticWorkspace: React.FC<DiagnosticWorkspaceProps> = ({
  category,
  selectedOS,
  steps,
  roadmap,
  currentStepIndex,
  onSelectStep,
  onPreviousStep,
  onNextStep,
  onSkipStep,
  onSubmitResult,
  onStopDiagnosis,
  onStartOver,
  lastInterpretation
}) => {
  const [isWhyOpen, setIsWhyOpen] = useState(false);
  const currentStep = steps[currentStepIndex] || steps[0];

  const handleQuickResult = (option: QuickResultOption, clarification?: string) => {
    onSubmitResult(currentStep.id, 'QUICK', { option, clarification });
  };

  const handlePastedOutput = (output: string) => {
    onSubmitResult(currentStep.id, 'OUTPUT', { output });
  };

  const handleScreenshot = (fileName: string, option: QuickResultOption, userDescription?: string) => {
    onSubmitResult(currentStep.id, 'SCREENSHOT', { fileName, option, userDescription });
  };

  return (
    <div className="workspace-container">
      {/* Left Sidebar: Diagnostic Roadmap */}
      <DiagnosticRoadmap
        category={category}
        selectedOS={selectedOS}
        roadmap={roadmap}
        currentStepId={currentStep.id}
        onSelectStep={onSelectStep}
        onStopDiagnosis={onStopDiagnosis}
        onStartOver={onStartOver}
      />

      {/* Right Action Panel: Step Viewer */}
      <StepViewer
        step={currentStep}
        selectedOS={selectedOS}
        totalSteps={steps.length}
        onOpenWhy={() => setIsWhyOpen(true)}
        onSubmitQuickResult={handleQuickResult}
        onSubmitPastedOutput={handlePastedOutput}
        onSubmitScreenshot={handleScreenshot}
        onPreviousStep={onPreviousStep}
        onSkipStep={onSkipStep}
        canGoBack={currentStepIndex > 0}
        canGoForward={currentStepIndex < steps.length - 1}
        onNextStep={onNextStep}
        lastInterpretation={lastInterpretation}
      />

      {/* "Why?" Explanation Modal Drawer */}
      <WhyDrawer
        step={currentStep}
        isOpen={isWhyOpen}
        onClose={() => setIsWhyOpen(false)}
      />
    </div>
  );
};
