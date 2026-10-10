import { describe, it, expect } from 'vitest';
import { DiagnosticEngine } from '../engine/diagnostic/diagnosticEngine';
import { EvidenceStore } from '../engine/diagnostic/evidenceStore';
import { RuleEvaluator } from '../engine/diagnostic/ruleEvaluator';
import { StepSelector } from '../engine/diagnostic/stepSelector';
import { createValidatedProblemContext } from '../engine/problemContext';
import { classifyProblem } from '../engine/problemClassifier';

describe('Phase 4 — Interactive Diagnostic Engine', () => {
  describe('1. Evidence Store & Contradiction Detection', () => {
    it('records structured facts and maintains evidence history', () => {
      const store = new EvidenceStore();
      const res = store.addEvidence(
        'gateway_reachability',
        'Default Gateway Reachability',
        '192.168.1.1',
        'Network (IP / DHCP)',
        'step_gateway_ping',
        'VERIFIED_OK'
      );

      expect(res.isContradiction).toBe(false);
      expect(store.isOk('gateway_reachability')).toBe(true);
      expect(store.isFault('gateway_reachability')).toBe(false);
      expect(store.get('gateway_reachability')?.value).toBe('192.168.1.1');
    });

    it('detects and flags contradictory results on the same fact', () => {
      const store = new EvidenceStore();
      store.addEvidence(
        'gateway_reachability',
        'Default Gateway Reachability',
        '192.168.1.1',
        'Network (IP / DHCP)',
        'step_gateway_ping',
        'FAULT_DETECTED'
      );

      // Later test reports gateway is now reachable
      const res = store.addEvidence(
        'gateway_reachability',
        'Default Gateway Reachability',
        '192.168.1.1',
        'Network (IP / DHCP)',
        'step_gateway_ping',
        'VERIFIED_OK'
      );

      expect(res.isContradiction).toBe(true);
      expect(res.contradictionMessage).toContain('Contradiction detected');
      expect(store.isOk('gateway_reachability')).toBe(true);
    });

    it('generates a human-readable summary list of verified facts', () => {
      const store = new EvidenceStore();
      store.addEvidence('adapter_link', 'Adapter Link', 'Connected', 'Physical / Data Link', 'step_network_adapter', 'VERIFIED_OK');
      store.addEvidence('dns_resolution', 'DNS Resolution', 'Failed', 'DNS / Name Translation', 'step_dns_lookup', 'FAULT_DETECTED');

      const summary = store.generateSummaryList();
      expect(summary).toHaveLength(2);
      expect(summary[0]).toContain('Verified normal: Adapter Link');
      expect(summary[1]).toContain('Fault identified: DNS Resolution');
    });
  });

  describe('2. Rule Evaluator (Deterministic Root Cause Deduction)', () => {
    const evaluator = new RuleEvaluator();

    it('deduces Physical Disconnect root cause when adapter link fails', () => {
      const store = new EvidenceStore();
      store.addEvidence('adapter_link', 'Adapter Link', 'Disconnected', 'Physical / Data Link', 'step_network_adapter', 'FAULT_DETECTED');

      const result = evaluator.evaluate(store);
      expect(result.rootCauseFound).toBe(true);
      expect(result.rootCause?.id).toBe('rc_no_physical_link');
    });

    it('deduces Gateway Unreachable when IP is valid but gateway ping fails', () => {
      const store = new EvidenceStore();
      store.addEvidence('ip_assignment', 'IP Valid', '192.168.1.45', 'Network (IP / DHCP)', 'step_ip_dhcp', 'VERIFIED_OK');
      store.addEvidence('gateway_reachability', 'Gateway Reachability', '100% loss', 'Network (IP / DHCP)', 'step_gateway_ping', 'FAULT_DETECTED');

      const result = evaluator.evaluate(store);
      expect(result.rootCauseFound).toBe(true);
      expect(result.rootCause?.id).toBe('rc_gateway_unreachable');
    });

    it('deduces ISP WAN Outage when gateway succeeds but WAN IP ping fails', () => {
      const store = new EvidenceStore();
      store.addEvidence('gateway_reachability', 'Gateway Reachability', '0% loss', 'Network (IP / DHCP)', 'step_gateway_ping', 'VERIFIED_OK');
      store.addEvidence('wan_reachability', 'WAN Reachability', '100% loss', 'Transport / Latency', 'step_internet_ping', 'FAULT_DETECTED');

      const result = evaluator.evaluate(store);
      expect(result.rootCauseFound).toBe(true);
      expect(result.rootCause?.id).toBe('rc_isp_wan_outage');
    });

    it('deduces DNS Server Failure when WAN ping succeeds but DNS lookup fails', () => {
      const store = new EvidenceStore();
      store.addEvidence('gateway_reachability', 'Gateway Reachability', '0% loss', 'Network (IP / DHCP)', 'step_gateway_ping', 'VERIFIED_OK');
      store.addEvidence('wan_reachability', 'WAN Reachability', '0% loss', 'Transport / Latency', 'step_internet_ping', 'VERIFIED_OK');
      store.addEvidence('dns_resolution', 'DNS Resolution', 'Timeout', 'DNS / Name Translation', 'step_dns_lookup', 'FAULT_DETECTED');

      const result = evaluator.evaluate(store);
      expect(result.rootCauseFound).toBe(true);
      expect(result.rootCause?.id).toBe('rc_dns_server_failure');
    });
  });

  describe('3. Step Selector (Adaptive Navigation & Branching)', () => {
    const selector = new StepSelector();

    it('selects sequential unexecuted steps adhering to procedure order', () => {
      const baseline = ['step_network_adapter', 'step_ip_dhcp', 'step_gateway_ping'];
      const store = new EvidenceStore();
      const roadmap = [
        { id: 'step_network_adapter', stepNumber: 1, title: 'Check Adapter', status: 'CURRENT' as const },
        { id: 'step_ip_dhcp', stepNumber: 2, title: 'Check IP', status: 'PENDING' as const },
        { id: 'step_gateway_ping', stepNumber: 3, title: 'Ping Gateway', status: 'PENDING' as const }
      ];

      const res = selector.selectNextStep(
        baseline,
        'step_network_adapter',
        ['step_network_adapter'],
        [],
        [],
        store,
        roadmap
      );

      expect(res.nextStepId).toBe('step_ip_dhcp');
      expect(res.isTerminal).toBe(false);
    });

    it('adaptively branches to DHCP release/renew when IP check fails with APIPA', () => {
      const baseline = ['step_network_adapter', 'step_ip_dhcp', 'step_gateway_ping'];
      const store = new EvidenceStore();
      store.addEvidence('ip_assignment', 'IP Assignment', '169.254.1.1', 'Network (IP / DHCP)', 'step_ip_dhcp', 'FAULT_DETECTED');

      const roadmap = [
        { id: 'step_network_adapter', stepNumber: 1, title: 'Check Adapter', status: 'COMPLETED' as const },
        { id: 'step_ip_dhcp', stepNumber: 2, title: 'Check IP', status: 'CURRENT' as const },
        { id: 'step_gateway_ping', stepNumber: 3, title: 'Ping Gateway', status: 'PENDING' as const }
      ];

      const res = selector.selectNextStep(
        baseline,
        'step_ip_dhcp',
        ['step_network_adapter'],
        [],
        ['step_ip_dhcp'],
        store,
        roadmap
      );

      expect(res.nextStepId).toBe('step_ip_release_renew');
      expect(res.reason).toContain('APIPA address detected');
    });

    it('does NOT repeat already executed steps', () => {
      const baseline = ['step_network_adapter', 'step_ip_dhcp', 'step_gateway_ping'];
      const store = new EvidenceStore();
      const roadmap = [
        { id: 'step_network_adapter', stepNumber: 1, title: 'Check Adapter', status: 'COMPLETED' as const },
        { id: 'step_ip_dhcp', stepNumber: 2, title: 'Check IP', status: 'COMPLETED' as const },
        { id: 'step_gateway_ping', stepNumber: 3, title: 'Ping Gateway', status: 'CURRENT' as const }
      ];

      const res = selector.selectNextStep(
        baseline,
        'step_gateway_ping',
        ['step_network_adapter', 'step_ip_dhcp', 'step_gateway_ping'],
        [],
        [],
        store,
        roadmap
      );

      expect(res.isTerminal).toBe(true);
      expect(res.nextStepId).toBeNull();
    });
  });

  describe('4. Master Diagnostic Engine Lifecycle & Adaptive Scenarios', () => {
    it('initializes session with correct OS and loads Phase 3 procedure', () => {
      const engine = new DiagnosticEngine();
      const classification = classifyProblem('My wifi is not working');
      const context = createValidatedProblemContext({
        rawInput: 'My wifi is not working',
        classification,
        selectedOS: 'windows'
      });

      const session = engine.startSession(context, 'windows', 'wifi_connection');

      expect(session.categoryKey).toBe('wifi_connection');
      expect(session.selectedOS).toBe('windows');
      expect(session.steps.length).toBeGreaterThanOrEqual(3);
      expect(session.status).toBe('IN_PROGRESS');
      expect(session.roadmap[0].status).toBe('CURRENT');
      expect(session.roadmap[1].status).toBe('PENDING');
    });

    it('Scenario A — DNS Resolution Failure Flow', () => {
      const engine = new DiagnosticEngine();
      const classification = classifyProblem('Websites are not loading');
      const context = createValidatedProblemContext({
        rawInput: 'Websites are not loading',
        classification,
        selectedOS: 'windows'
      });

      let session = engine.startSession(context, 'windows', 'website_connectivity');

      // Step 1: Network Adapter Check -> OK
      let result = engine.processSubmission(session, 'step_network_adapter', 'QUICK', { option: 'SUCCESS' });
      session = result.updatedSession;
      expect(result.decision.type).toBe('NEXT_STEP');

      // Step 2: IP Config -> OK
      result = engine.processSubmission(session, 'step_ip_dhcp', 'OUTPUT', {
        output: 'IPv4 Address. . . . . . . . . . . : 192.168.1.50\nSubnet Mask . . . . . . . . . . . : 255.255.255.0\nDefault Gateway . . . . . . . . . : 192.168.1.1'
      });
      session = result.updatedSession;
      expect(session.completedStepIds).toContain('step_ip_dhcp');

      // Step 3: HTTP Reachability -> FAILS
      result = engine.processSubmission(session, 'step_http_reachability', 'QUICK', { option: 'FAILURE' });
      session = result.updatedSession;

      // Step 4: DNS Lookup -> FAILS (DNS server timeout)
      result = engine.processSubmission(session, 'step_dns_lookup', 'OUTPUT', {
        output: 'DNS request timed out.\ntimeout was 2 seconds.\n*** Can\'t find google.com: No response from server'
      });
      session = result.updatedSession;

      // Step 5: Direct Internet WAN Ping (8.8.8.8) -> SUCCEEDS (0% loss)
      result = engine.processSubmission(session, 'step_internet_ping', 'OUTPUT', {
        output: 'Pinging 8.8.8.8 with 32 bytes of data:\nReply from 8.8.8.8: bytes=32 time=14ms TTL=117\nReply from 8.8.8.8: bytes=32 time=14ms TTL=117\nPackets: Sent = 4, Received = 4, Lost = 0 (0% loss)'
      });
      session = result.updatedSession;

      // Deterministic Decision: DNS Server Failure identified!
      expect(result.decision.type).toBe('ROOT_CAUSE_FOUND');
      expect(result.decision.rootCause?.id).toBe('rc_dns_server_failure');
      expect(session.status).toBe('AWAITING_VERIFICATION');

      // Verification Flow: User clicks "Yes, Problem Fixed"
      const verifResult = engine.verifyResolution(session, true);
      expect(verifResult.updatedSession.status).toBe('RESOLVED');
      expect(verifResult.finalReport).toBeDefined();
      expect(verifResult.finalReport?.rootCause).toContain('DNS');
      expect(verifResult.finalReport?.evidenceSummary.length).toBeGreaterThanOrEqual(3);
    });

    it('Scenario B — Local Gateway Failure Flow', () => {
      const engine = new DiagnosticEngine();
      const classification = classifyProblem('Cannot connect to router');
      const context = createValidatedProblemContext({
        rawInput: 'Cannot connect to router',
        classification,
        selectedOS: 'linux'
      });

      let session = engine.startSession(context, 'linux', 'router_connectivity');

      // Step 1: Adapter -> Pass
      let result = engine.processSubmission(session, 'step_network_adapter', 'QUICK', { option: 'SUCCESS' });
      session = result.updatedSession;

      // Step 2: IP -> Pass
      result = engine.processSubmission(session, 'step_ip_dhcp', 'QUICK', { option: 'SUCCESS' });
      session = result.updatedSession;

      // Step 3: Gateway Ping -> FAILS (100% loss)
      result = engine.processSubmission(session, 'step_gateway_ping', 'OUTPUT', {
        output: 'PING 192.168.1.1 (192.168.1.1) 56(84) bytes of data.\nFrom 192.168.1.45 icmp_seq=1 Destination Host Unreachable\n4 packets transmitted, 0 received, 100% packet loss'
      });
      session = result.updatedSession;

      expect(result.decision.type).toBe('ROOT_CAUSE_FOUND');
      expect(result.decision.rootCause?.id).toBe('rc_gateway_unreachable');
      expect(session.status).toBe('AWAITING_VERIFICATION');
    });

    it('Scenario C — ISP WAN Outage Flow', () => {
      const engine = new DiagnosticEngine();
      const classification = classifyProblem('Internet is down');
      const context = createValidatedProblemContext({
        rawInput: 'Internet is down',
        classification,
        selectedOS: 'windows'
      });

      let session = engine.startSession(context, 'windows', 'internet_not_working');

      // Adapter OK -> IP OK -> Gateway OK
      engine.processSubmission(session, 'step_network_adapter', 'QUICK', { option: 'SUCCESS' });
      engine.processSubmission(session, 'step_ip_dhcp', 'QUICK', { option: 'SUCCESS' });
      let result = engine.processSubmission(session, 'step_gateway_ping', 'OUTPUT', {
        output: 'Reply from 192.168.1.1: bytes=32 time=1ms TTL=64\nPackets: Sent = 4, Received = 4, Lost = 0 (0% loss)'
      });
      session = result.updatedSession;

      // External WAN ping (8.8.8.8) -> FAILS (100% packet loss)
      result = engine.processSubmission(session, 'step_internet_ping', 'OUTPUT', {
        output: 'Request timed out.\nRequest timed out.\nPackets: Sent = 4, Received = 0, Lost = 4 (100% loss)'
      });
      session = result.updatedSession;

      expect(result.decision.type).toBe('ROOT_CAUSE_FOUND');
      expect(result.decision.rootCause?.id).toBe('rc_isp_wan_outage');
    });

    it('handles Skip Step without fabricating false pass evidence', () => {
      const engine = new DiagnosticEngine();
      const classification = classifyProblem('Slow internet');
      const context = createValidatedProblemContext({
        rawInput: 'Slow internet',
        classification,
        selectedOS: 'windows'
      });

      let session = engine.startSession(context, 'windows', 'slow_internet');
      const skipResult = engine.skipStep(session, 'step_network_adapter');
      session = skipResult.updatedSession;

      expect(session.skippedStepIds).toContain('step_network_adapter');
      expect(session.completedStepIds).not.toContain('step_network_adapter');
      expect(session.activeStepId).toBe('step_ping_latency_jitter');
    });

    it('handles Backtracking cleanly to revisit previous steps', () => {
      const engine = new DiagnosticEngine();
      const classification = classifyProblem('High ping in games');
      const context = createValidatedProblemContext({
        rawInput: 'High ping in games',
        classification,
        selectedOS: 'windows'
      });

      let session = engine.startSession(context, 'windows', 'high_latency');

      // Advance to step 2
      let result = engine.processSubmission(session, 'step_network_adapter', 'QUICK', { option: 'SUCCESS' });
      session = result.updatedSession;
      expect(session.currentStepIndex).toBe(1);

      // Backtrack to step 1
      session = engine.backtrack(session, 'step_network_adapter');
      expect(session.currentStepIndex).toBe(0);
      expect(session.activeStepId).toBe('step_network_adapter');
      expect(session.roadmap[0].status).toBe('CURRENT');
      expect(session.roadmap[1].status).not.toBe('CURRENT');
    });

    it('ensures only the active step has CURRENT status and previous visited steps do not remain highlighted/CURRENT', () => {
      const engine = new DiagnosticEngine();
      const classification = classifyProblem('wifi connection issues');
      const context = createValidatedProblemContext({
        rawInput: 'wifi connection issues',
        classification,
        selectedOS: 'windows'
      });

      let session = engine.startSession(context, 'windows', 'wifi_connection');
      expect(session.roadmap[0].status).toBe('CURRENT');
      expect(session.roadmap.filter((s) => s.status === 'CURRENT').length).toBe(1);

      // Navigate to step 2 without submission
      session = engine.backtrack(session, session.roadmap[1].id);
      expect(session.currentStepIndex).toBe(1);
      expect(session.roadmap[1].status).toBe('CURRENT');
      expect(session.roadmap[0].status).toBe('PENDING');
      expect(session.roadmap.filter((s) => s.status === 'CURRENT').length).toBe(1);

      // Navigate to step 3 without submission
      session = engine.backtrack(session, session.roadmap[2].id);
      expect(session.currentStepIndex).toBe(2);
      expect(session.roadmap[2].status).toBe('CURRENT');
      expect(session.roadmap[0].status).toBe('PENDING');
      expect(session.roadmap[1].status).toBe('PENDING');
      expect(session.roadmap.filter((s) => s.status === 'CURRENT').length).toBe(1);
    });

    it('Resolution Verification: "No, Still Not Working" continues diagnosis', () => {
      const engine = new DiagnosticEngine();
      const classification = classifyProblem('Wi-Fi keeps dropping');
      const context = createValidatedProblemContext({
        rawInput: 'Wi-Fi keeps dropping',
        classification,
        selectedOS: 'windows'
      });

      let session = engine.startSession(context, 'windows', 'wifi_connection');

      // Wi-Fi signal fails
      const result = engine.processSubmission(session, 'step_wifi_signal', 'OUTPUT', {
        output: '    State                  : connected\n    Signal                 : 32%'
      });
      session = result.updatedSession;
      expect(session.status).toBe('AWAITING_VERIFICATION');

      // User says "No"
      const verifResult = engine.verifyResolution(session, false);
      expect(verifResult.updatedSession.status).toBe('IN_PROGRESS');
      expect(verifResult.finalReport).toBeNull();
    });

    it('safely handles unrecognized non-command output without falsely declaring a root cause or redirecting', () => {
      const engine = new DiagnosticEngine();
      const classification = classifyProblem('Internet not working');
      const context = createValidatedProblemContext({
        rawInput: 'Internet not working',
        classification,
        selectedOS: 'windows'
      });

      let session = engine.startSession(context, 'windows', 'internet_not_working');

      // User types arbitrary non-command text "hello world"
      const result = engine.processSubmission(session, 'step_network_adapter', 'OUTPUT', {
        output: 'hello world'
      });

      // Must NOT declare root cause or transition to AWAITING_VERIFICATION / RESOLVED
      expect(result.decision.type).toBe('UNRECOGNIZED_OUTPUT');
      expect(result.decision.plainReason).toContain('Unrecognized terminal output');
      expect(result.decision.plainReason).toContain('netsh interface show interface');
      expect(result.decision.rootCause).toBeUndefined();
      expect(result.updatedSession.status).toBe('IN_PROGRESS');

      // The step must remain CURRENT in the roadmap (not marked FAILED or COMPLETED)
      const currentStep = result.updatedSession.roadmap.find((r) => r.id === 'step_network_adapter');
      expect(currentStep?.status).toBe('CURRENT');
    });
  });
});
