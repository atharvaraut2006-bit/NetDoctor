/**
 * NetDoctor — Rule Evaluator Engine (Phase 4)
 * Deterministic, evidence-based reasoning engine matching collected facts to Root Causes
 */

import { ROOT_CAUSES_LIBRARY } from '../../knowledge/rootCauses';
import type { RootCauseRecord } from '../../knowledge/types';
import type { EvidenceStore } from './evidenceStore';

export interface RuleEvaluationResult {
  rootCauseFound: boolean;
  rootCause?: RootCauseRecord;
  suggestedSolution?: RootCauseRecord;
  plainExplanation: string;
  recommendedNextStepId?: string;
  confidenceReasoning: string;
  isIntermittent?: boolean;
  secondaryCauses?: string[];
}

export class RuleEvaluator {
  /**
   * Evaluates the current evidence store to determine if sufficient proof exists
   * to declare a root cause or if further diagnostic branching is required.
   */
  public evaluate(evidence: EvidenceStore): RuleEvaluationResult {
    // 1. Layer 1 / Physical Network Adapter Check
    if (evidence.isFault('adapter_link')) {
      const rc = ROOT_CAUSES_LIBRARY.rc_no_physical_link;
      return {
        rootCauseFound: true,
        rootCause: rc,
        suggestedSolution: rc,
        plainExplanation: 'Your network interface card is disconnected or disabled. Data cannot leave your computer.',
        confidenceReasoning: 'Confirmed via network adapter link state reporting disconnected or disabled.'
      };
    }

    // 2. Wi-Fi Physical Link / Signal Degradation Check
    if (evidence.isFault('wifi_signal')) {
      const rc = ROOT_CAUSES_LIBRARY.rc_wifi_weak_signal;
      return {
        rootCauseFound: true,
        rootCause: rc,
        suggestedSolution: rc,
        plainExplanation: 'Your Wi-Fi signal is severely degraded or experiencing heavy radio interference, dropping wireless packets.',
        confidenceReasoning: 'Wi-Fi interface metrics indicated signal quality below threshold (< 50%) or disconnected state.'
      };
    }

    // 3. Layer 3 APIPA / DHCP IP Lease Failure Check
    if (evidence.isFault('ip_assignment')) {
      const rc = ROOT_CAUSES_LIBRARY.rc_apipa_dhcp_failure;
      return {
        rootCauseFound: true,
        rootCause: rc,
        suggestedSolution: rc,
        plainExplanation: 'Your device failed to obtain an IP lease from the local router DHCP server and received an APIPA address (169.254.x.x).',
        recommendedNextStepId: 'step_ip_release_renew',
        confidenceReasoning: 'IP configuration check returned APIPA self-assigned address or missing IPv4 gateway.'
      };
    }

    // 4. Default Gateway (Local Router) Unreachable Check
    if (evidence.isFault('gateway_reachability') && evidence.isOk('ip_assignment')) {
      const rc = ROOT_CAUSES_LIBRARY.rc_gateway_unreachable;
      return {
        rootCauseFound: true,
        rootCause: rc,
        suggestedSolution: rc,
        plainExplanation: 'Your computer has a valid local IP address but cannot reach your local default gateway (router).',
        confidenceReasoning: 'ICMP ping to local gateway timed out with 100% packet loss while local IP was valid.'
      };
    }

    // 5. DNS Server Resolution Failure Check
    // (Crucial: Gateway & direct WAN IP ping succeed, but DNS lookup fails)
    if (
      evidence.isFault('dns_resolution') &&
      (evidence.isOk('wan_reachability') || evidence.isOk('gateway_reachability'))
    ) {
      const rc = ROOT_CAUSES_LIBRARY.rc_dns_server_failure;
      return {
        rootCauseFound: true,
        rootCause: rc,
        suggestedSolution: rc,
        plainExplanation: 'Your device has valid Internet connectivity, but your configured DNS server failed to resolve domain names to IP addresses.',
        recommendedNextStepId: 'step_dns_flush',
        confidenceReasoning: 'Direct WAN IP test (8.8.8.8) succeeded while nslookup failed or timed out.'
      };
    }

    // 6. ISP WAN Outage / External Link Failure Check
    // (Gateway is reachable, but direct WAN IP ping fails)
    if (evidence.isOk('gateway_reachability') && evidence.isFault('wan_reachability')) {
      const rc = ROOT_CAUSES_LIBRARY.rc_isp_wan_outage;
      return {
        rootCauseFound: true,
        rootCause: rc,
        suggestedSolution: rc,
        plainExplanation: 'Your local network connection to your router is healthy, but the external Internet Service Provider (WAN) connection is down.',
        confidenceReasoning: 'Default gateway ping succeeded with 0% loss, but external WAN ping (8.8.8.8) failed with 100% loss.'
      };
    }

    // 7. Target Web Server Outage Check
    // (General Internet and DNS work fine, but specific web server returns HTTP 5xx or Connection Refused)
    if (
      evidence.isFault('http_reachability') &&
      evidence.isOk('dns_resolution') &&
      evidence.isOk('wan_reachability')
    ) {
      const rc = ROOT_CAUSES_LIBRARY.rc_target_server_outage;
      return {
        rootCauseFound: true,
        rootCause: rc,
        suggestedSolution: rc,
        plainExplanation: 'Your Internet connection and DNS are working normally, but the specific destination web server is down or rejecting connections.',
        confidenceReasoning: 'HTTP test returned error status code (500/502/503/refused) while DNS and WAN ping succeeded.'
      };
    }

    // 8. Bufferbloat & High Latency / Jitter / Intermittent Packet Loss Check
    if (
      (evidence.isFault('ping_latency_jitter') || evidence.isIntermittent('ping_latency_jitter')) &&
      evidence.isOk('gateway_reachability')
    ) {
      const isIntermittent = evidence.isIntermittent('ping_latency_jitter');
      const rc = ROOT_CAUSES_LIBRARY.rc_bufferbloat_congestion;
      return {
        rootCauseFound: true,
        rootCause: rc,
        suggestedSolution: rc,
        plainExplanation: isIntermittent
          ? 'Intermittent latency spikes and periodic packet drops were detected. Network conditions fluctuate rather than suffering a persistent outage.'
          : 'Heavy network bandwidth usage or bufferbloat is introducing high latency variance and packet drops.',
        confidenceReasoning: isIntermittent
          ? 'Multi-sample observations confirmed intermittent jitter and packet variance under load.'
          : 'Extended ping test revealed significant jitter or latency spikes under load.',
        isIntermittent,
        secondaryCauses: [
          'Background downloads or cloud backups on other household devices',
          'Local router buffer queue saturation (bufferbloat)'
        ]
      };
    }

    // 9. Upstream Transit Hop Packet Loss Check
    if (evidence.isFault('traceroute_hop') && evidence.isOk('gateway_reachability')) {
      const rc = ROOT_CAUSES_LIBRARY.rc_packet_loss_hop;
      return {
        rootCauseFound: true,
        rootCause: rc,
        suggestedSolution: rc,
        plainExplanation: 'Data packets are being dropped by an intermediate ISP node or transit exchange outside your home network.',
        confidenceReasoning: 'Traceroute showed Hop 1 (local gateway) healthy, but packet timeouts starting at upstream ISP hops.'
      };
    }

    // 10. Local Subnet Mismatch / ARP Failure Check
    if (evidence.isFault('lan_peer_reachability') && evidence.isOk('gateway_reachability')) {
      const rc = ROOT_CAUSES_LIBRARY.rc_lan_subnet_mismatch;
      return {
        rootCauseFound: true,
        rootCause: rc,
        suggestedSolution: rc,
        plainExplanation: 'Local peer discovery failed. Devices may be on different subnets or blocked by Client Isolation / Firewall.',
        confidenceReasoning: 'Gateway was reachable but local peer ARP or ping failed.'
      };
    }

    // 11. Adapter Driver Glitch Check
    if (evidence.isOk('adapter_restart_outcome')) {
      const rc = ROOT_CAUSES_LIBRARY.rc_adapter_driver_glitch;
      return {
        rootCauseFound: true,
        rootCause: rc,
        suggestedSolution: rc,
        plainExplanation: 'Network adapter stack was reinitialized, resolving the transient driver lock.',
        confidenceReasoning: 'Adapter restart command succeeded and re-established link.'
      };
    }

    // Default: No conclusive root cause yet -> continue structured investigation
    return {
      rootCauseFound: false,
      plainExplanation: 'No conclusive fault identified yet. Continuing next diagnostic step.',
      confidenceReasoning: 'Current evidence is insufficient to declare a single root cause with certainty.'
    };
  }
}
