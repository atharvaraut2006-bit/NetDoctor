import React, { createContext, useContext, useState, useRef } from 'react';
import type {
  ActiveView,
  DiagnosticStep,
  OperatingSystem,
  RoadmapStepItem,
  StepStatus,
  StepSubmissionResult
} from '../types/diagnostic';
import {
  classifyProblem,
  createValidatedProblemContext,
  MVP_CATEGORIES
} from '../engine';
import type {
  ClassificationResult,
  FollowUpOption,
  FollowUpQuestion,
  ProblemCategoryKey,
  ValidatedProblemContext
} from '../engine/types';
import {
  DiagnosticEngine,
  type DiagnosticSessionState,
  type FinalDiagnosticReport
} from '../engine/diagnostic';
import type { RootCauseRecord } from '../knowledge/types';

export interface DiscoveredNetworkConfig {
  ipv4?: string;
  defaultGateway?: string;
  subnetMask?: string;
  dhcpServer?: string;
  dnsServers?: string[];
  adapterName?: string;
}

interface DiagnosticContextValue {
  view: ActiveView;
  problemDescription: string;
  selectedOS: OperatingSystem;
  activeCategory: string;
  categoryKey: ProblemCategoryKey;
  steps: DiagnosticStep[];
  roadmap: RoadmapStepItem[];
  currentStepIndex: number;
  currentStep: DiagnosticStep;
  submissions: Record<string, StepSubmissionResult>;
  lastInterpretation: string | null;
  isStopModalOpen: boolean;
  isStartOverModalOpen: boolean;
  isDisruptiveModalOpen: boolean;
  disruptiveModalWarning: string | null;

  // Phase 4 Engine State
  session: DiagnosticSessionState | null;
  identifiedRootCause: RootCauseRecord | null;
  suggestedSolution: RootCauseRecord | null;
  finalReport: FinalDiagnosticReport | null;
  resolutionStatus: 'AWAITING_VERIFICATION' | 'RESOLVED';

  // Discovered Network Configuration
  discoveredConfig: DiscoveredNetworkConfig;
  updateDiscoveredConfig: (config: Partial<DiscoveredNetworkConfig>) => void;

  // Phase 2 Validation State
  problemContext: ValidatedProblemContext | null;
  classificationResult: ClassificationResult | null;
  rejectionReason: string | null;
  activeFollowUp: FollowUpQuestion | null;

  // Actions
  startDiagnosis: (problemText: string, os: OperatingSystem, presetCategoryKey?: ProblemCategoryKey) => void;
  answerFollowUp: (option: FollowUpOption) => void;
  cancelFollowUp: () => void;
  clearRejection: () => void;
  selectStep: (stepId: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  skipStep: () => void;
  submitResult: (stepId: string, type: 'QUICK' | 'OUTPUT' | 'SCREENSHOT', data: any) => void;
  confirmDisruptiveAction: () => void;
  cancelDisruptiveAction: () => void;
  verifyResolution: (isFixed: boolean) => void;
  openStopModal: () => void;
  confirmStop: () => void;
  openStartOverModal: () => void;
  confirmStartOver: () => void;
  closeModals: () => void;
  navigateToHome: () => void;
}

const DiagnosticContext = createContext<DiagnosticContextValue | undefined>(undefined);

export const DiagnosticProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const engineRef = useRef<DiagnosticEngine>(new DiagnosticEngine());

  const [view, setView] = useState<ActiveView>('HOME');
  const [problemDescription, setProblemDescription] = useState<string>('');
  const [selectedOS, setSelectedOS] = useState<OperatingSystem>('windows');
  const [activeCategory, setActiveCategory] = useState<string>('Wi-Fi Connection Problems');
  const [categoryKey, setCategoryKey] = useState<ProblemCategoryKey>('wifi_connection');

  // Session State
  const [session, setSession] = useState<DiagnosticSessionState | null>(null);
  const [steps, setSteps] = useState<DiagnosticStep[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapStepItem[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [submissions, setSubmissions] = useState<Record<string, StepSubmissionResult>>({});
  const [lastInterpretation, setLastInterpretation] = useState<string | null>(null);

  // Phase 4 Resolution & Verification State
  const [identifiedRootCause, setIdentifiedRootCause] = useState<RootCauseRecord | null>(null);
  const [suggestedSolution, setSuggestedSolution] = useState<RootCauseRecord | null>(null);
  const [finalReport, setFinalReport] = useState<FinalDiagnosticReport | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState<'AWAITING_VERIFICATION' | 'RESOLVED'>('AWAITING_VERIFICATION');

  // Modals
  const [isStopModalOpen, setIsStopModalOpen] = useState(false);
  const [isStartOverModalOpen, setIsStartOverModalOpen] = useState(false);
  const [isDisruptiveModalOpen, setIsDisruptiveModalOpen] = useState(false);
  const [disruptiveModalWarning, setDisruptiveModalWarning] = useState<string | null>(null);
  const pendingDisruptiveActionRef = useRef<(() => void) | null>(null);

  // Discovered Network Configuration
  const [discoveredConfig, setDiscoveredConfig] = useState<DiscoveredNetworkConfig>({});

  // Phase 2 Validation State
  const [problemContext, setProblemContext] = useState<ValidatedProblemContext | null>(null);
  const [classificationResult, setClassificationResult] = useState<ClassificationResult | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [activeFollowUp, setActiveFollowUp] = useState<FollowUpQuestion | null>(null);

  const updateDiscoveredConfig = (config: Partial<DiscoveredNetworkConfig>) => {
    setDiscoveredConfig((prev) => ({ ...prev, ...config }));
  };

  const startDiagnosis = (
    problemText: string,
    os: OperatingSystem,
    presetCategoryKey?: ProblemCategoryKey
  ) => {
    setProblemDescription(problemText);
    setSelectedOS(os);
    setRejectionReason(null);
    setActiveFollowUp(null);
    setIdentifiedRootCause(null);
    setSuggestedSolution(null);
    setFinalReport(null);

    let context: ValidatedProblemContext;
    let resolvedCategory: ProblemCategoryKey;

    if (presetCategoryKey && MVP_CATEGORIES[presetCategoryKey]) {
      const catDef = MVP_CATEGORIES[presetCategoryKey];
      const classification: ClassificationResult = {
        isNetworkingRelated: true,
        category: presetCategoryKey,
        categoryDisplayName: catDef.displayName,
        normalizedText: problemText.toLowerCase(),
        correctedTokens: [],
        detectedConcepts: [presetCategoryKey],
        isVague: false,
        explanation: {
          matchedKeywords: [presetCategoryKey],
          matchedPhrases: [problemText],
          relevanceSignals: ['preset_selected'],
          categoryScores: { [presetCategoryKey]: 100 } as any
        }
      };

      context = createValidatedProblemContext({
        rawInput: problemText,
        classification,
        selectedOS: os
      });
      resolvedCategory = presetCategoryKey;
      setClassificationResult(classification);
    } else {
      const classification = classifyProblem(problemText);
      setClassificationResult(classification);

      if (!classification.isNetworkingRelated) {
        setRejectionReason(
          classification.rejectionReason ||
            'This problem does not appear to be related to networking. Please describe a network-related issue such as Wi-Fi connectivity, Internet access, DNS, latency, or packet loss.'
        );
        return;
      }

      if (classification.isVague && classification.followUpQuestion) {
        setActiveFollowUp(classification.followUpQuestion);
        return;
      }

      resolvedCategory = classification.category || 'internet_not_working';
      context = createValidatedProblemContext({
        rawInput: problemText,
        classification,
        selectedOS: os
      });
    }

    const catDef = MVP_CATEGORIES[resolvedCategory] || MVP_CATEGORIES.internet_not_working;

    // Start Phase 4 Diagnostic Engine Session
    const newSession = engineRef.current.startSession(context, os, resolvedCategory);

    const diagnosticSteps: DiagnosticStep[] = newSession.steps.map((def, idx) => ({
      id: def.id,
      stepNumber: idx + 1,
      title: def.title,
      category: def.layer,
      whyNeeded: def.whyNeeded,
      detailedWhy: def.detailedWhy,
      instructions: def.instructions,
      command: def.command,
      expectedResult: def.expectedResult,
      defaultStatus: (idx === 0 ? 'CURRENT' : 'PENDING') as StepStatus,
      isDisruptive: def.isDisruptive
    }));

    setProblemContext(context);
    setActiveCategory(catDef.displayName);
    setCategoryKey(resolvedCategory);
    setSession(newSession);
    setSteps(diagnosticSteps);
    setRoadmap(newSession.roadmap);
    setCurrentStepIndex(0);
    setSubmissions({});
    setLastInterpretation(null);
    setDiscoveredConfig({});
    setView('WORKSPACE');
  };

  const answerFollowUp = (option: FollowUpOption) => {
    if (!classificationResult) return;

    const context = createValidatedProblemContext({
      rawInput: problemDescription,
      classification: classificationResult,
      selectedOS,
      followUpAnswer: option
    });

    const catDef = MVP_CATEGORIES[context.category] || MVP_CATEGORIES.internet_not_working;
    const newSession = engineRef.current.startSession(context, selectedOS, context.category);

    const diagnosticSteps: DiagnosticStep[] = newSession.steps.map((def, idx) => ({
      id: def.id,
      stepNumber: idx + 1,
      title: def.title,
      category: def.layer,
      whyNeeded: def.whyNeeded,
      detailedWhy: def.detailedWhy,
      instructions: def.instructions,
      command: def.command,
      expectedResult: def.expectedResult,
      defaultStatus: (idx === 0 ? 'CURRENT' : 'PENDING') as StepStatus,
      isDisruptive: def.isDisruptive
    }));

    setProblemContext(context);
    setActiveCategory(catDef.displayName);
    setCategoryKey(context.category);
    setSession(newSession);
    setSteps(diagnosticSteps);
    setRoadmap(newSession.roadmap);
    setActiveFollowUp(null);
    setCurrentStepIndex(0);
    setSubmissions({});
    setLastInterpretation(null);
    setDiscoveredConfig({});
    setView('WORKSPACE');
  };

  const cancelFollowUp = () => setActiveFollowUp(null);
  const clearRejection = () => setRejectionReason(null);

  const selectStep = (stepId: string) => {
    if (!session) return;
    const updated = engineRef.current.backtrack(session, stepId);
    setSession(updated);
    setRoadmap(updated.roadmap);
    setCurrentStepIndex(updated.currentStepIndex);
    setLastInterpretation(null);
  };

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      const nextStepId = steps[nextIdx].id;
      selectStep(nextStepId);
    }
  };

  const previousStep = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      const prevStepId = steps[prevIdx].id;
      selectStep(prevStepId);
    }
  };

  const skipStep = () => {
    if (!session) return;
    const currentStepId = steps[currentStepIndex]?.id || session.activeStepId;
    const { updatedSession } = engineRef.current.skipStep(session, currentStepId);

    setSession(updatedSession);
    setRoadmap(updatedSession.roadmap);
    setCurrentStepIndex(updatedSession.currentStepIndex);
    setLastInterpretation(`Step "${steps[currentStepIndex]?.title}" was skipped by the user.`);
  };

  const submitResult = (stepId: string, type: 'QUICK' | 'OUTPUT' | 'SCREENSHOT', data: any) => {
    if (!session) return;

    // Check if the step is disruptive and requires safety confirmation before proceeding
    const activeStepDef = steps.find((s) => s.id === stepId);
    if (activeStepDef?.isDisruptive && !isDisruptiveModalOpen) {
      // Prompt safety modal
      pendingDisruptiveActionRef.current = () => executeSubmission(stepId, type, data);
      setDisruptiveModalWarning(
        `Running this test will temporarily reset network sockets or release IP configuration.`
      );
      setIsDisruptiveModalOpen(true);
      return;
    }

    executeSubmission(stepId, type, data);
  };

  const executeSubmission = (stepId: string, type: 'QUICK' | 'OUTPUT' | 'SCREENSHOT', data: any) => {
    if (!session) return;

    const { updatedSession, decision } = engineRef.current.processSubmission(
      session,
      stepId,
      type,
      data
    );

    setSession(updatedSession);
    setRoadmap(updatedSession.roadmap);
    setLastInterpretation(decision.plainReason);

    // Save submission locally in submissions dictionary
    const subRecord = updatedSession.submissions[stepId];
    if (subRecord) {
      setSubmissions((prev) => ({
        ...prev,
        [stepId]: {
          stepId,
          submissionType: type,
          rawInput: subRecord.rawInput,
          quickOutcome: subRecord.quickOutcome,
          fileName: subRecord.fileName,
          submittedAt: subRecord.submittedAt,
          mockInterpretation: decision.plainReason
        }
      }));

      // Extract discovered network configurations
      if (subRecord.extractedMetrics) {
        const metrics = subRecord.extractedMetrics;
        setDiscoveredConfig((prev) => ({
          ...prev,
          ...(metrics.ipv4 && { ipv4: metrics.ipv4 }),
          ...(metrics.defaultGateway && { defaultGateway: metrics.defaultGateway }),
          ...(metrics.subnetMask && { subnetMask: metrics.subnetMask }),
          ...(metrics.dhcpServer && { dhcpServer: metrics.dhcpServer }),
          ...(metrics.dnsServers && metrics.dnsServers.length > 0 && { dnsServers: metrics.dnsServers }),
          ...(metrics.adapterName && { adapterName: metrics.adapterName })
        }));
      }
    }

    // Adaptive Navigation
    if (decision.type === 'ROOT_CAUSE_FOUND' && decision.rootCause) {
      setIdentifiedRootCause(decision.rootCause);
      setSuggestedSolution(decision.rootCause);
      setResolutionStatus('AWAITING_VERIFICATION');
      setView('RESOLUTION');
    }
  };


  const confirmDisruptiveAction = () => {
    setIsDisruptiveModalOpen(false);
    if (pendingDisruptiveActionRef.current) {
      pendingDisruptiveActionRef.current();
      pendingDisruptiveActionRef.current = null;
    }
  };

  const cancelDisruptiveAction = () => {
    setIsDisruptiveModalOpen(false);
    pendingDisruptiveActionRef.current = null;
  };

  const verifyResolution = (isFixed: boolean) => {
    if (!session) return;

    const { updatedSession, finalReport: report } = engineRef.current.verifyResolution(
      session,
      isFixed
    );

    setSession(updatedSession);

    if (isFixed && report) {
      setFinalReport(report);
      setResolutionStatus('RESOLVED');
      setView('RESOLUTION');
    } else {
      // User said "No, Still Not Working" -> Return to Workspace to continue testing secondary causes
      setIdentifiedRootCause(null);
      setSuggestedSolution(null);
      setView('WORKSPACE');
      setLastInterpretation(
        'Troubleshooting action did not fully resolve the problem. Continuing with remaining diagnostic procedure steps.'
      );
    }
  };

  const openStopModal = () => setIsStopModalOpen(true);
  const confirmStop = () => {
    setIsStopModalOpen(false);
    setView('HOME');
  };

  const openStartOverModal = () => setIsStartOverModalOpen(true);
  const confirmStartOver = () => {
    setIsStartOverModalOpen(false);
    setProblemDescription('');
    setProblemContext(null);
    setClassificationResult(null);
    setRejectionReason(null);
    setActiveFollowUp(null);
    setSession(null);
    setSteps([]);
    setRoadmap([]);
    setCurrentStepIndex(0);
    setSubmissions({});
    setLastInterpretation(null);
    setIdentifiedRootCause(null);
    setSuggestedSolution(null);
    setFinalReport(null);
    setDiscoveredConfig({});
    setView('HOME');
  };

  const closeModals = () => {
    setIsStopModalOpen(false);
    setIsStartOverModalOpen(false);
    setIsDisruptiveModalOpen(false);
  };

  const navigateToHome = () => {
    if (view === 'WORKSPACE' || view === 'RESOLUTION') {
      openStartOverModal();
    } else {
      setView('HOME');
    }
  };

  const currentStep = steps[currentStepIndex] || steps[0] || {
    id: 'step_network_adapter',
    stepNumber: 1,
    title: 'Check Network Adapter',
    category: 'Physical / Data Link',
    whyNeeded: 'Verifies network adapter link state.',
    detailedWhy: 'Checks if network card is enabled and linked.',
    instructions: { windows: [], macos: [], linux: [] },
    command: { windows: '', macos: '', linux: '' },
    expectedResult: { summary: '', sampleOutput: '' },
    defaultStatus: 'CURRENT'
  };

  return (
    <DiagnosticContext.Provider
      value={{
        view,
        problemDescription,
        selectedOS,
        activeCategory,
        categoryKey,
        steps,
        roadmap,
        currentStepIndex,
        currentStep,
        submissions,
        lastInterpretation,
        isStopModalOpen,
        isStartOverModalOpen,
        isDisruptiveModalOpen,
        disruptiveModalWarning,
        session,
        identifiedRootCause,
        suggestedSolution,
        finalReport,
        resolutionStatus,
        discoveredConfig,
        updateDiscoveredConfig,
        problemContext,
        classificationResult,
        rejectionReason,
        activeFollowUp,
        startDiagnosis,
        answerFollowUp,
        cancelFollowUp,
        clearRejection,
        selectStep,
        nextStep,
        previousStep,
        skipStep,
        submitResult,
        confirmDisruptiveAction,
        cancelDisruptiveAction,
        verifyResolution,
        openStopModal,
        confirmStop,
        openStartOverModal,
        confirmStartOver,
        closeModals,
        navigateToHome
      }}
    >
      {children}
    </DiagnosticContext.Provider>
  );
};

export const useDiagnostic = () => {
  const context = useContext(DiagnosticContext);
  if (!context) {
    throw new Error('useDiagnostic must be used within a DiagnosticProvider');
  }
  return context;
};
