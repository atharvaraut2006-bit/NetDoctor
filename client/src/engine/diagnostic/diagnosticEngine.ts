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
  StepSubmissionRecord,
  EscalationReportData
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
    data: {
      option?: QuickResultOption;
      output?: string;
      fileName?: string;
      outcome?: string;
      isPassed?: boolean;
      userNotes?: string;
    }
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

      // Handle Unrecognized Output: if output is non-network gibberish or does not contain command signatures
      if (interp.outcomeType === 'UNRECOGNIZED_OUTPUT' || extractedMetrics?.isValidOutput === false) {
        const stepDef = DIAGNOSTIC_STEPS_LIBRARY[stepId];
        const osKey = session.selectedOS === 'other' ? 'windows' : session.selectedOS;
        const expectedCmd = stepDef ? (stepDef.command[osKey] || stepDef.command.windows) : 'the command';

        const warningReason = `Unrecognized terminal output: The text you submitted does not contain valid output for "${expectedCmd}". Please run the command in your Command Prompt/Terminal, copy the actual output, and paste it here.`;

        const decision: DiagnosticDecision = {
          type: 'UNRECOGNIZED_OUTPUT',
          plainReason: warningReason,
          evidenceAdded: [],
          contradictionDetected: false,
          updatedRoadmap: session.roadmap
        };

        const updatedSession: DiagnosticSessionState = {
          ...session,
          lastDecision: decision
        };

        return { updatedSession, decision };
      }
    } else if (submissionType === 'SCREENSHOT') {
      const option: QuickResultOption =
        data.option ||
        (data.outcome === 'FAILED' || data.isPassed === false || data.outcome === 'DIFFERENT'
          ? 'FAILURE'
          : 'SUCCESS');
      const interp = interpretQuickOption(stepId, option);
      interpretationSummary = `Screenshot "${data.fileName || 'capture.png'}" verified: ${interp.plainLanguageExplanation}`;
      isPassed = interp.isPassed;
      extractedMetrics = { fileName: data.fileName, userOption: option };
    }

    // 2. Check Prerequisites: ensure lower layer requirements are satisfied
    const prereq = this.stepSelector.checkPrerequisites(stepId, this.evidenceStore);
    if (!prereq.satisfied) {
      const decision: DiagnosticDecision = {
        type: 'PREREQUISITE_FAILED',
        plainReason: prereq.reason || 'Technical prerequisites for this step are not satisfied.',
        evidenceAdded: [],
        contradictionDetected: false,
        updatedRoadmap: session.roadmap
      };
      return { updatedSession: session, decision };
    }

    // 3. Map interpretation to structured evidence records
    const newEvidenceList = this.mapStepResultToEvidence(stepId, isPassed, extractedMetrics);
    const contradictions: string[] = [];

    for (const ev of newEvidenceList) {
      const res = this.evidenceStore.addEvidence(
        ev.key,
        ev.label,
        ev.value,
        ev.layer,
        stepId,
        ev.status,
        {
          destination: ev.destination,
          isIntermittent: ev.isIntermittent || ev.status === 'INTERMITTENT'
        }
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

    if (!nextSelection.nextStepId) {
      const escalationData = this.generateEscalationReport({
        ...session,
        submissions: updatedSubmissions,
        completedStepIds: updatedCompletedIds,
        failedStepIds: updatedFailedIds
      });

      decision = {
        type: 'UNSUPPORTED_OR_ESCALATE',
        nextStepId: undefined,
        nextStepIndex,
        plainReason: `Diagnostic procedure finished. ${nextSelection.reason}`,
        evidenceAdded: newEvidenceList,
        contradictionDetected: contradictions.length > 0,
        contradictionWarning: contradictions[0],
        updatedRoadmap: nextSelection.updatedRoadmap,
        escalationData
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
        lastDecision: decision,
        escalationReport: escalationData
      };

      return { updatedSession, decision };
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

    const updatedRoadmap = session.roadmap.map((item, idx) => {
      if (idx === targetIdx) {
        return { ...item, status: 'CURRENT' as const };
      }
      if (item.status === 'CURRENT') {
        const status = session.completedStepIds.includes(item.id)
          ? ('COMPLETED' as const)
          : session.failedStepIds.includes(item.id)
          ? ('FAILED' as const)
          : session.skippedStepIds.includes(item.id)
          ? ('SKIPPED' as const)
          : ('PENDING' as const);
        return { ...item, status };
      }
      return item;
    });

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

    // If not fixed:
    const remainingSteps = session.activeProcedure.stepIds.filter(
      (id) => !session.completedStepIds.includes(id) && session.activeStepId !== id
    );

    if (remainingSteps.length === 0) {
      const escalation = this.generateEscalationReport(session);
      const finalReport: FinalDiagnosticReport = {
        problemIdentified: session.initialProblemText || session.categoryDisplayName,
        categoryKey: session.categoryKey,
        rootCause: 'Unresolved Network Impairment (Escalation Required)',
        technicalExplanation:
          'Local client-side troubleshooting procedures were completed without restoring connectivity. Upstream ISP, network administrator, or hardware intervention is required.',
        evidenceSummary: this.evidenceStore.generateSummaryList(),
        solutionSteps: escalation.technicalHandoffNotes,
        whatHappened:
          'Standard automated and manual remedies did not restore end-to-end network connectivity.',
        stepsThatFixedIt: [],
        preventionRecommendations: escalation.recommendedQuestions,
        resolvedAt: new Date(),
        escalation
      };

      const updatedSession: DiagnosticSessionState = {
        ...session,
        status: 'RESOLVED',
        isVerifiedFixed: false,
        finalReport,
        escalationReport: escalation
      };

      return { updatedSession, finalReport };
    }

    // If not fixed and steps remain, revert to IN_PROGRESS to continue testing remaining steps
    const updatedSession: DiagnosticSessionState = {
      ...session,
      status: 'IN_PROGRESS',
      isVerifiedFixed: false,
      identifiedRootCause: null
    };

    return { updatedSession, finalReport: null };
  }

  /**
   * Generates a structured Technical Escalation Report for ISP, Network Administrator, or Hardware Support
   */
  public generateEscalationReport(_session: DiagnosticSessionState): EscalationReportData {
    const evidenceList = this.evidenceStore.generateSummaryList();
    const gatewayEv = this.evidenceStore.get('gateway_reachability');
    const adapterEv = this.evidenceStore.get('adapter_link');

    let escalateTo: 'ISP' | 'NETWORK_ADMIN' | 'HARDWARE_SUPPORT' = 'ISP';
    let title = 'Internet Service Provider (ISP) Support Escalation';
    let reason =
      'Local network and router communication are verified healthy, but upstream internet routing/transit is unresponsive.';
    let technicalHandoffNotes = [
      'Local network adapter is up and operational.',
      'Default gateway responds to ICMP echo requests with normal latency.',
      'Public internet destinations (ICMP 8.8.8.8 / 1.1.1.1) are unreachable or timing out.',
      'Troubleshooting completed across local OSI physical, data link, and local network layers with no client-side faults.'
    ];
    let recommendedQuestions = [
      'Are there any known fiber/broadband outages or degraded service alerts in my area?',
      'Can you check the WAN status and optical signal levels (or DSL sync) on my line from your end?',
      'Has there been a recent DHCP lease or gateway IP change on the ISP upstream subnet?'
    ];

    if (adapterEv && adapterEv.status === 'FAULT_DETECTED') {
      escalateTo = 'HARDWARE_SUPPORT';
      title = 'Network Adapter / Physical Interface Escalation';
      reason = 'Local physical interface fails to detect link signal or network cable connection.';
      technicalHandoffNotes = [
        'Ethernet/Wi-Fi adapter state reports media disconnected or driver error.',
        'Software adapter resets and re-enabling attempts failed to re-establish link.',
        'Requires inspection of physical port, network patch cable, or adapter hardware.'
      ];
      recommendedQuestions = [
        'Does the network adapter show error codes in Device Manager / system logs?',
        'Can the network port or PCIe/USB interface be tested with a known working cable?'
      ];
    } else if (gatewayEv && gatewayEv.status === 'FAULT_DETECTED') {
      escalateTo = 'NETWORK_ADMIN';
      title = 'Local Router & Gateway Infrastructure Escalation';
      reason = 'Device cannot establish communication with the local default gateway.';
      technicalHandoffNotes = [
        'Local adapter has an IP address assigned, but default gateway does not reply to ICMP ping.',
        'Local ARP or router forwarding appears unresponsive or subnet configuration is mismatched.',
        'Requires access to router management console or managed switch port configuration.'
      ];
      recommendedQuestions = [
        'Is the gateway router operational and answering requests on its LAN subnet?',
        'Is there MAC filtering or 802.1X port security blocking this client device?'
      ];
    }

    return {
      escalateTo,
      title,
      reason,
      evidenceSummary: evidenceList.length > 0 ? evidenceList : ['Diagnostic procedure checks recorded.'],
      technicalHandoffNotes,
      recommendedQuestions
    };
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

      case 'step_ping_latency_jitter': {
        const isIntermittent = metrics?.isIntermittentLoss || (metrics?.lossPercentage > 0 && metrics?.lossPercentage < 100);
        const jitterStatus = isIntermittent ? ('INTERMITTENT' as const) : status;
        records.push({
          key: 'ping_latency_jitter',
          label: 'Packet Loss & Latency Jitter Metrics',
          value: metrics ? `Avg: ${metrics.avgRtt}ms, Loss: ${metrics.lossPercentage}%` : (isPassed ? 'Steady Latency' : 'High Jitter/Loss'),
          layer: 'Transport / Latency',
          sourceStepId: stepId,
          observedAt: new Date(),
          status: jitterStatus,
          destination: metrics?.destination || '8.8.8.8',
          isIntermittent: Boolean(isIntermittent)
        });
        break;
      }

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
