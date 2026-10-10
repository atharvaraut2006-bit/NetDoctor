/**
 * NetDoctor — Diagnostic Engine Types (Phase 4)
 * Type definitions for Session State, Evidence, Decisions, Rules, and Reports
 */

import type { ProblemCategoryKey } from '../types';
import type { OperatingSystem, QuickResultOption, RoadmapStepItem, SubmissionType } from '../../types/diagnostic';
import type { DiagnosticProcedure, DiagnosticLayer, RootCauseRecord, CuratedDiagnosticStep } from '../../knowledge/types';

export type SessionStatus = 'IN_PROGRESS' | 'AWAITING_VERIFICATION' | 'RESOLVED' | 'STOPPED';

export type EvidenceStatus = 'VERIFIED_OK' | 'FAULT_DETECTED' | 'INCONCLUSIVE' | 'INTERMITTENT';

export interface EvidenceRecord {
  key: string;
  label: string;
  value: any;
  layer: DiagnosticLayer;
  sourceStepId: string;
  observedAt: Date;
  status: EvidenceStatus;
  observationIndex?: number;
  destination?: string;
  commandExecuted?: string;
  isIntermittent?: boolean;
}

export interface StepSubmissionRecord {
  stepId: string;
  submissionType: SubmissionType;
  rawInput?: string;
  quickOutcome?: QuickResultOption;
  fileName?: string;
  submittedAt: Date;
  interpretationSummary: string;
  isPassed: boolean;
  extractedMetrics?: Record<string, any>;
}

export interface EscalationReportData {
  escalateTo: 'ISP' | 'NETWORK_ADMIN' | 'HARDWARE_SUPPORT';
  title: string;
  reason: string;
  evidenceSummary: string[];
  technicalHandoffNotes: string[];
  recommendedQuestions: string[];
}

export interface FinalDiagnosticReport {
  sessionId?: string;
  problemIdentified: string;
  categoryKey: ProblemCategoryKey;
  rootCause: string;
  technicalExplanation: string;
  evidenceSummary: string[];
  solutionSteps: string[];
  whatHappened: string;
  stepsThatFixedIt: string[];
  preventionRecommendations: string[];
  resolvedAt: Date;
  escalation?: EscalationReportData;
}

export interface DiagnosticDecision {
  type:
    | 'NEXT_STEP'
    | 'ROOT_CAUSE_FOUND'
    | 'REASSESS_PATH'
    | 'NEED_CLARIFICATION'
    | 'VERIFY_RESOLUTION'
    | 'UNRECOGNIZED_OUTPUT'
    | 'UNSUPPORTED_OR_ESCALATE'
    | 'DISRUPTIVE_CONFIRMATION_REQUIRED'
    | 'PREREQUISITE_FAILED';
  nextStepId?: string;
  nextStepIndex?: number;
  plainReason: string;
  rootCause?: RootCauseRecord;
  evidenceAdded: EvidenceRecord[];
  contradictionDetected?: boolean;
  contradictionWarning?: string;
  updatedRoadmap?: RoadmapStepItem[];
  clarificationPrompt?: string;
  clarificationOptions?: string[];
  escalationData?: EscalationReportData;
}

export interface DiagnosticSessionState {
  sessionId: string;
  categoryKey: ProblemCategoryKey;
  categoryDisplayName: string;
  selectedOS: OperatingSystem;
  initialProblemText: string;
  status: SessionStatus;
  activeStepId: string;
  currentStepIndex: number;
  roadmap: RoadmapStepItem[];
  steps: CuratedDiagnosticStep[];
  activeProcedure: DiagnosticProcedure;
  completedStepIds: string[];
  skippedStepIds: string[];
  failedStepIds: string[];
  evidenceStore: Record<string, EvidenceRecord>;
  submissions: Record<string, StepSubmissionRecord>;
  currentHypothesis: string | null;
  identifiedRootCause: RootCauseRecord | null;
  suggestedSolution: RootCauseRecord | null;
  isVerifiedFixed: boolean | null;
  contradictionsDetected: string[];
  lastDecision: DiagnosticDecision | null;
  finalReport: FinalDiagnosticReport | null;
  escalationReport?: EscalationReportData | null;
}
