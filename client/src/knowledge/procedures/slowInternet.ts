/**
 * NetDoctor — Diagnostic Procedure: Slow Internet Throughput
 * Category: slow_internet
 */

import type { DiagnosticProcedure } from '../types';

export const slowInternetProcedure: DiagnosticProcedure = {
  categoryKey: 'slow_internet',
  displayName: 'Slow Internet Throughput',
  description: 'Sluggish downloads, video buffering, or reduced network throughput.',
  primaryObjective: 'Measure round-trip latency, hop bottlenecks, bufferbloat, and DNS responsiveness.',
  initialStepId: 'step_network_adapter',
  stepIds: [
    'step_network_adapter',
    'step_ping_latency_jitter',
    'step_gateway_ping',
    'step_trace_route',
    'step_wifi_signal',
    'step_internet_ping'
  ],
  expectedEvidenceKeys: [
    'adapter_state',
    'ping_average_latency',
    'ping_jitter',
    'gateway_reachability',
    'traceroute_hop_delays',
    'wan_ping_reachability'
  ],
  potentialRootCauses: [
    'rc_no_physical_link',
    'rc_bufferbloat_congestion',
    'rc_gateway_unreachable',
    'rc_packet_loss_hop',
    'rc_isp_wan_outage'
  ]
};
