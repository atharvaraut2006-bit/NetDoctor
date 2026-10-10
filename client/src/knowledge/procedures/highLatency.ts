/**
 * NetDoctor — Diagnostic Procedure: High Ping & Latency
 * Category: high_latency
 */

import type { DiagnosticProcedure } from '../types';

export const highLatencyProcedure: DiagnosticProcedure = {
  categoryKey: 'high_latency',
  displayName: 'High Ping & Latency',
  description: 'Elevated ping times, gaming lag spikes, or high network response delays.',
  primaryObjective: 'Determine if high ping originates from Wi-Fi jitter, local router, or ISP transit hops.',
  initialStepId: 'step_network_adapter',
  stepIds: [
    'step_network_adapter',
    'step_wifi_signal',
    'step_gateway_ping',
    'step_ping_latency_jitter',
    'step_trace_route',
    'step_internet_ping'
  ],
  expectedEvidenceKeys: [
    'adapter_state',
    'round_trip_min_max_avg',
    'gateway_ping_latency',
    'hop_by_hop_latencies',
    'wifi_signal_quality'
  ],
  potentialRootCauses: [
    'rc_no_physical_link',
    'rc_bufferbloat_congestion',
    'rc_gateway_unreachable',
    'rc_packet_loss_hop',
    'rc_wifi_weak_signal'
  ]
};
