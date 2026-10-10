/**
 * NetDoctor — Diagnostic Procedure: Specific Website Connectivity
 * Category: website_connectivity
 */

import type { DiagnosticProcedure } from '../types';

export const websiteConnectivityProcedure: DiagnosticProcedure = {
  categoryKey: 'website_connectivity',
  displayName: 'Specific Website Connectivity',
  description: 'Specific website fails to open while general Internet access is functioning.',
  primaryObjective: 'Differentiate between web server downtime, DNS misdirection, or remote port blocking.',
  initialStepId: 'step_network_adapter',
  stepIds: [
    'step_network_adapter',
    'step_ip_dhcp',
    'step_dns_lookup',
    'step_http_reachability',
    'step_dns_flush',
    'step_internet_ping'
  ],
  expectedEvidenceKeys: [
    'adapter_state',
    'ip_assigned',
    'http_response_code',
    'dns_resolution_record',
    'wan_ping_reachability'
  ],
  potentialRootCauses: [
    'rc_no_physical_link',
    'rc_apipa_dhcp_failure',
    'rc_target_server_outage',
    'rc_dns_server_failure',
    'rc_isp_wan_outage'
  ]
};
