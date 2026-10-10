/**
 * NetDoctor — Diagnostic Procedure: Internet Not Working
 * Category: internet_not_working
 */

import type { DiagnosticProcedure } from '../types';

export const internetNotWorkingProcedure: DiagnosticProcedure = {
  categoryKey: 'internet_not_working',
  displayName: 'Internet Not Working',
  description: 'General connectivity loss across all web applications and network sockets.',
  primaryObjective: 'Isolate whether connection failure is physical, local router, DNS, or ISP WAN.',
  initialStepId: 'step_network_adapter',
  stepIds: [
    'step_network_adapter',
    'step_ip_dhcp',
    'step_gateway_ping',
    'step_dns_lookup',
    'step_internet_ping'
  ],
  expectedEvidenceKeys: [
    'adapter_state',
    'ipv4_address',
    'default_gateway',
    'dns_resolution',
    'wan_ping_reachability'
  ],
  potentialRootCauses: [
    'rc_no_physical_link',
    'rc_apipa_dhcp_failure',
    'rc_gateway_unreachable',
    'rc_dns_server_failure',
    'rc_isp_wan_outage'
  ]
};
