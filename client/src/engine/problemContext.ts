/**
 * NetDoctor — Problem Context Builder
 * Constructs a structured, validated context package ready for Phase 3
 */

import type { OperatingSystem } from '../types/diagnostic';
import { MVP_CATEGORIES } from './categories';
import type { ClassificationResult, FollowUpOption, ProblemCategoryKey, ValidatedProblemContext } from './types';

interface CreateContextParams {
  rawInput: string;
  classification: ClassificationResult;
  selectedOS: OperatingSystem;
  followUpAnswer?: FollowUpOption;
}

export function createValidatedProblemContext(params: CreateContextParams): ValidatedProblemContext {
  const { rawInput, classification, selectedOS, followUpAnswer } = params;

  let finalCategory: ProblemCategoryKey = classification.category || 'internet_not_working';

  // If follow-up question specified a category modifier, apply it
  if (followUpAnswer && followUpAnswer.resolvedCategoryModifier) {
    finalCategory = followUpAnswer.resolvedCategoryModifier;
  }

  const categoryDef = MVP_CATEGORIES[finalCategory] || MVP_CATEGORIES.internet_not_working;
  const isOSSupported = selectedOS === 'windows' || selectedOS === 'macos' || selectedOS === 'linux';

  let contextSummary = `Identified Issue: ${categoryDef.displayName} (${finalCategory}) on ${selectedOS.toUpperCase()}`;
  if (followUpAnswer) {
    contextSummary += ` • Scope: ${followUpAnswer.label}`;
  }

  return {
    originalDescription: rawInput,
    normalizedDescription: classification.normalizedText,
    isNetworkingRelated: classification.isNetworkingRelated,
    category: finalCategory,
    categoryDisplayName: categoryDef.displayName,
    isVague: classification.isVague,
    followUpQuestion: classification.followUpQuestion,
    followUpAnswer: followUpAnswer?.id,
    followUpAnswerLabel: followUpAnswer?.label,
    operatingSystem: selectedOS,
    isOSSupported,
    classificationTimestamp: new Date(),
    contextSummary
  };
}
