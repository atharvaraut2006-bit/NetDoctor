/**
 * NetDoctor — Interactive Diagnostic Engine (Phase 4)
 * Orchestrates session state, evidence accumulation, deterministic rule evaluation,
 * adaptive step selection, resolution verification, and final diagnostic reporting.
 */

import type { OperatingSystem, QuickResultOption, RoadmapStepItem, SubmissionType } from '../../types/diagnostic';
import type { ProblemCategoryKey, ValidatedProblemContext } from '../types';
import type {
  DiagnosticSessionState,
  DiagnosticDecision,
  FinalDiagnosticReport,
  EvidenceRecord,
  StepSubmissionRecord
} from './types';
import { getProcedure } from '../../knowledge/procedures';
import { DIAGNOSTIC_STEPS_LIBRARY } from '../../knowledge/steps';
import { interpretCommandOutput, interpretQuickOption } from '../interpreters';
import { EvidenceStore } from './evidenceStore';
import { RuleEvaluator } from './ruleEvaluator';
import { StepSelector } from './stepSelector';

export class DiagnosticEngine {
  private evidenceStore: EvidenceStore;
  private ruleEvaluator: RuleEvaluator;
  private stepSelector: StepSelector;

  constructor() {
    this.evidenceStore = new EvidenceStore();
    this.ruleEvaluator = new RuleEvaluator();
    this.stepSelector = new StepSelector();
  }

  /**
   * Initializes a brand new diagnostic session
   */
  public startSession(
    problemContext: ValidatedProblemContext,
    selectedOS: OperatingSystem,
    presetCategoryKey?: ProblemCategoryKey
  ): DiagnosticSessionState {
    const categoryKey = presetCategoryKey || problemContext.category || 'internet_not_working';
    const procedure = getProcedure(categoryKey);

    this.evidenceStore.clear();

    const steps = procedure.stepIds
      .map((id) => DIAGNOSTIC_STEPS_LIBRARY[id])
      .filter((s): s is typeof s => Boolean(s));

    const roadmap: RoadmapStepItem[] = steps.map((s, idx) => ({
      id: s.id,
      stepNumber: idx + 1,
      title: s.title,
      status: idx === 0 ? 'CURRENT' : 'PENDING'
    }));

    const session: DiagnosticSessionState = {
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      categoryKey,
      categoryDisplayName: procedure.displayName,
      selectedOS,
      initialProblemText: problemContext.originalDescription,
      status: 'IN_PROGRESS',
      activeStepId: procedure.initialStepId,
      currentStepIndex: 0,
      roadmap,
      steps,
      activeProcedure: procedure,
      completedStepIds: [],
      skippedStepIds: [],
      failedStepIds: [],
      evidenceStore: {},
      submissions: {},
      currentHypothesis: procedure.primaryObjective,
      identifiedRootCause: null,
      suggestedSolution: null,
      isVerifiedFixed: null,
      contradictionsDetected: [],
      lastDecision: null,
      finalReport: null
    };

    return session;
  }

  /**
   * Processes a user submission (Quick option, pasted terminal output, or screenshot),
   * updates the evidence store, evaluates rules, and determines the next adaptive step.
   */
  public processSubmission(
    session: DiagnosticSessionState,
    stepId: string,
    submissionType: SubmissionType,
    data: { option?: QuickResultOption; output?: string; fileName?: string }
  ): { updatedSession: DiagnosticSessionState; decision: DiagnosticDecision } {
    let interpretationSummary = '';
    let isPassed = true;
    let extractedMetrics: Record<string, any> | undefined;

    // 1. Run Phase 3 Interpreters
    if (submissionType === 'QUICK') {
      const option = data.option || 'SUCCESS';
      const interp = interpretQuickOption(stepId, option);
      interpretationSummary = interp.plainLanguageExplanation;
      isPassed = interp.isPassed;
    } else if (submissionType === 'OUTPUT') {
      const output = data.output || '';
      const interp = interpretCommandOutput(stepId, session.selectedOS, output);
      interpretationSummary = interp.plainLanguageExplanation;
      isPassed = interp.isPassed;
      extractedMetrics = interp.extractedMetrics;
    } else if (submissionType === 'SCREENSHOT') {
      interpretationSummary = `Screenshot "${data.fileName || 'terminal_capture.png'}" recorded. (Phase 5 will perform OCR extraction).`;
      isPassed = true;
    }

    // 2. Map interpretation to structured evidence records
    const newEvidenceList = this.mapStepResultToEvidence(stepId, isPassed, extractedMetrics);
    const contradictions: string[] = [];

    for (const ev of newEvidenceList) {
      const res = this.evidenceStore.addEvidence(
        ev.key,
        ev.label,
        ev.value,
        ev.layer,
        stepId,
        ev.status
      );
      if (res.isContradiction && res.contradictionMessage) {
        contradictions.push(res.contradictionMessage);
      }
    }

    // 3. Record Submission in session
    const submissionRecord: StepSubmissionRecord = {
      stepId,
      submissionType,
      rawInput: data.output || data.fileName || data.option,
      quickOutcome: data.option,
      fileName: data.fileName,
      submittedAt: new Date(),
      interpretationSummary,
      isPassed,
      extractedMetrics
    };

    const updatedSubmissions = {
      ...session.submissions,
      [stepId]: submissionRecord
    };

    const updatedCompletedIds = isPassed
      ? Array.from(new Set([...session.completedStepIds, stepId]))
      : session.completedStepIds.filter((id) => id !== stepId);

    const updatedFailedIds = !isPassed
      ? Array.from(new Set([...session.failedStepIds, stepId]))
      : session.failedStepIds.filter((id) => id !== stepId);

    // 4. Deterministic Rule Evaluation for Root Cause
    const ruleEval = this.ruleEvaluator.evaluate(this.evidenceStore);

    let decision: DiagnosticDecision;
    let nextStepIndex = session.currentStepIndex;
    let updatedRoadmap = [...session.roadmap];

    // Case A: Conclusive Root Cause Identified
    if (ruleEval.rootCauseFound && ruleEval.rootCause) {
      decision = {
        type: 'ROOT_CAUSE_FOUND',
        plainReason: ruleEval.plainExplanation,
        rootCause: ruleEval.rootCause,
        evidenceAdded: newEvidenceList,
        contradictionDetected: contradictions.length > 0,
        contradictionWarning: contradictions[0]
      };

      updatedRoadmap = updatedRoadmap.map((item) => {
        if (item.id === stepId) {
          return {
            ...item,
            status: isPassed ? 'COMPLETED' : 'FAILED',
            resultSummary: interpretationSummary
          };
        }
        return item;
      });

      const updatedSession: DiagnosticSessionState = {
        ...session,
        status: 'AWAITING_VERIFICATION',
        submissions: updatedSubmissions,
        completedStepIds: updatedCompletedIds,
        failedStepIds: updatedFailedIds,
        evidenceStore: this.evidenceStore.getAll(),
        identifiedRootCause: ruleEval.rootCause,
        suggestedSolution: ruleEval.suggestedSolution || ruleEval.rootCause,
        contradictionsDetected: [...session.contradictionsDetected, ...contradictions],
        roadmap: updatedRoadmap,
        lastDecision: decision
      };

      return { updatedSession, decision };
    }

    // Case B: Continuous Adaptive Next-Step Selection
    const nextSelection = this.stepSelector.selectNextStep(
      session.activeProcedure.stepIds,
      stepId,
      updatedCompletedIds,
      session.skippedStepIds,
      updatedFailedIds,
      this.evidenceStore,
      updatedRoadmap
    );

    let activeStepId = session.activeStepId;

    if (nextSelection.nextStepId) {
      activeStepId = nextSelection.nextStepId;
      const foundIdx = nextSelection.updatedRoadmap.findIndex((r) => r.id === activeStepId);
      if (foundIdx !== -1) {
        nextStepIndex = foundIdx;
      }
    }

    decision = {
      type: 'NEXT_STEP',
      nextStepId: nextSelection.nextStepId || undefined,
      nextStepIndex,
      plainReason: nextSelection.reason,
      evidenceAdded: newEvidenceList,
      contradictionDetected: contradictions.length > 0,
      contradictionWarning: contradictions[0],
      updatedRoadmap: nextSelection.updatedRoadmap
    };

    const updatedSession: DiagnosticSessionState = {
      ...session,
      activeStepId,
      currentStepIndex: nextStepIndex,
      submissions: updatedSubmissions,
      completedStepIds: updatedCompletedIds,
      failedStepIds: updatedFailedIds,
      evidenceStore: this.evidenceStore.getAll(),
      roadmap: nextSelection.updatedRoadmap,
      contradictionsDetected: [...session.contradictionsDetected, ...contradictions],
      lastDecision: decision
    };

    return { updatedSession, decision };
  }

  /**
   * Skips a diagnostic step without fabricating false pass evidence
   */
  public skipStep(
    session: DiagnosticSessionState,
    stepId: string
  ): { updatedSession: DiagnosticSessionState; decision: DiagnosticDecision } {
    const updatedSkippedIds = Array.from(new Set([...session.skippedStepIds, stepId]));

    const nextSelection = this.stepSelector.selectNextStep(
      session.activeProcedure.stepIds,
      stepId,
      session.completedStepIds,
      updatedSkippedIds,
      session.failedStepIds,
      this.evidenceStore,
      session.roadmap
    );

    let nextStepIndex = session.currentStepIndex;
    let activeStepId = session.activeStepId;

    if (nextSelection.nextStepId) {
      activeStepId = nextSelection.nextStepId;
      const foundIdx = nextSelection.updatedRoadmap.findIndex((r) => r.id === activeStepId);
      if (foundIdx !== -1) {
        nextStepIndex = foundIdx;
      }
    }

    const decision: DiagnosticDecision = {
      type: 'NEXT_STEP',
      nextStepId: nextSelection.nextStepId || undefined,
      nextStepIndex,
      plainReason: `Step "${DIAGNOSTIC_STEPS_LIBRARY[stepId]?.title || stepId}" skipped by user. ${nextSelection.reason}`,
      evidenceAdded: [],
      updatedRoadmap: nextSelection.updatedRoadmap
    };

    const updatedSession: DiagnosticSessionState = {
      ...session,
      activeStepId,
      currentStepIndex: nextStepIndex,
      skippedStepIds: updatedSkippedIds,
      roadmap: nextSelection.updatedRoadmap,
      lastDecision: decision
    };

    return { updatedSession, decision };
  }

  /**
   * Backtracks to an earlier step cleanly without corrupting the session
   */
  public backtrack(
    session: DiagnosticSessionState,
    targetStepId: string
  ): DiagnosticSessionState {
    const targetIdx = session.roadmap.findIndex((r) => r.id === targetStepId);
    if (targetIdx === -1) return session;

    const updatedRoadmap = session.roadmap.map((item, idx) => ({
      ...item,
      status: idx === targetIdx ? ('CURRENT' as const) : item.status
    }));

    return {
      ...session,
      activeStepId: targetStepId,
      currentStepIndex: targetIdx,
      roadmap: updatedRoadmap
    };
  }

  /**
   * Closed-loop Verification: Prompts "Is your problem fixed?"
   * - If fixed (true): Builds comprehensive FinalDiagnosticReport and resolves session.
   * - If not fixed (false): Reopens session to continue investigating secondary causes.
   */
  public verifyResolution(
    session: DiagnosticSessionState,
    isFixed: boolean
  ): { updatedSession: DiagnosticSessionState; finalReport: FinalDiagnosticReport | null } {
    if (isFixed) {
      const rootCause = session.identifiedRootCause || {
        id: 'rc_resolved',
        problemTitle: session.categoryDisplayName,
        rootCause: 'Transient network state inconsistency or configuration fault',
        technicalExplanation: 'The diagnostic troubleshooting procedure resolved the network routing fault.',
        solutionSteps: ['Verified troubleshooting fix actions.'],
        verificationStepId: session.activeStepId,
        preventionRecommendations: ['Keep your network adapter drivers and router firmware updated.']
      };

      const stepsThatFixedIt = Object.values(session.submissions)
        .filter((s) => s.isPassed)
        .map((s) => DIAGNOSTIC_STEPS_LIBRARY[s.stepId]?.title || s.stepId);

      const finalReport: FinalDiagnosticReport = {
        problemIdentified: session.initialProblemText || session.categoryDisplayName,
        categoryKey: session.categoryKey,
        rootCause: rootCause.rootCause,
        technicalExplanation: rootCause.technicalExplanation,
        evidenceSummary: this.evidenceStore.generateSummaryList(),
        solutionSteps: rootCause.solutionSteps,
        whatHappened: rootCause.technicalExplanation,
        stepsThatFixedIt: stepsThatFixedIt.length > 0 ? stepsThatFixedIt : ['Diagnostic verification procedure completed.'],
        preventionRecommendations: rootCause.preventionRecommendations,
        resolvedAt: new Date()
      };

      const updatedSession: DiagnosticSessionState = {
        ...session,
        status: 'RESOLVED',
        isVerifiedFixed: true,
        finalReport
      };

      return { updatedSession, finalReport };
    }

    // If not fixed, revert to IN_PROGRESS to continue testing remaining steps
    const updatedSession: DiagnosticSessionState = {
      ...session,
      status: 'IN_PROGRESS',
      isVerifiedFixed: false,
      identifiedRootCause: null
    };

    return { updatedSession, finalReport: null };
  }

  /**
   * Internal mapper converting step results & metrics into typed EvidenceRecords
   */
  private mapStepResultToEvidence(
    stepId: string,
    isPassed: boolean,
    metrics?: Record<string, any>
  ): EvidenceRecord[] {
    const records: EvidenceRecord[] = [];
    const status = isPassed ? ('VERIFIED_OK' as const) : ('FAULT_DETECTED' as const);

    switch (stepId) {
      case 'step_network_adapter':
        records.push({
          key: 'adapter_link',
          label: 'Network Adapter Interface Link State',
          value: metrics?.adapterName || (isPassed ? 'Connected' : 'Disconnected'),
          layer: 'Physical / Data Link',
          sourceStepId: stepId,
          observedAt: new Date(),
          status
        });
        break;

      case 'step_wifi_signal':
        records.push({
          key: 'wifi_signal',
          label: 'Wi-Fi Signal Strength & Link Quality',
          value: metrics?.signalPercentage || (isPassed ? 'Good (>75%)' : 'Weak/Disconnected'),
          layer: 'Physical / Data Link',
          sourceStepId: stepId,
          observedAt: new Date(),
          status
        });
        break;

      case 'step_ip_dhcp':
        records.push({
          key: 'ip_assignment',
          label: 'IPv4 Address & DHCP Lease Validity',
          value: metrics?.ipv4 || (isPassed ? 'Valid Private IP' : 'APIPA / No IP'),
          layer: 'Network (IP / DHCP)',
          sourceStepId: stepId,
          observedAt: new Date(),
          status
        });
        break;

      case 'step_gateway_ping':
        records.push({
          key: 'gateway_reachability',
          label: 'Default Gateway (Router) ICMP Reachability',
          value: metrics?.defaultGateway || (isPassed ? '0% Packet Loss' : '100% Packet Loss / Unreachable'),
          layer: 'Network (IP / DHCP)',
          sourceStepId: stepId,
          observedAt: new Date(),
          status
        });
        break;

      case 'step_dns_lookup':
        records.push({
          key: 'dns_resolution',
          label: 'Domain Name System (DNS) Resolution',
          value: metrics?.resolvedAddresses || (isPassed ? 'Resolved Host IP' : 'Lookup Timeout / NXDOMAIN'),
          layer: 'DNS / Name Translation',
          sourceStepId: stepId,
          observedAt: new Date(),
          status
        });
        break;

      case 'step_internet_ping':
        records.push({
          key: 'wan_reachability',
          label: 'Direct Internet WAN Numerical IP Reachability (8.8.8.8)',
          value: isPassed ? '0% Packet Loss' : '100% Packet Loss / Timed Out',
          layer: 'Transport / Latency',
          sourceStepId: stepId,
          observedAt: new Date(),
          status
        });
        break;

      case 'step_ping_latency_jitter':
        records.push({
          key: 'ping_latency_jitter',
          label: 'Packet Loss & Latency Jitter Metrics',
          value: metrics ? `Avg: ${metrics.avgRtt}ms, Loss: ${metrics.lossPercentage}%` : (isPassed ? 'Steady Latency' : 'High Jitter/Loss'),
          layer: 'Transport / Latency',
          sourceStepId: stepId,
          observedAt: new Date(),
          status
        });
        break;

      case 'step_trace_route':
        records.push({
          key: 'traceroute_hop',
          label: 'Traceroute Intermediate Hop Health',
          value: isPassed ? 'All Hops Responding' : 'Hop Bottleneck / Timeouts Detected',
          layer: 'Network (IP / DHCP)',
          sourceStepId: stepId,
          observedAt: new Date(),
          status
        });
        break;

      case 'step_http_reachability':
        records.push({
          key: 'http_reachability',
          label: 'Web Server HTTP Port Response (80/443)',
          value: metrics?.httpStatusCode ? `HTTP ${metrics.httpStatusCode}` : (isPassed ? 'HTTP 200 OK' : 'Server Down / Error'),
          layer: 'Application / Web',
          sourceStepId: stepId,
          observedAt: new Date(),
          status
        });
        break;

      case 'step_lan_peer_ping':
        records.push({
          key: 'lan_peer_reachability',
          label: 'Local LAN Subnet ARP & Peer Discovery',
          value: isPassed ? 'Local Peers Discovered' : 'ARP Empty / Peer Unreachable',
          layer: 'Local LAN',
          sourceStepId: stepId,
          observedAt: new Date(),
          status
        });
        break;

      case 'step_adapter_restart':
        records.push({
          key: 'adapter_restart_outcome',
          label: 'Network Interface Reinitialization',
          value: isPassed ? 'Adapter Restart Succeeded' : 'Adapter Restart Failed',
          layer: 'Physical / Data Link',
          sourceStepId: stepId,
          observedAt: new Date(),
          status
        });
        break;

      case 'step_dns_flush':
        records.push({
          key: 'dns_flush_outcome',
          label: 'DNS Resolver Cache Reset',
          value: isPassed ? 'DNS Cache Flushed Successfully' : 'DNS Cache Flush Failed',
          layer: 'DNS / Name Translation',
          sourceStepId: stepId,
          observedAt: new Date(),
          status
        });
        break;

      case 'step_ip_release_renew':
        records.push({
          key: 'ip_renewal_outcome',
          label: 'DHCP Lease Release & Renewal',
          value: isPassed ? 'New Lease Obtained from Router' : 'DHCP Renewal Failed',
          layer: 'Network (IP / DHCP)',
          sourceStepId: stepId,
          observedAt: new Date(),
          status
        });
        break;

      default:
        records.push({
          key: `step_result_${stepId}`,
          label: `Result for step: ${stepId}`,
          value: isPassed ? 'Pass' : 'Fail',
          layer: 'Network (IP / DHCP)',
          sourceStepId: stepId,
          observedAt: new Date(),
          status
        });
        break;
    }

    return records;
  }
}
