/**
 * NetDoctor — Diagnostic Procedure: LAN & Local Network Connectivity
 * Category: lan_connectivity
 */

import type { DiagnosticProcedure } from '../types';

export const lanConnectivityProcedure: DiagnosticProcedure = {
  categoryKey: 'lan_connectivity',
  displayName: 'LAN & Local Network Connectivity',
  description: 'Inability to connect to local computers, shared folders, or local network devices.',
  primaryObjective: 'Inspect local ARP cache, subnet mask consistency, and local peer link.',
  initialStepId: 'step_network_adapter',
  stepIds: [
    'step_network_adapter',
    'step_ip_dhcp',
    'step_lan_peer_ping',
    'step_gateway_ping'
  ],
  expectedEvidenceKeys: [
    'adapter_state',
    'local_ip_and_mask',
    'arp_cache_entries',
    'gateway_ping_response'
  ],
  potentialRootCauses: [
    'rc_no_physical_link',
    'rc_apipa_dhcp_failure',
    'rc_lan_subnet_mismatch',
    'rc_gateway_unreachable'
  ]
};
