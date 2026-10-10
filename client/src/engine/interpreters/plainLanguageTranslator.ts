/**
 * NetDoctor — Plain-Language Translation Engine
 * Translates technical error patterns and metrics into clear, beginner-friendly explanations
 * Strictly avoids AI branding, confidence ratios, and obscure technical jargon
 */

import type { OutcomeType } from './types';

interface TranslationContext {
  stepId: string;
  outcomeType: OutcomeType;
  metrics: Record<string, any>;
}

export function translateOutcomeToPlainLanguage(ctx: TranslationContext): {
  summary: string;
  plainLanguageExplanation: string;
  technicalDetails: string;
} {
  const { stepId, outcomeType, metrics } = ctx;

  // Global Check: Unrecognized / Invalid command output
  if (outcomeType === 'UNRECOGNIZED_OUTPUT' || metrics.isValidOutput === false) {
    return {
      summary: 'Unrecognized command output format',
      plainLanguageExplanation:
        'The submitted text does not match the expected command output format. Please run the command shown above in your Command Prompt or Terminal, copy the full output, and paste it here.',
      technicalDetails: 'Input validation failed: No valid command tokens, network headers, IP addresses, or status metrics were detected in the pasted text.'
    };
  }

  switch (stepId) {
    case 'step_network_adapter': {
      if (outcomeType === 'DISCONNECTED' || outcomeType === 'FAILURE' || metrics.isDisconnected || !metrics.isConnected || metrics.isDisabled) {
        const adapterName = metrics.activeAdapterName || metrics.adapterName || 'Network Adapter';
        const stateDesc = metrics.isDisabled ? 'Disabled' : (metrics.state || 'Disconnected');
        return {
          summary: `Network adapter is ${stateDesc.toLowerCase()} (${adapterName})`,
          plainLanguageExplanation:
            `Your network interface (${adapterName}) is currently ${stateDesc.toLowerCase()} or turned off. Ensure Wi-Fi is enabled, Airplane Mode is off, or your Ethernet cable is plugged in.`,
          technicalDetails: `Interface: ${adapterName} | Admin State: ${metrics.adminState || 'Enabled'} | State: ${metrics.state || 'Disconnected'}. No active data link established on Layer 2.`
        };
      }
      const adapterName = metrics.activeAdapterName || metrics.adapterName || 'Wi-Fi/Ethernet';
      return {
        summary: `Network adapter is active and connected (${adapterName})`,
        plainLanguageExplanation:
          `Your network card (${adapterName}) is enabled and maintaining an active physical link to your router. Hardware communication is working normally.`,
        technicalDetails: `Interface: ${adapterName} is ${metrics.adminState || 'Enabled'} and ${metrics.state || 'Connected'}.`
      };
    }

    case 'step_ip_dhcp': {
      if (outcomeType === 'APIPA' || metrics.isApipa) {
        return {
          summary: 'Self-assigned IP address detected (169.254.x.x)',
          plainLanguageExplanation:
            'Your computer was unable to receive an IP address from your router. It assigned itself a temporary address starting with 169.254, which cannot access the Internet.',
          technicalDetails: `Assigned IPv4: ${metrics.ipv4 || '169.254.x.x'} (APIPA). DHCP Server did not provide a lease. Default Gateway is missing.`
        };
      }
      if (outcomeType === 'DISCONNECTED' || metrics.isDisconnected) {
        return {
          summary: 'Network interface is disconnected',
          plainLanguageExplanation:
            'The network adapter reports media disconnected. There is no active link to obtain an IP configuration.',
          technicalDetails: 'Media state: Disconnected. IPv4 address not present.'
        };
      }
      if (outcomeType === 'INVALID_CONFIG' || !metrics.ipv4) {
        return {
          summary: 'Invalid or incomplete IP configuration',
          plainLanguageExplanation:
            'Your network adapter did not return a valid IPv4 address and Default Gateway configuration.',
          technicalDetails: 'IPv4 address or Default Gateway routing entry missing or invalid.'
        };
      }
      return {
        summary: `Valid IP Address assigned (${metrics.ipv4})`,
        plainLanguageExplanation:
          'Your router successfully assigned your device a valid private IP address and identified your local default gateway.',
        technicalDetails: `IPv4: ${metrics.ipv4} | Subnet: ${metrics.subnetMask || '255.255.255.0'} | Gateway: ${metrics.defaultGateway || '192.168.1.1'}`
      };
    }

    case 'step_gateway_ping': {
      if (outcomeType === 'TIMEOUT' || outcomeType === 'FAILURE' || metrics.lossPercentage === 100) {
        return {
          summary: 'Local router / gateway is not responding',
          plainLanguageExplanation:
            'Your device sent test signals to your local router, but none returned. The problem is inside your local network or router, not with the external Internet provider.',
          technicalDetails: `Ping to Gateway: 100% packet loss (${metrics.packetsSent || 4} sent, 0 received). Request timed out.`
        };
      }
      if (outcomeType === 'UNREACHABLE') {
        return {
          summary: 'Destination host unreachable',
          plainLanguageExplanation:
            'Your device could not find a route to reach your local router IP address.',
          technicalDetails: 'ICMP error: Destination host unreachable.'
        };
      }
      if (outcomeType === 'PACKET_LOSS') {
        return {
          summary: `Packet loss to local router (${metrics.lossPercentage.toFixed(0)}% dropped)`,
          plainLanguageExplanation:
            'Some packets reached your router, but others were dropped. This points to local Wi-Fi interference or a damaged Ethernet cable.',
          technicalDetails: `Ping Gateway: ${metrics.lossPercentage.toFixed(0)}% packet loss. Sent=${metrics.packetsSent}, Received=${metrics.packetsReceived}.`
        };
      }
      return {
        summary: `Router reached successfully (${metrics.avgRtt !== undefined ? `${metrics.avgRtt}ms` : '<5ms'} avg latency, 0% loss)`,
        plainLanguageExplanation:
          'Data packets travel cleanly between your computer and local router with no packet loss. Your local home network connection is healthy.',
        technicalDetails: `Ping Gateway: ${metrics.packetsReceived || 4}/${metrics.packetsSent || 4} replies received. Min=${metrics.minRtt || 1}ms, Max=${metrics.maxRtt || 3}ms, Avg=${metrics.avgRtt || 2}ms, Loss=0%.`
      };
    }

    case 'step_dns_lookup': {
      if (outcomeType === 'TIMEOUT' || metrics.isTimeout) {
        return {
          summary: 'DNS server timed out without answering',
          plainLanguageExplanation:
            'Your computer attempted to translate the website name into an IP address, but your configured DNS server failed to reply.',
          technicalDetails: `DNS Query to ${metrics.server || 'configured DNS'}: Request timed out after standard retry interval.`
        };
      }
      if (outcomeType === 'DNS_FAIL' || metrics.isNxDomain || metrics.isServerFailure || (metrics.ipAddresses && metrics.ipAddresses.length === 0)) {
        return {
          summary: 'DNS resolution failed (SERVFAIL / NXDOMAIN)',
          plainLanguageExplanation:
            'The DNS server returned an error indicating it could not resolve the requested domain name into an IP address.',
          technicalDetails: `DNS Query failed: ${metrics.errorSignature || 'No answer records returned'}.`
        };
      }
      return {
        summary: `DNS resolved successfully (${(metrics.ipAddresses && metrics.ipAddresses[0]) || 'Valid IP'})`,
        plainLanguageExplanation:
          'Your DNS server translated the domain name into a valid numerical IP address without errors.',
        technicalDetails: `DNS Server: ${metrics.server || 'Default'} | Resolved IPs: ${(metrics.ipAddresses || []).join(', ') || '142.250.190.46'}`
      };
    }

    case 'step_internet_ping': {
      if (outcomeType === 'TIMEOUT' || metrics.lossPercentage === 100) {
        return {
          summary: 'Internet WAN connection is down (8.8.8.8 unreachable)',
          plainLanguageExplanation:
            'Your device cannot reach public servers on the global Internet. Since your local router is functioning, this indicates an outage with your Internet Service Provider (ISP).',
          technicalDetails: 'Ping 8.8.8.8: 100% packet loss. WAN routing down.'
        };
      }
      if (metrics.lossPercentage > 0) {
        return {
          summary: `Intermittent Internet packet loss (${metrics.lossPercentage.toFixed(0)}% dropped)`,
          plainLanguageExplanation:
            'Some data packets reached the Internet, but others were dropped in transit. This causes intermittent freezing and audio cutting.',
          technicalDetails: `Ping 8.8.8.8: ${metrics.lossPercentage.toFixed(0)}% packet loss. Avg RTT: ${metrics.avgRtt || 25}ms.`
        };
      }
      return {
        summary: `Internet IP reachable (${metrics.avgRtt !== undefined ? `${metrics.avgRtt}ms` : '18ms'} avg, 0% loss)`,
        plainLanguageExplanation:
          'Direct IP connectivity across the global Internet is functioning normally with zero packet loss.',
        technicalDetails: `Ping 8.8.8.8: ${metrics.packetsReceived || 4}/${metrics.packetsSent || 4} replies. RTT Avg: ${metrics.avgRtt || 18}ms, Loss: 0%.`
      };
    }

    case 'step_wifi_signal': {
      if (outcomeType === 'DISCONNECTED' || metrics.isDisconnected) {
        return {
          summary: 'Wi-Fi interface is disconnected',
          plainLanguageExplanation:
            'Your device is not currently connected to any wireless access point.',
          technicalDetails: 'Wi-Fi State: Disconnected. SSID: None.'
        };
      }
      if (metrics.isWeakSignal || (metrics.signalPercentage !== undefined && metrics.signalPercentage < 45)) {
        return {
          summary: `Weak Wi-Fi signal detected (${metrics.signalPercentage || 35}%)`,
          plainLanguageExplanation:
            'Your wireless signal strength is low. Distance, walls, or radio interference may cause intermittent disconnections and packet drops.',
          technicalDetails: `Wi-Fi SSID: ${metrics.ssid || 'Unknown'} | Signal: ${metrics.signalPercentage || 35}% | Radio: ${metrics.radioType || '802.11'}`
        };
      }
      return {
        summary: `Wi-Fi signal is strong (${metrics.signalPercentage || 85}%)`,
        plainLanguageExplanation:
          'Your Wi-Fi radio connection is solid with high signal strength and good transmission rates.',
        technicalDetails: `SSID: ${metrics.ssid || 'Wi-Fi'} | Signal: ${metrics.signalPercentage || 85}% | Radio: ${metrics.radioType || '802.11ax/ac'} | Rate: ${metrics.receiveRate || 866} Mbps`
      };
    }

    case 'step_ping_latency_jitter': {
      if (metrics.lossPercentage > 0) {
        return {
          summary: `Packet loss detected (${metrics.lossPercentage.toFixed(0)}% loss over 10 packets)`,
          plainLanguageExplanation:
            'During the 10-packet test, several packets failed to return. This causes noticeable stuttering in video calls and gaming.',
          technicalDetails: `10-packet ping: ${metrics.packetsLost || 2} lost (${metrics.lossPercentage.toFixed(0)}% loss). Min=${metrics.minRtt}ms, Max=${metrics.maxRtt}ms, Avg=${metrics.avgRtt}ms.`
        };
      }
      if (metrics.avgRtt && metrics.avgRtt > 120) {
        return {
          summary: `High round-trip latency detected (${metrics.avgRtt}ms avg)`,
          plainLanguageExplanation:
            'Your connection has elevated response times. Network bufferbloat, background downloads, or distant routing may be causing lag.',
          technicalDetails: `10-packet ping: Min=${metrics.minRtt}ms, Max=${metrics.maxRtt}ms, Avg=${metrics.avgRtt}ms. Elevated latency threshold (>120ms).`
        };
      }
      return {
        summary: `Latency is steady and low (${metrics.avgRtt || 18}ms avg, 0% loss)`,
        plainLanguageExplanation:
          'Round-trip times are consistent with zero packet loss across the 10-packet sample.',
        technicalDetails: `10-packet ping: Min=${metrics.minRtt || 15}ms, Max=${metrics.maxRtt || 22}ms, Avg=${metrics.avgRtt || 18}ms, Loss=0%.`
      };
    }

    case 'step_trace_route': {
      if (metrics.isHop1Timeout) {
        return {
          summary: 'Trace route failed at Hop 1 (Local Router)',
          plainLanguageExplanation:
            'Packet transmission stopped immediately at your local router. The router is not forwarding traffic outwards.',
          technicalDetails: 'Hop 1 (* * *) timed out. Local gateway not forwarding ICMP TTL exceeded.'
        };
      }
      if (metrics.failingHop) {
        return {
          summary: `Transit packet drop at Hop ${metrics.failingHop}`,
          plainLanguageExplanation:
            `Data packets successfully left your home router but encountered delays or timeouts at an intermediate ISP node (Hop ${metrics.failingHop}).`,
          technicalDetails: `Intermediate Hop ${metrics.failingHop} timed out. Total hops traced: ${metrics.totalHops || 8}.`
        };
      }
      return {
        summary: `Trace route completed cleanly in ${metrics.totalHops || 5} hops`,
        plainLanguageExplanation:
          'Packets traveled smoothly through all intermediate ISP routers and reached the destination server without delay.',
        technicalDetails: `Destination reached in ${metrics.totalHops || 5} hops. Steady latency progression.`
      };
    }

    case 'step_dns_flush': {
      return {
        summary: 'DNS Resolver Cache successfully flushed',
        plainLanguageExplanation:
          'Your operating system has cleared all stored domain lookup records. Subsequent website lookups will query fresh records from your DNS server.',
        technicalDetails: 'DNS Resolver cache flushed. System lookup table reset.'
      };
    }

    case 'step_ip_release_renew': {
      if (outcomeType === 'FAILURE' || metrics.isApipa) {
        return {
          summary: 'IP renewal failed (still on 169.254.x.x)',
          plainLanguageExplanation:
            'Your computer attempted to renew its IP address from the router, but no DHCP response was received.',
          technicalDetails: 'DHCP lease renewal failed. Adapter retained APIPA address.'
        };
      }
      return {
        summary: `IP lease successfully renewed (${metrics.ipv4 || '192.168.1.x'})`,
        plainLanguageExplanation:
          'Your device successfully negotiated a fresh IP address and gateway configuration with your router.',
        technicalDetails: `New IPv4: ${metrics.ipv4 || '192.168.1.x'} from DHCP Server.`
      };
    }

    case 'step_http_reachability': {
      if (metrics.isConnectionRefused || outcomeType === 'FAILURE') {
        return {
          summary: 'Web server refused connection',
          plainLanguageExplanation:
            'Your computer reached the server IP address, but the server refused the connection on HTTP/HTTPS port 80/443.',
          technicalDetails: 'TCP port connection refused by target server.'
        };
      }
      if (metrics.statusCode && metrics.statusCode >= 500) {
        return {
          summary: `Web server returned error HTTP ${metrics.statusCode}`,
          plainLanguageExplanation:
            'The destination website server is experiencing internal software or database issues.',
          technicalDetails: `HTTP ${metrics.statusCode} ${metrics.statusMessage || 'Server Error'}`
        };
      }
      return {
        summary: `Web server responded (${metrics.httpVersion || 'HTTP/2'} ${metrics.statusCode || 200})`,
        plainLanguageExplanation:
          'The remote web server is online, accepting connections, and returning valid web pages.',
        technicalDetails: `${metrics.httpVersion || 'HTTP/2'} ${metrics.statusCode || 200} OK`
      };
    }

    case 'step_lan_peer_ping': {
      return {
        summary: 'Local ARP table inspected',
        plainLanguageExplanation:
          'Your local address table was checked for active router and peer MAC address mappings.',
        technicalDetails: 'ARP cache parsed with active subnet mappings.'
      };
    }

    case 'step_adapter_restart': {
      return {
        summary: 'Network adapter successfully restarted',
        plainLanguageExplanation:
          'Your network interface card was disabled and re-enabled to reinitialize software drivers and clear socket locks.',
        technicalDetails: 'Network interface reinitialized.'
      };
    }

    default: {
      return {
        summary: outcomeType === 'SUCCESS' ? 'Command executed successfully' : 'Command encountered errors',
        plainLanguageExplanation:
          outcomeType === 'SUCCESS'
            ? 'The diagnostic command completed as expected with no detected errors.'
            : 'The diagnostic command encountered a failure or timeout. Review the technical details.',
        technicalDetails: JSON.stringify(metrics)
      };
    }
  }
}
