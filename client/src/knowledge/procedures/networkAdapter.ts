/**
 * NetDoctor — Diagnostic Procedure: Network Adapter Problems
 * Category: network_adapter
 */

import type { DiagnosticProcedure } from '../types';

export const networkAdapterProcedure: DiagnosticProcedure = {
  categoryKey: 'network_adapter',
  displayName: 'Network Adapter Problems',
  description: 'Network interface card (NIC) hardware or driver state issues.',
  primaryObjective: 'Verify adapter hardware state and reinitialize network interface stack.',
  initialStepId: 'step_network_adapter',
  stepIds: [
    'step_network_adapter',
    'step_ip_dhcp',
    'step_adapter_restart',
    'step_gateway_ping'
  ],
  expectedEvidenceKeys: [
    'adapter_admin_state',
    'adapter_link_state',
    'ip_binding_status',
    'adapter_restart_outcome',
    'gateway_ping_response'
  ],
  potentialRootCauses: [
    'rc_no_physical_link',
    'rc_apipa_dhcp_failure',
    'rc_adapter_driver_glitch',
    'rc_gateway_unreachable'
  ],
  isDisruptive: true,
  disruptiveWarning: 'Restarting your network interface will temporarily reset all active socket connections.'
};
