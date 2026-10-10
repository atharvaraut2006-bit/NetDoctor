/**
 * NetDoctor — Knowledge Base Types
 * Schemas for curated diagnostic steps, roadmaps, commands, and root causes
 */

import type { ProblemCategoryKey } from '../engine/types';

export type DiagnosticLayer =
  | 'Physical / Data Link'
  | 'Network (IP / DHCP)'
  | 'Transport / Latency'
  | 'DNS / Name Translation'
  | 'Application / Web'
  | 'Local LAN';

export interface StepInstructionSet {
  windows: string[];
  macos: string[];
  linux: string[];
}

export interface StepCommandSet {
  windows: string;
  macos: string;
  linux: string;
}

export interface StepExpectedResult {
  summary: string;
  sampleOutput: string;
}

export type VisualGuidanceType =
  | 'gateway_path'
  | 'dns_flow'
  | 'packet_loss_comparison'
  | 'device_connection'
  | 'disruptive_warning'
  | 'terminal_guide';

export interface VisualGuidanceConfig {
  type: VisualGuidanceType;
  title: string;
  description: string;
  altText: string;
  relatedStepId?: string;
}

export interface StepSafetyConfig {
  isDisruptive: boolean;
  requiresConfirmation: boolean;
  confirmationReason: string;
  potentialConsequences: string;
  prerequisites?: string[];
  requiresAdminPrivileges?: boolean;
  recoveryGuidance?: string;
}

export interface StepPrerequisites {
  requiredEvidenceKeys?: string[];
  prerequisiteStepIds?: string[];
}

export interface CuratedDiagnosticStep {
  id: string;
  stepNumber: number;
  title: string;
  layer: DiagnosticLayer;
  whyNeeded: string;
  detailedWhy: string;
  instructions: StepInstructionSet;
  command: StepCommandSet;
  expectedResult: StepExpectedResult;
  isDisruptive?: boolean;
  disruptiveWarning?: string;
  safety?: StepSafetyConfig;
  visualGuidance?: VisualGuidanceConfig;
  prerequisites?: StepPrerequisites;
  isIntermittentRelevant?: boolean;
  rootCauseIdOnFailure?: string;
}

export interface CategoryRoadmapConfig {
  categoryKey: ProblemCategoryKey;
  displayName: string;
  description: string;
  stepIds: string[];
  primaryObjective: string;
}

export interface DiagnosticProcedure {
  categoryKey: ProblemCategoryKey;
  displayName: string;
  description: string;
  primaryObjective: string;
  initialStepId: string;
  stepIds: string[];
  expectedEvidenceKeys: string[];
  potentialRootCauses: string[];
  isDisruptive?: boolean;
  disruptiveWarning?: string;
}

export interface EvidenceRecord {
  key: string;
  label: string;
  value: any;
  layer: DiagnosticLayer;
  sourceStepId: string;
  observedAt: Date;
  status: 'VERIFIED_OK' | 'FAULT_DETECTED' | 'INCONCLUSIVE' | 'INTERMITTENT';
}

export interface RootCauseRecord {
  id: string;
  problemTitle: string;
  rootCause: string;
  technicalExplanation: string;
  solutionSteps: string[];
  verificationStepId: string;
  preventionRecommendations: string[];
}
