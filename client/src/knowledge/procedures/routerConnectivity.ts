/**
 * NetDoctor — Diagnostic Procedure: Router & Gateway Connectivity
 * Category: router_connectivity
 */

import type { DiagnosticProcedure } from '../types';

export const routerConnectivityProcedure: DiagnosticProcedure = {
  categoryKey: 'router_connectivity',
  displayName: 'Router & Gateway Connectivity',
  description: 'Inability to communicate with or open the local router/default gateway page.',
  primaryObjective: 'Isolate local router hardware responsiveness, gateway IP address, and physical link.',
  initialStepId: 'step_network_adapter',
  stepIds: [
    'step_network_adapter',
    'step_ip_dhcp',
    'step_gateway_ping',
    'step_trace_route'
  ],
  expectedEvidenceKeys: [
    'adapter_state',
    'gateway_ip_detected',
    'gateway_ping_response',
    'first_hop_reachability'
  ],
  potentialRootCauses: [
    'rc_no_physical_link',
    'rc_apipa_dhcp_failure',
    'rc_gateway_unreachable',
    'rc_packet_loss_hop'
  ]
};
