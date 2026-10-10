/**
 * NetDoctor — Phase 2 Engine Types & Categories
 */

import type { OperatingSystem } from '../types/diagnostic';

export type ProblemCategoryKey =
  | 'internet_not_working'
  | 'wifi_connection'
  | 'slow_internet'
  | 'high_latency'
  | 'packet_loss'
  | 'dns_problem'
  | 'ip_dhcp_problem'
  | 'router_connectivity'
  | 'network_adapter'
  | 'website_connectivity'
  | 'lan_connectivity';

export interface CategoryDefinition {
  id: ProblemCategoryKey;
  displayName: string;
  description: string;
  primaryKeywords: string[];
  secondaryKeywords: string[];
  keyPhrases: string[];
  antiKeywords?: string[];
}

export interface FollowUpOption {
  id: string;
  label: string;
  description?: string;
  resolvedCategoryModifier?: ProblemCategoryKey;
}

export interface FollowUpQuestion {
  id: string;
  question: string;
  whyNeeded: string;
  options: FollowUpOption[];
}

export interface ClassificationResult {
  isNetworkingRelated: boolean;
  rejectionReason?: string;
  suggestedPrompt?: string;
  
  // Classification Details
  category?: ProblemCategoryKey;
  categoryDisplayName?: string;
  normalizedText: string;
  correctedTokens: Array<{ original: string; corrected: string }>;
  detectedConcepts: string[];
  
  // Vague detection
  isVague: boolean;
  followUpQuestion?: FollowUpQuestion;
  
  // Internal debug/explainability trace
  explanation: {
    matchedKeywords: string[];
    matchedPhrases: string[];
    relevanceSignals: string[];
    categoryScores: Record<string, number>;
  };
}

export interface ValidatedProblemContext {
  originalDescription: string;
  normalizedDescription: string;
  isNetworkingRelated: boolean;
  category: ProblemCategoryKey;
  categoryDisplayName: string;
  isVague: boolean;
  followUpQuestion?: FollowUpQuestion;
  followUpAnswer?: string;
  followUpAnswerLabel?: string;
  operatingSystem: OperatingSystem;
  isOSSupported: boolean;
  classificationTimestamp: Date;
  contextSummary: string;
}
