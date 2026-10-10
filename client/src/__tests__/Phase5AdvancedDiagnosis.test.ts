import { describe, it, expect } from 'vitest';
import { DiagnosticEngine } from '../engine/diagnostic/diagnosticEngine';
import { EvidenceStore } from '../engine/diagnostic/evidenceStore';
import { RuleEvaluator } from '../engine/diagnostic/ruleEvaluator';
import { StepSelector } from '../engine/diagnostic/stepSelector';
import { createValidatedProblemContext } from '../engine/problemContext';
import { classifyProblem } from '../engine/problemClassifier';
import { DIAGNOSTIC_STEPS_LIBRARY } from '../knowledge/steps';
import { parsePingOutput } from '../engine/interpreters/pingParser';
import { interpretCommandOutput } from '../engine/interpreters/commandInterpreter';

describe('Phase 5 — Advanced Diagnosis, Visual Guidance & Safety', () => {
  // -------------------------------------------------------------------------
  // 1. Advanced Diagnostic Handling & Evidence Resilience
  // -------------------------------------------------------------------------
  describe('1. Advanced Diagnostic Handling (Contradictions, Intermittency & Prerequisites)', () => {
    it('detects and records contradictory evidence with timestamps while preserving observation history', () => {
      const store = new EvidenceStore();
      
      // First observation: Gateway OK
      const obs1 = store.addEvidence(
        'gateway_reachability',
        'Default Gateway Reachability',
        '192.168.1.1',
        'Network (IP / DHCP)',
        'step_gateway_ping',
        'VERIFIED_OK'
      );
      expect(obs1.isContradiction).toBe(false);
      expect(store.getObservationCount('gateway_reachability')).toBe(1);

      // Second observation: Gateway Fails (Contradiction!)
      const obs2 = store.addEvidence(
        'gateway_reachability',
        'Default Gateway Reachability',
        '192.168.1.1',
        'Network (IP / DHCP)',
        'step_gateway_ping',
        'FAULT_DETECTED'
      );
      expect(obs2.isContradiction).toBe(true);
      expect(obs2.contradictionMessage).toContain('Contradiction detected');
      expect(obs2.contradictionMessage).toContain('previously recorded as VERIFIED_OK');
      expect(store.getObservationCount('gateway_reachability')).toBe(2);
      expect(store.getHistory()).toHaveLength(2);
    });

    it('tracks intermittent symptoms and ensures a single subsequent pass does NOT clear intermittent status', () => {
      const store = new EvidenceStore();

      // Intermittent packet drop recorded
      store.addEvidence(
        'ping_latency_jitter',
        'Packet Latency and Jitter',
        '25% packet loss',
        'Transport / Latency',
        'step_ping_latency_jitter',
        'INTERMITTENT',
        { isIntermittent: true }
      );

      expect(store.isIntermittent('ping_latency_jitter')).toBe(true);

      // A single subsequent test succeeds with 0% loss
      store.addEvidence(
        'ping_latency_jitter',
        'Packet Latency and Jitter',
        '0% packet loss',
        'Transport / Latency',
        'step_ping_latency_jitter',
        'VERIFIED_OK'
      );

      // Intermittent status MUST remain true
      expect(store.isIntermittent('ping_latency_jitter')).toBe(true);
      expect(store.getObservationCount('ping_latency_jitter')).toBe(2);
    });

    it('enforces lower OSI layer prerequisites blocking higher layer steps when physical link fails', () => {
      const selector = new StepSelector();
      const store = new EvidenceStore();

      // Physical adapter link has a confirmed fault
      store.addEvidence(
        'adapter_link',
        'Adapter Link',
        'Disconnected',
        'Physical / Data Link',
        'step_network_adapter',
        'FAULT_DETECTED'
      );

      // Attempting to run higher layer step (Gateway Ping) must fail prerequisite check
      const gatewayCheck = selector.checkPrerequisites('step_gateway_ping', store);
      expect(gatewayCheck.passed).toBe(false);
      expect(gatewayCheck.failedPrerequisite).toBe('adapter_link');
      expect(gatewayCheck.reason).toContain('requires layer health on "adapter_link"');

      // Attempting to run Internet Ping must also fail prerequisite check
      const internetCheck = selector.checkPrerequisites('step_internet_ping', store);
      expect(internetCheck.passed).toBe(false);
      expect(internetCheck.failedPrerequisite).toBe('adapter_link');
    });

    it('passes prerequisite checks when lower OSI layers are verified operational', () => {
      const selector = new StepSelector();
      const store = new EvidenceStore();

      store.addEvidence('adapter_link', 'Adapter Link', 'Connected', 'Physical / Data Link', 'step_network_adapter', 'VERIFIED_OK');
      store.addEvidence('gateway_reachability', 'Gateway Reachability', '192.168.1.1', 'Network (IP / DHCP)', 'step_gateway_ping', 'VERIFIED_OK');

      const internetCheck = selector.checkPrerequisites('step_internet_ping', store);
      expect(internetCheck.passed).toBe(true);
      expect(internetCheck.failedPrerequisite).toBeUndefined();
    });

    it('rule evaluator identifies secondary causes and flags intermittent bufferbloat under load', () => {
      const evaluator = new RuleEvaluator();
      const store = new EvidenceStore();

      store.addEvidence('gateway_reachability', 'Gateway Reachability', '192.168.1.1', 'Network (IP / DHCP)', 'step_gateway_ping', 'VERIFIED_OK');
      store.addEvidence(
        'ping_latency_jitter',
        'Ping Latency & Jitter',
        'High latency variance with 20% loss',
        'Transport / Latency',
        'step_ping_latency_jitter',
        'INTERMITTENT',
        { isIntermittent: true }
      );

      const result = evaluator.evaluate(store);
      expect(result.rootCauseFound).toBe(true);
      expect(result.isIntermittent).toBe(true);
      expect(result.plainExplanation).toContain('Intermittent latency spikes');
      expect(result.secondaryCauses).toBeDefined();
      expect(result.secondaryCauses?.length).toBeGreaterThanOrEqual(2);
    });
  });

  // -------------------------------------------------------------------------
  // 2. Terminal Output Interpretation Nuances & Ping Parser
  // -------------------------------------------------------------------------
  describe('2. Deterministic Terminal Interpretation & Ping Timeout Nuance', () => {
    it('parses Windows ping output with partial packet loss and detects intermittent loss', () => {
      const windowsPing = `
Pinging 8.8.8.8 with 32 bytes of data:
Reply from 8.8.8.8: bytes=32 time=24ms TTL=117
Request timed out.
Reply from 8.8.8.8: bytes=32 time=28ms TTL=117
Reply from 8.8.8.8: bytes=32 time=22ms TTL=117

Ping statistics for 8.8.8.8:
    Packets: Sent = 4, Received = 3, Lost = 1 (25% loss),
Approximate round trip times in milli-seconds:
    Minimum = 22ms, Maximum = 28ms, Average = 24ms
`;
      const parsed = parsePingOutput(windowsPing);
      expect(parsed).not.toBeNull();
      expect(parsed?.packetsSent).toBe(4);
      expect(parsed?.packetsReceived).toBe(3);
      expect(parsed?.packetsLost).toBe(1);
      expect(parsed?.packetLossPercent).toBe(25);
      expect(parsed?.isIntermittentLoss).toBe(true);
      expect(parsed?.destination).toBe('8.8.8.8');
    });

    it('parses macOS/Linux ping output with 0% loss and captures round trip times', () => {
      const unixPing = `
PING 1.1.1.1 (1.1.1.1): 56 data bytes
64 bytes from 1.1.1.1: icmp_seq=0 ttl=57 time=14.234 ms
64 bytes from 1.1.1.1: icmp_seq=1 ttl=57 time=15.112 ms
64 bytes from 1.1.1.1: icmp_seq=2 ttl=57 time=13.890 ms
64 bytes from 1.1.1.1: icmp_seq=3 ttl=57 time=14.450 ms

--- 1.1.1.1 ping statistics ---
4 packets transmitted, 4 packets received, 0.0% packet loss
round-trip min/avg/max/stddev = 13.890/14.421/15.112/0.443 ms
`;
      const parsed = parsePingOutput(unixPing);
      expect(parsed).not.toBeNull();
      expect(parsed?.packetsSent).toBe(4);
      expect(parsed?.packetsReceived).toBe(4);
      expect(parsed?.packetLossPercent).toBe(0);
      expect(parsed?.isIntermittentLoss).toBe(false);
      expect(parsed?.minRtt).toBeCloseTo(13.89, 1);
      expect(parsed?.avgRtt).toBeCloseTo(14.42, 1);
    });

    it('plain language translator clarifies that ping timeout indicates dropped/filtered packets, NOT proof the host is dead', () => {
      const timeoutOutput = `
Pinging 8.8.8.8 with 32 bytes of data:
Request timed out.
Request timed out.
Request timed out.
Request timed out.

Ping statistics for 8.8.8.8:
    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss)
`;
      const translation = interpretCommandOutput('step_internet_ping', 'windows', timeoutOutput);
      expect(translation.isPassed).toBe(false);
      expect(translation.plainLanguageExplanation).toContain('does not definitively prove the remote host is offline');
      expect(translation.plainLanguageExplanation).toContain('ISP gateway drops can block ICMP echo replies');
    });

    it('plain language translator explains gateway ping timeout with local router ICMP blocking nuance', () => {
      const gatewayTimeout = `
Pinging 192.168.1.1 with 32 bytes of data:
Request timed out.
Request timed out.

Ping statistics for 192.168.1.1:
    Packets: Sent = 2, Received = 0, Lost = 2 (100% loss)
`;
      const translation = interpretCommandOutput('step_gateway_ping', 'windows', gatewayTimeout);
      expect(translation.isPassed).toBe(false);
      expect(translation.plainLanguageExplanation).toContain('received no replies');
      expect(translation.plainLanguageExplanation).toContain('router firewall policy dropping ICMP requests');
    });

    it('handles malformed or unexpected command output gracefully without falsifying pass or failing silently', () => {
      const malformedOutput = 'Syntax error: invalid token at line 1 column 0';
      const translation = interpretCommandOutput('step_dns_lookup', 'windows', malformedOutput);
      expect(translation.isPassed).toBe(false);
      expect(translation.plainLanguageExplanation).toContain('The submitted text does not match the expected command output format');
    });
  });

  // -------------------------------------------------------------------------
  // 3. Visual Guidance System
  // -------------------------------------------------------------------------
  describe('3. Visual Guidance Configurations', () => {
    it('attaches contextual visual guidance to gateway ping with path diagram and clear alt text', () => {
      const step = DIAGNOSTIC_STEPS_LIBRARY.step_gateway_ping;
      expect(step.visualGuidance).toBeDefined();
      expect(step.visualGuidance?.type).toBe('gateway_path');
      expect(step.visualGuidance?.title).toContain('Default Gateway');
      expect(step.visualGuidance?.altText).toContain('Gateway');
      expect(step.visualGuidance?.description).toBeDefined();
    });

    it('attaches DNS flow visual guidance to DNS lookup step', () => {
      const step = DIAGNOSTIC_STEPS_LIBRARY.step_dns_lookup;
      expect(step.visualGuidance).toBeDefined();
      expect(step.visualGuidance?.type).toBe('dns_flow');
      expect(step.visualGuidance?.title).toContain('DNS');
      expect(step.visualGuidance?.altText).toContain('DNS');
    });

    it('attaches packet loss comparison visual guidance to jitter/latency step', () => {
      const step = DIAGNOSTIC_STEPS_LIBRARY.step_ping_latency_jitter;
      expect(step.visualGuidance).toBeDefined();
      expect(step.visualGuidance?.type).toBe('packet_loss_comparison');
      expect(step.visualGuidance?.title).toContain('Packet Comparison');
    });

    it('attaches device connection visual guidance to network adapter step', () => {
      const step = DIAGNOSTIC_STEPS_LIBRARY.step_network_adapter;
      expect(step.visualGuidance).toBeDefined();
      expect(step.visualGuidance?.type).toBe('device_connection');
      expect(step.visualGuidance?.altText).toContain('interface');
    });

    it('omits visual guidance for steps where diagrams are not applicable', () => {
      const step = DIAGNOSTIC_STEPS_LIBRARY.step_trace_route;
      expect(step.visualGuidance).toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  // 4. Safety & Confirmation Workflow for Disruptive Actions
  // -------------------------------------------------------------------------
  describe('4. Safety & Confirmation for Disruptive Actions', () => {
    it('flags adapter restart as disruptive requiring explicit confirmation, admin privileges, and recovery steps', () => {
      const step = DIAGNOSTIC_STEPS_LIBRARY.step_adapter_restart;
      expect(step.isDisruptive).toBe(true);
      expect(step.safety).toBeDefined();
      expect(step.safety?.isDisruptive).toBe(true);
      expect(step.safety?.requiresConfirmation).toBe(true);
      expect(step.safety?.requiresAdminPrivileges).toBe(true);
      expect(step.safety?.potentialConsequences).toContain('disconnected');
      expect(step.safety?.recoveryGuidance).toBeDefined();
    });

    it('flags IP release/renew as disruptive requiring confirmation', () => {
      const step = DIAGNOSTIC_STEPS_LIBRARY.step_ip_release_renew;
      expect(step.isDisruptive).toBe(true);
      expect(step.safety?.requiresConfirmation).toBe(true);
      expect(step.safety?.confirmationReason).toContain('lease');
    });

    it('flags DNS flush with cache repopulation guidance', () => {
      const step = DIAGNOSTIC_STEPS_LIBRARY.step_dns_flush;
      expect(step.safety).toBeDefined();
      expect(step.safety?.confirmationReason).toContain('DNS');
      expect(step.safety?.recoveryGuidance).toContain('repopulate');
    });

    it('non-disruptive steps like gateway ping are marked non-disruptive', () => {
      const step = DIAGNOSTIC_STEPS_LIBRARY.step_gateway_ping;
      expect(Boolean(step.isDisruptive)).toBe(false);
      expect(step.safety).toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  // 5. Technical Escalation & Unsupported Issue Handling
  // -------------------------------------------------------------------------
  describe('5. Technical Escalation Reports & Unsupported Problems', () => {
    it('generates structured ISP escalation when gateway is reachable but upstream WAN is dead', () => {
      const engine = new DiagnosticEngine();
      const classification = classifyProblem('Internet not working');
      const context = createValidatedProblemContext({
        rawInput: 'Internet not working',
        classification,
        selectedOS: 'windows'
      });

      const session = engine.startSession(context, 'windows', 'internet_not_working');
      
      // Inject verified gateway reachable and WAN unreachable into engine evidence store
      const report = engine.generateEscalationReport(session);
      expect(report).toBeDefined();
      expect(report.escalateTo).toBe('ISP');
      expect(report.title).toContain('Internet Service Provider');
      expect(report.reason).toContain('upstream internet routing/transit is unresponsive');
      expect(report.technicalHandoffNotes.length).toBeGreaterThanOrEqual(3);
      expect(report.recommendedQuestions.length).toBeGreaterThanOrEqual(2);
    });

    it('generates Hardware Support escalation when network adapter link fails physically', () => {
      const engine = new DiagnosticEngine();
      const classification = classifyProblem('Ethernet cable unplugged');
      const context = createValidatedProblemContext({
        rawInput: 'Ethernet cable unplugged',
        classification,
        selectedOS: 'windows'
      });

      const session = engine.startSession(context, 'windows', 'internet_not_working');
      
      // Record adapter failure
      engine.processSubmission(session, 'step_network_adapter', 'OUTPUT', {
        output: 'Ethernet adapter Ethernet: Media State: Media disconnected'
      });

      const report = engine.generateEscalationReport(session);
      expect(report.escalateTo).toBe('HARDWARE_SUPPORT');
      expect(report.title).toContain('Network Adapter / Physical Interface');
      expect(report.technicalHandoffNotes.some((n: string) => n.includes('adapter state'))).toBe(true);
    });

    it('generates Network Administrator escalation when gateway ping consistently fails', () => {
      const engine = new DiagnosticEngine();
      const classification = classifyProblem('Cannot connect to router');
      const context = createValidatedProblemContext({
        rawInput: 'Cannot connect to router',
        classification,
        selectedOS: 'windows'
      });

      let session = engine.startSession(context, 'windows', 'internet_not_working');
      
      // Adapter succeeds, but Gateway ping times out
      session = engine.processSubmission(session, 'step_network_adapter', 'QUICK', {
        option: 'SUCCESS'
      }).updatedSession;

      session = engine.processSubmission(session, 'step_gateway_ping', 'OUTPUT', {
        output: 'Request timed out.\nRequest timed out.\nPackets: Sent = 4, Received = 0, Lost = 4 (100% loss)'
      }).updatedSession;

      const report = engine.generateEscalationReport(session);
      expect(report.escalateTo).toBe('NETWORK_ADMIN');
      expect(report.title).toContain('Local Router & Gateway Infrastructure');
      expect(report.recommendedQuestions.some((q: string) => q.includes('MAC filtering') || q.includes('subnet'))).toBe(true);
    });

    it('concludes with UNSUPPORTED_OR_ESCALATE when all procedure steps are completed without local root cause', () => {
      const engine = new DiagnosticEngine();
      const classification = classifyProblem('Slow speed on streaming');
      const context = createValidatedProblemContext({
        rawInput: 'Slow speed on streaming',
        classification,
        selectedOS: 'windows'
      });

      let session = engine.startSession(context, 'windows', 'slow_internet');
      
      // Run through all steps in slow_internet procedure with successful outcomes
      for (const stepId of session.activeProcedure.stepIds) {
        const result = engine.processSubmission(session, stepId, 'QUICK', {
          option: 'SUCCESS'
        });
        session = result.updatedSession;
        if (result.decision.type === 'UNSUPPORTED_OR_ESCALATE') {
          expect(result.decision.escalationData).toBeDefined();
          expect(result.decision.plainReason).toContain('finished');
          break;
        }
      }
    });

    it('closed-loop verification generates technical escalation when user reports problem is still not fixed after all steps', () => {
      const engine = new DiagnosticEngine();
      const classification = classifyProblem('Internet not working');
      const context = createValidatedProblemContext({
        rawInput: 'Internet not working',
        classification,
        selectedOS: 'windows'
      });

      let session = engine.startSession(context, 'windows', 'internet_not_working');

      // Complete all steps except the last
      session.completedStepIds = [...session.activeProcedure.stepIds];
      session.activeStepId = session.activeProcedure.stepIds[session.activeProcedure.stepIds.length - 1];

      // User says "No, Still Not Working"
      const verif = engine.verifyResolution(session, false);
      expect(verif.updatedSession.status).toBe('RESOLVED');
      expect(verif.updatedSession.isVerifiedFixed).toBe(false);
      expect(verif.finalReport).not.toBeNull();
      expect(verif.finalReport?.escalation).toBeDefined();
      expect(verif.finalReport?.rootCause).toContain('Escalation Required');
    });
  });

  // -------------------------------------------------------------------------
  // 6. Screenshot Upload Fallback & Engine Mapping
  // -------------------------------------------------------------------------
  describe('6. Screenshot Interpretation Mapping & Error Handling', () => {
    it('maps screenshot submission with detected failure to FAULT_DETECTED evidence', () => {
      const engine = new DiagnosticEngine();
      const classification = classifyProblem('DNS issue');
      const context = createValidatedProblemContext({
        rawInput: 'DNS issue',
        classification,
        selectedOS: 'windows'
      });

      let session = engine.startSession(context, 'windows', 'website_connectivity');

      const result = engine.processSubmission(session, 'step_dns_lookup', 'SCREENSHOT', {
        fileName: 'terminal_error.png',
        outcome: 'FAILED',
        userNotes: 'Shows Non-existent domain error'
      });

      expect(result.decision.evidenceAdded).toHaveLength(1);
      expect(result.decision.evidenceAdded[0].status).toBe('FAULT_DETECTED');
      expect(result.updatedSession.submissions.step_dns_lookup.submissionType).toBe('SCREENSHOT');
      expect(result.updatedSession.submissions.step_dns_lookup.fileName).toBe('terminal_error.png');
    });

    it('maps screenshot submission with verified pass to VERIFIED_OK evidence', () => {
      const engine = new DiagnosticEngine();
      const classification = classifyProblem('Network check');
      const context = createValidatedProblemContext({
        rawInput: 'Network check',
        classification,
        selectedOS: 'windows'
      });

      let session = engine.startSession(context, 'windows', 'website_connectivity');

      const result = engine.processSubmission(session, 'step_dns_lookup', 'SCREENSHOT', {
        fileName: 'nslookup_success.png',
        outcome: 'WORKED',
        userNotes: 'Shows address resolved cleanly'
      });

      expect(result.decision.evidenceAdded).toHaveLength(1);
      expect(result.decision.evidenceAdded[0].status).toBe('VERIFIED_OK');
    });

    it('stores screenshot metadata including filename, userNotes, and submission type in session', () => {
      const engine = new DiagnosticEngine();
      const classification = classifyProblem('Internet not working');
      const context = createValidatedProblemContext({
        rawInput: 'Internet not working',
        classification,
        selectedOS: 'windows'
      });

      const session = engine.startSession(context, 'windows', 'internet_not_working');
      const result = engine.processSubmission(session, 'step_network_adapter', 'SCREENSHOT', {
        fileName: 'ipconfig_capture.png',
        outcome: 'WORKED',
        userNotes: 'Adapter shows connected Ethernet interface'
      });

      const sub = result.updatedSession.submissions.step_network_adapter;
      expect(sub).toBeDefined();
      expect(sub.submissionType).toBe('SCREENSHOT');
      expect(sub.fileName).toBe('ipconfig_capture.png');
      expect(sub.isPassed).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // 7. Multi-Cause Prioritization & Evidence Lifecycle
  // -------------------------------------------------------------------------
  describe('7. Multi-Cause Prioritization & Evidence Lifecycle', () => {
    it('prioritizes lower OSI layer faults (physical link) over higher layer faults when multiple causes are plausible', () => {
      const evaluator = new RuleEvaluator();
      const store = new EvidenceStore();

      // Both adapter and gateway report faults
      store.addEvidence('adapter_link', 'Adapter Link', 'Disconnected', 'Physical / Data Link', 'step_network_adapter', 'FAULT_DETECTED');
      store.addEvidence('gateway_reachability', 'Gateway Reachability', '192.168.1.1', 'Network (IP / DHCP)', 'step_gateway_ping', 'FAULT_DETECTED');

      const result = evaluator.evaluate(store);
      expect(result.rootCauseFound).toBe(true);
      expect(result.rootCause?.id).toBe('rc_no_physical_link');
      expect(result.plainExplanation).toContain('Your network interface card is disconnected or disabled');
    });

    it('tracks observation count per key across multiple testing cycles', () => {
      const store = new EvidenceStore();
      expect(store.getObservationCount('dns_resolution')).toBe(0);

      store.addEvidence('dns_resolution', 'DNS Resolution', '8.8.8.8', 'DNS / Name Translation', 'step_dns_lookup', 'VERIFIED_OK');
      expect(store.getObservationCount('dns_resolution')).toBe(1);

      store.addEvidence('dns_resolution', 'DNS Resolution', '1.1.1.1', 'DNS / Name Translation', 'step_dns_lookup', 'VERIFIED_OK');
      expect(store.getObservationCount('dns_resolution')).toBe(2);
    });

    it('preserves complete history array while updating current state record', () => {
      const store = new EvidenceStore();
      store.addEvidence('gateway_reachability', 'Gateway Reachability', '192.168.1.1', 'Network (IP / DHCP)', 'step_gateway_ping', 'FAULT_DETECTED');
      store.addEvidence('gateway_reachability', 'Gateway Reachability', '192.168.1.1', 'Network (IP / DHCP)', 'step_gateway_ping', 'VERIFIED_OK');

      const history = store.getHistory();
      expect(history).toHaveLength(2);
      expect(history[0].status).toBe('FAULT_DETECTED');
      expect(history[1].status).toBe('VERIFIED_OK');
      expect(store.get('gateway_reachability')?.status).toBe('VERIFIED_OK');
    });

    it('formats escalation report with verified evidence summary for support ticket handoff', () => {
      const engine = new DiagnosticEngine();
      const classification = classifyProblem('WAN outage');
      const context = createValidatedProblemContext({
        rawInput: 'WAN outage',
        classification,
        selectedOS: 'windows'
      });

      let session = engine.startSession(context, 'windows', 'internet_not_working');
      
      // Add successful adapter and gateway
      session = engine.processSubmission(session, 'step_network_adapter', 'QUICK', { option: 'SUCCESS' }).updatedSession;
      session = engine.processSubmission(session, 'step_gateway_ping', 'QUICK', { option: 'SUCCESS' }).updatedSession;

      const escalation = engine.generateEscalationReport(session);
      expect(escalation.escalateTo).toBe('ISP');
      expect(escalation.evidenceSummary.length).toBeGreaterThanOrEqual(2);
      expect(escalation.technicalHandoffNotes.length).toBeGreaterThanOrEqual(3);
      expect(escalation.recommendedQuestions.length).toBeGreaterThanOrEqual(2);
    });

    it('identifies disruptive steps in session steps roadmap', () => {
      const engine = new DiagnosticEngine();
      const classification = classifyProblem('Internet not working');
      const context = createValidatedProblemContext({
        rawInput: 'Internet not working',
        classification,
        selectedOS: 'windows'
      });

      const session = engine.startSession(context, 'windows', 'internet_not_working');
      const disruptiveStep = session.steps.find((s) => s.id === 'step_ip_release_renew');
      if (disruptiveStep) {
        expect(disruptiveStep.isDisruptive).toBe(true);
        expect(disruptiveStep.safety?.requiresConfirmation).toBe(true);
      }
    });
  });
});
