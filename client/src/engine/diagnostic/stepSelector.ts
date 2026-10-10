/**
 * NetDoctor — Adaptive Step Selector (Phase 4)
 * Deterministic next-step selector adhering to OSI hierarchy, prerequisites, and dynamic evidence
 */

import type { CuratedDiagnosticStep } from '../../knowledge/types';
import type { RoadmapStepItem } from '../../types/diagnostic';
import { DIAGNOSTIC_STEPS_LIBRARY } from '../../knowledge/steps';
import type { EvidenceStore } from './evidenceStore';

export interface NextStepSelection {
  nextStepId: string | null;
  nextStep?: CuratedDiagnosticStep;
  reason: string;
  isTerminal: boolean;
  updatedRoadmap: RoadmapStepItem[];
}

export class StepSelector {
  /**
   * Selects the next diagnostic step adaptively based on current progress and evidence.
   */
  public selectNextStep(
    baselineStepIds: string[],
    currentStepId: string,
    completedStepIds: string[],
    skippedStepIds: string[],
    failedStepIds: string[],
    evidence: EvidenceStore,
    currentRoadmap: RoadmapStepItem[]
  ): NextStepSelection {
    const executedStepIds = new Set([...completedStepIds, ...skippedStepIds, ...failedStepIds]);

    // 1. Adaptive Branching Check:
    // If IP configuration failed with APIPA, prioritize DHCP release/renew if not already executed
    if (evidence.isFault('ip_assignment') && !executedStepIds.has('step_ip_release_renew')) {
      const step = DIAGNOSTIC_STEPS_LIBRARY.step_ip_release_renew;
      const updatedRoadmap = this.insertStepIntoRoadmap(currentRoadmap, currentStepId, step);
      return {
        nextStepId: 'step_ip_release_renew',
        nextStep: step,
        reason: 'APIPA address detected. Diverting to DHCP lease release and renewal before testing gateway.',
        isTerminal: false,
        updatedRoadmap
      };
    }

    // If DNS failed but Internet WAN is reachable, branch to DNS flush before ending
    if (
      evidence.isFault('dns_resolution') &&
      evidence.isOk('wan_reachability') &&
      !executedStepIds.has('step_dns_flush')
    ) {
      const step = DIAGNOSTIC_STEPS_LIBRARY.step_dns_flush;
      const updatedRoadmap = this.insertStepIntoRoadmap(currentRoadmap, currentStepId, step);
      return {
        nextStepId: 'step_dns_flush',
        nextStep: step,
        reason: 'DNS lookup failure detected while external IP ping succeeded. Diverting to flush DNS cache.',
        isTerminal: false,
        updatedRoadmap
      };
    }

    // If adapter link state failed, branch to adapter restart if not already done
    if (evidence.isFault('adapter_link') && !executedStepIds.has('step_adapter_restart')) {
      const step = DIAGNOSTIC_STEPS_LIBRARY.step_adapter_restart;
      const updatedRoadmap = this.insertStepIntoRoadmap(currentRoadmap, currentStepId, step);
      return {
        nextStepId: 'step_adapter_restart',
        nextStep: step,
        reason: 'Network adapter reported disabled or disconnected. Recommending network adapter interface restart.',
        isTerminal: false,
        updatedRoadmap
      };
    }

    // 2. Sequential Baseline Selection (Avoiding already executed steps):
    const currentIdx = baselineStepIds.indexOf(currentStepId);
    let nextStepId: string | null = null;

    // Search forward in baseline list for the first unexecuted step
    for (let i = (currentIdx >= 0 ? currentIdx + 1 : 0); i < baselineStepIds.length; i++) {
      const candidateId = baselineStepIds[i];
      if (!executedStepIds.has(candidateId)) {
        nextStepId = candidateId;
        break;
      }
    }

    // If no forward unexecuted step, search from beginning for any unexecuted step
    if (!nextStepId) {
      for (const candidateId of baselineStepIds) {
        if (!executedStepIds.has(candidateId)) {
          nextStepId = candidateId;
          break;
        }
      }
    }

    // 3. Terminal condition: All steps executed
    if (!nextStepId) {
      const finalRoadmap = currentRoadmap.map((item) => {
        if (item.id === currentStepId) {
          return {
            ...item,
            status: (completedStepIds.includes(item.id)
              ? 'COMPLETED'
              : skippedStepIds.includes(item.id)
              ? 'SKIPPED'
              : 'FAILED') as any
          };
        }
        if (item.status === 'CURRENT') {
          return {
            ...item,
            status: (completedStepIds.includes(item.id)
              ? 'COMPLETED'
              : skippedStepIds.includes(item.id)
              ? 'SKIPPED'
              : failedStepIds.includes(item.id)
              ? 'FAILED'
              : 'PENDING') as any
          };
        }
        return item;
      });

      return {
        nextStepId: null,
        reason: 'All diagnostic steps in the procedure roadmap have been evaluated.',
        isTerminal: true,
        updatedRoadmap: finalRoadmap
      };
    }

    const nextStep = DIAGNOSTIC_STEPS_LIBRARY[nextStepId];
    const updatedRoadmap = currentRoadmap.map((item) => {
      if (item.id === currentStepId) {
        return {
          ...item,
          status: (completedStepIds.includes(item.id)
            ? 'COMPLETED'
            : skippedStepIds.includes(item.id)
            ? 'SKIPPED'
            : 'FAILED') as any
        };
      }
      if (item.id === nextStepId) {
        return { ...item, status: 'CURRENT' as const };
      }
      if (item.status === 'CURRENT') {
        return {
          ...item,
          status: (completedStepIds.includes(item.id)
            ? 'COMPLETED'
            : skippedStepIds.includes(item.id)
            ? 'SKIPPED'
            : failedStepIds.includes(item.id)
            ? 'FAILED'
            : 'PENDING') as any
        };
      }
      return item;
    });

    return {
      nextStepId,
      nextStep,
      reason: `Proceeding to next diagnostic test: ${nextStep.title}`,
      isTerminal: false,
      updatedRoadmap
    };
  }

  /**
   * Dynamically inserts an adaptive branching step into the roadmap right after the active step
   */
  private insertStepIntoRoadmap(
    roadmap: RoadmapStepItem[],
    currentStepId: string,
    stepToInsert: CuratedDiagnosticStep
  ): RoadmapStepItem[] {
    const existingIndex = roadmap.findIndex((r) => r.id === stepToInsert.id);
    if (existingIndex !== -1) {
      return roadmap.map((item) =>
        item.id === stepToInsert.id ? { ...item, status: 'CURRENT' as const } : item
      );
    }

    const currentIdx = roadmap.findIndex((r) => r.id === currentStepId);
    const newRoadmap = [...roadmap];
    const newRoadmapItem: RoadmapStepItem = {
      id: stepToInsert.id,
      stepNumber: (currentIdx >= 0 ? currentIdx + 2 : roadmap.length + 1),
      title: stepToInsert.title,
      status: 'CURRENT' as const
    };

    if (currentIdx >= 0) {
      newRoadmap.splice(currentIdx + 1, 0, newRoadmapItem);
    } else {
      newRoadmap.push(newRoadmapItem);
    }

    // Renumber steps
    return newRoadmap.map((item, idx) => ({
      ...item,
      stepNumber: idx + 1
    }));
  }

  /**
   * Verifies if all technical prerequisites for a step are satisfied.
   * If a lower OSI layer has a known fault, executing higher layer tests is invalid.
   */
  public checkPrerequisites(
    stepId: string,
    evidence: EvidenceStore
  ): {
    satisfied: boolean;
    passed: boolean;
    missingKey?: string;
    failedPrerequisite?: string;
    reason?: string;
  } {
    const stepDef = DIAGNOSTIC_STEPS_LIBRARY[stepId];
    if (!stepDef?.prerequisites?.requiredEvidenceKeys) {
      return { satisfied: true, passed: true };
    }

    for (const key of stepDef.prerequisites.requiredEvidenceKeys) {
      if (evidence.isFault(key)) {
        return {
          satisfied: false,
          passed: false,
          missingKey: key,
          failedPrerequisite: key,
          reason: `Prerequisite unsatisfied: Step "${stepDef.title}" requires layer health on "${key}", which currently reports an active fault.`
        };
      }
    }

    return { satisfied: true, passed: true };
  }
}
