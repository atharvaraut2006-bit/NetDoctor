/**
 * NetDoctor — Diagnostic Procedure: IP & DHCP Configuration Issues
 * Category: ip_dhcp_problem
 */

import type { DiagnosticProcedure } from '../types';

export const ipDhcpProblemProcedure: DiagnosticProcedure = {
  categoryKey: 'ip_dhcp_problem',
  displayName: 'IP & DHCP Configuration Issues',
  description: 'Failure to obtain a valid IP lease from DHCP or APIPA self-assigned address.',
  primaryObjective: 'Verify IP subnet configuration and perform DHCP lease release and renewal.',
  initialStepId: 'step_network_adapter',
  stepIds: [
    'step_network_adapter',
    'step_ip_dhcp',
    'step_gateway_ping',
    'step_ip_release_renew'
  ],
  expectedEvidenceKeys: [
    'adapter_state',
    'dhcp_assigned_ipv4',
    'subnet_mask_validity',
    'gateway_reachability',
    'dhcp_renewal_outcome'
  ],
  potentialRootCauses: [
    'rc_no_physical_link',
    'rc_apipa_dhcp_failure',
    'rc_gateway_unreachable'
  ],
  isDisruptive: true,
  disruptiveWarning: 'Releasing and renewing your IP configuration will briefly disconnect network traffic.'
};
