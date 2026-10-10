/**
 * NetDoctor — Diagnostic Procedure: DNS Resolution Problems
 * Category: dns_problem
 */

import type { DiagnosticProcedure } from '../types';

export const dnsProblemProcedure: DiagnosticProcedure = {
  categoryKey: 'dns_problem',
  displayName: 'DNS Resolution Problems',
  description: 'Domain name translation failures, DNS server timeouts, or lookup errors.',
  primaryObjective: 'Verify DNS server reachability, lookup integrity, and flush corrupted resolver cache.',
  initialStepId: 'step_network_adapter',
  stepIds: [
    'step_network_adapter',
    'step_ip_dhcp',
    'step_gateway_ping',
    'step_dns_lookup',
    'step_dns_flush',
    'step_internet_ping'
  ],
  expectedEvidenceKeys: [
    'adapter_state',
    'configured_dns_servers',
    'nslookup_resolution_status',
    'direct_ip_ping_status',
    'dns_cache_flush_status'
  ],
  potentialRootCauses: [
    'rc_no_physical_link',
    'rc_apipa_dhcp_failure',
    'rc_dns_server_failure',
    'rc_dns_cache_corruption',
    'rc_isp_wan_outage'
  ]
};
