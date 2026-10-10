/**
 * NetDoctor — Diagnostic Procedure: Wi-Fi Connection Problems
 * Category: wifi_connection
 */

import type { DiagnosticProcedure } from '../types';

export const wifiConnectionProcedure: DiagnosticProcedure = {
  categoryKey: 'wifi_connection',
  displayName: 'Wi-Fi Connection Problems',
  description: 'Wireless signal drops, association problems, or weak Wi-Fi connectivity.',
  primaryObjective: 'Analyze network adapter link, Wi-Fi signal quality, DHCP lease, and router gateway.',
  initialStepId: 'step_network_adapter',
  stepIds: [
    'step_network_adapter',
    'step_wifi_signal',
    'step_ip_dhcp',
    'step_gateway_ping',
    'step_ping_latency_jitter',
    'step_internet_ping'
  ],
  expectedEvidenceKeys: [
    'adapter_state',
    'wifi_signal_percentage',
    'wifi_ssid_band',
    'ipv4_address',
    'gateway_reachability',
    'wan_ping_reachability'
  ],
  potentialRootCauses: [
    'rc_no_physical_link',
    'rc_wifi_weak_signal',
    'rc_apipa_dhcp_failure',
    'rc_gateway_unreachable',
    'rc_isp_wan_outage'
  ]
};
