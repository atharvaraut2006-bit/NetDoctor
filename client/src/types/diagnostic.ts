/**
 * NetDoctor — Diagnostic System Types
 * Master interfaces for UI state, Roadmap, Steps, and Execution
 */

import type { ProblemCategoryKey } from '../engine/types';
import type { VisualGuidanceConfig, StepSafetyConfig, DiagnosticLayer } from '../knowledge/types';

export type OperatingSystem = 'windows' | 'macos' | 'linux' | 'other';

export type StepStatus = 'COMPLETED' | 'CURRENT' | 'PENDING' | 'FAILED' | 'SKIPPED';

export type SubmissionType = 'QUICK' | 'OUTPUT' | 'SCREENSHOT';

export type QuickResultOption = 'SUCCESS' | 'FAILURE' | 'DIFFERENT';

export interface DiagnosticStep {
  id: string;
  stepNumber: number;
  title: string;
  category: string;
  layer?: DiagnosticLayer;
  whyNeeded: string;
  detailedWhy: string;
  instructions: {
    windows: string[];
    macos: string[];
    linux: string[];
  };
  command: {
    windows: string;
    macos: string;
    linux: string;
  };
  expectedResult: {
    summary: string;
    sampleOutput: string;
  };
  defaultStatus: StepStatus;
  isDisruptive?: boolean;
  safety?: StepSafetyConfig;
  visualGuidance?: VisualGuidanceConfig;
}

export interface RoadmapStepItem {
  id: string;
  stepNumber: number;
  title: string;
  status: StepStatus;
  resultSummary?: string;
}

export interface CommonProblem {
  id: string;
  title: string;
  description: string;
  iconName: 'wifi' | 'globe' | 'gauge' | 'activity' | 'server';
  defaultCategoryKey: ProblemCategoryKey;
  defaultCategoryName: string;
}

export interface StepSubmissionResult {
  stepId: string;
  submissionType: SubmissionType;
  rawInput?: string;
  quickOutcome?: QuickResultOption;
  fileName?: string;
  submittedAt: Date;
  mockInterpretation?: string;
}

export type ActiveView = 'HOME' | 'WORKSPACE' | 'RESOLUTION';

export interface DiagnosticSessionState {
  sessionId: string;
  view: ActiveView;
  problemDescription: string;
  selectedOS: OperatingSystem;
  activeCategory: string;
  currentStepIndex: number;
  roadmap: RoadmapStepItem[];
  steps: DiagnosticStep[];
  submissions: Record<string, StepSubmissionResult>;
  isWhyDrawerOpen: boolean;
  isStopModalOpen: boolean;
  isStartOverModalOpen: boolean;
  isDisruptiveModalOpen: boolean;
  lastInterpretation: string | null;
}
