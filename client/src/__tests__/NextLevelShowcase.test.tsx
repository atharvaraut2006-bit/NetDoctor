import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { getSampleOutput } from '../components/workspace/ResultSubmission';
import { VisualGuidance } from '../components/workspace/VisualGuidance';
import { ResolutionView } from '../components/resolution/ResolutionView';
import type { VisualGuidanceConfig } from '../knowledge/types';
import type { FinalDiagnosticReport } from '../engine/diagnostic/types';

describe('Next-Level Showcase & Demo Readiness Tests', () => {
  describe('CLI Output Simulator (Viva & Test Scenario Generator)', () => {
    it('generates authentic gateway ping outputs for success, failure, and jitter', () => {
      const successOutput = getSampleOutput('step_gateway_ping', 'SUCCESS');
      expect(successOutput).toContain('0% loss');
      expect(successOutput).toContain('Reply from 192.168.1.1');

      const failureOutput = getSampleOutput('step_gateway_ping', 'FAILURE');
      expect(failureOutput).toContain('100% loss');
      expect(failureOutput).toContain('Request timed out');

      const jitterOutput = getSampleOutput('step_gateway_ping', 'JITTER');
      expect(jitterOutput).toContain('25% loss');
      expect(jitterOutput).toContain('180ms');
    });

    it('generates authentic DHCP & APIPA outputs for step_ip_dhcp', () => {
      const successDhcp = getSampleOutput('step_ip_dhcp', 'SUCCESS');
      expect(successDhcp).toContain('192.168.1.145');
      expect(successDhcp).toContain('Default Gateway');

      const failureDhcp = getSampleOutput('step_ip_dhcp', 'FAILURE');
      expect(failureDhcp).toContain('169.254.142.88');
    });

    it('generates authentic DNS lookup outputs for step_dns_resolution', () => {
      const successDns = getSampleOutput('step_dns_resolution', 'SUCCESS');
      expect(successDns).toContain('google.com');
      expect(successDns).toContain('142.250.190.46');

      const failureDns = getSampleOutput('step_dns_resolution', 'FAILURE');
      expect(failureDns).toContain('Server failed');
      expect(failureDns).toContain('timed out');
    });
  });

  describe('Interactive Animated Packet Flow in VisualGuidance', () => {
    const mockVisual: VisualGuidanceConfig = {
      type: 'gateway_path',
      title: 'Local Gateway Routing Path',
      description: 'Verifies communication along local hop.',
      altText: 'Network path from device to gateway and internet',
      relatedStepId: 'step_gateway_ping'
    };

    it('renders simulation trigger and toggles packet flow on user click', () => {
      render(<VisualGuidance visual={mockVisual} selectedOS="windows" />);

      const simBtn = screen.getByRole('button', { name: /simulate packet flow/i });
      expect(simBtn).toBeInTheDocument();

      // Before activation, no live packet simulation banner
      expect(screen.queryByText(/Live Packet Simulation:/i)).not.toBeInTheDocument();

      // Click to start simulation
      fireEvent.click(simBtn);

      expect(screen.getByText(/Packet Flow Active/i)).toBeInTheDocument();
      expect(screen.getByText(/Live Packet Simulation:/i)).toBeInTheDocument();
      expect(screen.getByText(/RTT: 2ms • Loss: 0%/i)).toBeInTheDocument();

      // Click to stop simulation
      fireEvent.click(simBtn);
      expect(screen.getByText(/Simulate Packet Flow/i)).toBeInTheDocument();
      expect(screen.queryByText(/Live Packet Simulation:/i)).not.toBeInTheDocument();
    });
  });

  describe('Printable Report & Technical Audit Ledger in ResolutionView', () => {
    const mockReport: FinalDiagnosticReport = {
      sessionId: 'session-demo-audit-123456',
      problemIdentified: 'Cannot browse websites',
      categoryKey: 'dns_problem',
      rootCause: 'DNS Resolver Failure',
      technicalExplanation: 'Local DNS queries fail to resolve domain names to IP addresses.',
      evidenceSummary: [
        'Local gateway ping 192.168.1.1 succeeded with 0% packet loss (1ms RTT)',
        'Public IP ping 8.8.8.8 succeeded with 0% packet loss (14ms RTT)',
        'Domain resolution for google.com failed with DNS request timeout'
      ],
      solutionSteps: [
        'Flush DNS cache using ipconfig /flushdns',
        'Configure DNS server to 8.8.8.8 and 1.1.1.1'
      ],
      whatHappened: 'DNS resolution broke while raw IP routing was healthy.',
      stepsThatFixedIt: ['Flush DNS Resolver Cache'],
      preventionRecommendations: ['Use high-availability redundant public DNS resolvers'],
      resolvedAt: new Date('2026-10-10T12:00:00Z')
    };

    it('renders Print / Export PDF button and triggers window.print', () => {
      const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
      const onVerifyFixed = vi.fn();
      const onStartNewDiagnosis = vi.fn();
      const onBackToWorkspace = vi.fn();

      render(
        <ResolutionView
          status="RESOLVED"
          identifiedRootCause={null}
          finalReport={mockReport}
          onVerifyFixed={onVerifyFixed}
          onStartNewDiagnosis={onStartNewDiagnosis}
          onBackToWorkspace={onBackToWorkspace}
        />
      );

      const printBtn = screen.getByRole('button', { name: /print \/ export pdf/i });
      expect(printBtn).toBeInTheDocument();

      fireEvent.click(printBtn);
      expect(printSpy).toHaveBeenCalledTimes(1);

      printSpy.mockRestore();
    });

    it('renders the Technical Audit Ledger table with verified checkpoints and decision rules', () => {
      render(
        <ResolutionView
          status="RESOLVED"
          identifiedRootCause={null}
          finalReport={mockReport}
          onVerifyFixed={vi.fn()}
          onStartNewDiagnosis={vi.fn()}
          onBackToWorkspace={vi.fn()}
        />
      );

      expect(screen.getByText(/Session Technical Audit Ledger & Decision Trace/i)).toBeInTheDocument();
      expect(screen.getByText(/CHECKPOINT_1/i)).toBeInTheDocument();
      expect(screen.getByText(/CHECKPOINT_2/i)).toBeInTheDocument();
      expect(screen.getByText(/CHECKPOINT_3/i)).toBeInTheDocument();
      expect(screen.getByText(/ROOT_CAUSE_MATCH/i)).toBeInTheDocument();
      expect(screen.getByText(/FINAL_CONCLUSION/i)).toBeInTheDocument();
      expect(screen.getAllByText(/DNS Resolver Failure/i).length).toBeGreaterThanOrEqual(2);
    });
  });
});
