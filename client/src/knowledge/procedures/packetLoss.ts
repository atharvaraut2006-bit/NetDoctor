/**
 * NetDoctor — Diagnostic Procedure: Packet Loss
 * Category: packet_loss
 */

import type { DiagnosticProcedure } from '../types';

export const packetLossProcedure: DiagnosticProcedure = {
  categoryKey: 'packet_loss',
  displayName: 'Packet Loss',
  description: 'Dropped packets causing stuttering voice calls, choppy video, or gaming disconnects.',
  primaryObjective: 'Identify which network hop or wireless interface is discarding data packets.',
  initialStepId: 'step_network_adapter',
  stepIds: [
    'step_network_adapter',
    'step_ping_latency_jitter',
    'step_gateway_ping',
    'step_trace_route',
    'step_wifi_signal'
  ],
  expectedEvidenceKeys: [
    'adapter_state',
    'ping_packet_loss_percentage',
    'gateway_packet_loss',
    'traceroute_hop_timeouts',
    'wifi_signal_strength'
  ],
  potentialRootCauses: [
    'rc_no_physical_link',
    'rc_bufferbloat_congestion',
    'rc_gateway_unreachable',
    'rc_packet_loss_hop',
    'rc_wifi_weak_signal'
  ]
};
